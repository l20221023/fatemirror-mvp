import { describe, expect, it } from "vitest";

import { ExtendedAdviceResultSchema } from "../../lib/advice/schemas";
import { parseAndValidateExtendedAdvice } from "../../lib/advice/validators/output-validator";

describe("extended advice output schema", () => {
  it("accepts valid structured JSON", () => {
    const json = JSON.stringify({
      kind: "extended-advice",
      version: "0.1.0",
      observedSummary: "The current pattern is uneven but observable.",
      assumptionBoundary: "Some meanings are still assumptions.",
      traditionalPerspective: ["Use traditional signals only as context."],
      guidance: {
        nextSteps: ["Ask one concrete question."],
        boundaries: ["Do not assume the other person's mind."],
        reflection: "What is actually known here?",
        caution: "Avoid absolute claims.",
      },
      sourceAnchors: {
        observedFacts: ["They cancelled one meeting."],
        userAssumptions: ["I think they lost interest."],
        traditionalFacts: ["ming-gua-match: same-group"],
        unknownFacts: ["I do not know whether they want to continue."],
      },
    });

    const result = parseAndValidateExtendedAdvice(json, {
      observedFacts: ["They cancelled one meeting."],
      userAssumptions: ["I think they lost interest."],
      traditionalFacts: ["ming-gua-match: same-group"],
      unknownFacts: ["I do not know whether they want to continue."],
      safetyFlags: [],
    });

    expect(result.success).toBe(true);
    expect(ExtendedAdviceResultSchema.parse(JSON.parse(json)).kind).toBe("extended-advice");
  });

  it("rejects invalid json and invalid schema", () => {
    expect(
      parseAndValidateExtendedAdvice("{bad-json", {
        observedFacts: [],
        userAssumptions: [],
        traditionalFacts: [],
        unknownFacts: [],
        safetyFlags: [],
      }).success,
    ).toBe(false);

    expect(
      parseAndValidateExtendedAdvice(JSON.stringify({ nope: true }), {
        observedFacts: [],
        userAssumptions: [],
        traditionalFacts: [],
        unknownFacts: [],
        safetyFlags: [],
      }).success,
    ).toBe(false);
  });
});
