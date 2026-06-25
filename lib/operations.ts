import { getAdviceMetrics } from "./advice/services/metrics";
import { previewExpiredAdviceReports } from "./advice/services/cleanup-expired-reports";
import { getAdviceRuntimeConfig } from "./advice/runtime";
import { getAdviceDailyUsageSnapshot } from "./advice/usage";
import { getProviderFuseState } from "./advice/controls";
import { createDefaultAdviceReportRepository } from "./advice/repository/default-advice-report-repository";
import { getApplicationHealthSnapshot } from "./health";
import { listBetaInvites, listBetaSessions } from "./beta-access/service";
import { getCommercialOrders, listCommercialEntitlements } from "./commercial";
import { COMMERCIAL_PRODUCTS } from "./commercial/products";

function expectedProductPrices() {
  return Object.values(COMMERCIAL_PRODUCTS).map((product) => ({
    code: product.code,
    label: product.name,
    expectedPriceCents: product.priceCents,
    currentPriceCents: product.priceCents,
    active: product.active,
    entitlementType: product.entitlementType,
  }));
}

export async function getOperationsSnapshot() {
  const config = getAdviceRuntimeConfig();
  const reportRepository = createDefaultAdviceReportRepository();
  const [health, adviceMetrics, cleanupPreview, betaInvites, betaSessions, commercialOrders, commercialEntitlements, reports] =
    await Promise.all([
      Promise.resolve(getApplicationHealthSnapshot()),
      getAdviceMetrics(),
      previewExpiredAdviceReports(config.reportRetentionDays),
      listBetaInvites(),
      listBetaSessions(),
      config.commercialEnabled ? getCommercialOrders() : Promise.resolve([]),
      config.commercialEnabled ? listCommercialEntitlements() : Promise.resolve([]),
      reportRepository.listReports(),
    ]);

  const pricingValidation = expectedProductPrices().map((product) => ({
    ...product,
    matchesExpectation: product.currentPriceCents === product.expectedPriceCents,
  }));

  const activeBetaSessions = betaSessions.filter((session) => {
    const expiresAt = new Date(session.expiresAt).getTime();
    const now = Date.now();
    return session.status === "active" && expiresAt > now;
  });

  const cohortStats = new Map<string, {
    inviteCount: number;
    sessionCount: number;
    aiReportCount: number;
    averageCost: number;
    feedbackBreakdown: Record<"helpful" | "partly_helpful" | "not_helpful", number>;
    thresholdHits: number;
  }>();

  const feedbackByReportId = new Map<string, "helpful" | "partly_helpful" | "not_helpful">();
  for (const report of reports) {
    const feedback = await reportRepository.getFeedback(report.id);
    if (feedback) {
      feedbackByReportId.set(report.id, feedback.helpfulness);
    }
  }

  const sessionCountByCohort = new Map<string, { invites: Set<string>; sessions: number }>();
  for (const session of activeBetaSessions) {
    const current = sessionCountByCohort.get(session.cohortId) ?? { invites: new Set<string>(), sessions: 0 };
    current.sessions += 1;
    current.invites.add(session.inviteId);
    sessionCountByCohort.set(session.cohortId, current);

    const thresholdHit =
      session.aiUsageToday >= config.betaAiDailyLimit || session.aiUsageTotal >= config.betaAiTotalLimit;
    const sessionCohort = cohortStats.get(session.cohortId) ?? {
      inviteCount: 0,
      sessionCount: 0,
      aiReportCount: 0,
      averageCost: 0,
      feedbackBreakdown: { helpful: 0, partly_helpful: 0, not_helpful: 0 },
      thresholdHits: 0,
    };
    sessionCohort.thresholdHits += thresholdHit ? 1 : 0;
    cohortStats.set(session.cohortId, sessionCohort);
  }

  for (const report of reports) {
    if (!report.cohortId) continue;

    const existing = cohortStats.get(report.cohortId) ?? {
      inviteCount: 0,
      sessionCount: 0,
      aiReportCount: 0,
      averageCost: 0,
      feedbackBreakdown: { helpful: 0, partly_helpful: 0, not_helpful: 0 },
      thresholdHits: 0,
    };

    existing.aiReportCount += report.generationMode === "ai_enhanced" ? 1 : 0;
    existing.averageCost += report.estimatedCost ?? 0;
    if (report.generationMode === "ai_fallback" || report.generationMode === "local_only") {
      existing.thresholdHits += report.fallbackReasonCode ? 1 : 0;
    }

    const feedbackValue = feedbackByReportId.get(report.id);
    if (feedbackValue) {
      existing.feedbackBreakdown[feedbackValue] += 1;
    }

    cohortStats.set(report.cohortId, existing);
  }

  for (const [cohortId, stats] of cohortStats.entries()) {
    const counts = sessionCountByCohort.get(cohortId);
    stats.sessionCount = counts?.sessions ?? 0;
    stats.inviteCount = counts?.invites.size ?? 0;
    stats.averageCost = stats.aiReportCount > 0 ? stats.averageCost / stats.aiReportCount : 0;
  }

  const dailyUsage = getAdviceDailyUsageSnapshot();

  return {
    health,
    adviceMetrics,
    adviceUsage: dailyUsage,
    fuse: getProviderFuseState(),
    cleanupPreview,
    beta: {
      invites: betaInvites,
      sessions: betaSessions,
      activeSessions: activeBetaSessions,
      cohortStats: Array.from(cohortStats.entries()).map(([cohortId, stats]) => ({
        cohortId,
        ...stats,
      })),
    },
    commercial: {
      orders: commercialOrders,
      entitlements: commercialEntitlements,
      pricingValidation,
    },
  };
}
