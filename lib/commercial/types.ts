import type { JsonValue } from "../supabase";

export type CommercialProductCode =
  | "free_basic"
  | "deep_advice_single"
  | "deep_advice_reviewed";

export type CommercialEntitlementType = "beta" | "paid_basic" | "paid_deep";

export type OrderStatus =
  | "created"
  | "pending_payment"
  | "paid"
  | "fulfilled"
  | "failed"
  | "cancelled"
  | "refunded";

export type EntitlementStatus =
  | "pending"
  | "active"
  | "consumed"
  | "expired"
  | "refunded"
  | "revoked";

export type PaymentEventType =
  | "checkout_created"
  | "payment_succeeded"
  | "payment_failed"
  | "payment_refunded"
  | "entitlement_consumed"
  | "entitlement_restored";

export type CommercialProduct = {
  code: CommercialProductCode;
  name: string;
  description: string;
  priceCents: number;
  currency: "USD";
  active: boolean;
  entitlementType: CommercialEntitlementType | "beta";
};

export type CommercialOrder = {
  id: string;
  idempotencyKey: string;
  subjectHash: string;
  productCode: CommercialProductCode;
  status: OrderStatus;
  amountCents: number;
  currency: "USD";
  provider: "mock" | "sandbox";
  checkoutUrl: string;
  providerSessionId: string | null;
  providerPaymentIntentId: string | null;
  metadata: JsonValue;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  fulfilledAt: string | null;
  cancelledAt: string | null;
  refundedAt: string | null;
};

export type CommercialEntitlement = {
  id: string;
  subjectHash: string;
  entitlementType: CommercialEntitlementType | "beta";
  productCode: CommercialProductCode;
  status: EntitlementStatus;
  orderId: string | null;
  expiresAt: string | null;
  consumedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
  metadata: JsonValue;
};

export type PaymentEvent = {
  id: string;
  orderId: string | null;
  eventType: PaymentEventType;
  provider: "mock" | "sandbox";
  signatureValid: boolean;
  payload: JsonValue;
  createdAt: string;
};

export type CommercialOrderCreateInput = {
  id?: string;
  idempotencyKey: string;
  subjectHash: string;
  productCode: CommercialProductCode;
  amountCents: number;
  currency: "USD";
  provider: "mock" | "sandbox";
  checkoutUrl: string;
  providerSessionId?: string | null;
  providerPaymentIntentId?: string | null;
  metadata?: JsonValue;
  status?: OrderStatus;
};

export type CommercialOrderUpdateInput = Partial<
  Pick<
    CommercialOrder,
    | "status"
    | "checkoutUrl"
    | "providerSessionId"
    | "providerPaymentIntentId"
    | "paidAt"
    | "fulfilledAt"
    | "cancelledAt"
    | "refundedAt"
    | "metadata"
  >
>;

export type CommercialEntitlementCreateInput = {
  id?: string;
  subjectHash: string;
  entitlementType: CommercialEntitlementType | "beta";
  productCode: CommercialProductCode;
  status: EntitlementStatus;
  orderId?: string | null;
  expiresAt?: string | null;
  consumedAt?: string | null;
  revokedAt?: string | null;
  metadata?: JsonValue;
};

export type CommercialEntitlementUpdateInput = Partial<
  Pick<
    CommercialEntitlement,
    | "status"
    | "orderId"
    | "expiresAt"
    | "consumedAt"
    | "revokedAt"
    | "metadata"
  >
>;

export type CommercialProductsTableRow = {
  code: CommercialProductCode;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  active: boolean;
  entitlement_type: CommercialEntitlementType | "beta";
  created_at: string;
  updated_at: string;
};

export type CommercialOrdersTableRow = {
  id: string;
  idempotency_key: string;
  subject_hash: string;
  product_code: CommercialProductCode;
  status: OrderStatus;
  amount_cents: number;
  currency: string;
  provider: "mock" | "sandbox";
  checkout_url: string;
  provider_session_id: string | null;
  provider_payment_intent_id: string | null;
  metadata: JsonValue;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  fulfilled_at: string | null;
  cancelled_at: string | null;
  refunded_at: string | null;
};

export type CommercialEntitlementsTableRow = {
  id: string;
  subject_hash: string;
  entitlement_type: CommercialEntitlementType | "beta";
  product_code: CommercialProductCode;
  status: EntitlementStatus;
  order_id: string | null;
  expires_at: string | null;
  consumed_at: string | null;
  revoked_at: string | null;
  metadata: JsonValue;
  created_at: string;
  updated_at: string;
};

export type PaymentEventsTableRow = {
  id: string;
  order_id: string | null;
  event_type: PaymentEventType;
  provider: "mock" | "sandbox";
  signature_valid: boolean;
  payload: JsonValue;
  created_at: string;
};
