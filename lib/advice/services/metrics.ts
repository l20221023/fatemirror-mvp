import { createDefaultAdviceReportRepository } from "../repository/default-advice-report-repository";

const repository = createDefaultAdviceReportRepository();

export async function getAdviceMetrics() {
  return repository.getMetrics();
}
