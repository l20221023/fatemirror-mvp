import { createHash, randomUUID } from "node:crypto";

import { getAdviceRuntimeConfig } from "../advice/runtime";
import type { JsonValue } from "../supabase";
import { createMockPaymentProvider, signMockWebhookPayload } from "./mock-payment-provider";
import { getCommercialPriceCents } from "./pricing";
import { COMMERCIAL_PRODUCTS, getCommercialProduct } from "./products";
import type {
  CommercialOrder,
  CommercialProductCode,
} from "./types";
import { createDefaultCommercialRepository } from "./repository/default-commercial-repository";

const repository = createDefaultCommercialRepository();
const paymentProvider = createMockPaymentProvider();

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function getCommercialSubjectHash(subject: string) {
  return hash(subject);
}

export function getCommercialIdempotencyKey(subjectHash: string, productCode: CommercialProductCode) {
  return `${subjectHash}:${productCode}`;
}

export async function syncCommercialCatalog() {
  await repository.syncProducts(Object.values(COMMERCIAL_PRODUCTS));
}

export async function createCommercialOrder(options: {
  subject: string;
  productCode: CommercialProductCode;
  returnUrl: string;
  metadata?: JsonValue;
}) {
  const config = getAdviceRuntimeConfig();
  if (!config.commercialEnabled || config.paymentMode === "disabled") {
    throw new Error("COMMERCIAL_DISABLED");
  }

  await syncCommercialCatalog();

  const subjectHash = getCommercialSubjectHash(options.subject);
  const idempotencyKey = getCommercialIdempotencyKey(subjectHash, options.productCode);
  const existing = await repository.getOrderByIdempotencyKey(idempotencyKey);
  if (existing) {
    return existing;
  }

  const product = getCommercialProduct(options.productCode);
  const orderId = randomUUID();
  const checkoutUrl = `${options.returnUrl.replace(/\/$/, "")}/${orderId}`;
  const session = await paymentProvider.createCheckoutSession({
    order: {
      id: orderId,
      idempotencyKey,
      subjectHash,
      productCode: options.productCode,
      status: "created",
      amountCents: getCommercialPriceCents(options.productCode),
      currency: product.currency,
      provider: paymentProvider.name,
      checkoutUrl,
      providerSessionId: null,
      providerPaymentIntentId: null,
      metadata: (options.metadata ?? {}) as JsonValue,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paidAt: null,
      fulfilledAt: null,
      cancelledAt: null,
      refundedAt: null,
    },
    returnUrl: checkoutUrl,
  });

  const order = await repository.createOrder({
    id: orderId,
    idempotencyKey,
    subjectHash,
    productCode: options.productCode,
    amountCents: getCommercialPriceCents(options.productCode),
    currency: product.currency,
    provider: paymentProvider.name,
    checkoutUrl: session.checkoutUrl,
    providerSessionId: session.providerSessionId,
    providerPaymentIntentId: null,
      metadata: (options.metadata ?? {}) as JsonValue,
    status: "pending_payment",
  });

  await repository.recordPaymentEvent({
    orderId: order.id,
    eventType: "checkout_created",
    provider: paymentProvider.name,
    signatureValid: true,
    payload: {
      orderId: order.id,
      checkoutUrl: order.checkoutUrl,
      productCode: order.productCode,
    },
  });

  return order;
}

export async function getCommercialOrder(orderId: string) {
  return repository.getOrder(orderId);
}

export async function getCommercialOrders() {
  return repository.listOrders();
}

export async function getActiveCommercialEntitlement(subject: string, productCode: CommercialProductCode) {
  const subjectHash = getCommercialSubjectHash(subject);
  const entitlements = await repository.findEntitlementsBySubject(subjectHash);
  return entitlements.find(
    (entitlement) =>
      entitlement.productCode === productCode &&
      (entitlement.status === "active" || entitlement.status === "consumed"),
  ) ?? null;
}

export async function consumeCommercialEntitlement(subject: string, productCode: CommercialProductCode) {
  const entitlement = await getActiveCommercialEntitlement(subject, productCode);
  if (!entitlement || entitlement.status !== "active") {
    return entitlement;
  }

  return repository.updateEntitlement(entitlement.id, {
    status: "consumed",
    consumedAt: new Date().toISOString(),
  });
}

export async function grantCommercialEntitlementForOrder(order: CommercialOrder) {
  const product = getCommercialProduct(order.productCode);
  const expiryDays = order.productCode === "deep_advice_single" ? 30 : 90;
  const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();
  return repository.createEntitlement({
    subjectHash: order.subjectHash,
    entitlementType: product.entitlementType,
    productCode: order.productCode,
    status: "active",
    orderId: order.id,
    expiresAt,
    metadata: {
      source: "sandbox_checkout",
    },
  });
}

export async function handleCommercialWebhook(rawBody: string, signature: string | null) {
  const signatureValid = paymentProvider.verifyWebhookSignature({ rawBody, signature });
  const event = paymentProvider.parseWebhookEvent(rawBody);

  if (!event) {
    return {
      success: false,
      signatureValid,
      reason: "INVALID_EVENT",
    } as const;
  }

  const recordedEvent = await repository.recordPaymentEvent({
    orderId: event.orderId,
    eventType: event.eventType,
    provider: paymentProvider.name,
    signatureValid,
    payload: JSON.parse(JSON.stringify(event)) as JsonValue,
  });

  if (!signatureValid) {
    return {
      success: false,
      signatureValid,
      reason: "INVALID_SIGNATURE",
      event: recordedEvent,
    } as const;
  }

  const order = await repository.getOrder(event.orderId);
  if (!order) {
    return {
      success: false,
      signatureValid,
      reason: "ORDER_NOT_FOUND",
      event: recordedEvent,
    } as const;
  }

  if (event.eventType === "payment_succeeded") {
    const alreadyPaid = order.status === "paid" || order.status === "fulfilled";
    const nextOrder = alreadyPaid
      ? order
      : await repository.updateOrder(order.id, {
          status: "paid",
          paidAt: new Date().toISOString(),
          providerPaymentIntentId: event.providerPaymentIntentId,
          providerSessionId: event.providerSessionId,
        });

    if (!alreadyPaid && nextOrder) {
      const existing = (await repository.findEntitlementsBySubject(order.subjectHash)).find(
        (item) => item.orderId === order.id,
      );

      const entitlement = existing ?? (await grantCommercialEntitlementForOrder(nextOrder));
      if (entitlement.status === "active") {
        await repository.updateOrder(order.id, {
          status: "paid",
        });
      }
    }
  }

  if (event.eventType === "payment_failed") {
    await repository.updateOrder(order.id, {
      status: "failed",
    });
  }

  if (event.eventType === "payment_refunded") {
    await repository.updateOrder(order.id, {
      status: "refunded",
      refundedAt: new Date().toISOString(),
    });

    const entitlements = await repository.findEntitlementsBySubject(order.subjectHash);
    const entitlement = entitlements.find((item) => item.orderId === order.id);
    if (entitlement) {
      await repository.updateEntitlement(entitlement.id, {
        status: "refunded",
        revokedAt: new Date().toISOString(),
      });
    }
  }

  return {
    success: true,
    signatureValid,
    event: recordedEvent,
  } as const;
}

export function buildMockPaymentWebhook(order: CommercialOrder, eventType: "payment_succeeded" | "payment_failed" | "payment_refunded" = "payment_succeeded") {
  return signMockWebhookPayload({
    eventType,
    orderId: order.id,
    providerSessionId: order.providerSessionId,
    providerPaymentIntentId: `pi_${order.id.slice(0, 12)}`,
    payload: {
      orderId: order.id,
      productCode: order.productCode,
    },
  });
}
