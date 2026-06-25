import type { AdviceReport } from "../types";
import type { JsonValue } from "../../supabase";

export type AdviceEntitlementType = "free" | "beta" | "paid_basic" | "paid_deep";

export type AdviceReportGenerationMode =
  | "local_only"
  | "ai_enhanced"
  | "ai_fallback"
  | "high_risk_local";

export type AdviceReportRecord = {
  id: string;
  accessTokenHash: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  locale: string;
  cohortId: string | null;
  relationshipStage: string;
  primaryConcern: string;
  generationMode: AdviceReportGenerationMode;
  safetyLevel: string;
  provider?: string | null;
  model?: string | null;
  promptVersion: string;
  adviceVersion: string;
  entitlementType: AdviceEntitlementType;
  reportPayload: AdviceReport;
  durationMs?: number | null;
  estimatedInputTokens?: number | null;
  estimatedOutputTokens?: number | null;
  estimatedCost?: number | null;
  fallbackReasonCode?: string | null;
  validationFailureCodes?: string[] | null;
  deletedAt?: Date | null;
};

export type AdviceFeedbackValue =
  | "helpful"
  | "partly_helpful"
  | "not_helpful";

export type AdviceFeedbackReason =
  | "too_generic"
  | "not_fact_based"
  | "not_actionable"
  | "repetitive"
  | "unsafe_or_uncomfortable"
  | "other";

export type AdviceFeedbackRecord = {
  reportId: string;
  helpfulness: AdviceFeedbackValue;
  reasons: AdviceFeedbackReason[];
  createdAt: Date;
};

export type AdviceReportMetrics = {
  totalReports: number;
  aiEnhancedCount: number;
  aiFallbackCount: number;
  localOnlyCount: number;
  highRiskCount: number;
  averageGenerationMs: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedCost: number;
  feedbackBreakdown: Record<AdviceFeedbackValue, number>;
  commonFallbackReasonCodes: Array<{ code: string; count: number }>;
  commonValidationFailureCodes: Array<{ code: string; count: number }>;
};

export type AdviceReportRepositoryCreateInput = Omit<
  AdviceReportRecord,
  "createdAt" | "updatedAt" | "deletedAt" | "cohortId"
> & {
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  cohortId?: string | null;
};

export type AdviceReportRepositoryUpdateInput = Partial<
  Pick<
    AdviceReportRecord,
    | "reportPayload"
    | "updatedAt"
    | "durationMs"
    | "estimatedInputTokens"
    | "estimatedOutputTokens"
    | "estimatedCost"
    | "fallbackReasonCode"
    | "validationFailureCodes"
    | "deletedAt"
  >
>;

export type AdviceReportDatabaseRow = {
  id: string;
  access_token_hash: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  locale: string;
  cohort_id: string | null;
  relationship_stage: string;
  primary_concern: string;
  generation_mode: AdviceReportGenerationMode;
  safety_level: string;
  provider: string | null;
  model: string | null;
  prompt_version: string;
  advice_version: string;
  entitlement_type: AdviceEntitlementType;
  report_payload: JsonValue;
  duration_ms: number | null;
  estimated_input_tokens: number | null;
  estimated_output_tokens: number | null;
  estimated_cost: number | null;
  fallback_reason_code: string | null;
  validation_failure_codes: JsonValue | null;
  deleted_at: string | null;
};

export type AdviceFeedbackDatabaseRow = {
  report_id: string;
  helpfulness: AdviceFeedbackValue;
  reasons: JsonValue;
  created_at: string;
};
