import type { AdviceReport } from "./types";

export type AdviceResultViewModel = {
  isHighRisk: boolean;
  showTraditionalPerspective: boolean;
  showExtendedAdvice: boolean;
  statusLabel: string;
  statusDescription: string;
};

export function buildAdviceResultViewModel(
  report: Pick<AdviceReport, "extendedAdvice" | "facts" | "generation">,
  labels: Record<AdviceReport["generation"]["mode"], string>,
  descriptions: Record<AdviceReport["generation"]["mode"], string>,
): AdviceResultViewModel {
  return {
    isHighRisk: report.generation.mode === "high_risk_local",
    showTraditionalPerspective: report.facts.traditionalFacts.length > 0,
    showExtendedAdvice: report.extendedAdvice !== null,
    statusLabel: labels[report.generation.mode],
    statusDescription: descriptions[report.generation.mode],
  };
}
