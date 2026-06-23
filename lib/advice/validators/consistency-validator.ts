import type { AdviceFacts, ExtendedAdviceResult } from "../types";

function isSubset(source: string[], allowed: string[]) {
  return source.every((item) => allowed.includes(item));
}

export function validateAdviceConsistency(
  facts: AdviceFacts,
  result: ExtendedAdviceResult,
) {
  const violations: string[] = [];

  if (!isSubset(result.sourceAnchors.observedFacts, facts.observedFacts)) {
    violations.push("observed_facts_mismatch");
  }

  if (!isSubset(result.sourceAnchors.userAssumptions, facts.userAssumptions)) {
    violations.push("user_assumptions_mismatch");
  }

  if (!isSubset(result.sourceAnchors.traditionalFacts, facts.traditionalFacts)) {
    violations.push("traditional_facts_mismatch");
  }

  if (!isSubset(result.sourceAnchors.unknownFacts, facts.unknownFacts)) {
    violations.push("unknown_facts_mismatch");
  }

  if (facts.userAssumptions.length > 0 && result.assumptionBoundary.trim().length === 0) {
    violations.push("missing_assumption_boundary");
  }

  if (
    facts.userAssumptions.some((item) => result.observedSummary.includes(item)) ||
    facts.unknownFacts.some((item) => result.observedSummary.includes(item))
  ) {
    violations.push("assumptions_or_unknowns_presented_as_observed");
  }

  const traditionalText = result.traditionalPerspective.join("\n");
  if (
    facts.traditionalFacts.length > 0 &&
    result.sourceAnchors.traditionalFacts.length === 0 &&
    traditionalText.length > 0
  ) {
    violations.push("traditional_perspective_missing_source_anchor");
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}
