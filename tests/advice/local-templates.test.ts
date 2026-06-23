import { describe, expect, it } from "vitest";

import { generateLocalAdvice } from "../../lib/advice/generate-local-advice";

describe("local advice templates", () => {
  it("builds ordinary local advice without letting traditional signals decide the action", () => {
    const result = generateLocalAdvice({
      locale: "zh",
      question: "我想知道这段关系接下来怎么推进更稳。",
      relationshipStage: "getting-closer",
      primaryConcern: "commitment",
      contextNotes: "我们最近联系很频繁，但还没谈清楚未来。",
      traditionalSignals: [{ source: "ming-gua-match", summary: "传统上偏顺" }],
    });

    expect(result.safety.isHighRisk).toBe(false);
    expect(result.summary.traditionalPerspective[0]).toContain("传统");
    expect(result.guidance.nextSteps.length).toBeGreaterThan(0);
    expect(result.summary.caution).toContain("不会声称知道对方真实心理");
  });

  it("covers all six relationship stages and six concerns", () => {
    const stages = [
      "early-contact",
      "getting-closer",
      "unclear-relationship",
      "committed",
      "conflict-distance",
      "separation",
    ] as const;
    const concerns = [
      "intentions",
      "communication",
      "trust",
      "distance",
      "commitment",
      "breakup",
    ] as const;

    for (const stage of stages) {
      for (const concern of concerns) {
        const result = generateLocalAdvice({
          locale: "en",
          question: "I need grounded relationship advice.",
          relationshipStage: stage,
          primaryConcern: concern,
        });

        expect(result.summary.headline.length).toBeGreaterThan(0);
        expect(result.guidance.boundaries.length).toBeGreaterThan(0);
      }
    }
  });

  it("short-circuits to a safety-first response for high-risk input", () => {
    const result = generateLocalAdvice({
      locale: "en",
      question: "How do I track her phone and make her regret leaving?",
      relationshipStage: "separation",
      primaryConcern: "breakup",
    });

    expect(result.safety.isHighRisk).toBe(true);
    expect(result.guidance.boundaries.join(" ")).toMatch(/stalk|retaliate/i);
  });
});
