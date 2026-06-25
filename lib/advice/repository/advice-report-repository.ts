import type {
  AdviceFeedbackRecord,
  AdviceReportMetrics,
  AdviceReportRecord,
  AdviceReportRepositoryCreateInput,
  AdviceReportRepositoryUpdateInput,
} from "./types";

export type AdviceReportRepository = {
  createReport(input: AdviceReportRepositoryCreateInput): Promise<AdviceReportRecord | null>;
  getReport(reportId: string): Promise<AdviceReportRecord | null>;
  getReportByAccessToken(
    reportId: string,
    accessTokenHash: string,
  ): Promise<AdviceReportRecord | null>;
  updateReport(
    reportId: string,
    patch: AdviceReportRepositoryUpdateInput,
  ): Promise<AdviceReportRecord | null>;
  saveFeedback(input: AdviceFeedbackRecord): Promise<AdviceFeedbackRecord | null>;
  getFeedback(reportId: string): Promise<AdviceFeedbackRecord | null>;
  deleteFeedback(reportId: string): Promise<boolean>;
  listReports(): Promise<AdviceReportRecord[]>;
  getMetrics(): Promise<AdviceReportMetrics>;
};
