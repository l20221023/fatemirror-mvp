import { describe, expect, it } from "vitest";

import { validateAdviceConsistency } from "../../lib/advice/validators/consistency-validator";
import { ADVICE_ENGINE_VERSION } from "../../lib/advice/types";

describe("advice consistency validator", () => {
  it("accepts matching source anchors", () => {
    const result = validateAdviceConsistency(
      {
        observedFacts: ["They cancelled one meeting."],
        userAssumptions: ["I think they lost interest."],
        traditionalFacts: ["ming-gua-match: same-group"],
        unknownFacts: ["I do not know whether they want to continue."],
        safetyFlags: [],
      },
      {
        kind: "extended-advice",
        version: ADVICE_ENGINE_VERSION,
        observedSummary: "They cancelled one meeting.",
        assumptionBoundary: "Some meanings remain assumptions.",
        traditionalPerspective: ["Traditional perspective may offer context."],
        guidance: {
          nextSteps: ["Ask one concrete question."],
          boundaries: ["Do not assume their mind."],
          reflection: "What is known?",
          caution: "Avoid absolute claims.",
        },
        sourceAnchors: {
          observedFacts: ["They cancelled one meeting."],
          userAssumptions: ["I think they lost interest."],
          traditionalFacts: ["ming-gua-match: same-group"],
          unknownFacts: ["I do not know whether they want to continue."],
        },
      },
    );

    expect(result.valid).toBe(true);
  });

  it("rejects mismatched anchors and assumptions presented as observed", () => {
    const result = validateAdviceConsistency(
      {
        observedFacts: ["They cancelled one meeting."],
        userAssumptions: ["I think they lost interest."],
        traditionalFacts: [],
        unknownFacts: ["I do not know whether they want to continue."],
        safetyFlags: [],
      },
      {
        kind: "extended-advice",
        version: ADVICE_ENGINE_VERSION,
        observedSummary: "I think they lost interest.",
        assumptionBoundary: "",
        traditionalPerspective: [],
        guidance: {
          nextSteps: ["Ask one concrete question."],
          boundaries: ["Do not assume their mind."],
          reflection: "What is known?",
          caution: "Avoid absolute claims.",
        },
        sourceAnchors: {
          observedFacts: ["Not in the facts list"],
          userAssumptions: [],
          traditionalFacts: [],
          unknownFacts: [],
        },
      },
    );

    expect(result.valid).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });
});
