import { getSupabaseServerClient, type JsonValue } from "../../supabase";
import type { AdviceReportRepository } from "./advice-report-repository";
import type {
  AdviceFeedbackDatabaseRow,
  AdviceFeedbackRecord,
  AdviceReportDatabaseRow,
  AdviceReportMetrics,
  AdviceReportRecord,
  AdviceReportRepositoryCreateInput,
  AdviceReportRepositoryUpdateInput,
} from "./types";

function toIso(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function fromIso(value: string | null | undefined) {
  return value ? new Date(value) : null;
}

function reportRowToRecord(row: AdviceReportDatabaseRow): AdviceReportRecord {
  return {
    id: row.id,
    accessTokenHash: row.access_token_hash,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    expiresAt: new Date(row.expires_at),
    locale: row.locale,
    cohortId: row.cohort_id,
    relationshipStage: row.relationship_stage,
    primaryConcern: row.primary_concern,
    generationMode: row.generation_mode,
    safetyLevel: row.safety_level,
    provider: row.provider,
    model: row.model,
    promptVersion: row.prompt_version,
    adviceVersion: row.advice_version,
    entitlementType: row.entitlement_type,
    reportPayload: row.report_payload as AdviceReportRecord["reportPayload"],
    durationMs: row.duration_ms,
    estimatedInputTokens: row.estimated_input_tokens,
    estimatedOutputTokens: row.estimated_output_tokens,
    estimatedCost: row.estimated_cost,
    fallbackReasonCode: row.fallback_reason_code,
    validationFailureCodes: Array.isArray(row.validation_failure_codes)
      ? (row.validation_failure_codes as string[])
      : null,
    deletedAt: fromIso(row.deleted_at),
  };
}

function feedbackRowToRecord(row: AdviceFeedbackDatabaseRow): AdviceFeedbackRecord {
  return {
    reportId: row.report_id,
    helpfulness: row.helpfulness,
    reasons: Array.isArray(row.reasons) ? (row.reasons as AdviceFeedbackRecord["reasons"]) : [],
    createdAt: new Date(row.created_at),
  };
}

export class DatabaseAdviceReportRepository implements AdviceReportRepository {
  async createReport(input: AdviceReportRepositoryCreateInput) {
    const supabase = getSupabaseServerClient();
    if (!supabase) return null;

    const payload = {
      id: input.id,
      access_token_hash: input.accessTokenHash,
      created_at: toIso(input.createdAt ?? new Date())!,
      updated_at: toIso(input.updatedAt ?? input.createdAt ?? new Date())!,
      expires_at: toIso(input.expiresAt)!,
      locale: input.locale,
      cohort_id: input.cohortId ?? null,
      relationship_stage: input.relationshipStage,
      primary_concern: input.primaryConcern,
      generation_mode: input.generationMode,
      safety_level: input.safetyLevel,
      provider: input.provider ?? null,
      model: input.model ?? null,
      prompt_version: input.promptVersion,
      advice_version: input.adviceVersion,
      entitlement_type: input.entitlementType,
      report_payload: input.reportPayload,
      duration_ms: input.durationMs ?? null,
      estimated_input_tokens: input.estimatedInputTokens ?? null,
      estimated_output_tokens: input.estimatedOutputTokens ?? null,
      estimated_cost: input.estimatedCost ?? null,
      fallback_reason_code: input.fallbackReasonCode ?? null,
      validation_failure_codes: input.validationFailureCodes ?? null,
      deleted_at: toIso(input.deletedAt ?? null),
    };

    const { data, error } = await supabase
      .from("advice_reports")
      .upsert(payload, { onConflict: "id" })
      .select("*")
      .single();

    if (error || !data) {
      console.error("Failed to create advice report", error);
      return null;
    }

    return reportRowToRecord(data as AdviceReportDatabaseRow);
  }

  async getReport(reportId: string) {
    const supabase = getSupabaseServerClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("advice_reports")
      .select("*")
      .eq("id", reportId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return reportRowToRecord(data as AdviceReportDatabaseRow);
  }

  async getReportByAccessToken(reportId: string, accessTokenHash: string) {
    const supabase = getSupabaseServerClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("advice_reports")
      .select("*")
      .eq("id", reportId)
      .eq("access_token_hash", accessTokenHash)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return reportRowToRecord(data as AdviceReportDatabaseRow);
  }

  async updateReport(reportId: string, patch: AdviceReportRepositoryUpdateInput) {
    const supabase = getSupabaseServerClient();
    if (!supabase) return null;

    const payload: Record<string, JsonValue | string | number | null> = {};

    if (patch.reportPayload !== undefined) payload.report_payload = patch.reportPayload as JsonValue;
    payload.updated_at = toIso(patch.updatedAt ?? new Date())!;
    if (patch.durationMs !== undefined) payload.duration_ms = patch.durationMs;
    if (patch.estimatedInputTokens !== undefined) payload.estimated_input_tokens = patch.estimatedInputTokens;
    if (patch.estimatedOutputTokens !== undefined) payload.estimated_output_tokens = patch.estimatedOutputTokens;
    if (patch.estimatedCost !== undefined) payload.estimated_cost = patch.estimatedCost;
    if (patch.fallbackReasonCode !== undefined) payload.fallback_reason_code = patch.fallbackReasonCode;
    if (patch.validationFailureCodes !== undefined) payload.validation_failure_codes = patch.validationFailureCodes as JsonValue;
    if (patch.deletedAt !== undefined) payload.deleted_at = toIso(patch.deletedAt);

    const { data, error } = await supabase
      .from("advice_reports")
      .update(payload)
      .eq("id", reportId)
      .select("*")
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return reportRowToRecord(data as AdviceReportDatabaseRow);
  }

  async saveFeedback(input: AdviceFeedbackRecord) {
    const supabase = getSupabaseServerClient();
    if (!supabase) return null;

    const payload = {
      report_id: input.reportId,
      helpfulness: input.helpfulness,
      reasons: input.reasons,
      created_at: input.createdAt.toISOString(),
    };

    const { data, error } = await supabase
      .from("advice_feedback")
      .upsert(payload, { onConflict: "report_id" })
      .select("*")
      .single();

    if (error || !data) {
      console.error("Failed to save advice feedback", error);
      return null;
    }

    return feedbackRowToRecord(data as AdviceFeedbackDatabaseRow);
  }

  async getFeedback(reportId: string) {
    const supabase = getSupabaseServerClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("advice_feedback")
      .select("*")
      .eq("report_id", reportId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return feedbackRowToRecord(data as AdviceFeedbackDatabaseRow);
  }

  async deleteFeedback(reportId: string) {
    const supabase = getSupabaseServerClient();
    if (!supabase) return false;

    const { error } = await supabase.from("advice_feedback").delete().eq("report_id", reportId);
    return !error;
  }

  async listReports() {
    const supabase = getSupabaseServerClient();
    if (!supabase) return [];

    const { data, error } = await supabase.from("advice_reports").select("*");
    if (error || !data) {
      return [];
    }

    return (data as AdviceReportDatabaseRow[]).map(reportRowToRecord);
  }

  async getMetrics(): Promise<AdviceReportMetrics> {
    const reports = await this.listReports();
    const feedback = await this.listFeedback();

    const feedbackBreakdown: AdviceReportMetrics["feedbackBreakdown"] = {
      helpful: 0,
      partly_helpful: 0,
      not_helpful: 0,
    };

    for (const record of feedback) {
      feedbackBreakdown[record.helpfulness] += 1;
    }

    const fallbackCodes = new Map<string, number>();
    const validationCodes = new Map<string, number>();

    for (const report of reports) {
      for (const code of report.validationFailureCodes ?? []) {
        validationCodes.set(code, (validationCodes.get(code) ?? 0) + 1);
      }

      if (report.fallbackReasonCode) {
        fallbackCodes.set(report.fallbackReasonCode, (fallbackCodes.get(report.fallbackReasonCode) ?? 0) + 1);
      }
    }

    const sum = (values: Array<number | null | undefined>): number => {
      let total = 0;
      for (const value of values) {
        total += value ?? 0;
      }
      return total;
    };

    return {
      totalReports: reports.length,
      aiEnhancedCount: reports.filter((record) => record.generationMode === "ai_enhanced").length,
      aiFallbackCount: reports.filter((record) => record.generationMode === "ai_fallback").length,
      localOnlyCount: reports.filter((record) => record.generationMode === "local_only").length,
      highRiskCount: reports.filter((record) => record.generationMode === "high_risk_local").length,
      averageGenerationMs:
        reports.length > 0 ? sum(reports.map((record) => record.durationMs)) / reports.length : 0,
      estimatedInputTokens: sum(reports.map((record) => record.estimatedInputTokens ?? 0)),
      estimatedOutputTokens: sum(reports.map((record) => record.estimatedOutputTokens ?? 0)),
      estimatedCost: sum(reports.map((record) => record.estimatedCost ?? 0)),
      feedbackBreakdown,
      commonFallbackReasonCodes: Array.from(fallbackCodes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([code, count]) => ({ code, count })),
      commonValidationFailureCodes: Array.from(validationCodes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([code, count]) => ({ code, count })),
    };
  }

  private async listFeedback() {
    const supabase = getSupabaseServerClient();
    if (!supabase) return [];

    const { data, error } = await supabase.from("advice_feedback").select("*");
    if (error || !data) {
      return [];
    }

    return (data as AdviceFeedbackDatabaseRow[]).map(feedbackRowToRecord);
  }
}

export function createDatabaseAdviceReportRepository() {
  return new DatabaseAdviceReportRepository();
}
