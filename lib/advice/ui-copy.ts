import type {
  AdviceGenerationMode,
  AdviceLocale,
  AdviceMode,
  PrimaryConcern,
  RelationshipStage,
  TraditionalSignal,
} from "./types";
import { PRIMARY_CONCERNS, RELATIONSHIP_STAGES } from "./types";

type LocalizedOption<T extends string> = {
  value: T;
  label: string;
};

export type AdviceUiCopy = {
  alphaBadge: string;
  homeEntry: {
    title: string;
    description: string;
    cta: string;
    note: string;
  };
  page: {
    eyebrow: string;
    title: string;
    intro: string;
    highlights: string[];
    formTitle: string;
    formIntro: string;
    resultTitle: string;
    resultMissingTitle: string;
    resultMissingText: string;
    resultMissingCta: string;
  };
  form: {
    modeLabel: string;
    modeOptions: Array<{
      value: AdviceMode;
      label: string;
      description: string;
    }>;
    relationshipStage: string;
    primaryConcern: string;
    question: string;
    questionPlaceholder: string;
    contextNotes: string;
    contextPlaceholder: string;
    knownDetails: string;
    knownDetailsHint: string;
    knownDetailsPlaceholder: string;
    addKnownDetail: string;
    traditionalSignals: string;
    traditionalSignalsHint: string;
    signalSource: string;
    signalSummary: string;
    signalSummaryPlaceholder: string;
    addTraditionalSignal: string;
    removeItem: string;
    privacyReminder: string;
    identityReminder: string;
    privacyConfirmation: string;
    aiConfirmation: string;
    submitLocal: string;
    submitAi: string;
    submitting: string;
    retry: string;
    rewrite: string;
    startOver: string;
    questionCountLabel: string;
    contextCountLabel: string;
    stageOptions: Array<LocalizedOption<RelationshipStage>>;
    concernOptions: Array<LocalizedOption<PrimaryConcern>>;
    sourceOptions: Array<LocalizedOption<TraditionalSignal["source"]>>;
  };
  errors: {
    validation: string;
    privacyRequired: string;
    aiConfirmationRequired: string;
    timeout: string;
    network: string;
    requestFailed: string;
    invalidResponse: string;
  };
  result: {
    summaryTitle: string;
    factsTitle: string;
    observedFacts: string;
    userAssumptions: string;
    unknownFacts: string;
    emptyFacts: string;
    traditionalPerspectiveTitle: string;
    traditionalPerspectiveHint: string;
    actionAdviceTitle: string;
    localGuidanceTitle: string;
    aiGuidanceTitle: string;
    nextSteps: string;
    boundaries: string;
    reflection: string;
    caution: string;
    generationTitle: string;
    aiBadge: string;
    aiBadgeHint: string;
    statusLabels: Record<AdviceGenerationMode, string>;
    statusDescriptions: Record<AdviceGenerationMode, string>;
    links: {
      methodology: string;
      privacy: string;
      disclaimer: string;
    };
    rewrite: string;
    startOver: string;
    devAnchors: string;
  };
  safety: {
    title: string;
    summary: string;
    professionalHelp: string;
    emergencySupport: string;
  };
  feedback: {
    title: string;
    levels: Array<{ value: "helpful" | "partial" | "not_helpful"; label: string }>;
    reasonsLabel: string;
    reasons: Array<{ value: "too_generic" | "not_fact_based" | "not_actionable" | "repetitive" | "other"; label: string }>;
    submitted: string;
  };
};

const STAGE_LABELS: Record<RelationshipStage, { en: string; zh: string }> = {
  "early-contact": { en: "Just started talking", zh: "刚开始联系" },
  "getting-closer": { en: "Getting closer", zh: "正在靠近" },
  "unclear-relationship": { en: "Unclear relationship", zh: "关系不明确" },
  committed: { en: "Committed relationship", zh: "稳定关系" },
  "conflict-distance": { en: "Conflict or distance", zh: "冲突或疏远" },
  separation: { en: "Separated or considering ending", zh: "分开或考虑结束" },
};

const CONCERN_LABELS: Record<PrimaryConcern, { en: string; zh: string }> = {
  intentions: { en: "Their intentions", zh: "对方的意图" },
  communication: { en: "How to communicate", zh: "如何沟通" },
  trust: { en: "Trust issues", zh: "信任问题" },
  distance: { en: "Distance and coldness", zh: "距离与冷淡" },
  commitment: { en: "Commitment or continuing", zh: "是否承诺或继续投入" },
  breakup: { en: "Breakup or stepping back", zh: "分开与退出" },
};

const SOURCE_LABELS: Record<TraditionalSignal["source"], { en: string; zh: string }> = {
  "ming-gua-match": { en: "Ming Gua Match", zh: "命卦匹配" },
  "xiaoliu-ren": { en: "Xiao Liu Ren", zh: "小六壬" },
  "marriage-direction": { en: "Marriage Direction", zh: "婚配方位" },
  custom: { en: "Other traditional signal", zh: "其他传统信号" },
};

function stageOptions(locale: AdviceLocale) {
  return RELATIONSHIP_STAGES.map((value) => ({
    value,
    label: STAGE_LABELS[value][locale],
  }));
}

function concernOptions(locale: AdviceLocale) {
  return PRIMARY_CONCERNS.map((value) => ({
    value,
    label: CONCERN_LABELS[value][locale],
  }));
}

function sourceOptions(locale: AdviceLocale) {
  return (Object.keys(SOURCE_LABELS) as TraditionalSignal["source"][]).map((value) => ({
    value,
    label: SOURCE_LABELS[value][locale],
  }));
}

export function getAdviceUiCopy(locale: AdviceLocale): AdviceUiCopy {
  if (locale === "zh") {
    return {
      alphaBadge: "内部测试 / Alpha",
      homeEntry: {
        title: "关系现状与下一步建议",
        description:
          "填写结构化关系信息，先得到基础建议；如启用 AI 扩展，失败时也会安全降级回本地建议，不暴露模型细节。",
        cta: "开始内部测试",
        note: "内部测试 / Alpha",
      },
      page: {
        eyebrow: "Advice Engine",
        title: "把关系事实、未知部分和可执行建议分开来看。",
        intro:
          "这个内部测试页先把你能确认的事实、你的猜测、传统结果和未知信息拆开，再返回基础建议或 AI 扩展建议。",
        highlights: [
          "只接收结构化字段并通过 POST 提交，不把问题正文写进 URL。",
          "高风险内容会优先切换到安全分流，不继续生成普通关系推进建议。",
          "AI 扩展只做整理和补充，不能改写基础事实或确定性计算结果。",
        ],
        formTitle: "填写关系情况",
        formIntro:
          "这是内部测试表单。请只写你自己观察到或能确认的情况，避免填写真实姓名、电话、住址、证件号、工作单位等敏感信息。",
        resultTitle: "关系建议结果",
        resultMissingTitle: "这次建议结果已经离开当前页面会话。",
        resultMissingText:
          "出于隐私保护，这个内部测试结果不会默认持久化，也不会写入 URL。请返回表单重新填写并提交。",
        resultMissingCta: "返回建议表单",
      },
      form: {
        modeLabel: "建议模式",
        modeOptions: [
          {
            value: "local",
            label: "基础建议",
            description: "仅使用本地规则模板生成建议，始终可用。",
          },
          {
            value: "ai",
            label: "AI扩展建议",
            description: "先生成基础建议，再尝试补充 AI 扩展内容；失败时会自动降级。",
          },
        ],
        relationshipStage: "关系阶段",
        primaryConcern: "主要问题",
        question: "你现在最想处理的问题",
        questionPlaceholder: "例如：我们最近越来越冷淡，我应该先沟通节奏，还是先停下来观察？",
        contextNotes: "补充背景",
        contextPlaceholder: "补充最近发生过的情况，但只写你能确认的事实和你自己的感受。",
        knownDetails: "已知情况",
        knownDetailsHint: "逐条填写你能观察到或确认的情况，不要把猜测写成事实。",
        knownDetailsPlaceholder: "例如：这周没有再约时间",
        addKnownDetail: "添加一条已知情况",
        traditionalSignals: "可选传统结果",
        traditionalSignalsHint: "传统结果只能作为辅助观察，不能单独决定行动建议。",
        signalSource: "来源",
        signalSummary: "结果摘要",
        signalSummaryPlaceholder: "例如：同组匹配，节奏偏慢",
        addTraditionalSignal: "添加传统结果",
        removeItem: "删除",
        privacyReminder: "请删除姓名、手机号、住址、学校、公司、证件号等不必要个人信息。",
        identityReminder: "不要填写第三方真实身份信息，也不要代替对方做心理定论。",
        privacyConfirmation: "我已删除姓名、手机号、地址等不必要的个人信息。",
        aiConfirmation:
          "我理解扩展建议可能由人工智能生成，只用于整理信息和提供行动参考，不能替代现实沟通或专业意见。",
        submitLocal: "生成基础建议",
        submitAi: "生成 AI 扩展建议",
        submitting: "正在生成建议",
        retry: "重试",
        rewrite: "返回改写",
        startOver: "重新填写",
        questionCountLabel: "问题字数",
        contextCountLabel: "背景字数",
        stageOptions: stageOptions(locale),
        concernOptions: concernOptions(locale),
        sourceOptions: sourceOptions(locale),
      },
      errors: {
        validation: "请先完成必填项，并确认输入没有超出长度限制。",
        privacyRequired: "提交前请先确认你已经移除了不必要的个人信息。",
        aiConfirmationRequired: "AI 扩展模式需要先确认 AI 使用说明。",
        timeout: "请求超时了。你可以直接重试，之前填写的内容还在当前页面里。",
        network: "网络请求失败，当前没有生成结果。请检查连接后重试。",
        requestFailed: "这次请求没有成功完成。请调整输入后重试。",
        invalidResponse: "系统返回了无法使用的结果格式，请稍后重试。",
      },
      result: {
        summaryTitle: "情况摘要",
        factsTitle: "信息边界",
        observedFacts: "可以确认的事实",
        userAssumptions: "用户当前的推测",
        unknownFacts: "目前无法确认的信息",
        emptyFacts: "当前没有可显示的条目。",
        traditionalPerspectiveTitle: "传统文化视角",
        traditionalPerspectiveHint: "该部分只作为辅助观察，不单独决定现实行动。",
        actionAdviceTitle: "行动建议",
        localGuidanceTitle: "基础建议",
        aiGuidanceTitle: "AI 扩展建议",
        nextSteps: "下一步",
        boundaries: "边界提醒",
        reflection: "反思问题",
        caution: "重要提醒",
        generationTitle: "生成状态",
        aiBadge: "以下扩展内容由人工智能根据结构化信息辅助生成，请结合现实情况独立判断。",
        aiBadgeHint: "AI 扩展不会改写基础事实和传统计算结果。",
        statusLabels: {
          local: "local_only",
          ai: "ai_enhanced",
          ai_fallback: "ai_fallback",
          high_risk_local: "high_risk_local",
        },
        statusDescriptions: {
          local: "当前展示的是基础规则建议。",
          ai: "当前展示的是基础建议加 AI 扩展建议。",
          ai_fallback: "AI 扩展暂时不可用，当前安全降级为基础建议。",
          high_risk_local: "检测到高风险输入，当前切换为安全优先结果。",
        },
        links: {
          methodology: "方法说明",
          privacy: "隐私说明",
          disclaimer: "免责声明",
        },
        rewrite: "返回改写并重试",
        startOver: "清空并重新填写",
        devAnchors: "开发调试视图：sourceAnchors",
      },
      safety: {
        title: "安全优先结果",
        summary: "当前不继续提供普通关系推进建议，而是优先处理现实安全、专业支持和边界保护。",
        professionalHelp: "涉及医疗、怀孕或法律问题时，请优先咨询对应专业人士。",
        emergencySupport: "涉及暴力、威胁、自伤、跟踪或强迫控制时，请优先联系可信任的人或当地紧急支持渠道。",
      },
      feedback: {
        title: "这份建议对你有帮助吗？",
        levels: [
          { value: "helpful", label: "有帮助" },
          { value: "partial", label: "部分有帮助" },
          { value: "not_helpful", label: "没有帮助" },
        ],
        reasonsLabel: "你可以选择原因",
        reasons: [
          { value: "too_generic", label: "太笼统" },
          { value: "not_fact_based", label: "没有结合事实" },
          { value: "not_actionable", label: "建议不可执行" },
          { value: "repetitive", label: "内容重复" },
          { value: "other", label: "其他" },
        ],
        submitted: "反馈只保存在当前页面状态，不会默认上传原始问题或完整结果。",
      },
    };
  }

  return {
    alphaBadge: "Internal Test / Alpha",
    homeEntry: {
      title: "Relationship status and next-step advice",
      description:
        "Fill in structured relationship facts to get local advice first, with optional AI expansion that safely falls back if AI is unavailable.",
      cta: "Start internal test",
      note: "Internal Test / Alpha",
    },
    page: {
      eyebrow: "Advice Engine",
      title: "Separate facts, unknowns, and next actions before reading the situation.",
      intro:
        "This internal testing flow separates observed facts, guesses, traditional signals, and unknowns before returning local advice or optional AI-expanded advice.",
      highlights: [
        "Structured fields are submitted via POST only, with no raw question text in the URL.",
        "High-risk content is diverted into a safety-first result instead of ordinary relationship guidance.",
        "AI expansion can reorganize and extend advice, but it cannot rewrite base facts or deterministic calculations.",
      ],
      formTitle: "Relationship advice form",
      formIntro:
        "This is an internal testing form. Only include information you can personally observe or confirm, and remove names, phone numbers, addresses, IDs, workplaces, and other sensitive details.",
      resultTitle: "Relationship advice result",
      resultMissingTitle: "This result is no longer available in the current page session.",
      resultMissingText:
        "For privacy, this internal test does not persist results by default and does not place your input in the URL. Please return to the form and submit again.",
      resultMissingCta: "Back to advice form",
    },
    form: {
      modeLabel: "Advice mode",
      modeOptions: [
        {
          value: "local",
          label: "Basic advice",
          description: "Uses local rule-based templates only and is always available.",
        },
        {
          value: "ai",
          label: "AI expanded advice",
          description: "Generates local advice first, then attempts structured AI expansion with safe fallback.",
        },
      ],
      relationshipStage: "Relationship stage",
      primaryConcern: "Primary concern",
      question: "What do you most want help with right now?",
      questionPlaceholder: "For example: We have become more distant lately. Should I clarify the pace, or step back and observe first?",
      contextNotes: "Context notes",
      contextPlaceholder: "Add recent context, but keep it to observable facts and your own experience.",
      knownDetails: "Known details",
      knownDetailsHint: "Add one observable or confirmable detail per line. Do not present guesses as confirmed facts.",
      knownDetailsPlaceholder: "For example: We did not make plans again this week.",
      addKnownDetail: "Add a known detail",
      traditionalSignals: "Optional traditional signals",
      traditionalSignalsHint: "Traditional signals are only an auxiliary perspective and cannot decide the action plan by themselves.",
      signalSource: "Source",
      signalSummary: "Signal summary",
      signalSummaryPlaceholder: "For example: Same-group match, slower pacing.",
      addTraditionalSignal: "Add traditional signal",
      removeItem: "Remove",
      privacyReminder: "Remove names, phone numbers, addresses, schools, workplaces, IDs, and other unnecessary personal details.",
      identityReminder: "Do not enter real third-party identity details and do not claim certainty about the other person's psychology.",
      privacyConfirmation: "I removed names, phone numbers, addresses, and other unnecessary personal details.",
      aiConfirmation:
        "I understand that expanded advice may be AI-generated, is only for organizing information and action reference, and cannot replace real communication or professional advice.",
      submitLocal: "Generate basic advice",
      submitAi: "Generate AI expanded advice",
      submitting: "Generating advice",
      retry: "Retry",
      rewrite: "Rewrite",
      startOver: "Start over",
      questionCountLabel: "Question length",
      contextCountLabel: "Context length",
      stageOptions: stageOptions(locale),
      concernOptions: concernOptions(locale),
      sourceOptions: sourceOptions(locale),
    },
    errors: {
      validation: "Please complete the required fields and keep every field within its length limit.",
      privacyRequired: "Please confirm that you removed unnecessary personal details before submitting.",
      aiConfirmationRequired: "AI expanded mode requires the AI-use confirmation checkbox.",
      timeout: "The request timed out. You can retry without losing the current in-page draft.",
      network: "The request failed because of a network problem. Please retry.",
      requestFailed: "The request did not complete successfully. Please adjust the input and retry.",
      invalidResponse: "The system returned an unusable response format. Please retry later.",
    },
    result: {
      summaryTitle: "Situation summary",
      factsTitle: "Fact boundaries",
      observedFacts: "Observed facts",
      userAssumptions: "User assumptions",
      unknownFacts: "Unknown information",
      emptyFacts: "Nothing to show here yet.",
      traditionalPerspectiveTitle: "Traditional perspective",
      traditionalPerspectiveHint: "This section is auxiliary context only and does not determine real-world action by itself.",
      actionAdviceTitle: "Action guidance",
      localGuidanceTitle: "Local advice",
      aiGuidanceTitle: "AI expanded advice",
      nextSteps: "Next steps",
      boundaries: "Boundaries",
      reflection: "Reflection question",
      caution: "Important caution",
      generationTitle: "Generation status",
      aiBadge: "The expanded content below was AI-assisted from structured inputs. Use your own judgment with real-world context.",
      aiBadgeHint: "AI expansion does not rewrite base facts or traditional calculation results.",
      statusLabels: {
        local: "local_only",
        ai: "ai_enhanced",
        ai_fallback: "ai_fallback",
        high_risk_local: "high_risk_local",
      },
      statusDescriptions: {
        local: "You are viewing the local rule-based advice only.",
        ai: "You are viewing the local advice plus AI-expanded guidance.",
        ai_fallback: "AI expansion is unavailable right now, so the result safely falls back to local advice.",
        high_risk_local: "High-risk input was detected, so this result is safety-first.",
      },
      links: {
        methodology: "Methodology",
        privacy: "Privacy",
        disclaimer: "Disclaimer",
      },
      rewrite: "Rewrite and retry",
      startOver: "Clear and start over",
      devAnchors: "Dev-only source anchors",
    },
    safety: {
      title: "Safety-first result",
      summary: "This result does not continue with ordinary relationship escalation advice and instead prioritizes safety, professional support, and boundaries.",
      professionalHelp: "For medical, pregnancy, or legal concerns, seek a qualified professional.",
      emergencySupport: "For violence, threats, self-harm, stalking, or coercive control, contact a trusted person or local emergency support first.",
    },
    feedback: {
      title: "Was this advice helpful?",
      levels: [
        { value: "helpful", label: "Helpful" },
        { value: "partial", label: "Partly helpful" },
        { value: "not_helpful", label: "Not helpful" },
      ],
      reasonsLabel: "Optional reasons",
      reasons: [
        { value: "too_generic", label: "Too generic" },
        { value: "not_fact_based", label: "Not grounded in facts" },
        { value: "not_actionable", label: "Not actionable" },
        { value: "repetitive", label: "Repetitive" },
        { value: "other", label: "Other" },
      ],
      submitted: "This feedback stays in local page state only and does not upload your raw question or full report.",
    },
  };
}
