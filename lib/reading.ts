import {
  buildCompatibilityReading,
  buildTraditionalProfile,
  type Branch,
  type CompatibilityKind,
  type TraditionalProfile,
  type XiaoLiuRenKey,
} from "./metaphysics";
import { stageLabel, type Locale, type RelationshipStage } from "./i18n";

export type LoveReadingInput = {
  birthDate: string;
  birthTime: string;
  theirBirthDate: string;
  theirBirthTime: string;
  relationshipStage: string;
  heartQuestion: string;
};

type ReadingSection = {
  title: string;
  text: string;
};

type LockedModule = {
  title: string;
  teaser: string;
};

type DisplayTraditionalProfile = {
  lunarDateLabel: string;
  shiChenLabel: string;
  mingGongLabel: string;
  xiaoLiuRenLabel: string;
  xiaoLiuRenNote: string;
  zodiacLabel: string;
  usedEstimatedTime: boolean;
};

export type LoveReading = {
  focusLabel: string;
  keywords: string[];
  snapshotTone: string;
  stageLabel: string;
  sections: ReadingSection[];
  lockedModules: LockedModule[];
  profiles: {
    you: DisplayTraditionalProfile;
    counterpart: DisplayTraditionalProfile;
  };
  compatibility: {
    score: number;
    headline: string;
    note: string;
  };
};

const concernThemes = [
  {
    key: "trust",
    keywords: ["trust", "honest", "safe", "lied", "betray", "guarded", "信任", "安全感", "撒谎", "背叛", "防备"],
    labels: { en: "trust and emotional safety", zh: "信任与情绪安全感" },
    tones: { en: "guarded honesty", zh: "谨慎而克制的真诚" },
    patterns: {
      en: "The emotional field here is not empty, but it is cautious. Trust grows slowly when one or both people are trying to protect themselves from disappointment.",
      zh: "这段关系并不缺少情感流动，只是它带着明显的谨慎感。当一方或双方都在避免失望时，信任只能缓慢生长。",
    },
    guidance: {
      en: "Clarity will come more easily through consistent behavior than through intense reassurance. Let trust be built in small proofs.",
      zh: "真正的清晰更容易来自持续稳定的行动，而不是情绪很满的安抚。让信任通过一次次小的证明慢慢建立。",
    },
  },
  {
    key: "distance",
    keywords: ["distance", "pull", "away", "cold", "unclear", "confused", "mixed", "距离", "冷淡", "忽远忽近", "不清楚", "困惑", "拉扯"],
    labels: { en: "distance and uncertainty", zh: "距离感与不确定性" },
    tones: { en: "unstable closeness", zh: "不稳定的靠近感" },
    patterns: {
      en: "This connection appears to move in waves. Warmth is possible, but one person may be stepping back whenever the bond starts to feel too exposed.",
      zh: "这段关系更像在潮汐中前进。温度并不是没有，但一旦连接开始变得太直接，其中一方就可能下意识后退。",
    },
    guidance: {
      en: "Try not to interpret every pause as an ending. Watch the pattern over time and ask whether the connection is capable of steadiness.",
      zh: "不要把每一次停顿都直接理解成结束。更重要的是看它的长期节奏：这段关系到底有没有稳定下来的能力。",
    },
  },
  {
    key: "reunion",
    keywords: ["reunion", "return", "come back", "again", "reconnect", "ex", "复合", "回来", "前任", "重新开始"],
    labels: { en: "reunion and unfinished feelings", zh: "复合与未完成的情绪" },
    tones: { en: "lingering attachment", zh: " lingering attachment".trim() },
    patterns: {
      en: "The bond carries unfinished emotional weight. That does not guarantee a return, but it does suggest something meaningful is still being processed beneath the surface.",
      zh: "这段连接里仍然残留着未被放下的情绪重量。它不保证一定会回来，但说明有些重要的东西仍在水面下被消化。",
    },
    guidance: {
      en: "Leave room for longing without letting it become your only compass. Reunion matters most when both people are able to return with clearer energy.",
      zh: "允许自己承认想念，但不要让想念成为唯一判断标准。真正值得的复合，来自双方都能带着更清晰的状态回来。",
    },
  },
  {
    key: "commitment",
    keywords: ["future", "commit", "commitment", "serious", "marriage", "long term", "未来", "承诺", "认真", "结婚", "长期"],
    labels: { en: "commitment and future direction", zh: "承诺与未来方向" },
    tones: { en: "future-facing tension", zh: "面向未来的拉扯" },
    patterns: {
      en: "There is a real question here about whether feeling and direction are moving at the same pace. One heart may want definition sooner than the other can provide it.",
      zh: "这里真正的问题在于：感受与方向是否同步推进。其中一颗心已经想要更明确的答案，另一颗却还没有准备好给出。",
    },
    guidance: {
      en: "Name what kind of future you actually need. A vague bond can feel romantic while still avoiding the truth of where it is headed.",
      zh: "把你真正需要的未来说清楚。模糊的关系很容易被浪漫化，但它也可能正好在逃避它究竟要走向哪里。",
    },
  },
];

const defaultTheme = {
  labels: { en: "mixed feelings and emotional timing", zh: "复杂情绪与关系时机" },
  tones: { en: "quiet uncertainty", zh: "安静但悬而未决" },
  patterns: {
    en: "The question on your heart suggests a bond that matters, but whose meaning still feels partly veiled. Emotion is present, yet not everything is moving in the open.",
    zh: "你心里的问题指向一段确实重要的连接，只是它的意义暂时仍带着一层雾。情绪是真实存在的，但很多东西还没有来到明处。",
  },
  guidance: {
    en: "Give more weight to patterns than to isolated moments. A connection becomes clearer when you observe its rhythm over time.",
    zh: "比起单独的瞬间，更要重视它反复出现的模式。关系是否值得继续，往往要在时间里看节奏。",
  },
};

const stageStyles = {
  "just-met": {
    en: {
      overview:
        "This connection has the spark of possibility, but its shape is still forming. Attraction may be real, yet timing and confidence are not settled enough to call it stable.",
      emotional:
        "Curiosity is likely stronger than certainty right now. Early bonds often carry projection, so part of the emotional pattern here is learning who this person really is beyond the first pull.",
      guidancePrefix: "Move with curiosity rather than urgency.",
      compatibilityTeaser:
        "See where attraction feels natural versus where fantasy may still be filling in the gaps.",
      timingTeaser:
        "Explore whether this is a season for gentle unfolding or a sign to slow down before attaching too quickly.",
    },
    zh: {
      overview:
        "这段连接带着明显的可能性火花，但它的轮廓还没有真正定型。吸引力也许是真实的，只是时机与安全感暂时还不足以支撑稳定感。",
      emotional:
        "此刻好奇往往大于确定。刚开始的关系很容易带着投射，所以其中一个重要课题，是分清你喜欢的是这个人本身，还是最初被点亮的感觉。",
      guidancePrefix: "先带着好奇靠近，而不是急着求答案。",
      compatibilityTeaser:
        "看看吸引力到底是自然贴合，还是仍有不少想象在替现实补空。",
      timingTeaser:
        "判断此刻更适合温柔展开，还是应该在投入过快之前稍微放慢。",
    },
  },
  dating: {
    en: {
      overview:
        "There is active momentum in this connection, but momentum does not always mean mutual clarity. The bond feels alive, though not every emotional layer has been spoken plainly yet.",
      emotional:
        "Dating often reveals the difference between chemistry and capacity. The current pattern suggests feeling is present, but the pacing of openness may not be perfectly matched.",
      guidancePrefix: "Stay close to what is being shown, not only what is being hoped for.",
      compatibilityTeaser:
        "Look deeper at emotional pacing, mutual effort, and whether the bond is growing in the same direction for both people.",
      timingTeaser:
        "Find out whether this is a moment to deepen, define, or wait for stronger consistency.",
    },
    zh: {
      overview:
        "这段关系正在推进，但推进不等于彼此都已经想清楚。你们之间是有活跃感的，只是并不是每一层情绪都已经被说开。",
      emotional:
        "暧昧和约会阶段，最容易看出化学反应和真正承载能力之间的差别。这里的感觉并不缺少，只是敞开的节奏未必一致。",
      guidancePrefix: "多看对方正在做什么，而不只是你希望它变成什么。",
      compatibilityTeaser:
        "进一步看看情绪节奏、投入程度，以及这段关系是否在朝同一个方向生长。",
      timingTeaser:
        "判断这是不是一个适合更深入、明确关系，还是先等待稳定性的阶段。",
    },
  },
  relationship: {
    en: {
      overview:
        "The bond has roots, which means its strengths and strains are both easier to feel. This reading points less to surface attraction and more to the current health of the emotional atmosphere between you.",
      emotional:
        "Established relationships often carry hidden rhythms of closeness, withdrawal, repair, and silence. The pattern here suggests that unspoken needs may be shaping more than the visible conflict itself.",
      guidancePrefix: "Return to emotional honesty before trying to solve everything at once.",
      compatibilityTeaser:
        "See where your deeper values, reassurance styles, and emotional needs are truly aligned.",
      timingTeaser:
        "Understand whether this chapter asks for repair, patience, or a reset in how love is being expressed.",
    },
    zh: {
      overview:
        "这段关系已经有了根，所以它的力量与疲惫都会更容易被感受到。这里要看的不再只是表面吸引力，而是你们之间情绪气候当前是否健康。",
      emotional:
        "长期关系往往隐藏着靠近、退开、修复与沉默之间的循环。此刻真正影响你们的，也许不是表面的冲突，而是没有说出口的需求。",
      guidancePrefix: "先回到情绪上的坦诚，再谈怎么一次性解决所有问题。",
      compatibilityTeaser:
        "更深入看看你们的价值观、被安抚方式与情感需求到底有没有真正对齐。",
      timingTeaser:
        "理解这一阶段是在要求修复、耐心，还是需要重置爱的表达方式。",
    },
  },
  separation: {
    en: {
      overview:
        "Separation changes the emotional weather of a connection, but it does not always erase the bond. What remains here feels marked by distance, memory, and unresolved timing.",
      emotional:
        "When two people are apart, longing and reality can easily blur. The pattern suggests there may still be emotional charge, but clarity requires seeing what is present now rather than only what once was.",
      guidancePrefix: "Let truth matter more than nostalgia.",
      compatibilityTeaser:
        "Look at whether the bond still holds living compatibility or mostly emotional residue.",
      timingTeaser:
        "Explore whether this separation signals an eventual return, a lesson in closure, or a pause that asks for patience.",
    },
    zh: {
      overview:
        "分开会改变一段关系的情绪天气，但它并不一定代表这份连接已经消失。此刻残留的，是距离、记忆和没有完全解决的时机问题。",
      emotional:
        "当两个人分开后，想念与现实很容易混在一起。这里也许仍有情绪电流，但真正的清晰，要建立在看见现在，而不是只盯着过去。",
      guidancePrefix: "让真实比怀旧更重要。",
      compatibilityTeaser:
        "看一看这段关系现在还保留着活的兼容性，还是主要只剩情绪残影。",
      timingTeaser:
        "理解这次分开更像是会回来的暂停、帮助释怀的课程，还是需要耐心等待的阶段。",
    },
  },
  complicated: {
    en: {
      overview:
        "This connection likely contains real feeling alongside real contradiction. The energy is not simple, which is often why the heart keeps circling the same questions.",
      emotional:
        "Complicated bonds usually carry mixed signals, uneven vulnerability, or unclear expectations. The pattern suggests both pull and resistance are present at the same time.",
      guidancePrefix: "Complexity should not become a permanent substitute for clarity.",
      compatibilityTeaser:
        "See whether the intensity here is supported by genuine compatibility or only by emotional entanglement.",
      timingTeaser:
        "Understand whether timing is truly the obstacle, or whether confusion has started to become the relationship itself.",
    },
    zh: {
      overview:
        "这段关系里多半既有真实的感情，也有真实的矛盾。它并不简单，所以你的心才会反复回到同一个问题上。",
      emotional:
        "复杂关系通常伴随着混合信号、不对等的脆弱表达，或模糊期待。这里的模式显示：吸引与抗拒正在同时存在。",
      guidancePrefix: "复杂不应该变成长期替代清晰的借口。",
      compatibilityTeaser:
        "看清这里的强烈感，到底建立在真实兼容性上，还是更多来自情绪纠缠。",
      timingTeaser:
        "分辨真正的问题是不是时机，还是混乱本身已经逐渐变成了这段关系的主体。",
    },
  },
} as const satisfies Record<RelationshipStage, Record<Locale, {
  overview: string;
  emotional: string;
  guidancePrefix: string;
  compatibilityTeaser: string;
  timingTeaser: string;
}>>;

const branchMeta: Record<
  Branch,
  {
    en: { branch: string; zodiac: string; mingGongNote: string };
    zh: { branch: string; zodiac: string; mingGongNote: string };
  }
> = {
  子: {
    en: { branch: "Zi", zodiac: "Rat", mingGongNote: "adaptive and intuitive, but easily shaped by the emotional climate around them" },
    zh: { branch: "子", zodiac: "鼠", mingGongNote: "适应力强、直觉敏锐，但很容易被周围情绪气候影响" },
  },
  丑: {
    en: { branch: "Chou", zodiac: "Ox", mingGongNote: "steady and protective, with strength that builds through consistency" },
    zh: { branch: "丑", zodiac: "牛", mingGongNote: "稳定而有保护欲，力量来自长期一致性" },
  },
  寅: {
    en: { branch: "Yin", zodiac: "Tiger", mingGongNote: "direct and active, often moving first when conviction is clear" },
    zh: { branch: "寅", zodiac: "虎", mingGongNote: "直接而主动，一旦确认就会率先行动" },
  },
  卯: {
    en: { branch: "Mao", zodiac: "Rabbit", mingGongNote: "refined and relational, often sensitive to tone and harmony" },
    zh: { branch: "卯", zodiac: "兔", mingGongNote: "细腻、重关系，对氛围与语气格外敏感" },
  },
  辰: {
    en: { branch: "Chen", zodiac: "Dragon", mingGongNote: "expansive and self-driven, often carrying larger ambitions" },
    zh: { branch: "辰", zodiac: "龙", mingGongNote: "外扩而自驱，通常带着更大的志向感" },
  },
  巳: {
    en: { branch: "Si", zodiac: "Snake", mingGongNote: "perceptive and strategic, often thinking several steps ahead" },
    zh: { branch: "巳", zodiac: "蛇", mingGongNote: "敏锐而有策略感，常常会提前想很多步" },
  },
  午: {
    en: { branch: "Wu", zodiac: "Horse", mingGongNote: "expressive and visible, with warmth that draws attention quickly" },
    zh: { branch: "午", zodiac: "马", mingGongNote: "表达感强、存在感高，温度容易被人迅速感知" },
  },
  未: {
    en: { branch: "Wei", zodiac: "Goat", mingGongNote: "soft outside but enduring underneath, often caring deeply about security" },
    zh: { branch: "未", zodiac: "羊", mingGongNote: "外柔内韧，通常对安全感有很深的在意" },
  },
  申: {
    en: { branch: "Shen", zodiac: "Monkey", mingGongNote: "flexible and alert, good at adjusting to changing circumstances" },
    zh: { branch: "申", zodiac: "猴", mingGongNote: "灵活机警，擅长在变化中快速调整" },
  },
  酉: {
    en: { branch: "You", zodiac: "Rooster", mingGongNote: "precise and selective, with strong standards and taste" },
    zh: { branch: "酉", zodiac: "鸡", mingGongNote: "讲究、挑剔，通常有很明确的标准感" },
  },
  戌: {
    en: { branch: "Xu", zodiac: "Dog", mingGongNote: "loyal and guarded, often taking commitment seriously once decided" },
    zh: { branch: "戌", zodiac: "狗", mingGongNote: "忠诚而谨慎，一旦决定投入就会认真看待承诺" },
  },
  亥: {
    en: { branch: "Hai", zodiac: "Pig", mingGongNote: "empathic and imaginative, but sometimes pulled by mood and longing" },
    zh: { branch: "亥", zodiac: "猪", mingGongNote: "共情力强、想象力足，但也容易被情绪和牵挂牵引" },
  },
};

const xiaoLiuRenMeta: Record<
  XiaoLiuRenKey,
  { en: { name: string; note: string }; zh: { name: string; note: string } }
> = {
  "da-an": {
    en: { name: "Da An / 大安", note: "The rhythm is stable and grounded, so patience tends to work better than pressure." },
    zh: { name: "大安", note: "节奏偏稳定扎实，更适合以耐心推进，而不是用压力催促。" },
  },
  "liu-lian": {
    en: { name: "Liu Lian / 留连", note: "Progress may feel delayed or repetitive, so what matters is whether both people can stay present through the slowdown." },
    zh: { name: "留连", note: "推进感会偏慢、偏反复，关键在于双方能不能在拖延感里依旧保持在场。" },
  },
  "su-xi": {
    en: { name: "Su Xi / 速喜", note: "Momentum rises quickly and positive movement can appear faster than expected." },
    zh: { name: "速喜", note: "推进节奏偏快，积极变化有时会比预期更早出现。" },
  },
  "chi-kou": {
    en: { name: "Chi Kou / 赤口", note: "Sharp words, misunderstanding, or tension need gentler handling than usual." },
    zh: { name: "赤口", note: "更容易出现言语冲突、误解与情绪刺感，需要更细致地处理。" },
  },
  "xiao-ji": {
    en: { name: "Xiao Ji / 小吉", note: "This is a mild favorable phase, good for quiet repair and steady improvement." },
    zh: { name: "小吉", note: "属于轻微向好的阶段，适合温和修复、慢慢改善。" },
  },
  "kong-wang": {
    en: { name: "Kong Wang / 空亡", note: "Energy can feel hollow or uncertain here, so avoid forcing certainty too early." },
    zh: { name: "空亡", note: "这里的能量更容易显得空、悬而未决，所以不要过早逼迫确定感。" },
  },
};

const compatibilityText: Record<
  CompatibilityKind,
  Record<Locale, (a: string, b: string) => { headline: string; note: string }>
> = {
  same: {
    en: (a) => ({
      headline: `Shared zodiac rhythm: ${a}`,
      note: "You tend to mirror each other quickly. Similar instincts can feel deeply natural, but emotional blind spots may also repeat in sync.",
    }),
    zh: (a) => ({
      headline: `同生肖节奏：${a}`,
      note: "你们很容易迅速照见彼此。相似的本能会带来熟悉感，但情绪上的盲点也可能同步重复出现。",
    }),
  },
  "liu-he": {
    en: (a, b) => ({
      headline: `Liu He pairing: ${a} + ${b}`,
      note: "This is a traditionally favorable match. The bond often feels naturally cooperative, with each side softening the other's harder edges.",
    }),
    zh: (a, b) => ({
      headline: `六合配对：${a} + ${b}`,
      note: "这是传统上较为顺畅的一类搭配。你们往往更容易自然合作，也更可能柔化彼此较硬的一面。",
    }),
  },
  "san-he": {
    en: (a, b) => ({
      headline: `San He support: ${a} + ${b}`,
      note: "This pairing tends to build momentum over time. Shared direction and reinforcement often matter more here than immediate sparks.",
    }),
    zh: (a, b) => ({
      headline: `三合助力：${a} + ${b}`,
      note: "这种组合更容易在时间里越走越顺。对你们来说，共同方向与互相加持，往往比瞬间火花更重要。",
    }),
  },
  "liu-chong": {
    en: (a, b) => ({
      headline: `Clashing zodiac current: ${a} + ${b}`,
      note: "Attraction can be vivid, but timing and instinct often pull in opposite directions. Clear agreements matter more than intensity alone.",
    }),
    zh: (a, b) => ({
      headline: `相冲气流：${a} + ${b}`,
      note: "吸引力可能很明显，但时机与本能经常会往相反方向拉。对你们而言，明确约定比单纯强烈感更重要。",
    }),
  },
  "liu-hai": {
    en: (a, b) => ({
      headline: `Hidden friction: ${a} + ${b}`,
      note: "This pairing can create subtle drains rather than open conflict. Misread intentions or emotional fatigue are worth watching closely.",
    }),
    zh: (a, b) => ({
      headline: `暗耗关系：${a} + ${b}`,
      note: "这种组合更容易形成细小但持续的消耗，而不是直接冲突。误读彼此意图和情绪疲惫值得被特别留意。",
    }),
  },
  mixed: {
    en: (a, b) => ({
      headline: `Mixed but workable: ${a} + ${b}`,
      note: "This is neither an instantly easy match nor a fixed obstacle. The relationship depends more on maturity, rhythm, and follow-through.",
    }),
    zh: (a, b) => ({
      headline: `有难度，但可以经营：${a} + ${b}`,
      note: "它既不是天然顺滑的组合，也不是注定不行。真正决定走向的，更是成熟度、节奏感与能否持续兑现。",
    }),
  },
};

export function readLoveInputFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): LoveReadingInput {
  return {
    birthDate: readSingleValue(searchParams.birthDate),
    birthTime: readSingleValue(searchParams.birthTime),
    theirBirthDate: readSingleValue(searchParams.theirBirthDate),
    theirBirthTime: readSingleValue(searchParams.theirBirthTime),
    relationshipStage: readSingleValue(searchParams.relationshipStage),
    heartQuestion: readSingleValue(searchParams.heartQuestion),
  };
}

export function hasCompleteReadingInput(input: LoveReadingInput) {
  return Boolean(
    input.birthDate &&
      input.theirBirthDate &&
      input.relationshipStage &&
      input.heartQuestion,
  );
}

export function buildLoveReading(
  input: LoveReadingInput,
  locale: Locale,
): LoveReading {
  const theme = findConcernTheme(input.heartQuestion);
  const stageKey =
    (input.relationshipStage as RelationshipStage) in stageStyles
      ? (input.relationshipStage as RelationshipStage)
      : "complicated";
  const style = stageStyles[stageKey][locale];
  const you = buildTraditionalProfile(input.birthDate, input.birthTime);
  const counterpart = buildTraditionalProfile(
    input.theirBirthDate,
    input.theirBirthTime,
  );
  const compatibilityRaw = buildCompatibilityReading(you, counterpart);
  const compatibility = localizeCompatibility(compatibilityRaw.kind, you, counterpart, locale, compatibilityRaw.score);
  const youProfile = localizeProfile(you, locale);
  const counterpartProfile = localizeProfile(counterpart, locale);
  const xiaoCycle =
    locale === "zh"
      ? `${youProfile.xiaoLiuRenLabel} 与 ${counterpartProfile.xiaoLiuRenLabel}`
      : `${youProfile.xiaoLiuRenLabel} and ${counterpartProfile.xiaoLiuRenLabel}`;
  const mingGongBlend =
    locale === "zh"
      ? `${youProfile.mingGongLabel} 偏向${branchMeta[you.mingGongBranch][locale].mingGongNote}，而对方则更像${branchMeta[counterpart.mingGongBranch][locale].mingGongNote}。`
      : `${youProfile.mingGongLabel} suggests someone who is ${branchMeta[you.mingGongBranch][locale].mingGongNote}, while the other side is more ${branchMeta[counterpart.mingGongBranch][locale].mingGongNote}.`;

  return {
    focusLabel: theme.labels[locale],
    keywords: [
      theme.labels[locale],
      stageLabel(stageKey, locale),
      compatibility.headline,
    ],
    snapshotTone:
      locale === "zh"
        ? `${theme.tones[locale]}，兼容度 ${compatibility.score}/100`
        : `${theme.tones[locale]}, compatibility score ${compatibility.score}/100`,
    stageLabel: stageLabel(stageKey, locale),
    sections: [
      {
        title: locale === "zh" ? "关系概览" : "Connection Overview",
        text:
          locale === "zh"
            ? `${style.overview} ${theme.patterns[locale]} 从传统配对标记上看，你们更接近“${compatibility.headline}”，这意味着${compatibility.note}`
            : `${style.overview} ${theme.patterns[locale]} Traditional matching points to ${compatibility.headline.toLowerCase()}, which suggests ${compatibility.note.toLowerCase()}`,
      },
      {
        title: locale === "zh" ? "当前情绪模式" : "Current Emotional Pattern",
        text:
          locale === "zh"
            ? `${style.emotional} 目前最明显的情绪主线是“${theme.labels[locale]}”。你们的小六壬分别落在 ${xiaoCycle}，因此关系节奏更容易在 ${youProfile.xiaoLiuRenNote} 与 ${counterpartProfile.xiaoLiuRenNote} 之间来回摆动。`
            : `${style.emotional} The main emotional thread showing up here is ${theme.labels[locale]}. Your Xiao Liu Ren markers land on ${xiaoCycle}, so the rhythm may alternate between ${youProfile.xiaoLiuRenNote.toLowerCase()} and ${counterpartProfile.xiaoLiuRenNote.toLowerCase()}.`,
      },
      {
        title: locale === "zh" ? "温和建议" : "Gentle Guidance",
        text:
          locale === "zh"
            ? `${style.guidancePrefix} ${theme.guidance[locale]} 命宫的落点也提示：${mingGongBlend}`
            : `${style.guidancePrefix} ${theme.guidance[locale]} Ming Gong signals add another layer here: ${mingGongBlend}`,
      },
    ],
    lockedModules: [
      {
        title: locale === "zh" ? "更深兼容性" : "Deeper Compatibility",
        teaser:
          locale === "zh"
            ? `${style.compatibilityTeaser} 当前传统兼容度分数为 ${compatibility.score}/100。`
            : `${style.compatibilityTeaser} Current traditional score: ${compatibility.score}/100.`,
      },
      {
        title: locale === "zh" ? "隐藏张力" : "Hidden Tension",
        teaser:
          locale === "zh"
            ? "继续看下去，可以更具体地看到迟疑、防御和反复误解究竟是怎么在表层故事之下形成的。"
            : "Uncover what may be creating hesitation, defensiveness, or repeated misunderstandings beneath the visible story.",
      },
      {
        title: locale === "zh" ? "时机洞察" : "Timing Insight",
        teaser: style.timingTeaser,
      },
      {
        title: locale === "zh" ? "下一步建议" : "Next Step Guidance",
        teaser:
          locale === "zh"
            ? "获得一份更平静的判断：此刻更适合靠近、暂停、要答案，还是先保护自己的能量。"
            : "Receive a calmer read on whether to lean in, pause, ask for clarity, or protect your energy.",
      },
    ],
    profiles: {
      you: youProfile,
      counterpart: counterpartProfile,
    },
    compatibility,
  };
}

function findConcernTheme(heartQuestion: string) {
  const lower = heartQuestion.toLowerCase();
  return (
    concernThemes.find((theme) =>
      theme.keywords.some((keyword) => lower.includes(keyword.toLowerCase())),
    ) ?? defaultTheme
  );
}

function localizeProfile(
  profile: TraditionalProfile,
  locale: Locale,
): DisplayTraditionalProfile {
  const branch = branchMeta[profile.zodiacBranch][locale];
  const shiBranch = branchMeta[profile.shiChenBranch][locale];
  const mingBranch = branchMeta[profile.mingGongBranch][locale];
  const xiaoMeta = xiaoLiuRenMeta[profile.xiaoLiuRenKey][locale];

  return {
    lunarDateLabel:
      locale === "zh"
        ? `农历 ${profile.lunarMonth} 月 ${profile.lunarDay} 日`
        : `Month ${profile.lunarMonth}, Day ${profile.lunarDay}`,
    shiChenLabel:
      locale === "zh"
        ? `${shiBranch.branch}时 (${profile.shiChenRange})`
        : `${shiBranch.branch} Hour (${profile.shiChenRange})`,
    mingGongLabel:
      locale === "zh"
        ? `${mingBranch.branch}宫`
        : `${mingBranch.branch} Palace`,
    xiaoLiuRenLabel: xiaoMeta.name,
    xiaoLiuRenNote: xiaoMeta.note,
    zodiacLabel:
      locale === "zh"
        ? `${branch.zodiac} (${branch.branch})`
        : `${branch.zodiac} (${branch.branch})`,
    usedEstimatedTime: profile.usedEstimatedTime,
  };
}

function localizeCompatibility(
  kind: CompatibilityKind,
  person: TraditionalProfile,
  counterpart: TraditionalProfile,
  locale: Locale,
  score: number,
) {
  const a = branchMeta[person.zodiacBranch][locale].zodiac;
  const b = branchMeta[counterpart.zodiacBranch][locale].zodiac;
  const text = compatibilityText[kind][locale](a, b);

  return {
    score,
    headline: text.headline,
    note: text.note,
  };
}

function readSingleValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
