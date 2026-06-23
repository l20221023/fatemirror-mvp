import { describe, expect, it } from "vitest";

import { classifySafety } from "../../lib/advice/safety-classifier";

describe("safety-classifier", () => {
  it("covers each required safety category", () => {
    const cases = [
      { code: "violence_or_threat", question: "He threatened to hurt me if I leave." },
      { code: "self_harm", question: "I want to kill myself if this relationship ends." },
      { code: "stalking_or_surveillance", question: "Can I track her phone without her knowing?" },
      { code: "coercion_or_control", question: "How do I force him to obey and stay?" },
      { code: "revenge_or_manipulation", question: "How can I punish her and make her regret leaving?" },
      { code: "minor_related", question: "I am talking to an underage high school student." },
      { code: "medical_or_pregnancy", question: "Does this mean she is pregnant?" },
      { code: "severe_delusion", question: "The government is reading my thoughts through a chip." },
    ] as const;

    for (const testCase of cases) {
      const result = classifySafety({
        locale: "en",
        question: testCase.question,
        relationshipStage: "unclear-relationship",
        primaryConcern: "intentions",
      });

      expect(result.map((item) => item.code)).toContain(testCase.code);
    }
  });

  it("returns an empty list for ordinary relationship input", () => {
    expect(
      classifySafety({
        locale: "zh",
        question: "我们最近联系变少了，我想知道怎么沟通。",
        relationshipStage: "conflict-distance",
        primaryConcern: "communication",
      }),
    ).toEqual([]);
  });
});
