import { describe, expect, it } from "vitest";

import { buildAdviceFacts } from "../../lib/advice/fact-builder";

describe("fact-builder", () => {
  it("separates observed, assumption, traditional, unknown, and safety facts", () => {
    const facts = buildAdviceFacts({
      locale: "zh",
      question: "我觉得他可能不想继续，但我不知道他会不会回复。",
      relationshipStage: "unclear-relationship",
      primaryConcern: "intentions",
      contextNotes: "上周他取消过一次见面。",
      knownDetails: ["这周没有再约时间", "我怀疑他在躲我"],
      traditionalSignals: [{ source: "ming-gua-match", summary: "同组匹配" }],
    });

    expect(facts.observedFacts).toContain("上周他取消过一次见面");
    expect(facts.userAssumptions.some((item) => item.includes("可能"))).toBe(true);
    expect(facts.unknownFacts.some((item) => item.includes("不知道"))).toBe(true);
    expect(facts.traditionalFacts).toEqual(["ming-gua-match: 同组匹配"]);
    expect(facts.safetyFlags).toEqual([]);
  });

  it("collects safety flags from risky text", () => {
    const facts = buildAdviceFacts({
      locale: "en",
      question: "Should I track their phone to see where they are?",
      relationshipStage: "conflict-distance",
      primaryConcern: "trust",
    });

    expect(facts.safetyFlags).toContain("stalking_or_surveillance");
  });
});
