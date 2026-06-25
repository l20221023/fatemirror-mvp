import { describe, expect, it } from "vitest";

import { validateProhibitedAdviceContent } from "../../lib/advice/validators/prohibited-content-validator";
import { ADVICE_ENGINE_VERSION } from "../../lib/advice/types";

describe("prohibited advice content validator", () => {
  it("rejects forbidden destiny, harassment, and medical content", () => {
    const result = validateProhibitedAdviceContent({
      kind: "extended-advice",
      version: ADVICE_ENGINE_VERSION,
      observedSummary: "This is a destined soulmate connection.",
      assumptionBoundary: "You know exactly what they feel.",
      traditionalPerspective: ["Guaranteed marriage."],
      guidance: {
        nextSteps: ["Track their phone."],
        boundaries: ["Ignore boundaries."],
        reflection: "How can you force a yes?",
        caution: "This also predicts pregnancy.",
      },
      sourceAnchors: {
        observedFacts: [],
        userAssumptions: [],
        traditionalFacts: [],
        unknownFacts: [],
      },
    });

    expect(result.valid).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it("accepts grounded content", () => {
    expect(
      validateProhibitedAdviceContent({
        kind: "extended-advice",
        version: ADVICE_ENGINE_VERSION,
        observedSummary: "The recent pattern is uneven but observable.",
        assumptionBoundary: "Some meanings remain assumptions.",
        traditionalPerspective: ["Traditional perspective may offer context only."],
        guidance: {
          nextSteps: ["Ask one clear question."],
          boundaries: ["Do not assume the other person's mind."],
          reflection: "What is actually known here?",
          caution: "Avoid absolute conclusions.",
        },
        sourceAnchors: {
          observedFacts: [],
          userAssumptions: [],
          traditionalFacts: [],
          unknownFacts: [],
        },
      }).valid,
    ).toBe(true);
  });
});
