import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { generateAdvice } from "../../lib/advice/generate-advice";
import { MockAdviceProvider } from "../../lib/advice/providers/mock-provider";
import { persistAdviceReport, saveAdviceFeedback } from "../../lib/advice/services/create-report";
import { deleteAdviceReport } from "../../lib/advice/services/delete-report";
import { getAdviceReport } from "../../lib/advice/services/get-report";
import { getAdviceMetrics } from "../../lib/advice/services/metrics";
import {
  resetAdviceRateLimitState,
} from "../../lib/advice/rate-limit";
import { resetAdviceControlState } from "../../lib/advice/controls";
import { resetAdviceDailyUsageState } from "../../lib/advice/usage";
import {
  resetMemoryAdviceReportRepository,
} from "../../lib/advice/repository/memory-advice-report-repository";
import { createBetaAccessToken, verifyBetaAccessToken } from "../../lib/beta-access/tokens";

describe("advice report lifecycle", () => {
  beforeEach(() => {
    resetMemoryAdviceReportRepository();
    resetAdviceRateLimitState();
    resetAdviceControlState();
    resetAdviceDailyUsageState();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("hashes access tokens and preserves only the hashed value", async () => {
    const { report } = await generateAdvice(
      {
        mode: "local",
        locale: "en",
        question: "How should I communicate better?",
        relationshipStage: "conflict-distance",
        primaryConcern: "communication",
      },
      new MockAdviceProvider("success"),
    );

    const persisted = await persistAdviceReport({
      report,
      input: {
        mode: "local",
        locale: "en",
        question: "How should I communicate better?",
        relationshipStage: "conflict-distance",
        primaryConcern: "communication",
      },
      accessToken: "plain-access-token",
      diagnostics: {
        durationMs: 25,
        estimatedInputTokens: 20,
        estimatedOutputTokens: 30,
        estimatedCost: 0.001,
        fallbackReasonCode: "local_mode",
        validationFailureCodes: null,
      },
    });

    expect(persisted.accessTokenHash).not.toBe("plain-access-token");
    expect(persisted.accessTokenHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("creates, reads, updates feedback, and deletes a report", async () => {
    vi.stubEnv("ADVICE_AI_ENABLED", "true");

    const generated = await generateAdvice(
      {
        mode: "ai",
        locale: "en",
        question: "How should I communicate better?",
        relationshipStage: "conflict-distance",
        primaryConcern: "communication",
      },
      new MockAdviceProvider("success"),
      { betaAccessGranted: true, aiRequestAllowed: true },
    );

    const persisted = await persistAdviceReport({
      report: generated.report,
      input: {
        mode: "ai",
        locale: "en",
        question: "How should I communicate better?",
        relationshipStage: "conflict-distance",
        primaryConcern: "communication",
      },
      accessToken: "report-access-token",
      diagnostics: generated.diagnostics,
    });

    const fetched = await getAdviceReport(persisted.reportId, persisted.accessToken);
    expect(fetched?.reportPayload.generation.mode).toBe("ai");

    await saveAdviceFeedback({
      reportId: persisted.reportId,
      helpfulness: "helpful",
      reasons: ["not_actionable"],
      createdAt: new Date(),
    });

    const metricsBeforeDelete = await getAdviceMetrics();
    expect(metricsBeforeDelete.feedbackBreakdown.helpful).toBe(1);

    await deleteAdviceReport(persisted.reportId, persisted.accessToken);
    const afterDelete = await getAdviceReport(persisted.reportId, persisted.accessToken);
    expect(afterDelete).toBeNull();

    const metricsAfterDelete = await getAdviceMetrics();
    expect(metricsAfterDelete.feedbackBreakdown.helpful).toBe(0);
  });

  it("falls back to local advice when beta access is missing", async () => {
    vi.stubEnv("ADVICE_AI_ENABLED", "true");

    const { report } = await generateAdvice(
      {
        mode: "ai",
        locale: "en",
        question: "How should I communicate better?",
        relationshipStage: "conflict-distance",
        primaryConcern: "communication",
      },
      new MockAdviceProvider("success"),
      { betaAccessGranted: false, aiRequestAllowed: true },
    );

    expect(report.generation.mode).toBe("ai_fallback");
  });

  it("creates and validates beta access tokens", () => {
    vi.stubEnv("ADVICE_BETA_ACCESS_SECRET", "unit-test-secret");

    const token = createBetaAccessToken();
    expect(token).toBeTruthy();
    expect(verifyBetaAccessToken(token)).toBe(true);
    expect(verifyBetaAccessToken("bad-token")).toBe(false);
  });
});
