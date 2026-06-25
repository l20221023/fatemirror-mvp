import { getRuntimeEnvironmentSummary } from "./runtime/environment";
import { isSupabaseConfigured } from "./supabase";
import { getAdviceRuntimeConfig } from "./advice/runtime";

export function getApplicationHealthSnapshot() {
  const advice = getAdviceRuntimeConfig();
  const runtime = getRuntimeEnvironmentSummary();
  const envPresence = {
    SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    OPENAI_API_KEY: Boolean(process.env.OPENAI_API_KEY),
    ADVICE_AI_ENABLED: process.env.ADVICE_AI_ENABLED === undefined ? null : advice.aiEnabled,
    ADVICE_MODEL: Boolean(process.env.ADVICE_MODEL || process.env.ADVICE_AI_MODEL),
    ADVICE_REPOSITORY: Boolean(process.env.ADVICE_REPOSITORY),
    ADVICE_BETA_ENABLED: process.env.ADVICE_BETA_ENABLED === undefined ? null : advice.betaEnabled,
    ADVICE_GLOBAL_DAILY_REPORT_LIMIT: Boolean(process.env.ADVICE_GLOBAL_DAILY_REPORT_LIMIT),
    ADVICE_GLOBAL_DAILY_BUDGET_USD: process.env.ADVICE_GLOBAL_DAILY_BUDGET_USD !== undefined,
    BETA_SESSION_TTL_DAYS: Boolean(process.env.BETA_SESSION_TTL_DAYS),
    BETA_LOCAL_DAILY_LIMIT: Boolean(process.env.BETA_LOCAL_DAILY_LIMIT),
    BETA_AI_DAILY_LIMIT: Boolean(process.env.BETA_AI_DAILY_LIMIT),
    BETA_AI_TOTAL_LIMIT: Boolean(process.env.BETA_AI_TOTAL_LIMIT),
    BETA_AI_COOLDOWN_MINUTES: Boolean(process.env.BETA_AI_COOLDOWN_MINUTES),
    RATE_LIMIT_HASH_SECRET: Boolean(process.env.RATE_LIMIT_HASH_SECRET),
    CRON_SECRET: Boolean(process.env.CRON_SECRET || process.env.ADVICE_CLEANUP_CRON_SECRET),
    INTERNAL_ACCESS_SECRET: Boolean(process.env.INTERNAL_ACCESS_SECRET),
  };

  const missingCriticalEnv: string[] = [];
  if (!process.env.SUPABASE_URL) missingCriticalEnv.push("SUPABASE_URL");
  if (runtime.productionLike && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    missingCriticalEnv.push("SUPABASE_SERVICE_ROLE_KEY");
  }
  if (runtime.productionLike && advice.aiEnabled && !process.env.OPENAI_API_KEY) {
    missingCriticalEnv.push("OPENAI_API_KEY");
  }

  return {
    runtime,
    supabaseConfigured: isSupabaseConfigured(),
    advice: {
      aiEnabled: advice.aiEnabled,
      betaEnabled: advice.betaEnabled,
      commercialEnabled: advice.commercialEnabled ?? false,
      repository: advice.repository,
      paymentMode: advice.paymentMode,
      reportRetentionDays: advice.reportRetentionDays,
      betaSessionTtlDays: advice.betaSessionTtlDays,
      betaLocalDailyLimit: advice.betaLocalDailyLimit,
      betaAiDailyLimit: advice.betaAiDailyLimit,
      betaAiTotalLimit: advice.betaAiTotalLimit,
      betaAiCooldownMinutes: advice.betaAiCooldownMinutes,
      globalDailyReportLimit: advice.adviceGlobalDailyReportLimit,
      globalDailyBudgetConfigured: advice.adviceGlobalDailyBudgetUsd !== null,
    },
    envPresence,
    missingCriticalEnv,
    healthy: missingCriticalEnv.length === 0,
  };
}
