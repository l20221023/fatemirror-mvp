import { afterEach, describe, expect, it, vi } from "vitest";

import { generateAdvice } from "../../lib/advice/generate-advice";
import { MockAdviceProvider } from "../../lib/advice/providers/mock-provider";
import { cleanupExpiredAdviceReports, previewExpiredAdviceReports } from "../../lib/advice/services/cleanup-expired-reports";
import { getAdviceReportById } from "../../lib/advice/services/get-report";
import { createDefaultAdviceReportRepository } from "../../lib/advice/repository/default-advice-report-repository";
import { resetMemoryAdviceReportRepository } from "../../lib/advice/repository/memory-advice-report-repository";
import { getAdviceAccessTokenHash } from "../../lib/advice/services/create-report";
import { resetAdviceControlState } from "../../lib/advice/controls";
import { resetAdviceDailyUsageState } from "../../lib/advice/usage";

describe("cleanup expired reports", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetAdviceControlState();
    resetAdviceDailyUsageState();
  });

  it("finds and removes expired reports", async () => {
    resetMemoryAdviceReportRepository();
    vi.stubEnv("ADVICE_REPORT_RETENTION_DAYS", "7");

    const provider = new MockAdviceProvider("success");
    const generated = await generateAdvice(
      {
        mode: "local",
        locale: "en",
        question: "What should I focus on?",
        relationshipStage: "conflict-distance",
        primaryConcern: "communication",
      },
      provider,
      { betaAccessGranted: true, aiRequestAllowed: true },
    );

    const repository = createDefaultAdviceReportRepository();
    await repository.createReport({
      id: "expired-report",
      accessTokenHash: getAdviceAccessTokenHash("expired-token"),
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      expiresAt: new Date("2026-01-02T00:00:00.000Z"),
      locale: generated.report.locale,
      relationshipStage: generated.report.relationshipStage,
      primaryConcern: generated.report.primaryConcern,
      generationMode: "local_only",
      safetyLevel: generated.report.safety.isHighRisk ? "high" : "low",
      provider: generated.report.generation.provider,
      model: generated.report.generation.model,
      promptVersion: "v-test",
      adviceVersion: generated.report.version,
      entitlementType: "free",
      reportPayload: generated.report,
      durationMs: 42,
      estimatedInputTokens: 10,
      estimatedOutputTokens: 20,
      estimatedCost: 0.001,
      fallbackReasonCode: null,
      validationFailureCodes: null,
      deletedAt: null,
    });

    const preview = await previewExpiredAdviceReports(7);
    expect(preview.eligible).toBe(1);

    const cleanup = await cleanupExpiredAdviceReports({ dryRun: false, retentionDays: 7 });
    expect(cleanup.cleaned).toBe(1);

    const deleted = await getAdviceReportById("expired-report");
    expect(deleted).toBeNull();
  });

  it("paginates cleanup batches without touching the full set", async () => {
    resetMemoryAdviceReportRepository();
    vi.stubEnv("ADVICE_REPORT_RETENTION_DAYS", "7");

    const provider = new MockAdviceProvider("success");
    const generated = await generateAdvice(
      {
        mode: "local",
        locale: "en",
        question: "What should I focus on?",
        relationshipStage: "conflict-distance",
        primaryConcern: "communication",
      },
      provider,
      { betaAccessGranted: true, aiRequestAllowed: true },
    );

    const repository = createDefaultAdviceReportRepository();
    for (const id of ["expired-a", "expired-b"]) {
      await repository.createReport({
        id,
        accessTokenHash: getAdviceAccessTokenHash(`${id}-token`),
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        expiresAt: new Date("2026-01-02T00:00:00.000Z"),
        locale: generated.report.locale,
        relationshipStage: generated.report.relationshipStage,
        primaryConcern: generated.report.primaryConcern,
        generationMode: "local_only",
        safetyLevel: generated.report.safety.isHighRisk ? "high" : "low",
        provider: generated.report.generation.provider,
        model: generated.report.generation.model,
        promptVersion: "v-test",
        adviceVersion: generated.report.version,
        entitlementType: "free",
        reportPayload: generated.report,
        durationMs: 42,
        estimatedInputTokens: 10,
        estimatedOutputTokens: 20,
        estimatedCost: 0.001,
        fallbackReasonCode: null,
        validationFailureCodes: null,
        deletedAt: null,
      });
    }

    const cleanup = await cleanupExpiredAdviceReports({ dryRun: false, retentionDays: 7, limit: 1, offset: 0 });
    expect(cleanup.cleaned).toBe(1);
    expect(cleanup.hasMore).toBe(true);
  });
});
