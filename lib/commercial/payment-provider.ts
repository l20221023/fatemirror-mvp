import type { CommercialOrder, PaymentEventType } from "./types";

export type CommercialPaymentWebhookEvent = {
  eventType: PaymentEventType;
  orderId: string;
  providerSessionId: string | null;
  providerPaymentIntentId: string | null;
  payload: unknown;
};

export type CreateCheckoutSessionInput = {
  order: CommercialOrder;
  returnUrl: string;
};

export type CreateCheckoutSessionResult = {
  checkoutUrl: string;
  providerSessionId: string;
};

export type VerifyWebhookSignatureInput = {
  rawBody: string;
  signature: string | null;
};

export type PaymentProvider = {
  name: "mock" | "sandbox";
  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionResult>;
  verifyWebhookSignature(input: VerifyWebhookSignatureInput): boolean;
  parseWebhookEvent(rawBody: string): CommercialPaymentWebhookEvent | null;
};
