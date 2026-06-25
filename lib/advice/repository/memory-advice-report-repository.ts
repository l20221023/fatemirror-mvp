import type {
  AdviceFeedbackRecord,
  AdviceReportMetrics,
  AdviceReportRecord,
  AdviceReportRepositoryCreateInput,
  AdviceReportRepositoryUpdateInput,
} from "./types";
import type { AdviceReportRepository } from "./advice-report-repository";

const reports = new Map<string, AdviceReportRecord>();
const feedbackByReportId = new Map<string, AdviceFeedbackRecord>();

export function resetMemoryAdviceReportRepository() {
  reports.clear();
  feedbackByReportId.clear();
}

function cloneReport(record: AdviceReportRecord) {
  return {
    ...record,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
    expiresAt: new Date(record.expiresAt),
    deletedAt: record.deletedAt ? new Date(record.deletedAt) : null,
    reportPayload: structuredClone(record.reportPayload),
  };
}

function cloneFeedback(record: AdviceFeedbackRecord) {
  return {
    ...record,
    createdAt: new Date(record.createdAt),
    reasons: [...record.reasons],
  };
}

function sum(values: Array<number | null | undefined>) {
  let total = 0;
  for (const value of values) {
    total += value ?? 0;
  }
  return total;
}

export class MemoryAdviceReportRepository implements AdviceReportRepository {
  async createReport(input: AdviceReportRepositoryCreateInput) {
    const record: AdviceReportRecord = {
      ...input,
      createdAt: input.createdAt ?? new Date(),
      updatedAt: input.updatedAt ?? input.createdAt ?? new Date(),
      deletedAt: input.deletedAt ?? null,
      cohortId: input.cohortId ?? null,
      provider: input.provider ?? null,
      model: input.model ?? null,
      entitlementType: input.entitlementType,
      durationMs: input.durationMs ?? null,
      estimatedInputTokens: input.estimatedInputTokens ?? null,
      estimatedOutputTokens: input.estimatedOutputTokens ?? null,
      estimatedCost: input.estimatedCost ?? null,
      fallbackReasonCode: input.fallbackReasonCode ?? null,
      validationFailureCodes: input.validationFailureCodes ?? null,
    };

    reports.set(record.id, cloneReport(record));
    return cloneReport(record);
  }

  async getReport(reportId: string) {
    const record = reports.get(reportId);
    return record ? cloneReport(record) : null;
  }

  async getReportByAccessToken(reportId: string, accessTokenHash: string) {
    const record = reports.get(reportId);
    if (!record) return null;
    if (record.accessTokenHash !== accessTokenHash) return null;
    return cloneReport(record);
  }

  async updateReport(reportId: string, patch: AdviceReportRepositoryUpdateInput) {
    const record = reports.get(reportId);
    if (!record) return null;

    const next: AdviceReportRecord = {
      ...record,
      ...patch,
      updatedAt: new Date(),
      deletedAt: patch.deletedAt !== undefined ? patch.deletedAt : record.deletedAt ?? null,
      reportPayload: patch.reportPayload ?? record.reportPayload,
    };

    reports.set(reportId, cloneReport(next));
    return cloneReport(next);
  }

  async saveFeedback(input: AdviceFeedbackRecord) {
    feedbackByReportId.set(input.reportId, cloneFeedback(input));
    return cloneFeedback(input);
  }

  async getFeedback(reportId: string) {
    const record = feedbackByReportId.get(reportId);
    return record ? cloneFeedback(record) : null;
  }

  async deleteFeedback(reportId: string) {
    return feedbackByReportId.delete(reportId);
  }

  async listReports() {
    return Array.from(reports.values()).map(cloneReport);
  }

  async getMetrics(): Promise<AdviceReportMetrics> {
    const allReports = Array.from(reports.values());
    const feedbackValues = Array.from(feedbackByReportId.values());

    const feedbackBreakdown: AdviceReportMetrics["feedbackBreakdown"] = {
      helpful: 0,
      partly_helpful: 0,
      not_helpful: 0,
    };

    for (const record of feedbackValues) {
      feedbackBreakdown[record.helpfulness] += 1;
    }

    const fallbackCounts = new Map<string, number>();
    const validationCounts = new Map<string, number>();

    for (const record of allReports) {
      for (const code of record.validationFailureCodes ?? []) {
        validationCounts.set(code, (validationCounts.get(code) ?? 0) + 1);
      }

      if (record.fallbackReasonCode) {
        fallbackCounts.set(record.fallbackReasonCode, (fallbackCounts.get(record.fallbackReasonCode) ?? 0) + 1);
      }
    }

    return {
      totalReports: allReports.length,
      aiEnhancedCount: allReports.filter((record) => record.generationMode === "ai_enhanced").length,
      aiFallbackCount: allReports.filter((record) => record.generationMode === "ai_fallback").length,
      localOnlyCount: allReports.filter((record) => record.generationMode === "local_only").length,
      highRiskCount: allReports.filter((record) => record.generationMode === "high_risk_local").length,
      averageGenerationMs:
        allReports.length > 0
          ? sum(allReports.map((record) => record.durationMs)) / allReports.length
          : 0,
      estimatedInputTokens: sum(allReports.map((record) => record.estimatedInputTokens ?? 0)),
      estimatedOutputTokens: sum(allReports.map((record) => record.estimatedOutputTokens ?? 0)),
      estimatedCost: sum(allReports.map((record) => record.estimatedCost ?? 0)),
      feedbackBreakdown,
      commonFallbackReasonCodes: Array.from(fallbackCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([code, count]) => ({ code, count })),
      commonValidationFailureCodes: Array.from(validationCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([code, count]) => ({ code, count })),
    };
  }
}

export function createMemoryAdviceReportRepository() {
  return new MemoryAdviceReportRepository();
}
