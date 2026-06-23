import { getAdviceUiCopy } from "./advice/ui-copy";

export const locales = ["en", "zh"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const relationshipStages = [
  "just-met",
  "dating",
  "relationship",
  "separation",
  "complicated",
] as const;

export type RelationshipStage = (typeof relationshipStages)[number];

export function hasLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocaleLabel(locale: Locale) {
  return locale === "zh" ? "中文" : "EN";
}

export function serializeSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
      continue;
    }

    if (typeof value === "string") {
      params.set(key, value);
    }
  }

  return params.toString();
}

export function stageLabel(stage: string, locale: Locale) {
  const labels: Record<RelationshipStage, { en: string; zh: string }> = {
    "just-met": { en: "Just met", zh: "刚认识" },
    dating: { en: "Dating", zh: "暧昧 / 约会中" },
    relationship: { en: "In a relationship", zh: "稳定关系中" },
    separation: { en: "In separation", zh: "分开 / 冷淡期" },
    complicated: { en: "It's complicated", zh: "关系复杂" },
  };

  return labels[stage as RelationshipStage]?.[locale] ?? labels.complicated[locale];
}

export function getDictionary(locale: Locale) {
  const shared = {
    en: {
      brand: "FateMirror",
      categoryLove: "Love & Connection Reading",
      categoryMoment: "Moment Reading",
      navHome: "Home",
      navAbout: "About",
      navDisclaimer: "Disclaimer",
      openNow: "Open now",
      comingSoon: "Coming soon",
      man: "Man",
      woman: "Woman",
      stageOptions: relationshipStages.map((value) => ({
        value,
        label: stageLabel(value, "en"),
      })),
      disclaimer:
        "FateMirror is designed for reflection and entertainment. It does not provide legal, medical, or financial advice.",
    },
    zh: {
      brand: "FateMirror",
      categoryLove: "Love & Connection Reading",
      categoryMoment: "Moment Reading",
      navHome: "首页",
      navAbout: "关于",
      navDisclaimer: "免责声明",
      openNow: "现已开放",
      comingSoon: "即将推出",
      man: "Man",
      woman: "Woman",
      stageOptions: relationshipStages.map((value) => ({
        value,
        label: stageLabel(value, "zh"),
      })),
      disclaimer:
        "FateMirror 仅用于个人反思与娱乐体验，不构成法律、医疗或财务建议。",
    },
  }[locale];

  const home = {
    en: {
      eyebrow: "Eastern-inspired reflective readings",
      title: "Discover the hidden patterns shaping your path.",
      subtitle:
        "FateMirror reframes Eastern-inspired insight for modern life, with one path for love and one for the question currently on your mind.",
      primaryCta: "Start with Love",
      secondaryCta: "Read the Moment",
      pathsEyebrow: "Two reading paths",
      pathsTitle: "Choose the doorway that fits what you need right now.",
      pathsText:
        "One reading looks at connection and compatibility. The other reads the timing and movement around the matter you cannot stop thinking about.",
      loveDescription:
        "Read a relationship through palace compatibility, emotional context, and a calmer modern lens on connection.",
      momentDescription:
        "Ask about the matter on your mind right now and receive a quick timing signal shaped by the moment of inquiry.",
      differenceEyebrow: "A quieter lens",
      differenceTitle: "Not a loud prediction machine. A more composed way of reading love, timing, and direction.",
      differenceText:
        "FateMirror draws from Eastern metaphysical thinking, but presents it as a modern, atmospheric, emotionally intelligent product.",
      finalEyebrow: "Begin with one question",
      finalTitle: "Choose the reading that matches your attention, and let the rest unfold from there.",
      finalCtaLove: "Open Love Reading",
      finalCtaMoment: "Open Moment Reading",
    },
    zh: {
      eyebrow: "东方灵感下的现代反思式解读",
      title: "看见那些正在塑造你人生路径的隐藏模式。",
      subtitle:
        "FateMirror 用更现代、克制的方式重塑东方灵感，一条路径看关系，一条路径看此刻心里放不下的那件事。",
      primaryCta: "从 Love Reading 开始",
      secondaryCta: "查看 Moment Reading",
      pathsEyebrow: "两条正式路径",
      pathsTitle: "先选一个最贴近你此刻需要的入口。",
      pathsText:
        "一条 reading 看关系与匹配，一条 reading 看当下这件事的时机与走势，让产品结构更清晰，也更像真实用户会使用的工具。",
      loveDescription:
        "从命宫匹配、关系阶段与问题语境出发，看这段连接到底是更顺、更费力，还是需要更有意识地经营。",
      momentDescription:
        "围绕你此刻心里那件事，按起念当下的时刻做一次即时解读，帮助你判断势头、风险与应对方式。",
      differenceEyebrow: "更安静的一种命运视角",
      differenceTitle: "它不是夸张的预测机器，而是一种更沉静地阅读关系、时机与方向的方式。",
      differenceText:
        "FateMirror 受东方命理思想启发，但会用现代、克制、有氛围的产品语言去表达，而不是堆砌神秘符号。",
      finalEyebrow: "从一个问题开始",
      finalTitle: "先选中你此刻最在意的入口，剩下的内容再慢慢展开。",
      finalCtaLove: "打开 Love Reading",
      finalCtaMoment: "打开 Moment Reading",
    },
  }[locale];

  const loveForm = {
    en: {
      backHome: "Back to home",
      title: "Read the connection through compatibility, not noise.",
      intro:
        "This version of Love Reading centers on palace matching and emotional context. It is intentionally lighter than the fuller system that will come later.",
      highlights: [
        "Two birth dates to derive palace matching",
        "Two gender fields because the palace formula depends on them",
        "One relationship context and one real question to set the tone",
      ],
      eyebrow: "Love Reading",
      helper: "Stay honest and simple. The result is meant to orient you, not overwhelm you.",
      yourName: "Your name (optional)",
      yourNamePlaceholder: "For a more personal tone",
      yourGender: "Your gender",
      theirGender: "Their gender",
      yourBirthDate: "Your birth date",
      yourBirthTime: "Your birth time",
      theirBirthDate: "Their birth date",
      theirBirthTime: "Their birth time",
      relationshipStage: "Relationship stage",
      stagePlaceholder: "Choose the closest fit",
      heartQuestion: "What is weighing on your heart?",
      heartPlaceholder:
        "For example: I want to know whether this connection is naturally aligned, or whether it will require much more effort than it seems.",
      birthTimeNote:
        "Birth time is optional here. The current compatibility layer is derived from birth year and gender, not from a full astrological chart.",
      error: "Please complete all required fields before starting your reading.",
      submit: "Reveal My Love Reading",
    },
    zh: {
      backHome: "返回首页",
      title: "先看这段连接到底合不合，而不是先被情绪拉着走。",
      intro:
        "这一版 Love Reading 先以命宫匹配和关系语境为核心。它刻意保持轻量，后面你再提供更完整算法后，我们再继续扩展。",
      highlights: [
        "两个人的出生日期，用来推命宫",
        "双方性别是必填，因为命宫算法依赖它",
        "一个关系阶段和一个真实问题，用来控制结果语气",
      ],
      eyebrow: "Love Reading",
      helper: "尽量简单，也尽量诚实。结果的作用是帮你定方向，而不是制造更多噪音。",
      yourName: "你的名字（可选）",
      yourNamePlaceholder: "让语气更贴近你",
      yourGender: "你的性别",
      theirGender: "对方性别",
      yourBirthDate: "你的出生日期",
      yourBirthTime: "你的出生时间",
      theirBirthDate: "对方的出生日期",
      theirBirthTime: "对方的出生时间",
      relationshipStage: "当前关系阶段",
      stagePlaceholder: "选择最接近的一项",
      heartQuestion: "此刻你最想知道这段关系的什么？",
      heartPlaceholder:
        "例如：我想知道这段关系是不是天然更顺，还是以后会需要我花很多力气去维持。",
      birthTimeNote:
        "这里的出生时间目前是可选项。当前匹配层主要看出生年份与性别，不是完整排盘。",
      error: "请先完成所有必填项，再开始 reading。",
      submit: "查看我的 Love Reading",
    },
  }[locale];

  const momentForm = {
    en: {
      backHome: "Back to home",
      title: "Read the movement around the matter on your mind.",
      intro:
        "Moment Reading uses the timing of the exact moment you ask. It is meant for a present question, not a long biography.",
      highlights: [
        "Best for one current matter",
        "Uses the moment of inquiry as its anchor",
        "Designed to give quick timing and action guidance",
      ],
      eyebrow: "Moment Reading",
      helper:
        "Ask about the thing you are genuinely thinking about now. Do not over-edit the question.",
      yourName: "Your name (optional)",
      yourNamePlaceholder: "For a more personal tone",
      question: "What is on your mind right now?",
      questionPlaceholder:
        "For example: Should I reach out? Is this deal worth pushing? Is this situation about to shift?",
      error: "Please add your question before starting the reading.",
      submit: "Reveal My Moment Reading",
    },
    zh: {
      backHome: "返回首页",
      title: "围绕你此刻心里那件事，看它正在往哪里走。",
      intro:
        "Moment Reading 以你起念当下的时刻为锚点，更适合处理一个当前问题，而不是讲一整段人生背景。",
      highlights: [
        "最适合问一件当前的事",
        "以起念时刻作为主要依据",
        "结果更偏向时机判断与动作提醒",
      ],
      eyebrow: "Moment Reading",
      helper: "问你现在真的在想的那件事，不要为了显得深刻而把问题写得太拧巴。",
      yourName: "你的名字（可选）",
      yourNamePlaceholder: "让语气更贴近你",
      question: "你此刻心里正在想着什么事？",
      questionPlaceholder:
        "例如：我现在该不该联系对方？这件合作值不值得继续推？这个局面是不是快要动了？",
      error: "请先写下你要问的事情，再开始 reading。",
      submit: "查看我的 Moment Reading",
    },
  }[locale];

  const loveResult = {
    en: {
      unavailableEyebrow: "Reading unavailable",
      unavailableTitle: "Add both people, both genders, and your question first.",
      unavailableText:
        "Love Reading needs the two birth dates, two genders, the relationship stage, and your question before it can become specific.",
      unavailableCta: "Go to the form",
      restart: "Start another love reading",
      title: "This relationship can be read through alignment, not just longing.",
      stageLabel: "Stage",
      snapshotTitle: "Reading snapshot",
      primaryTone: "Primary tone",
      currentStage: "Current stage",
      focusLabel: "Focus",
      compatibilityMarker: "Palace compatibility",
      yourPalace: "Your palace",
      theirPalace: "Their palace",
      freeLayerEyebrow: "Compatibility layer",
      freeTextTitle: "Current reading",
      unlockPreviewEyebrow: "Deeper layer",
      unlockPreviewTitle: "A fuller relationship system can sit behind this first compatibility signal.",
      unlockPreviewText:
        "This version begins with whether the bond is naturally aligned, second-tier aligned, or less aligned. A fuller method can deepen the interpretation later.",
      unlockTeaser:
        "True wisdom reveals itself to those who seek with sincerity.",
      paywallTitle: "Unlock the fuller love layer",
      paywallSubtitle:
        "Move from palace matching into a fuller relationship interpretation once the broader love method is ready.",
      paywallPrice: "$3.99",
      paidLayerEyebrow: "Unlocked layer",
      paidLayerTitle: "The deeper love method will expand from compatibility into fuller interpretation.",
      unlockButton: "Continue to unlock",
      unlockPageTitle: "Unlock the deeper love layer",
      unlockPageText:
        "Payment remains a placeholder in this MVP. This entry now only enables a non-production preview of the deeper love layer.",
      unlockPageDemo: "Preview this love reading (non-production)",
    },
    zh: {
      unavailableEyebrow: "暂时无法显示结果",
      unavailableTitle: "先把双方、性别和问题补齐，Love Reading 才能真正成立。",
      unavailableText:
        "Love Reading 需要两个人的出生日期、双方性别、关系阶段，以及你心里的那个问题，结果才会具体。",
      unavailableCta: "去填写表单",
      restart: "重新开始一轮 Love Reading",
      title: "这段关系可以先从“合不合”来读，而不只是从想不想来读。",
      stageLabel: "阶段",
      snapshotTitle: "阅读快照",
      primaryTone: "主要氛围",
      currentStage: "当前阶段",
      focusLabel: "核心主题",
      compatibilityMarker: "命宫匹配",
      yourPalace: "你的命宫",
      theirPalace: "对方命宫",
      freeLayerEyebrow: "匹配层",
      freeTextTitle: "当前解读",
      unlockPreviewEyebrow: "更深层",
      unlockPreviewTitle: "这一层之后，还可以接上更完整的关系系统。",
      unlockPreviewText:
        "当前版本先从命宫匹配出发，判断这段连接是天然更顺、次级合适，还是更需要用力经营。更完整的 love 方法会在后续继续补上。",
      unlockTeaser: "诚意叩门，方能入室。深层玄机，为有缘人备。",
      paywallTitle: "解锁更完整的 Love 层",
      paywallSubtitle:
        "先从命宫匹配开始，等更完整的 Love 方法就绪后，再继续走向更深层的关系解读。",
      paywallPrice: "$3.99",
      paidLayerEyebrow: "已解锁层",
      paidLayerTitle: "更深层的 Love 方法会在这里从匹配继续展开到完整关系解释。",
      unlockButton: "继续解锁",
      unlockPageTitle: "解锁更深层 Love 内容",
      unlockPageText:
        "当前 MVP 里，支付仍是占位流程。你可以先通过测试解锁按钮，模拟更深层 Love 内容的已付费状态。",
      unlockPageDemo: "测试解锁这份 Love Reading",
    },
  }[locale];

  const momentResult = {
    en: {
      unavailableEyebrow: "Reading unavailable",
      unavailableTitle: "Add the question on your mind first.",
      unavailableText:
        "Moment Reading only needs the matter you are asking about and the time you asked it.",
      unavailableCta: "Go to the form",
      restart: "Start another moment reading",
      title: "The moment you asked already carries a signal.",
      snapshotTitle: "Moment snapshot",
      primaryTone: "Primary tone",
      focusLabel: "Current focus",
      freeLayerEyebrow: "Moment layer",
      freeTextTitle: "Current reading",
      unlockPreviewEyebrow: "Deeper layer",
      unlockPreviewTitle: "There is more to see when the moment deserves a second pass.",
      unlockPreviewText:
        "The deeper layer expands the signal into a steadier interpretation and more grounded action guidance.",
      unlockTeaser:
        "True wisdom reveals itself to those who seek with sincerity.",
      paywallTitle: "Unlock the fuller moment layer",
      paywallSubtitle:
        "Move from a quick signal into a fuller reading of timing, friction, and what to do next.",
      paywallPrice: "$3.99",
      paidLayerEyebrow: "Unlocked layer",
      paidLayerTitle: "A deeper reading of the question, the timing, and the next move.",
      unlockButton: "Continue to unlock",
      unlockPageTitle: "Unlock the deeper moment layer",
      unlockPageText:
        "Payment remains a placeholder in this MVP. This entry now only enables a non-production preview of the deeper moment layer.",
      unlockPageDemo: "Preview this moment reading (non-production)",
      currentQuestion: "Current question",
      currentSignal: "Current signal",
    },
    zh: {
      unavailableEyebrow: "暂时无法显示结果",
      unavailableTitle: "先把你要问的事情写出来。",
      unavailableText:
        "Moment Reading 主要需要的，是你正在问什么，以及你起念的那个时刻。",
      unavailableCta: "去填写表单",
      restart: "重新开始一轮 Moment Reading",
      title: "你起念的那个瞬间，本身就已经带着一个信号。",
      snapshotTitle: "时刻快照",
      primaryTone: "主要氛围",
      focusLabel: "当前焦点",
      freeLayerEyebrow: "Moment 层",
      freeTextTitle: "当前解读",
      unlockPreviewEyebrow: "更深层",
      unlockPreviewTitle: "如果这件事值得再看一遍，后面还有更完整的一层。",
      unlockPreviewText:
        "更深层会继续把这次信号展开成更稳的判断，并给出更贴近现实动作的建议。",
      unlockTeaser: "诚意叩门，方能入室。深层玄机，为有缘人备。",
      paywallTitle: "解锁更完整的 Moment 层",
      paywallSubtitle:
        "从一个快信号，进入更完整的时机判断、阻力识别与下一步建议。",
      paywallPrice: "$3.99",
      paidLayerEyebrow: "已解锁层",
      paidLayerTitle: "更深一层去看这件事、它的时机，以及你接下来该怎么动。",
      unlockButton: "继续解锁",
      unlockPageTitle: "解锁更深层 Moment 内容",
      unlockPageText:
        "当前 MVP 里，支付仍是占位流程。你可以先通过测试解锁按钮，模拟更深层 Moment 内容的已付费状态。",
      unlockPageDemo: "测试解锁这份 Moment Reading",
      currentQuestion: "当前问题",
      currentSignal: "当前信号",
    },
  }[locale];

  const about = {
    en: {
      eyebrow: "About FateMirror",
      title: "A reflective reading product built to help people see more clearly, not surrender blindly.",
      philosophyTitle: "Philosophy",
      philosophyText:
        "FateMirror is built around one idea: destiny is not something to obey without thought. It is something to understand, so that choice becomes possible again.",
      methodTitle: "Method",
      methodText:
        "The product draws from traditional Eastern metaphysical thinking, but expresses it through a modern, emotionally intelligent web experience.",
      quote:
        "Fate is not meant to surrender to — it is meant to be understood, then chosen.",
      contactTitle: "Contact",
      contactText:
        "A fuller contact flow can live here later. For now, this page anchors trust and product philosophy.",
    },
    zh: {
      eyebrow: "关于 FateMirror",
      title: "这是一款帮助人看清局势、找回选择权的反思式解读产品，而不是让人盲目屈从的命运站。",
      philosophyTitle: "产品理念",
      philosophyText:
        "FateMirror 的底层想法很简单：命运不是拿来无条件服从的，而是拿来看懂、然后重新选择的。",
      methodTitle: "方法来源",
      methodText:
        "它受传统东方命理思想启发，但会通过更现代、克制、情绪智能更高的网页体验来呈现。",
      quote: "命运不是用来屈服的，而是用来看懂、然后选择的。",
      contactTitle: "联系方式",
      contactText:
        "后续可以在这里补更完整的联系入口；当前先承担品牌解释与信任建立的作用。",
    },
  }[locale];

  const disclaimerPage = {
    en: {
      eyebrow: "Disclaimer",
      title: "A reading should offer perspective, not remove responsibility.",
      divination:
        "All readings on this platform are based on traditional metaphysical interpretation and should be understood as tendency, not absolute destiny. User action remains a decisive variable.",
      health:
        "Any body, mood, or wellness-related guidance is traditional cultural reference only and does not constitute medical diagnosis or treatment advice. Please consult qualified medical professionals for health concerns.",
      user:
        "Any decisions made based on content from this platform remain the responsibility of the user.",
    },
    zh: {
      eyebrow: "免责声明",
      title: "解读可以提供视角，但不应替代人的责任与判断。",
      divination:
        "本平台所有解读内容均基于传统命理推算方法，属于趋势推演，不构成对命运的绝对判定。用户的自主行动仍是改变趋势的重要变量。",
      health:
        "涉及五行体质、情志调养或身心状态的内容，仅供传统文化参考，不构成任何医疗诊断或治疗建议。如有健康问题，请咨询专业医疗人员。",
      user:
        "用户基于平台内容所做的一切决定，均由用户自行负责。",
    },
  }[locale];

  return {
    shared,
    home,
    loveForm,
    momentForm,
    loveResult,
    momentResult,
    about,
    disclaimerPage,
    advice: getAdviceUiCopy(locale),
  };
}
