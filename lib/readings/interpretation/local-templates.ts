import type { Locale } from "../../i18n";
import type { MingGuaMatchLevel } from "../../ming-gong";
import type { XiaoLiuRenKey } from "../../xiaoliu-ren";

export type LoveInterpretationFacts = {
  method: "ming-gua-match";
  personA: {
    palaceNumber: number;
    trigram: string;
    groupLabel: string;
  };
  personB: {
    palaceNumber: number;
    trigram: string;
    groupLabel: string;
  };
  matchType: MingGuaMatchLevel;
  matchLabel: string;
  matchSummary: string;
  relationshipStage?: string;
  question?: string;
};

export type MomentInterpretationFacts = {
  method: "xiaoliu-ren";
  deityKey: XiaoLiuRenKey;
  deityName: string;
  summary: string;
  action: string;
  occurredAtLabel: string;
  question?: string;
};

export function buildLoveLocalTemplate(
  locale: Locale,
  layer: "free" | "paid",
  facts: LoveInterpretationFacts,
) {
  if (locale === "zh") {
    const stageText = facts.relationshipStage ? `当前阶段是“${facts.relationshipStage}”。` : "";
    const questionText = facts.question ? `你最关心的问题是：${facts.question}。` : "";
    const effort =
      facts.matchType === "traditional-best-pair"
        ? "这类组合通常更容易在节奏和方向感上找到共鸣，但仍需要现实中的确认。"
        : facts.matchType === "same-group"
          ? "这类组合在方向偏好上更接近，真正能否走稳仍取决于沟通和边界。"
          : "这类组合意味着双方更可能在节奏、期待或生活偏好上需要额外协商。";

    if (layer === "free") {
      return `${facts.matchSummary}${stageText}${questionText}${effort}先别急着把一次波动当成结论，回到你们最近最真实的互动里再看。`;
    }

    return `${facts.matchSummary}${stageText}${questionText}${effort}如果你想让关系更清楚，最值得先观察的，不是“合不合”，而是两个人在不舒服的时候，能不能继续说清楚、继续修复，并且在现实安排上彼此尊重。`;
  }

  const stageText = facts.relationshipStage ? `The current stage is "${facts.relationshipStage}". ` : "";
  const questionText = facts.question ? `The main question is: ${facts.question}. ` : "";
  const effort =
    facts.matchType === "traditional-best-pair"
      ? "This pairing tends to feel more naturally aligned in direction, though reality still matters more than symbolism. "
      : facts.matchType === "same-group"
        ? "This pairing shares a broader directional group, but the relationship still stands or falls on communication and boundaries. "
        : "This pairing suggests more negotiation may be needed around pace, expectations, and practical life. ";

  if (layer === "free") {
    return `${facts.matchSummary} ${stageText}${questionText}${effort}Before turning one emotional moment into a verdict, look again at the most recent real interaction between you.`;
  }

  return `${facts.matchSummary} ${stageText}${questionText}${effort}The most useful question now is not whether the match is good in theory, but whether both people can stay clear, respectful, and repair-oriented when the relationship becomes uncomfortable.`;
}

export function buildMomentLocalTemplate(
  locale: Locale,
  layer: "free" | "paid",
  facts: MomentInterpretationFacts,
) {
  if (locale === "zh") {
    const questionText = facts.question ? `你此刻的问题是：${facts.question}。` : "";
    if (layer === "free") {
      return `${facts.deityName}的信号偏向这样的状态：${facts.summary}${questionText}先读清当前的节奏，再决定要不要推进，通常会比急着求答案更稳。`;
    }

    return `${facts.deityName}提示眼前这件事更适合从时机和节奏来判断：${facts.summary}${questionText}${facts.action}如果外部信息还不够完整，先补齐事实，再做下一步决定。`;
  }

  const questionText = facts.question ? `Your question is: ${facts.question}. ` : "";
  if (layer === "free") {
    return `${facts.deityName} points to this kind of field: ${facts.summary} ${questionText}Read the timing before you force movement.`;
  }

  return `${facts.deityName} suggests this matter is best judged through timing and rhythm: ${facts.summary} ${questionText}${facts.action} If the facts are still incomplete, gather them before making the next move.`;
}
