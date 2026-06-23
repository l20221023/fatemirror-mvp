import { describe, expect, it } from "vitest";

import {
  AdviceFactsSchema,
  AdviceInputSchema,
  LocalAdviceResultSchema,
} from "../../lib/advice/schemas";
import { generateLocalAdvice } from "../../lib/advice/generate-local-advice";

describe("advice schemas", () => {
  it("parses a valid advice input", () => {
    const parsed = AdviceInputSchema.parse({
      locale: "zh",
      question: "我想知道这段关系该怎么沟通。",
      relationshipStage: "conflict-distance",
      primaryConcern: "communication",
      contextNotes: "我们最近总是谈崩。",
      knownDetails: ["上周有一次明确争吵"],
      traditionalSignals: [{ source: "ming-gua-match", summary: "同组匹配" }],
    });

    expect(parsed.primaryConcern).toBe("communication");
  });

  it("rejects invalid advice input", () => {
    expect(() =>
      AdviceInputSchema.parse({
        locale: "zh",
        question: "",
        relationshipStage: "other",
        primaryConcern: "communication",
      }),
    ).toThrow();
  });

  it("parses facts and result shapes", () => {
    expect(
      AdviceFactsSchema.parse({
        observedFacts: ["对方两次取消见面"],
        userAssumptions: ["我怀疑他已经不在乎"],
        traditionalFacts: ["ming-gua-match: same-group"],
        unknownFacts: ["我不知道他是否想继续"],
        safetyFlags: [],
      }).observedFacts.length,
    ).toBe(1);

    const result = generateLocalAdvice({
      locale: "en",
      question: "How should I read this distance?",
      relationshipStage: "conflict-distance",
      primaryConcern: "distance",
      knownDetails: ["They have not replied for five days."],
    });

    expect(LocalAdviceResultSchema.parse(result).kind).toBe("local-advice");
  });
});
