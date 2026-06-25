import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildMockPaymentWebhook,
  createCommercialOrder,
  getCommercialOrder,
  handleCommercialWebhook,
} from "../../lib/commercial/order-service";
import { getCommercialEntitlementForProduct } from "../../lib/commercial/entitlement-service";
import { resetMemoryCommercialRepository } from "../../lib/commercial/repository/memory-commercial-repository";
import { getApplicationHealthSnapshot } from "../../lib/health";

describe("commercial sandbox flow", () => {
  beforeEach(() => {
    resetMemoryCommercialRepository();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates an order and grants an entitlement after a signed sandbox webhook", async () => {
    vi.stubEnv("ADVICE_COMMERCIAL_ENABLED", "true");
    vi.stubEnv("ADVICE_PAYMENT_MODE", "mock");

    const order = await createCommercialOrder({
      subject: "session-abc",
      productCode: "deep_advice_single",
      returnUrl: "https://example.com/en/commercial/checkout",
    });

    expect(order.status).toBe("pending_payment");
    expect(order.checkoutUrl).toContain("/en/commercial/checkout/");

    const webhook = buildMockPaymentWebhook(order, "payment_succeeded");
    const result = await handleCommercialWebhook(webhook.rawBody, webhook.signature);

    expect(result.success).toBe(true);

    const updatedOrder = await getCommercialOrder(order.id);
    expect(updatedOrder?.status).toBe("paid");

    const entitlement = await getCommercialEntitlementForProduct("session-abc", "deep_advice_single");
    expect(entitlement?.status).toBe("active");
    expect(entitlement?.orderId).toBe(order.id);
  });

  it("keeps order creation idempotent for the same session and product", async () => {
    vi.stubEnv("ADVICE_COMMERCIAL_ENABLED", "true");
    vi.stubEnv("ADVICE_PAYMENT_MODE", "mock");

    const first = await createCommercialOrder({
      subject: "session-xyz",
      productCode: "deep_advice_single",
      returnUrl: "https://example.com/en/commercial/checkout",
    });
    const second = await createCommercialOrder({
      subject: "session-xyz",
      productCode: "deep_advice_single",
      returnUrl: "https://example.com/en/commercial/checkout",
    });

    expect(second.id).toBe(first.id);
    expect(second.checkoutUrl).toBe(first.checkoutUrl);
  });

  it("reports health without leaking secrets", () => {
    vi.stubEnv("ADVICE_COMMERCIAL_ENABLED", "true");
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "unit-test-role-key");
    const snapshot = getApplicationHealthSnapshot();

    expect(snapshot.healthy).toBe(true);
    expect(snapshot.missingCriticalEnv).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });
});
