import { buildAdviceFacts } from "./fact-builder";
import { buildHighRiskLocalAdvice, buildStandardLocalAdvice } from "./local-templates";
import { AdviceInputSchema, LocalAdviceResultSchema } from "./schemas";
import { classifySafety, isHighRiskClassification } from "./safety-classifier";
import type { AdviceInput, LocalAdviceResult } from "./types";

export function generateLocalAdvice(rawInput: AdviceInput): LocalAdviceResult {
  const input = AdviceInputSchema.parse(rawInput);
  const facts = buildAdviceFacts(input);
  const classifications = classifySafety(input);

  const result = classifications.some(isHighRiskClassification)
    ? buildHighRiskLocalAdvice(
        input.locale,
        input.relationshipStage,
        input.primaryConcern,
        facts,
        classifications,
      )
    : buildStandardLocalAdvice(
        input.locale,
        input.relationshipStage,
        input.primaryConcern,
        facts,
        classifications,
      );

  return LocalAdviceResultSchema.parse(result);
}
