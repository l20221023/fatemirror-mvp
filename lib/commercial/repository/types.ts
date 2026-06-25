import type { JsonValue } from "../../supabase";
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

export type CommercialRepository = {
  syncProducts(products: CommercialProduct[]): Promise<void>;
  listProducts(): Promise<CommercialProduct[]>;
  createOrder(input: CommercialOrderCreateInput): Promise<CommercialOrder>;
  getOrder(orderId: string): Promise<CommercialOrder | null>;
  getOrderByIdempotencyKey(idempotencyKey: string): Promise<CommercialOrder | null>;
  updateOrder(orderId: string, patch: CommercialOrderUpdateInput): Promise<CommercialOrder | null>;
  listOrders(): Promise<CommercialOrder[]>;
  createEntitlement(input: CommercialEntitlementCreateInput): Promise<CommercialEntitlement>;
  getEntitlement(entitlementId: string): Promise<CommercialEntitlement | null>;
  findEntitlementsBySubject(subjectHash: string): Promise<CommercialEntitlement[]>;
  listEntitlements(): Promise<CommercialEntitlement[]>;
  updateEntitlement(
    entitlementId: string,
    patch: CommercialEntitlementUpdateInput,
  ): Promise<CommercialEntitlement | null>;
  recordPaymentEvent(input: {
    id?: string;
    orderId: string | null;
    eventType: PaymentEventType;
    provider: "mock" | "sandbox";
    signatureValid: boolean;
    payload: JsonValue;
    createdAt?: string;
  }): Promise<PaymentEvent>;
  listPaymentEvents(): Promise<PaymentEvent[]>;
};
