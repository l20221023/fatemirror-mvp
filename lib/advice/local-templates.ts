import { createAdviceError } from "./errors";
import type {
  AdviceFacts,
  AdviceLocale,
  LocalAdviceResult,
  PrimaryConcern,
  RelationshipStage,
  SafetyClassification,
} from "./types";
import { ADVICE_ENGINE_VERSION } from "./types";

type StageTemplate = {
  en: { label: string; situation: string };
  zh: { label: string; situation: string };
};

type ConcernTemplate = {
  en: {
    headline: string;
    nextSteps: string[];
    boundaries: string[];
    reflection: string;
  };
  zh: {
    headline: string;
    nextSteps: string[];
    boundaries: string[];
    reflection: string;
  };
};

const STAGE_TEMPLATES: Record<RelationshipStage, StageTemplate> = {
  "early-contact": {
    en: { label: "Early contact", situation: "The connection is still light, so clarity matters more than intensity." },
    zh: { label: "初步接触", situation: "关系还在起步阶段，此时更需要清晰与节奏，而不是过度投入。" },
  },
  "getting-closer": {
    en: { label: "Getting closer", situation: "Both people may be testing consistency, responsiveness, and comfort." },
    zh: { label: "逐渐靠近", situation: "彼此正在观察稳定性、回应方式和相处舒适度。" },
  },
  "unclear-relationship": {
    en: { label: "Unclear relationship", situation: "Ambiguity is part of the strain, so naming what is real becomes important." },
    zh: { label: "关系未明", situation: "模糊本身就是压力来源，先把真实情况说清楚更重要。" },
  },
  committed: {
    en: { label: "Committed", situation: "The issue now is less about attraction and more about repair, roles, and follow-through." },
    zh: { label: "已承诺关系", situation: "当前重点更像是修复、分工和兑现，而不是单纯心动。" },
  },
  "conflict-distance": {
    en: { label: "Conflict or distance", situation: "The bond may be strained by silence, conflict, or uneven effort." },
    zh: { label: "冲突或疏离", situation: "关系可能正被沉默、冲突或投入失衡拉扯。" },
  },
  separation: {
    en: { label: "Separation", situation: "The immediate need is steadiness and reality-checking, not rushing to restore certainty." },
    zh: { label: "分开阶段", situation: "眼下更需要稳定自己、看清现实，而不是急着把结论拉回确定。" },
  },
};

const CONCERN_TEMPLATES: Record<PrimaryConcern, ConcernTemplate> = {
  intentions: {
    en: {
      headline: "Ask for clarity without forcing a verdict.",
      nextSteps: [
        "Name one concrete question about intentions instead of asking for total certainty.",
        "Look for repeated behavior, not only mood or chemistry.",
      ],
      boundaries: [
        "Do not treat silence as proof of commitment.",
        "Do not claim to know what the other person truly feels.",
      ],
      reflection: "What has this person actually done more than once, and what are you filling in yourself?",
    },
    zh: {
      headline: "把意图问清楚，但不要逼出终局答案。",
      nextSteps: [
        "先提出一个具体问题，而不是要求对方一次性交代全部未来。",
        "优先看重复出现的行为，而不只看一时热度。",
      ],
      boundaries: [
        "不要把沉默直接解释成承诺。",
        "不要声称自己已经知道对方的真实心理。",
      ],
      reflection: "对方真正重复做过什么，又有哪些部分是你自己在补全？",
    },
  },
  communication: {
    en: {
      headline: "Lower the heat and increase precision.",
      nextSteps: [
        "Describe one event, one feeling, and one request.",
        "Choose a time to talk when neither side is already escalated.",
      ],
      boundaries: [
        "Do not keep repeating the same message after no reply.",
        "Do not turn symbolic compatibility into proof that your argument is right.",
      ],
      reflection: "Which part is the real issue: tone, timing, or an unmet agreement?",
    },
    zh: {
      headline: "先降温，再把表达说准确。",
      nextSteps: [
        "一次只说一件事：发生了什么、你感受到什么、你希望什么。",
        "选择双方都没在上头的时候再谈。",
      ],
      boundaries: [
        "对方不回复时，不要反复轰炸同样的信息。",
        "不要把传统结果当成你一定正确的证据。",
      ],
      reflection: "真正的问题更像是语气、时机，还是某个约定一直没有落实？",
    },
  },
  trust: {
    en: {
      headline: "Trust needs evidence, boundaries, and time.",
      nextSteps: [
        "Write down which trust question is concrete and verifiable.",
        "Discuss what would count as repair, not only what caused pain.",
      ],
      boundaries: [
        "Do not investigate, track, or surveil to calm anxiety.",
        "Do not invent a compatibility score to justify staying or leaving.",
      ],
      reflection: "What evidence do you have, and what part comes from fear or guesswork?",
    },
    zh: {
      headline: "信任要靠证据、边界和时间重建。",
      nextSteps: [
        "把你最在意的信任问题写成可核实的事实。",
        "不仅讨论受伤原因，也讨论什么才算修复动作。",
      ],
      boundaries: [
        "不要用跟踪、监视或查手机来缓解焦虑。",
        "不要自造匹配分数来证明该不该继续。",
      ],
      reflection: "你手里的证据是什么，哪些又只是出于害怕的推测？",
    },
  },
  distance: {
    en: {
      headline: "Distance is easier to read through patterns than promises.",
      nextSteps: [
        "Check whether the gap is logistical, emotional, or both.",
        "Ask for one realistic contact rhythm instead of constant reassurance.",
      ],
      boundaries: [
        "Do not keep chasing after repeated non-response.",
        "Do not read a traditional sign as proof that contact must happen soon.",
      ],
      reflection: "What contact pattern is actually sustainable for both people right now?",
    },
    zh: {
      headline: "疏离更适合看模式，而不是听承诺。",
      nextSteps: [
        "先分清楚距离感是现实安排造成的，还是情感退缩造成的。",
        "争取一个现实可行的联系节奏，而不是不断索要安抚。",
      ],
      boundaries: [
        "多次不回应后，不要继续追着要答案。",
        "不要把传统信号当成对方一定会主动联系的证明。",
      ],
      reflection: "对双方来说，什么样的联系频率才真正可持续？",
    },
  },
  commitment: {
    en: {
      headline: "Commitment is shown in plans, costs, and follow-through.",
      nextSteps: [
        "Move from abstract future talk to one concrete shared decision.",
        "Check whether values, resources, and timing are aligned enough for the next step.",
      ],
      boundaries: [
        "Do not make absolute claims like destined marriage or guaranteed separation.",
        "Do not use pressure, guilt, or ritualized certainty to force a yes.",
      ],
      reflection: "If you removed the fantasy version, what commitment has actually been demonstrated?",
    },
    zh: {
      headline: "承诺要落在计划、代价和兑现上。",
      nextSteps: [
        "把抽象的未来话题收敛成一个具体决定来讨论。",
        "核对价值观、资源和时机是否足够支撑下一步。",
      ],
      boundaries: [
        "不要做“必然结婚”或“必然分开”的绝对判断。",
        "不要用施压、内疚或神秘确定感去逼承诺。",
      ],
      reflection: "去掉想象后的版本，对方究竟实际兑现过哪些承诺？",
    },
  },
  breakup: {
    en: {
      headline: "Treat breakup questions as recovery and clarity work first.",
      nextSteps: [
        "Stabilize sleep, routines, and support before making major relationship moves.",
        "Decide whether you need closure, no-contact, or one contained conversation.",
      ],
      boundaries: [
        "Do not retaliate, test, or try to make the other person regret it.",
        "Do not keep escalating contact after a clear refusal or block.",
      ],
      reflection: "What outcome would genuinely reduce harm for you in the next two weeks?",
    },
    zh: {
      headline: "分开议题先做恢复和澄清，不先做推进。",
      nextSteps: [
        "先稳住作息、生活节奏和支持系统，再决定关系动作。",
        "分清你现在更需要的是告别、断联，还是一次边界明确的沟通。",
      ],
      boundaries: [
        "不要报复、试探，或故意让对方后悔。",
        "在明确拒绝或拉黑后，不要继续升级联系。",
      ],
      reflection: "接下来两周里，什么结果最能真正减少你的损耗？",
    },
  },
};

function localeText<T>(locale: AdviceLocale, value: { en: T; zh: T }): T {
  return value[locale];
}

export function buildHighRiskLocalAdvice(
  locale: AdviceLocale,
  relationshipStage: RelationshipStage,
  primaryConcern: PrimaryConcern,
  facts: AdviceFacts,
  classifications: SafetyClassification[],
): LocalAdviceResult {
  const isZh = locale === "zh";

  return {
    kind: "local-advice",
    version: ADVICE_ENGINE_VERSION,
    locale,
    relationshipStage,
    primaryConcern,
    facts,
    safety: {
      isHighRisk: true,
      classifications,
    },
    summary: {
      headline: isZh ? "当前输入触发了安全优先处理。" : "This input requires a safety-first response.",
      situation: isZh
        ? "这里不继续给出普通关系推进或命理式建议，优先处理现实安全与专业支持。"
        : "This response does not continue with ordinary relationship or metaphysical guidance.",
      traditionalPerspective: isZh
        ? ["传统结果不能覆盖现实风险。任何传统信号都不能替代安全判断。"]
        : ["Traditional signals cannot override real-world safety concerns."],
      caution: isZh
        ? "如果存在人身危险、自伤风险、胁迫、跟踪、未成年或医疗问题，请立即转向现实支持渠道。"
        : "If there is danger, coercion, self-harm risk, minor-related concern, or medical risk, shift to real-world support immediately.",
    },
    guidance: {
      nextSteps: isZh
        ? [
            "优先联系现实中的可信任成年人、朋友、家人、学校、单位或当地紧急支持渠道。",
            "把注意力放在即时安全、身体状态和证据保存，而不是继续推进关系动作。",
          ]
        : [
            "Contact a trusted person, local emergency support, or a qualified professional first.",
            "Focus on immediate safety, physical wellbeing, and documentation rather than relationship escalation.",
          ],
      boundaries: isZh
        ? [
            "不要继续跟踪、报复、施压、试探或用神秘解释压过现实风险。",
            "不要把自己的猜测当成对方真实心理或未来必然结果。",
          ]
        : [
            "Do not stalk, retaliate, pressure, or test the other person.",
            "Do not present guesses as certainty about another person's mind or the future.",
          ],
      reflection: isZh
        ? "眼下最优先要保护的人、最需要联络的支持对象，以及最该停止的高风险动作分别是什么？"
        : "Who needs protection first, who can support you now, and which risky action needs to stop immediately?",
    },
  };
}

export function buildStandardLocalAdvice(
  locale: AdviceLocale,
  relationshipStage: RelationshipStage,
  primaryConcern: PrimaryConcern,
  facts: AdviceFacts,
  classifications: SafetyClassification[],
): LocalAdviceResult {
  const stage = STAGE_TEMPLATES[relationshipStage];
  const concern = CONCERN_TEMPLATES[primaryConcern];

  if (!stage || !concern) {
    throw createAdviceError("TEMPLATE_NOT_FOUND");
  }

  const stageText = localeText(locale, stage);
  const concernText = localeText(locale, concern);
  const traditionalPerspective =
    facts.traditionalFacts.length > 0
      ? facts.traditionalFacts.map((item) =>
          locale === "zh"
            ? `传统视角可作为旁观角度参考：${item}。但行动建议仍以现实事实、边界和安全为准。`
            : `Traditional perspective may offer context: ${item}. It does not decide the action plan on its own.`,
        )
      : [
          locale === "zh"
            ? "当前没有传统输入，本建议仅基于已知事实、未知项和安全规则生成。"
            : "No traditional signal was provided, so this advice stays grounded in observed facts, unknowns, and safety rules.",
        ];

  return {
    kind: "local-advice",
    version: ADVICE_ENGINE_VERSION,
    locale,
    relationshipStage,
    primaryConcern,
    facts,
    safety: {
      isHighRisk: false,
      classifications,
    },
    summary: {
      headline: concernText.headline,
      situation: stageText.situation,
      traditionalPerspective,
      caution:
        locale === "zh"
          ? "本建议不会声称知道对方真实心理，也不会给出必然结婚、分手、正缘、灾祸等绝对判断。"
          : "This advice does not claim to know the other person's mind or make absolute predictions such as guaranteed marriage, breakup, soulmate status, or disaster.",
    },
    guidance: {
      nextSteps: concernText.nextSteps,
      boundaries: concernText.boundaries,
      reflection: concernText.reflection,
    },
  };
}
