import { createDefaultAdviceReportRepository } from "../repository/default-advice-report-repository";
import { getAdviceRuntimeConfig } from "../runtime";

const repository = createDefaultAdviceReportRepository();

export type AdviceCleanupResult = {
  retentionDays: number;
  dryRun: boolean;
  scanned: number;
  eligible: number;
  cleaned: number;
  alreadyDeleted: number;
  remaining: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  reportIds: string[];
};

function isExpired(record: Awaited<ReturnType<typeof repository.listReports>>[number]) {
  return record.expiresAt.getTime() < Date.now();
}

function isWithinCleanupWindow(record: Awaited<ReturnType<typeof repository.listReports>>[number], retentionDays: number) {
  const ageMs = Date.now() - record.expiresAt.getTime();
  return ageMs >= retentionDays * 24 * 60 * 60 * 1000;
}

export async function previewExpiredAdviceReports(retentionDays = getAdviceRuntimeConfig().reportRetentionDays) {
  const reports = await repository.listReports();
  const eligible = reports.filter((record) => !record.deletedAt && isExpired(record) && isWithinCleanupWindow(record, retentionDays));

  return {
    dryRun: true,
    retentionDays,
    scanned: reports.length,
    eligible: eligible.length,
    alreadyDeleted: reports.filter((record) => Boolean(record.deletedAt)).length,
    remaining: reports.length - eligible.length,
    reportIds: eligible.map((record) => record.id),
  };
}

export async function cleanupExpiredAdviceReports(options?: {
  retentionDays?: number;
  dryRun?: boolean;
  limit?: number;
  offset?: number;
}) {
  const retentionDays = options?.retentionDays ?? getAdviceRuntimeConfig().reportRetentionDays;
  const dryRun = options?.dryRun ?? true;
  const limit = Math.max(1, Math.min(options?.limit ?? 50, 200));
  const offset = Math.max(0, options?.offset ?? 0);
  const reports = await repository.listReports();
  const candidates = reports
    .filter((record) => !record.deletedAt && isExpired(record) && isWithinCleanupWindow(record, retentionDays))
    .sort((left, right) => left.expiresAt.getTime() - right.expiresAt.getTime() || left.id.localeCompare(right.id));
  const selected = candidates.slice(offset, offset + limit);

  let cleaned = 0;
  if (!dryRun) {
    for (const report of selected) {
      await repository.updateReport(report.id, {
        deletedAt: new Date(),
      });
      await repository.deleteFeedback(report.id);
      cleaned += 1;
    }
  }

  return {
    retentionDays,
    dryRun,
    scanned: reports.length,
    eligible: candidates.length,
    cleaned,
    alreadyDeleted: reports.filter((record) => Boolean(record.deletedAt)).length,
    remaining: Math.max(0, candidates.length - offset - selected.length),
    limit,
    offset,
    hasMore: offset + selected.length < candidates.length,
    reportIds: selected.map((record) => record.id),
  } satisfies AdviceCleanupResult;
}
