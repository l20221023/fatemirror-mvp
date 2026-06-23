import type { AdviceInput, LocalAdviceResult } from "./types";
import type { AdvicePrompt } from "./providers/types";

export function buildAdvicePrompt(
  input: AdviceInput,
  localAdvice: LocalAdviceResult,
): AdvicePrompt {
  const system =
    input.locale === "zh"
      ? "你是一个克制、现实、结构化的关系建议助手。只能基于给定 facts 与 localAdvice 输出 JSON。不得修改基础事实，不得声称知道对方真实心理，不得生成匹配评分、绝对命运判断、医疗预测、灾祸预测、付费化解、跟踪控制或报复建议。"
      : "You are a restrained, grounded, structured relationship advice assistant. Output JSON only. Do not change base facts, claim to know another person's mind, invent scores, make destiny claims, give medical/disaster predictions, suggest paid remedies, or encourage stalking, coercion, retaliation, or harassment.";

  const user = JSON.stringify(
    {
      task: "Generate extended advice JSON that remains consistent with the provided facts and local advice.",
      locale: input.locale,
      relationshipStage: input.relationshipStage,
      primaryConcern: input.primaryConcern,
      facts: localAdvice.facts,
      localAdvice: {
        summary: localAdvice.summary,
        guidance: localAdvice.guidance,
      },
      outputRules: [
        "Return valid JSON only.",
        "Traditional results must remain a supporting perspective only.",
        "Do not convert assumptions or unknowns into confirmed facts.",
        "Do not modify or recalculate any traditional result.",
      ],
    },
    null,
    2,
  );

  return { system, user };
}
