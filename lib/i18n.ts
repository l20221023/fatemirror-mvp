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

  const fallback = locale === "zh" ? "关系复杂" : "It's complicated";

  return labels[stage as RelationshipStage]?.[locale] ?? fallback;
}

export function getDictionary(locale: Locale) {
  const shared = {
    en: {
      categoryLove: "Love & Connection",
      categoryTiming: "Luck & Timing",
      categoryFace: "Face Reading",
      openNow: "Open now",
      comingSoon: "Coming soon",
      disclaimer:
        "FateMirror is designed for personal reflection and entertainment. It does not provide legal, medical, or financial advice.",
      stageOptions: relationshipStages.map((value) => ({
        value,
        label: stageLabel(value, "en"),
      })),
    },
    zh: {
      categoryLove: "情感与连接",
      categoryTiming: "时机与运势",
      categoryFace: "面相与气质",
      openNow: "现已开放",
      comingSoon: "即将推出",
      disclaimer:
        "FateMirror 仅用于个人反思与娱乐体验，不构成法律、医疗或财务建议。",
      stageOptions: relationshipStages.map((value) => ({
        value,
        label: stageLabel(value, "zh"),
      })),
    },
  }[locale];

  const home = {
    en: {
      headerCta: "Start Your Reading",
      eyebrow: "Eastern-inspired love insight",
      title: "Discover the hidden patterns shaping your path.",
      subtitle:
        "FateMirror offers reflective readings for love, timing, and personal energy, inspired by Eastern wisdom and reimagined for modern life.",
      primaryCta: "Start Your Reading",
      secondaryCta: "Preview a Reading",
      liveNow: "Live now",
      exploreTitle: "What you will explore",
      explorePoints: [
        "Your relational rhythm",
        "Current emotional tension",
        "Gentle next-step guidance",
      ],
      highlightTitle: "A softer reading style for modern relationships.",
      highlightText:
        "Not a horoscope clone. Not a dramatic prediction engine. Just a thoughtful lens on timing, connection, and personal energy.",
      categoryEyebrow: "Category preview",
      categoryTitle: "Built for one focused experience first.",
      categoryText:
        "FateMirror can grow into timing, energy, and identity readings, but the first release keeps the product centered on love and connection.",
      categoryLoveDescription:
        "Reflect on emotional patterns, mutual timing, and the shape of your current connection.",
      categoryTimingDescription:
        "Explore when momentum rises, when patience matters, and where life may be asking for alignment.",
      categoryFaceDescription:
        "A softer, modern take on personality cues, expression, and the energy people carry.",
      enterReading: "Enter reading",
      availableLater: "Available in a later release.",
      differenceEyebrow: "A different lens on destiny",
      differenceTitle:
        "Insight shaped by timing, connection, and emotional energy.",
      differenceTextOne:
        "While astrology looks to the stars and tarot turns to symbols, FateMirror explores timing, connection, and personal energy through an Eastern-inspired perspective.",
      differenceTextTwo:
        "The difference is in the interpretive lens, not in loud mystical decoration. We want the experience to feel intimate, modern, and quietly atmospheric.",
      howItWorksEyebrow: "How it works",
      steps: [
        {
          title: "Share a few details",
          text: "Add two birth dates, your relationship stage, and what feels most present on your heart.",
        },
        {
          title: "Receive a personalized reflection",
          text: "Get a calm, structured reading that highlights the current pattern between closeness, uncertainty, and timing.",
        },
        {
          title: "Unlock deeper insight",
          text: "Measure deeper interest by inviting users into a fuller layer of compatibility, timing, and next-step guidance.",
        },
      ],
      sampleEyebrow: "Sample reading preview",
      sampleTitle:
        "A result page should feel calm, specific, and emotionally useful.",
      sampleCardEyebrow: "Sample free reading",
      previewLabel: "Preview",
      sampleReading: [
        {
          title: "Connection Overview",
          text: "There is real emotional gravity here, but it does not move in a straight line. One of you is leaning toward closeness while the other is still measuring the pace.",
        },
        {
          title: "Current Emotional Pattern",
          text: "The bond feels shaped by mixed timing rather than a lack of feeling. Curiosity is present, but so is self-protection.",
        },
        {
          title: "Gentle Guidance",
          text: "Do not force certainty too early. Let clarity come from steady actions, not only from intense moments.",
        },
      ],
      lockedEyebrow: "What stays locked",
      lockedTitle: "The deeper layer users can choose to unlock.",
      lockedModules: [
        "Deeper Compatibility",
        "Hidden Tension",
        "Timing Insight",
        "Next Step Guidance",
      ],
      lockedText:
        "The first version does not need real payment. It only needs to show whether users care enough to keep going.",
      finalEyebrow: "Begin with one reading",
      finalTitle: "Start with love. Learn whether the experience resonates.",
      finalCta: "Start Your Reading",
    },
    zh: {
      headerCta: "开始测试解读",
      eyebrow: "东方灵感下的情感洞察",
      title: "看见那些正在塑造你人生路径的隐藏模式。",
      subtitle:
        "FateMirror 以现代、克制的方式重塑东方智慧，为你带来关于情感、时机与个人能量的反思式解读体验。",
      primaryCta: "开始测试解读",
      secondaryCta: "预览结果",
      liveNow: "当前开放",
      exploreTitle: "你将看到",
      explorePoints: ["关系节奏", "当下情绪张力", "温和的下一步建议"],
      highlightTitle: "更克制、更现代的情感解读方式。",
      highlightText:
        "它不是星座替代品，也不是夸张的预测引擎，而是一种关于时机、连接与个人能量的细腻视角。",
      categoryEyebrow: "功能预览",
      categoryTitle: "第一版先专注做好一个体验入口。",
      categoryText:
        "FateMirror 未来可以延展到时机、运势与身份感知，但第一版先只验证情感与连接这条主线。",
      categoryLoveDescription:
        "围绕情感模式、彼此时机与当前关系轮廓，做一轮温和而具体的反思。",
      categoryTimingDescription:
        "帮助用户感知何时适合推进、何时适合等待，以及人生节奏何时需要重新校准。",
      categoryFaceDescription:
        "以更现代的方式理解气质、表达与一个人所呈现的能量感。",
      enterReading: "进入体验",
      availableLater: "将在后续版本开放。",
      differenceEyebrow: "一种不同的命运视角",
      differenceTitle: "从时机、关系与情绪能量出发的洞察。",
      differenceTextOne:
        "如果说 astrology 看向星体、tarot 借助象征，FateMirror 则通过带有东方灵感的视角，去理解关系、时机与个人能量之间的流动。",
      differenceTextTwo:
        "它的差异不在于堆砌神秘符号，而在于解释世界的方式。我们希望它安静、亲密、有分寸，带着一点命运感，但不落入廉价玄学风。",
      howItWorksEyebrow: "体验流程",
      steps: [
        {
          title: "填写少量信息",
          text: "提供两个人的出生日期、当前关系阶段，以及你心里最在意的问题。",
        },
        {
          title: "收到个性化反思",
          text: "看到一份简洁但有情绪价值的解读，聚焦连接、拉扯与当下时机。",
        },
        {
          title: "解锁更深层内容",
          text: "通过 deeper insight 按钮，验证用户是否真的想继续看更深的兼容性与行动建议。",
        },
      ],
      sampleEyebrow: "结果示例",
      sampleTitle: "结果页应该让人感觉安静、具体，而且情绪上被接住。",
      sampleCardEyebrow: "免费示例结果",
      previewLabel: "预览",
      sampleReading: [
        {
          title: "关系概览",
          text: "你们之间并不缺少情感引力，但它并不是稳定直线推进的。其中一方更想靠近，另一方仍在判断节奏是否安全。",
        },
        {
          title: "当前情绪模式",
          text: "这段关系的拉扯更像是时机错位，而不是没有感觉。好奇与自我保护同时存在。",
        },
        {
          title: "温和建议",
          text: "不要太早逼迫确定答案。真正的清晰，往往来自持续行动，而不是一次情绪高点。",
        },
      ],
      lockedEyebrow: "被锁住的内容",
      lockedTitle: "用户可以选择继续解锁的更深层部分。",
      lockedModules: ["更深兼容性", "隐藏张力", "时机洞察", "下一步建议"],
      lockedText:
        "第一版不需要真的接支付，只需要验证用户是否足够在意，愿不愿意继续往下看更深一层。",
      finalEyebrow: "先从一个 reading 开始",
      finalTitle: "先从情感入口开始，验证这份体验是否真的打动人。",
      finalCta: "开始测试解读",
    },
  }[locale];

  const form = {
    en: {
      backHome: "Back to home",
      title: "Share a few details, then let the reading meet you where you are.",
      intro:
        "This first version stays intentionally light. A little context helps FateMirror reflect on your current emotional rhythm without turning the experience into a long questionnaire.",
      highlights: [
        "Two birth dates to ground the reflection",
        "Your current relationship stage to shape the tone",
        "One honest question so the reading feels personal",
      ],
      eyebrow: "Begin your reading",
      helper:
        "Answer simply. The clearest readings come from a calm question, not a perfect one.",
      yourBirthDate: "Your birth date",
      yourBirthTime: "Your birth time",
      theirBirthDate: "Their birth date",
      theirBirthTime: "Their birth time",
      relationshipStage: "Relationship stage",
      stagePlaceholder: "Choose the closest fit",
      heartQuestion: "What feels most unclear to you right now?",
      heartPlaceholder:
        "For example: I cannot tell whether this distance means fear, timing, or the beginning of an ending.",
      birthTimeNote:
        "Birth time is optional, but recommended for direct-calculation modules like Xiao Liu Ren and Ming Gong. If omitted, FateMirror will estimate from midday.",
      error: "Please complete all required fields before starting your reading.",
      submit: "Reveal My Reading",
    },
    zh: {
      backHome: "返回首页",
      title: "只填少量信息，然后让这份解读贴近你此刻的状态。",
      intro:
        "第一版故意保持轻量。少量上下文就足以让 FateMirror 贴近你当前的情绪节奏，而不是把它做成一份冗长问卷。",
      highlights: [
        "两个人的出生日期，帮助建立解读锚点",
        "当前关系阶段，用来控制结果语气",
        "一个真诚的问题，让 reading 更像是在回应你",
      ],
      eyebrow: "开始你的 reading",
      helper: "不用想得太复杂。最好的输入不是最完整，而是最真诚。",
      yourBirthDate: "你的出生日期",
      yourBirthTime: "你的出生时间",
      theirBirthDate: "对方的出生日期",
      theirBirthTime: "对方的出生时间",
      relationshipStage: "当前关系阶段",
      stagePlaceholder: "选择最接近的一项",
      heartQuestion: "此刻最让你放不下、最不清楚的是什么？",
      heartPlaceholder:
        "例如：我分不清这段距离感是因为害怕、时机不对，还是这段关系真的在走向结束。",
      birthTimeNote:
        "出生时间是可选项，但像小六壬、命宫这类直算模块会更准确。如果不填，FateMirror 会按中午时刻估算。",
      error: "请先完成所有必填项，再开始 reading。",
      submit: "查看我的解读",
    },
  }[locale];

  const result = {
    en: {
      unavailableEyebrow: "Reading unavailable",
      unavailableTitle:
        "Start with a few details so FateMirror has something to reflect on.",
      unavailableText:
        "The result page needs both birth dates, your relationship stage, and the question on your heart. Once those are in place, the reading can become specific.",
      unavailableCta: "Go to the form",
      restart: "Start another reading",
      title: "Your connection is moving through a pattern, not just a moment.",
      stageLabel: "Stage",
      storyPrefix: "What you shared suggests a story about",
      snapshotTitle: "Reflection snapshot",
      primaryTone: "Primary tone",
      currentStage: "Current stage",
      focusLabel: "Focus",
      traditionalSnapshot: "Traditional calculation snapshot",
      youLabel: "You",
      theyLabel: "They",
      lunarDate: "Lunar date",
      shiChen: "Shi Chen",
      mingGong: "Ming Gong",
      xiaoLiuRen: "Xiao Liu Ren",
      zodiac: "Zodiac",
      estimatedTime:
        "Estimated from midday because no birth time was provided.",
      compatibilityMarker: "Compatibility marker",
      deeperPreviewEyebrow: "Deeper insight preview",
      deeperPreviewTitle: "There is more beneath the surface of this connection.",
      unlockEyebrow: "Unlock deeper insight",
      unlockTitle: "Join the early-access list for the fuller reading.",
      unlockText:
        "This first release is measuring interest, not charging users yet. If this reading resonated, leave your email and we will save your place for the deeper version.",
      emailLabel: "Email address",
      joinedMessage:
        "You're in. We'll let you know as soon as the deeper love reading is ready.",
      joinError: "Please add your email first to unlock the deeper layer.",
      unlockButton: "Unlock Deeper Insight",
    },
    zh: {
      unavailableEyebrow: "暂时无法显示结果",
      unavailableTitle: "先填写一些基本信息，FateMirror 才能给出像样的回应。",
      unavailableText:
        "结果页需要两个人的出生日期、当前关系阶段，以及你心里的那个问题。有了这些，解读才会具体。",
      unavailableCta: "去填写表单",
      restart: "重新开始一轮 reading",
      title: "你们之间正在经历的，是一种模式，而不只是一个瞬间。",
      stageLabel: "阶段",
      storyPrefix: "你给出的信息更像是在讲述这样一段故事：",
      snapshotTitle: "关系快照",
      primaryTone: "主要氛围",
      currentStage: "当前阶段",
      focusLabel: "核心主题",
      traditionalSnapshot: "传统计算快照",
      youLabel: "你",
      theyLabel: "对方",
      lunarDate: "农历日期",
      shiChen: "时辰",
      mingGong: "命宫",
      xiaoLiuRen: "小六壬",
      zodiac: "生肖",
      estimatedTime: "因为未填写出生时间，此处按中午时刻做估算。",
      compatibilityMarker: "兼容度标记",
      deeperPreviewEyebrow: "更深层内容预览",
      deeperPreviewTitle: "这段关系表面之下，还有更多值得看的部分。",
      unlockEyebrow: "解锁更深层洞察",
      unlockTitle: "留下邮箱，加入完整版本的早期体验名单。",
      unlockText:
        "第一版的目标是先验证兴趣，而不是立刻收费。如果这份解读对你有触动，留下邮箱就好；完整版本准备好后，我们会第一时间把它送到你面前。",
      emailLabel: "留下你的邮箱",
      joinedMessage: "已为你保留位置。完整版本准备好后，我们会第一时间通知你。",
      joinError: "请先填写邮箱，再继续解锁更深层内容。",
      unlockButton: "解锁更深层内容",
    },
  }[locale];

  return { shared, home, form, result };
}
