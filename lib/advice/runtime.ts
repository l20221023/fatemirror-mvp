export type AdviceProviderMode = "openai" | "mock";
export type AdviceRepositoryMode = "memory" | "supabase" | "auto";
export type AdvicePaymentMode = "mock" | "sandbox" | "disabled";

function envFlag(name: string, fallback = false) {
  const value = process.env[name];
  if (!value) return fallback;
  return value === "1" || value.toLowerCase() === "true";
}

function envNumber(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function envOptionalNumber(name: string) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return null;

  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function envList(name: string) {
  const value = process.env[name];
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isPreviewLikeEnvironment() {
  const vercelEnv = process.env.VERCEL_ENV;
  return vercelEnv === "preview" || vercelEnv === "development";
}

export function getAdviceRuntimeConfig() {
  const testFriendly = process.env.NODE_ENV === "test";
  const aiEnabled = envFlag("ADVICE_AI_ENABLED", false);
  const explicitProvider = process.env.ADVICE_AI_PROVIDER;
  const repository = (process.env.ADVICE_REPOSITORY || "auto") as AdviceRepositoryMode;
  const betaEnabled = envFlag("ADVICE_BETA_ENABLED", false);
  const commercialEnabled = envFlag("ADVICE_COMMERCIAL_ENABLED", false);
  const paymentMode = (process.env.ADVICE_PAYMENT_MODE || "mock") as AdvicePaymentMode;
  const defaultProvider: AdviceProviderMode =
    aiEnabled && (betaEnabled || isPreviewLikeEnvironment()) && process.env.OPENAI_API_KEY
      ? "openai"
      : "mock";

  return {
    aiEnabled,
    provider: (explicitProvider === "openai" || explicitProvider === "mock"
      ? explicitProvider
      : defaultProvider) as AdviceProviderMode,
    model: process.env.ADVICE_MODEL || process.env.ADVICE_AI_MODEL || "gpt-4o-mini",
    requestTimeoutMs: envNumber(
      "ADVICE_REQUEST_TIMEOUT_MS",
      envNumber("ADVICE_AI_TIMEOUT_MS", 8000),
    ),
    maxOutputTokens: envNumber(
      "ADVICE_MAX_OUTPUT_TOKENS",
      envNumber("ADVICE_AI_MAX_OUTPUT", 700),
    ),
    maxInputChars: envNumber("ADVICE_MAX_INPUT_CHARS", 1200),
    betaSessionTtlDays: envNumber("BETA_SESSION_TTL_DAYS", 7),
    betaLocalDailyLimit: envNumber("BETA_LOCAL_DAILY_LIMIT", testFriendly ? 1000 : 3),
    betaAiDailyLimit: envNumber("BETA_AI_DAILY_LIMIT", testFriendly ? 1000 : 1),
    betaAiTotalLimit: envNumber("BETA_AI_TOTAL_LIMIT", testFriendly ? 1000 : 2),
    betaAiCooldownMinutes: envNumber("BETA_AI_COOLDOWN_MINUTES", 10),
    adviceGlobalDailyReportLimit: envNumber("ADVICE_GLOBAL_DAILY_REPORT_LIMIT", testFriendly ? 1000 : 10),
    adviceGlobalDailyBudgetUsd: envOptionalNumber("ADVICE_GLOBAL_DAILY_BUDGET_USD"),
    adviceMaxInputChars: envNumber("ADVICE_MAX_INPUT_CHARS", 1200),
    adviceMaxOutputTokens: envNumber("ADVICE_MAX_OUTPUT_TOKENS", 700),
    dailyRequestLimit: envNumber("ADVICE_DAILY_REQUEST_LIMIT", 12),
    rateLimitIpHashTtlHours: envNumber("RATE_LIMIT_IP_HASH_TTL_HOURS", 24),
    rateLimitInviteFailuresPer15Minutes: envNumber("RATE_LIMIT_INVITE_FAILURES_PER_15_MINUTES", testFriendly ? 1000 : 5),
    rateLimitAdviceRequestsPerHour: envNumber("RATE_LIMIT_ADVICE_REQUESTS_PER_HOUR", testFriendly ? 1000 : 5),
    rateLimitAiRequestsPerIpPerDay: envNumber("RATE_LIMIT_AI_REQUESTS_PER_IP_PER_DAY", testFriendly ? 1000 : 3),
    providerFailureFuseThreshold: envNumber("ADVICE_PROVIDER_FAILURE_FUSE_THRESHOLD", 4),
    providerFailureFuseWindowMinutes: envNumber("ADVICE_PROVIDER_FAILURE_FUSE_WINDOW_MINUTES", 60),
    providerFailureFuseCooldownMinutes: envNumber("ADVICE_PROVIDER_FUSE_COOLDOWN_MINUTES", 60),
    mockBehavior: (process.env.MOCK_ADVICE_PROVIDER_BEHAVIOR || "success") as
      | "success"
      | "invalid_json"
      | "invalid_schema"
      | "prohibited"
      | "timeout"
      | "server_error"
      | "throw",
    betaEnabled,
    commercialEnabled,
    repository,
    paymentMode,
    betaInviteCodes: envList("ADVICE_BETA_INVITE_CODES"),
    betaTestAccessCode: process.env.ADVICE_BETA_TEST_ACCESS_CODE || "",
    betaAccessSecret:
      process.env.ADVICE_BETA_ACCESS_SECRET ||
      process.env.OPENAI_API_KEY ||
      process.env.ADVICE_BETA_TEST_ACCESS_CODE ||
      "",
    reportRetentionDays: envNumber("ADVICE_REPORT_RETENTION_DAYS", 30),
    internalMetricsEnabled: envFlag("ADVICE_INTERNAL_METRICS_ENABLED", false),
  };
}

export function isRetryableAdviceAiError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("timeout") ||
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("503") ||
    message.includes("502") ||
    message.includes("500") ||
    message.includes("429") ||
    message.includes("econnreset") ||
    message.includes("etimedout") ||
    message.includes("advice_ai_timeout")
  );
}
