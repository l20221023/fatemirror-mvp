import type { AdviceMeta, AdviceReport } from "./types";

export function createAdviceMeta(report: AdviceReport): AdviceMeta {
  return {
    engine: "advice",
    engineVersion: report.version,
    generatedAt: new Date().toISOString(),
    requestedMode: report.generation.requestedMode,
    generationMode: report.generation.mode,
    provider: report.generation.provider,
    model: report.generation.model,
    aiAvailable: report.generation.aiAvailable,
    safetyRouted: report.generation.mode === "high_risk_local",
  };
}
