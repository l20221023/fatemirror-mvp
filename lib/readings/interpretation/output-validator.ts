import { FORBIDDEN_INTERPRETATION_PATTERNS } from "./forbidden-claims";

export function validateInterpretationOutput(text: string, facts: {
  locale: "en" | "zh";
  expectedPhrases?: string[];
  maxLength?: number;
}) {
  const normalized = text.trim();
  if (!normalized) return false;
  if (facts.maxLength && normalized.length > facts.maxLength) return false;
  if (FORBIDDEN_INTERPRETATION_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return false;
  }
  if (facts.expectedPhrases?.length) {
    return facts.expectedPhrases.some((phrase) => normalized.includes(phrase));
  }
  return true;
}
