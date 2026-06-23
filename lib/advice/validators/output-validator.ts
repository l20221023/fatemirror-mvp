import { ExtendedAdviceResultSchema } from "../schemas";
import type { AdviceFacts, ExtendedAdviceResult } from "../types";
import { validateAdviceConsistency } from "./consistency-validator";
import { validateProhibitedAdviceContent } from "./prohibited-content-validator";

export type ExtendedAdviceValidationResult =
  | {
      success: true;
      data: ExtendedAdviceResult;
    }
  | {
      success: false;
      reason:
        | "invalid_json"
        | "invalid_schema"
        | "consistency_failed"
        | "prohibited_content";
      violations?: string[];
    };

export function parseAndValidateExtendedAdvice(
  rawText: string,
  facts: AdviceFacts,
): ExtendedAdviceValidationResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { success: false, reason: "invalid_json" };
  }

  const schemaResult = ExtendedAdviceResultSchema.safeParse(parsed);
  if (!schemaResult.success) {
    return { success: false, reason: "invalid_schema" };
  }

  const consistency = validateAdviceConsistency(facts, schemaResult.data);
  if (!consistency.valid) {
    return {
      success: false,
      reason: "consistency_failed",
      violations: consistency.violations,
    };
  }

  const prohibited = validateProhibitedAdviceContent(schemaResult.data);
  if (!prohibited.valid) {
    return {
      success: false,
      reason: "prohibited_content",
      violations: prohibited.violations,
    };
  }

  return {
    success: true,
    data: schemaResult.data,
  };
}
