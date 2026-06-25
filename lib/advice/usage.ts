import { randomUUID } from "node:crypto";

import { getSupabaseAdminClient } from "../supabase";
import type { AdviceReport } from "./types";
import type { AdviceReportGenerationMode } from "./repository/types";

type AdviceUsageDailyRow = {
  date: string;
  submitted_count: number;
  ai_request_count: number;
  ai_success_count: number;
  ai_downgrade_count: number;
  rate_limited_count: number;
  invite_failure_count: number;
  local_only_count: number;
  ai_enhanced_count: number;
  ai_fallback_count: number;
  high_risk_count: number;
  total_generation_ms: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost_usd: number;
};

const memoryDailyUsage = new Map<string, AdviceUsageDailyRow>();

function getDateKey(value = new Date()) {
  return value.toISOString().slice(0, 10);
}

function ensureRow(date: string) {
  const existing = memoryDailyUsage.get(date);
  if (existing) return existing;

  const next: AdviceUsageDailyRow = {
    date,
    submitted_count: 0,
    ai_request_count: 0,
    ai_success_count: 0,
    ai_downgrade_count: 0,
    rate_limited_count: 0,
    invite_failure_count: 0,
    local_only_count: 0,
    ai_enhanced_count: 0,
    ai_fallback_count: 0,
    high_risk_count: 0,
    total_generation_ms: 0,
    total_input_tokens: 0,
    total_output_tokens: 0,
    total_cost_usd: 0,
  };

  memoryDailyUsage.set(date, next);
  return next;
}

function bumpGenerationMode(row: AdviceUsageDailyRow, mode: AdviceReportGenerationMode) {
  if (mode === "local_only") row.local_only_count += 1;
  if (mode === "ai_enhanced") row.ai_enhanced_count += 1;
  if (mode === "ai_fallback") row.ai_fallback_count += 1;
  if (mode === "high_risk_local") row.high_risk_count += 1;
}

export function recordAdviceDailySubmission(report: AdviceReport, diagnostics: {
  durationMs?: number | null;
  estimatedInputTokens?: number | null;
  estimatedOutputTokens?: number | null;
  estimatedCost?: number | null;
}) {
  const date = getDateKey();
  const row = ensureRow(date);
  row.submitted_count += 1;
  row.total_generation_ms += diagnostics.durationMs ?? 0;
  row.total_input_tokens += diagnostics.estimatedInputTokens ?? 0;
  row.total_output_tokens += diagnostics.estimatedOutputTokens ?? 0;
  row.total_cost_usd += diagnostics.estimatedCost ?? 0;
  bumpGenerationMode(row, mapGenerationMode(report.generation.mode));
}

export function recordAdviceDailyAttempt(input: {
  aiRequested: boolean;
  aiSucceeded: boolean;
  aiDowngraded: boolean;
  rateLimited: boolean;
  inviteFailure: boolean;
}) {
  const row = ensureRow(getDateKey());
  if (input.aiRequested) row.ai_request_count += 1;
  if (input.aiSucceeded) row.ai_success_count += 1;
  if (input.aiDowngraded) row.ai_downgrade_count += 1;
  if (input.rateLimited) row.rate_limited_count += 1;
  if (input.inviteFailure) row.invite_failure_count += 1;
}

function mapGenerationMode(mode: AdviceReport["generation"]["mode"]): AdviceReportGenerationMode {
  if (mode === "ai") return "ai_enhanced";
  if (mode === "ai_fallback") return "ai_fallback";
  if (mode === "high_risk_local") return "high_risk_local";
  return "local_only";
}

export async function flushAdviceDailySubmission(report: AdviceReport, diagnostics: {
  durationMs?: number | null;
  estimatedInputTokens?: number | null;
  estimatedOutputTokens?: number | null;
  estimatedCost?: number | null;
  fallbackReasonCode?: string | null;
  validationFailureCodes?: string[] | null;
  reportId?: string | null;
}) {
  recordAdviceDailySubmission(report, diagnostics);

  const client = getSupabaseAdminClient();
  if (!client) {
    return;
  }

  const date = getDateKey();
  const row = ensureRow(date);
  await client.from("advice_usage_daily").upsert(row, { onConflict: "date" });
  await client.from("advice_generation_events").insert({
    request_id: randomUUID(),
    report_id: diagnostics.reportId ?? null,
    generation_mode: mapGenerationMode(report.generation.mode),
    provider: report.generation.provider,
    model: report.generation.model,
    prompt_version: process.env.ADVICE_PROMPT_VERSION || "v0.3.0",
    advice_version: report.version,
    duration_ms: diagnostics.durationMs ?? null,
    estimated_input_tokens: diagnostics.estimatedInputTokens ?? null,
    estimated_output_tokens: diagnostics.estimatedOutputTokens ?? null,
    estimated_cost_usd: diagnostics.estimatedCost ?? null,
    fallback_reason_code: diagnostics.fallbackReasonCode ?? null,
    validation_failure_codes: diagnostics.validationFailureCodes ?? null,
    safety_level: report.safety.isHighRisk ? "high" : "low",
    created_at: new Date().toISOString(),
  });
}

export function getAdviceDailyUsageSnapshot() {
  const row = ensureRow(getDateKey());
  return structuredClone(row);
}

export function resetAdviceDailyUsageState() {
  memoryDailyUsage.clear();
}
