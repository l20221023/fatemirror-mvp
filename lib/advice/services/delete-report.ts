import { createHash } from "node:crypto";

import { createDefaultAdviceReportRepository } from "../repository/default-advice-report-repository";

const repository = createDefaultAdviceReportRepository();

function hashAccessToken(accessToken: string) {
  return createHash("sha256").update(accessToken).digest("hex");
}

export async function deleteAdviceReport(reportId: string, accessToken: string) {
  const accessTokenHash = hashAccessToken(accessToken);
  const record = await repository.getReportByAccessToken(reportId, accessTokenHash);

  if (!record) {
    return { ok: true as const, existed: false };
  }

  if (record.deletedAt) {
    return { ok: true as const, existed: true };
  }

  const updated = await repository.updateReport(reportId, { deletedAt: new Date() });
  await repository.deleteFeedback(reportId);

  return {
    ok: true as const,
    existed: Boolean(updated),
  };
}
