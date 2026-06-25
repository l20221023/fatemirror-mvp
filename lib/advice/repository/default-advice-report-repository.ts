import { getSupabaseServerClient } from "../../supabase";
import { createDatabaseAdviceReportRepository } from "./database-advice-report-repository";
import { createMemoryAdviceReportRepository } from "./memory-advice-report-repository";
import type { AdviceReportRepository } from "./advice-report-repository";
import type {
  AdviceFeedbackRecord,
  AdviceReportMetrics,
  AdviceReportRecord,
  AdviceReportRepositoryCreateInput,
  AdviceReportRepositoryUpdateInput,
} from "./types";

function hasDatabase() {
  return Boolean(getSupabaseServerClient());
}

export class DefaultAdviceReportRepository implements AdviceReportRepository {
  private readonly database = createDatabaseAdviceReportRepository();
  private readonly memory = createMemoryAdviceReportRepository();
  private readonly databaseEnabled = hasDatabase();

  async createReport(input: AdviceReportRepositoryCreateInput) {
    if (this.databaseEnabled) {
      const record = await this.database.createReport(input);
      if (record) return record;
    }

    return this.memory.createReport(input);
  }

  async getReport(reportId: string) {
    if (this.databaseEnabled) {
      const record = await this.database.getReport(reportId);
      if (record) return record;
    }

    return this.memory.getReport(reportId);
  }

  async getReportByAccessToken(reportId: string, accessTokenHash: string) {
    if (this.databaseEnabled) {
      const record = await this.database.getReportByAccessToken(reportId, accessTokenHash);
      if (record) return record;
    }

    return this.memory.getReportByAccessToken(reportId, accessTokenHash);
  }

  async updateReport(reportId: string, patch: AdviceReportRepositoryUpdateInput) {
    if (this.databaseEnabled) {
      const record = await this.database.updateReport(reportId, patch);
      if (record) return record;
    }

    return this.memory.updateReport(reportId, patch);
  }

  async saveFeedback(input: AdviceFeedbackRecord) {
    if (this.databaseEnabled) {
      const record = await this.database.saveFeedback(input);
      if (record) return record;
    }

    return this.memory.saveFeedback(input);
  }

  async getFeedback(reportId: string) {
    if (this.databaseEnabled) {
      const record = await this.database.getFeedback(reportId);
      if (record) return record;
    }

    return this.memory.getFeedback(reportId);
  }

  async deleteFeedback(reportId: string) {
    const primary = this.databaseEnabled ? await this.database.deleteFeedback(reportId) : false;
    const fallback = await this.memory.deleteFeedback(reportId);
    return primary || fallback;
  }

  async listReports() {
    const primary = this.databaseEnabled ? await this.database.listReports() : [];
    const fallback = await this.memory.listReports();
    const byId = new Map<string, AdviceReportRecord>();

    for (const record of [...primary, ...fallback]) {
      byId.set(record.id, record);
    }

    return Array.from(byId.values());
  }

  async getMetrics(): Promise<AdviceReportMetrics> {
    const reports = await this.listReports();

    if (this.databaseEnabled) {
      const record = await this.database.getMetrics();
      const memoryRecord = await this.memory.getMetrics();

        return {
          totalReports: record.totalReports + memoryRecord.totalReports,
          aiEnhancedCount: record.aiEnhancedCount + memoryRecord.aiEnhancedCount,
          aiFallbackCount: record.aiFallbackCount + memoryRecord.aiFallbackCount,
          localOnlyCount: record.localOnlyCount + memoryRecord.localOnlyCount,
          highRiskCount: record.highRiskCount + memoryRecord.highRiskCount,
          averageGenerationMs:
            reports.length > 0
              ? reports.reduce((total, item) => total + (item.durationMs ?? 0), 0) / reports.length
              : 0,
          estimatedInputTokens:
            (record.estimatedInputTokens ?? 0) + (memoryRecord.estimatedInputTokens ?? 0),
          estimatedOutputTokens:
            (record.estimatedOutputTokens ?? 0) + (memoryRecord.estimatedOutputTokens ?? 0),
          estimatedCost: (record.estimatedCost ?? 0) + (memoryRecord.estimatedCost ?? 0),
          feedbackBreakdown: {
            helpful:
              record.feedbackBreakdown.helpful + memoryRecord.feedbackBreakdown.helpful,
            partly_helpful:
              record.feedbackBreakdown.partly_helpful +
              memoryRecord.feedbackBreakdown.partly_helpful,
            not_helpful:
              record.feedbackBreakdown.not_helpful + memoryRecord.feedbackBreakdown.not_helpful,
          },
          commonFallbackReasonCodes: mergeTopCodes(
            record.commonFallbackReasonCodes,
            memoryRecord.commonFallbackReasonCodes,
          ),
          commonValidationFailureCodes: mergeTopCodes(
            record.commonValidationFailureCodes,
            memoryRecord.commonValidationFailureCodes,
          ),
        };
    }

    return this.memory.getMetrics();
  }
}

function mergeTopCodes(
  left: Array<{ code: string; count: number }>,
  right: Array<{ code: string; count: number }>,
) {
  const counts = new Map<string, number>();
  for (const item of [...left, ...right]) {
    counts.set(item.code, (counts.get(item.code) ?? 0) + item.count);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([code, count]) => ({ code, count }));
}

export function createDefaultAdviceReportRepository() {
  return new DefaultAdviceReportRepository();
}
