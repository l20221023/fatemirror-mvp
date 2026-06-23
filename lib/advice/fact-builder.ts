import { classifySafety } from "./safety-classifier";
import type { AdviceFacts, AdviceInput } from "./types";

const ASSUMPTION_PATTERNS = [
  /\bi think\b/i,
  /\bmaybe\b/i,
  /\bseems like\b/i,
  /\bprobably\b/i,
  /我觉得|我怀疑|可能|也许|好像|猜/i,
] as const;

const UNKNOWN_PATTERNS = [
  /\bi don't know\b/i,
  /\bnot sure\b/i,
  /\bunclear\b/i,
  /\bunknown\b/i,
  /不知道|不确定|不清楚|没法确认/i,
] as const;

function splitIntoFacts(input: AdviceInput) {
  return [
    input.question,
    input.contextNotes ?? "",
    ...(input.knownDetails ?? []),
  ]
    .flatMap((item) => item.split(/[，,。！？!?;\n]/))
    .map((item) => item.trim())
    .filter(Boolean);
}

function isUnknownFact(text: string) {
  return UNKNOWN_PATTERNS.some((pattern) => pattern.test(text));
}

function isAssumptionFact(text: string) {
  return ASSUMPTION_PATTERNS.some((pattern) => pattern.test(text));
}

export function buildAdviceFacts(input: AdviceInput): AdviceFacts {
  const observedFacts: string[] = [];
  const userAssumptions: string[] = [];
  const unknownFacts: string[] = [];

  for (const fact of splitIntoFacts(input)) {
    if (isUnknownFact(fact)) {
      unknownFacts.push(fact);
      continue;
    }

    if (isAssumptionFact(fact)) {
      userAssumptions.push(fact);
      continue;
    }

    observedFacts.push(fact);
  }

  const traditionalFacts = (input.traditionalSignals ?? []).map(
    (item) => `${item.source}: ${item.summary}`,
  );

  const safetyFlags = classifySafety(input).map((item) => item.code);

  return {
    observedFacts,
    userAssumptions,
    traditionalFacts,
    unknownFacts,
    safetyFlags: [...new Set(safetyFlags)],
  };
}
