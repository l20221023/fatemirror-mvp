import { createHmac, randomUUID } from "node:crypto";

import type {
  CommercialPaymentWebhookEvent,
  CreateCheckoutSessionInput,
  CreateCheckoutSessionResult,
  PaymentProvider,
  VerifyWebhookSignatureInput,
} from "./payment-provider";

function getSecret() {
  return (
    process.env.ADVICE_PAYMENT_WEBHOOK_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.OPENAI_API_KEY ||
    "fatemirror-sandbox-secret"
  );
}

function sign(rawBody: string) {
  return createHmac("sha256", getSecret()).update(rawBody).digest("hex");
}

export function createMockPaymentProvider(): PaymentProvider {
  return {
    name: "mock",
    async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionResult> {
      const providerSessionId = `mock_${randomUUID()}`;
      return {
        checkoutUrl: input.returnUrl,
        providerSessionId,
      };
    },
    verifyWebhookSignature(input: VerifyWebhookSignatureInput) {
      if (!input.signature) return false;
      return sign(input.rawBody) === input.signature;
    },
    parseWebhookEvent(rawBody: string): CommercialPaymentWebhookEvent | null {
      try {
        const parsed = JSON.parse(rawBody) as CommercialPaymentWebhookEvent;
        if (!parsed?.eventType || !parsed.orderId) return null;
        return parsed;
      } catch {
        return null;
      }
    },
  };
}

export function signMockWebhookPayload(event: CommercialPaymentWebhookEvent) {
  const rawBody = JSON.stringify(event);
  return {
    rawBody,
    signature: sign(rawBody),
  };
}
