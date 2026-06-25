import { getSupabaseAdminClient, type JsonValue } from "../../supabase";
import type {
  CommercialEntitlement,
  CommercialEntitlementCreateInput,
  CommercialEntitlementUpdateInput,
  CommercialEntitlementsTableRow,
  CommercialOrder,
  CommercialOrderCreateInput,
  CommercialOrdersTableRow,
  CommercialOrderUpdateInput,
  CommercialProduct,
  CommercialProductsTableRow,
  PaymentEvent,
  PaymentEventsTableRow,
} from "../types";
import type { CommercialRepository } from "./types";

function toIso(value: string | null | undefined) {
  return value ?? null;
}

function rowToOrder(row: CommercialOrdersTableRow): CommercialOrder {
  return {
    id: row.id,
    idempotencyKey: row.idempotency_key,
    subjectHash: row.subject_hash,
    productCode: row.product_code,
    status: row.status,
    amountCents: row.amount_cents,
    currency: row.currency as "USD",
    provider: row.provider as "mock" | "sandbox",
    checkoutUrl: row.checkout_url,
    providerSessionId: row.provider_session_id,
    providerPaymentIntentId: row.provider_payment_intent_id,
    metadata: row.metadata as JsonValue,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    paidAt: row.paid_at,
    fulfilledAt: row.fulfilled_at,
    cancelledAt: row.cancelled_at,
    refundedAt: row.refunded_at,
  };
}

function rowToEntitlement(row: CommercialEntitlementsTableRow): CommercialEntitlement {
  return {
    id: row.id,
    subjectHash: row.subject_hash,
    entitlementType: row.entitlement_type,
    productCode: row.product_code,
    status: row.status,
    orderId: row.order_id,
    expiresAt: row.expires_at,
    consumedAt: row.consumed_at,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    metadata: row.metadata as JsonValue,
  };
}

function rowToEvent(row: PaymentEventsTableRow): PaymentEvent {
  return {
    id: row.id,
    orderId: row.order_id,
    eventType: row.event_type,
    provider: row.provider as "mock" | "sandbox",
    signatureValid: row.signature_valid,
    payload: row.payload as JsonValue,
    createdAt: row.created_at,
  };
}

export class DatabaseCommercialRepository implements CommercialRepository {
  private get client() {
    return getSupabaseAdminClient();
  }

  async syncProducts(products: CommercialProduct[]) {
    const client = this.client;
    if (!client) return;

    const now = new Date().toISOString();
    await client.from("commercial_products").upsert(
      products.map((product) => ({
        code: product.code,
        name: product.name,
        description: product.description,
        price_cents: product.priceCents,
        currency: product.currency,
        active: product.active,
        entitlement_type: product.entitlementType,
        created_at: now,
        updated_at: now,
      })),
      { onConflict: "code" },
    );
  }

  async listProducts() {
    const client = this.client;
    if (!client) return [];

    const { data } = await client.from("commercial_products").select("*");
    return (data ?? []).map((row: CommercialProductsTableRow) => ({
      code: row.code,
      name: row.name,
      description: row.description,
      priceCents: row.price_cents,
      currency: row.currency as "USD",
      active: row.active,
      entitlementType: row.entitlement_type,
    }));
  }

  async createOrder(input: CommercialOrderCreateInput) {
    const client = this.client;
    if (!client) throw new Error("SUPABASE_UNAVAILABLE");

    const payload = {
      id: input.id,
      idempotency_key: input.idempotencyKey,
      subject_hash: input.subjectHash,
      product_code: input.productCode,
      status: input.status ?? "created",
      amount_cents: input.amountCents,
      currency: input.currency,
      provider: input.provider,
      checkout_url: input.checkoutUrl,
      provider_session_id: input.providerSessionId ?? null,
      provider_payment_intent_id: input.providerPaymentIntentId ?? null,
      metadata: input.metadata ?? {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      paid_at: null,
      fulfilled_at: null,
      cancelled_at: null,
      refunded_at: null,
    };

    const { data, error } = await client.from("commercial_orders").upsert(payload, { onConflict: "id" }).select("*").single();
    if (error || !data) throw error ?? new Error("Failed to create order");
    return rowToOrder(data);
  }

  async getOrder(orderId: string) {
    const client = this.client;
    if (!client) return null;
    const { data } = await client.from("commercial_orders").select("*").eq("id", orderId).maybeSingle();
    return data ? rowToOrder(data) : null;
  }

  async getOrderByIdempotencyKey(idempotencyKey: string) {
    const client = this.client;
    if (!client) return null;
    const { data } = await client.from("commercial_orders").select("*").eq("idempotency_key", idempotencyKey).maybeSingle();
    return data ? rowToOrder(data) : null;
  }

  async updateOrder(orderId: string, patch: CommercialOrderUpdateInput) {
    const client = this.client;
    if (!client) return null;
    const payload: Record<string, JsonValue> = {};
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.checkoutUrl !== undefined) payload.checkout_url = patch.checkoutUrl;
    if (patch.providerSessionId !== undefined) payload.provider_session_id = patch.providerSessionId as JsonValue;
    if (patch.providerPaymentIntentId !== undefined) payload.provider_payment_intent_id = patch.providerPaymentIntentId as JsonValue;
    if (patch.paidAt !== undefined) payload.paid_at = toIso(patch.paidAt);
    if (patch.fulfilledAt !== undefined) payload.fulfilled_at = toIso(patch.fulfilledAt);
    if (patch.cancelledAt !== undefined) payload.cancelled_at = toIso(patch.cancelledAt);
    if (patch.refundedAt !== undefined) payload.refunded_at = toIso(patch.refundedAt);
    if (patch.metadata !== undefined) payload.metadata = patch.metadata as JsonValue;
    payload.updated_at = new Date().toISOString();
    const { data } = await client.from("commercial_orders").update(payload).eq("id", orderId).maybeSingle();
    return data ? rowToOrder(data) : null;
  }

  async listOrders() {
    const client = this.client;
    if (!client) return [];
    const { data } = await client.from("commercial_orders").select("*");
    return (data ?? []).map(rowToOrder);
  }

  async createEntitlement(input: CommercialEntitlementCreateInput) {
    const client = this.client;
    if (!client) throw new Error("SUPABASE_UNAVAILABLE");
    const payload = {
      id: input.id,
      subject_hash: input.subjectHash,
      entitlement_type: input.entitlementType,
      product_code: input.productCode,
      status: input.status,
      order_id: input.orderId ?? null,
      expires_at: input.expiresAt ?? null,
      consumed_at: input.consumedAt ?? null,
      revoked_at: input.revokedAt ?? null,
      metadata: input.metadata ?? {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await client.from("commercial_entitlements").upsert(payload, { onConflict: "id" }).select("*").single();
    if (error || !data) throw error ?? new Error("Failed to create entitlement");
    return rowToEntitlement(data);
  }

  async getEntitlement(entitlementId: string) {
    const client = this.client;
    if (!client) return null;
    const { data } = await client.from("commercial_entitlements").select("*").eq("id", entitlementId).maybeSingle();
    return data ? rowToEntitlement(data) : null;
  }

  async findEntitlementsBySubject(subjectHash: string) {
    const client = this.client;
    if (!client) return [];
    const { data } = await client.from("commercial_entitlements").select("*").eq("subject_hash", subjectHash);
    return (data ?? []).map(rowToEntitlement);
  }

  async listEntitlements() {
    const client = this.client;
    if (!client) return [];
    const { data } = await client.from("commercial_entitlements").select("*");
    return (data ?? []).map(rowToEntitlement);
  }

  async updateEntitlement(entitlementId: string, patch: CommercialEntitlementUpdateInput) {
    const client = this.client;
    if (!client) return null;
    const payload: Record<string, JsonValue> = {};
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.orderId !== undefined) payload.order_id = patch.orderId as JsonValue;
    if (patch.expiresAt !== undefined) payload.expires_at = patch.expiresAt as JsonValue;
    if (patch.consumedAt !== undefined) payload.consumed_at = patch.consumedAt as JsonValue;
    if (patch.revokedAt !== undefined) payload.revoked_at = patch.revokedAt as JsonValue;
    if (patch.metadata !== undefined) payload.metadata = patch.metadata as JsonValue;
    payload.updated_at = new Date().toISOString();
    const { data } = await client.from("commercial_entitlements").update(payload).eq("id", entitlementId).maybeSingle();
    return data ? rowToEntitlement(data) : null;
  }

  async recordPaymentEvent(input: {
    id?: string;
    orderId: string | null;
    eventType: PaymentEvent["eventType"];
    provider: "mock" | "sandbox";
    signatureValid: boolean;
    payload: JsonValue;
    createdAt?: string;
  }) {
    const client = this.client;
    if (!client) throw new Error("SUPABASE_UNAVAILABLE");
    const payload = {
      id: input.id,
      order_id: input.orderId,
      event_type: input.eventType,
      provider: input.provider,
      signature_valid: input.signatureValid,
      payload: input.payload,
      created_at: input.createdAt ?? new Date().toISOString(),
    };
    const { data, error } = await client.from("payment_events").insert(payload).select("*").single();
    if (error || !data) throw error ?? new Error("Failed to create payment event");
    return rowToEvent(data);
  }

  async listPaymentEvents() {
    const client = this.client;
    if (!client) return [];
    const { data } = await client.from("payment_events").select("*");
    return (data ?? []).map(rowToEvent);
  }
}

export function createDatabaseCommercialRepository() {
  return new DatabaseCommercialRepository();
}
