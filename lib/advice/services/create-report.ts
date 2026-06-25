import { createHash, randomUUID } from "node:crypto";

import { createDefaultAdviceReportRepository } from "../repository/default-advice-report-repository";
import type { AdviceReportGenerationMode } from "../repository/types";
import type { AdviceFeedbackRecord, AdviceReportRecord } from "../repository/types";
import { ADVICE_PROMPT_VERSION } from "../types";
import type { AdviceReport, AdviceGenerateRequest } from "../types";
import { getAdviceRuntimeConfig } from "../runtime";
import { flushAdviceDailySubmission } from "../usage";
import type { AdviceEntitlementType } from "../repository/types";

const repository = createDefaultAdviceReportRepository();

function hashAccessToken(accessToken: string) {
  return createHash("sha256").update(accessToken).digest("hex");
}

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}

function mapGenerationMode(mode: AdviceReport["generation"]["mode"]): AdviceReportGenerationMode {
  switch (mode) {
    case "local":
      return "local_only";
    case "ai":
      return "ai_enhanced";
    case "ai_fallback":
      return "ai_fallback";
    case "high_risk_local":
      return "high_risk_local";
    default:
      return "local_only";
  }
}

export function createAdviceAccessToken() {
  return randomUUID().replaceAll("-", "") + randomUUID().replaceAll("-", "").slice(0, 16);
}

export function getAdviceAccessTokenHash(accessToken: string) {
  return hashAccessToken(accessToken);
}

export type PersistAdviceReportInput = {
  report: AdviceReport;
  input: AdviceGenerateRequest;
  cohortId?: string | null;
  diagnostics?: {
    durationMs?: number;
    estimatedInputTokens?: number;
    estimatedOutputTokens?: number;
    estimatedCost?: number;
    fallbackReasonCode?: string | null;
    validationFailureCodes?: string[] | null;
  };
  accessToken?: string;
  reportId?: string;
  entitlementType?: AdviceEntitlementType;
};

export type PersistAdviceReportResult = {
  reportId: string;
  accessToken: string;
  accessTokenHash: string;
  record: AdviceReportRecord | null;
};

export async function persistAdviceReport({
  report,
  input,
  cohortId,
  diagnostics,
  accessToken,
  reportId,
  entitlementType,
}: PersistAdviceReportInput): Promise<PersistAdviceReportResult> {
  const config = getAdviceRuntimeConfig();
  const finalReportId = reportId || randomUUID();
  const finalAccessToken = accessToken || createAdviceAccessToken();
  const createdAt = new Date();
  const updatedAt = createdAt;
  const expiresAt = new Date(createdAt.getTime() + config.reportRetentionDays * 24 * 60 * 60 * 1000);
  const accessTokenHash = hashAccessToken(finalAccessToken);
  const estimatedInputTokens =
    diagnostics?.estimatedInputTokens ?? estimateTokens(JSON.stringify(input));
  const estimatedOutputTokens =
    diagnostics?.estimatedOutputTokens ?? estimateTokens(JSON.stringify(report));
  const estimatedCost =
    diagnostics?.estimatedCost ?? Number(((estimatedInputTokens + estimatedOutputTokens) / 1000 * 0.002).toFixed(4));

  const record = await repository.createReport({
    id: finalReportId,
    accessTokenHash,
    createdAt,
    updatedAt,
    expiresAt,
    locale: report.locale,
    cohortId: cohortId ?? null,
    relationshipStage: report.relationshipStage,
    primaryConcern: report.primaryConcern,
    generationMode: mapGenerationMode(report.generation.mode),
    safetyLevel: report.safety.isHighRisk ? "high" : "low",
    provider: report.generation.provider,
    model: report.generation.model,
    promptVersion: process.env.ADVICE_PROMPT_VERSION || ADVICE_PROMPT_VERSION,
    adviceVersion: report.version,
    entitlementType:
      entitlementType ?? (config.betaEnabled ? "beta" : "free"),
    reportPayload: report,
    durationMs: diagnostics?.durationMs ?? null,
    estimatedInputTokens,
    estimatedOutputTokens,
    estimatedCost,
    fallbackReasonCode: diagnostics?.fallbackReasonCode ?? null,
    validationFailureCodes: diagnostics?.validationFailureCodes ?? null,
    deletedAt: null,
  });

  await flushAdviceDailySubmission(report, {
    reportId: finalReportId,
    durationMs: diagnostics?.durationMs ?? null,
    estimatedInputTokens: estimatedInputTokens,
    estimatedOutputTokens: estimatedOutputTokens,
    estimatedCost: estimatedCost,
    fallbackReasonCode: diagnostics?.fallbackReasonCode ?? null,
    validationFailureCodes: diagnostics?.validationFailureCodes ?? null,
  });

  return {
    reportId: finalReportId,
    accessToken: finalAccessToken,
    accessTokenHash,
    record,
  };
}

export async function saveAdviceFeedback(input: AdviceFeedbackRecord) {
  return repository.saveFeedback(input);
}
