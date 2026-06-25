import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "../../app/api/advice/generate/route";
import { resetAdviceControlState } from "../../lib/advice/controls";
import { resetAdviceRateLimitState } from "../../lib/advice/rate-limit";
import { resetAdviceDailyUsageState } from "../../lib/advice/usage";
import { resetMemoryAdviceReportRepository } from "../../lib/advice/repository/memory-advice-report-repository";

describe("advice api route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetAdviceRateLimitState();
    resetAdviceControlState();
    resetAdviceDailyUsageState();
    resetMemoryAdviceReportRepository();
  });

  it("returns 400 for invalid input", async () => {
    const response = await POST(
      new Request("http://localhost/api/advice/generate", {
        method: "POST",
        body: JSON.stringify({ mode: "local" }),
        headers: { "content-type": "application/json" },
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns local advice in local mode", async () => {
    const response = await POST(
      new Request("http://localhost/api/advice/generate", {
        method: "POST",
        body: JSON.stringify({
          mode: "local",
          locale: "en",
          question: "How should I read this distance?",
          relationshipStage: "conflict-distance",
          primaryConcern: "distance",
        }),
        headers: { "content-type": "application/json" },
      }),
    );

    const json = (await response.json()) as { success: boolean; data?: { generation: { mode: string } } };
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data?.generation.mode).toBe("local");
  });

  it("returns ai advice through the mock provider", async () => {
    vi.stubEnv("ADVICE_AI_ENABLED", "true");
    vi.stubEnv("ADVICE_AI_PROVIDER", "mock");
    vi.stubEnv("MOCK_ADVICE_PROVIDER_BEHAVIOR", "success");

    const response = await POST(
      new Request("http://localhost/api/advice/generate", {
        method: "POST",
        body: JSON.stringify({
          mode: "ai",
          locale: "en",
          question: "How should I communicate better?",
          relationshipStage: "conflict-distance",
          primaryConcern: "communication",
        }),
        headers: { "content-type": "application/json" },
      }),
    );

    const json = (await response.json()) as { success: boolean; data?: { generation: { mode: string } } };
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data?.generation.mode).toBe("ai");
  });

  it("falls back when mock AI output is invalid", async () => {
    vi.stubEnv("ADVICE_AI_ENABLED", "true");
    vi.stubEnv("ADVICE_AI_PROVIDER", "mock");
    vi.stubEnv("MOCK_ADVICE_PROVIDER_BEHAVIOR", "invalid_json");

    const response = await POST(
      new Request("http://localhost/api/advice/generate", {
        method: "POST",
        body: JSON.stringify({
          mode: "ai",
          locale: "en",
          question: "How should I communicate better?",
          relationshipStage: "conflict-distance",
          primaryConcern: "communication",
        }),
        headers: { "content-type": "application/json" },
      }),
    );

    const json = (await response.json()) as { success: boolean; data?: { generation: { mode: string } } };
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data?.generation.mode).toBe("ai_fallback");
  });
});
