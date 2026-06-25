import { createHash } from "node:crypto";

import { createDefaultAdviceReportRepository } from "../repository/default-advice-report-repository";

const repository = createDefaultAdviceReportRepository();

function hashAccessToken(accessToken: string) {
  return createHash("sha256").update(accessToken).digest("hex");
}

export async function getAdviceReport(reportId: string, accessToken: string) {
  const accessTokenHash = hashAccessToken(accessToken);
  const record = await repository.getReportByAccessToken(reportId, accessTokenHash);

  if (!record || record.deletedAt || record.expiresAt.getTime() < Date.now()) {
    return null;
  }

  return record;
}

export async function getAdviceReportById(reportId: string) {
  const record = await repository.getReport(reportId);

  if (!record || record.deletedAt || record.expiresAt.getTime() < Date.now()) {
    return null;
  }

  return record;
}
