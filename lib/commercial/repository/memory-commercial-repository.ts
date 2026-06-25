import { randomUUID } from "node:crypto";

import type {
  CommercialEntitlement,
  CommercialEntitlementCreateInput,
  CommercialEntitlementUpdateInput,
  CommercialOrder,
  CommercialOrderCreateInput,
  CommercialOrderUpdateInput,
  CommercialProduct,
  PaymentEvent,
  PaymentEventType,
} from "../types";
import type { CommercialRepository } from "./types";

const products = new Map<string, CommercialProduct>();
const orders = new Map<string, CommercialOrder>();
const entitlements = new Map<string, CommercialEntitlement>();
const paymentEvents = new Map<string, PaymentEvent>();

function cloneOrder(order: CommercialOrder) {
  return structuredClone(order);
}

function cloneEntitlement(entitlement: CommercialEntitlement) {
  return structuredClone(entitlement);
}

function cloneProduct(product: CommercialProduct) {
  return structuredClone(product);
}

function clonePaymentEvent(event: PaymentEvent) {
  return structuredClone(event);
}

function nowIso() {
  return new Date().toISOString();
}

export function resetMemoryCommercialRepository() {
  products.clear();
  orders.clear();
  entitlements.clear();
  paymentEvents.clear();
}

export class MemoryCommercialRepository implements CommercialRepository {
  async syncProducts(items: CommercialProduct[]) {
    for (const item of items) {
      products.set(item.code, cloneProduct(item));
    }
  }

  async listProducts() {
    return Array.from(products.values()).map(cloneProduct);
  }

  async createOrder(input: CommercialOrderCreateInput) {
    const createdAt = nowIso();
    const order: CommercialOrder = {
      id: input.id ?? randomUUID(),
      idempotencyKey: input.idempotencyKey,
      subjectHash: input.subjectHash,
      productCode: input.productCode,
      status: input.status ?? "created",
      amountCents: input.amountCents,
      currency: input.currency,
      provider: input.provider,
      checkoutUrl: input.checkoutUrl,
      providerSessionId: input.providerSessionId ?? null,
      providerPaymentIntentId: input.providerPaymentIntentId ?? null,
      metadata: input.metadata ?? {},
      createdAt,
      updatedAt: createdAt,
      paidAt: null,
      fulfilledAt: null,
      cancelledAt: null,
      refundedAt: null,
    };

    orders.set(order.id, cloneOrder(order));
    return cloneOrder(order);
  }

  async getOrder(orderId: string) {
    const order = orders.get(orderId);
    return order ? cloneOrder(order) : null;
  }

  async getOrderByIdempotencyKey(idempotencyKey: string) {
    const order = Array.from(orders.values()).find((item) => item.idempotencyKey === idempotencyKey);
    return order ? cloneOrder(order) : null;
  }

  async updateOrder(orderId: string, patch: CommercialOrderUpdateInput) {
    const order = orders.get(orderId);
    if (!order) return null;

    const next: CommercialOrder = {
      ...order,
      ...patch,
      metadata: patch.metadata ?? order.metadata,
      updatedAt: nowIso(),
    };

    orders.set(orderId, cloneOrder(next));
    return cloneOrder(next);
  }

  async listOrders() {
    return Array.from(orders.values()).map(cloneOrder);
  }

  async createEntitlement(input: CommercialEntitlementCreateInput) {
    const createdAt = nowIso();
    const entitlement: CommercialEntitlement = {
      id: input.id ?? randomUUID(),
      subjectHash: input.subjectHash,
      entitlementType: input.entitlementType,
      productCode: input.productCode,
      status: input.status,
      orderId: input.orderId ?? null,
      expiresAt: input.expiresAt ?? null,
      consumedAt: input.consumedAt ?? null,
      revokedAt: input.revokedAt ?? null,
      createdAt,
      updatedAt: createdAt,
      metadata: input.metadata ?? {},
    };

    entitlements.set(entitlement.id, cloneEntitlement(entitlement));
    return cloneEntitlement(entitlement);
  }

  async getEntitlement(entitlementId: string) {
    const entitlement = entitlements.get(entitlementId);
    return entitlement ? cloneEntitlement(entitlement) : null;
  }

  async findEntitlementsBySubject(subjectHash: string) {
    return Array.from(entitlements.values())
      .filter((item) => item.subjectHash === subjectHash)
      .map(cloneEntitlement);
  }

  async listEntitlements() {
    return Array.from(entitlements.values()).map(cloneEntitlement);
  }

  async updateEntitlement(entitlementId: string, patch: CommercialEntitlementUpdateInput) {
    const entitlement = entitlements.get(entitlementId);
    if (!entitlement) return null;

    const next: CommercialEntitlement = {
      ...entitlement,
      ...patch,
      orderId: patch.orderId ?? entitlement.orderId,
      expiresAt: patch.expiresAt ?? entitlement.expiresAt,
      consumedAt: patch.consumedAt ?? entitlement.consumedAt,
      revokedAt: patch.revokedAt ?? entitlement.revokedAt,
      metadata: patch.metadata ?? entitlement.metadata,
      updatedAt: nowIso(),
    };

    entitlements.set(entitlementId, cloneEntitlement(next));
    return cloneEntitlement(next);
  }

  async recordPaymentEvent(input: {
    id?: string;
    orderId: string | null;
    eventType: PaymentEventType;
    provider: "mock" | "sandbox";
    signatureValid: boolean;
    payload: unknown;
    createdAt?: string;
  }) {
    const event: PaymentEvent = {
      id: input.id ?? randomUUID(),
      orderId: input.orderId,
      eventType: input.eventType,
      provider: input.provider,
      signatureValid: input.signatureValid,
      payload: input.payload as never,
      createdAt: input.createdAt ?? nowIso(),
    };

    paymentEvents.set(event.id, clonePaymentEvent(event));
    return clonePaymentEvent(event);
  }

  async listPaymentEvents() {
    return Array.from(paymentEvents.values()).map(clonePaymentEvent);
  }
}

export function createMemoryCommercialRepository() {
  return new MemoryCommercialRepository();
}
