export type RuntimeEnvironmentName =
  | "development"
  | "preview"
  | "staging"
  | "production"
  | "test";

function normalizeEnvironmentName(value: string | undefined): RuntimeEnvironmentName {
  const normalized = (value || "").toLowerCase();
  if (normalized === "development" || normalized === "preview" || normalized === "staging" || normalized === "production" || normalized === "test") {
    return normalized;
  }

  return "development";
}

export function getRuntimeEnvironment(): RuntimeEnvironmentName {
  const nodeEnv = normalizeEnvironmentName(process.env.NODE_ENV);
  const vercelEnv = (process.env.VERCEL_ENV || "").toLowerCase();

  if (vercelEnv === "production") return "production";
  if (vercelEnv === "preview") return "preview";

  return nodeEnv;
}

export function isTestEnvironment() {
  return getRuntimeEnvironment() === "test";
}

export function isProductionEnvironment() {
  return getRuntimeEnvironment() === "production";
}

export function isPreviewEnvironment() {
  return getRuntimeEnvironment() === "preview";
}

export function isDevelopmentEnvironment() {
  return getRuntimeEnvironment() === "development";
}

export function isProductionLikeEnvironment() {
  return isProductionEnvironment() || isPreviewEnvironment() || process.env.VERCEL_ENV === "staging";
}

export function getRuntimeEnvironmentSummary() {
  return {
    environment: getRuntimeEnvironment(),
    vercelEnvironment: process.env.VERCEL_ENV || null,
    nodeEnvironment: process.env.NODE_ENV || null,
    productionLike: isProductionLikeEnvironment(),
  };
}
