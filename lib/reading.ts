import { calculateMingGong, calculateMingGongMatch, parseGender } from "./ming-gong";
import { generateReadingText } from "./openai";
import type { Locale } from "./i18n";
import { stageLabel } from "./i18n";
import { getReadingRecord, saveReadingAnalysis } from "./reading-store";
import type { JsonValue } from "./supabase";
import { calculateXiaoLiuRen } from "./xiaoliu-ren";

export type LoveReadingInput = {
  name: string;
  gender: string;
  birthDate: string;
  theirGender: string;
  theirBirthDate: string;
  relationshipStage: string;
  heartQuestion: string;
  readingId: string;
};

export type MomentReadingInput = {
  name: string;
  heartQuestion: string;
  momentIso: string;
  momentLocal: string;
  readingId: string;
};

export type LoveReadingExperience = {
  stageLabel: string;
  focusLabel: string;
  snapshotTone: string;
  keywords: string[];
  compatibility: {
    score: number;
    headline: string;
    note: string;
  };
  palaces: {
    you: string;
    counterpart: string;
  };
  freeReadingText: string;
  paidReadingText: string | null;
  paidPreviewText: string;
};

export type MomentReadingExperience = {
  focusLabel: string;
  snapshotTone: string;
  keywords: string[];
  xiaoLiuRen: {
    deity: string;
    meaning: string;
    advice: string;
    formulaLabel: string;
    shichenLabel: string;
  };
  freeReadingText: string;
  paidReadingText: string | null;
  paidPreviewText: string;
};

const defaultMomentFocus = {
  en: "timing and movement around the matter you asked about",
  zh: "你所问之事的时机与走势",
};

const loveThemeMap = [
  {
    key: "trust",
    keywords: ["trust", "honest", "safe", "lied", "betray", "guarded", "信任", "安全感", "撒谎", "背叛", "防备"],
    labels: { en: "trust and emotional safety", zh: "信任与情绪安全感" },
    tones: { en: "measured caution", zh: "谨慎而克制的观察" },
  },
  {
    key: "future",
    keywords: ["future", "commit", "serious", "marriage", "long term", "未来", "承诺", "认真", "结婚", "长期"],
    labels: { en: "future direction", zh: "未来方向与承诺" },
    tones: { en: "future-facing tension", zh: "面向未来的拉扯" },
  },
];

const defaultLoveTheme = {
  labels: { en: "compatibility and relationship direction", zh: "匹配度与关系走向" },
  tones: { en: "quiet uncertainty", zh: "安静但未完全落定" },
};

export function readLoveInputFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): LoveReadingInput {
  return {
    name: readSingleValue(searchParams.name),
    gender: readSingleValue(searchParams.gender),
    birthDate: readSingleValue(searchParams.birthDate),
    theirGender: readSingleValue(searchParams.theirGender),
    theirBirthDate: readSingleValue(searchParams.theirBirthDate),
    relationshipStage: readSingleValue(searchParams.relationshipStage),
    heartQuestion: readSingleValue(searchParams.heartQuestion),
    readingId: readSingleValue(searchParams.rid),
  };
}

export function readMomentInputFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): MomentReadingInput {
  return {
    name: readSingleValue(searchParams.name),
    heartQuestion: readSingleValue(searchParams.heartQuestion),
    momentIso: readSingleValue(searchParams.momentIso),
    momentLocal: readSingleValue(searchParams.momentLocal),
    readingId: readSingleValue(searchParams.rid),
  };
}

export function hasCompleteLoveReadingInput(input: LoveReadingInput) {
  return Boolean(
    input.birthDate &&
      input.theirBirthDate &&
      input.gender &&
      input.theirGender &&
      input.relationshipStage &&
      input.heartQuestion,
  );
}

export function hasCompleteMomentReadingInput(input: MomentReadingInput) {
  return Boolean(input.heartQuestion && input.momentIso && input.momentLocal);
}

export async function buildLoveReadingExperience(
  input: LoveReadingInput,
  locale: Locale,
  isPaid: boolean,
): Promise<LoveReadingExperience> {
  const gender = parseGender(input.gender);
  const theirGender = parseGender(input.theirGender);

  if (!gender || !theirGender) {
    throw new Error("Missing gender for love reading");
  }

  const theme = findLoveTheme(input.heartQuestion);
  const you = calculateMingGong(input.birthDate, gender);
  const counterpart = calculateMingGong(input.theirBirthDate, theirGender);
  const compatibility = localizeLoveCompatibility(
    calculateMingGongMatch(you, counterpart),
    locale,
  );
  const readingRecord = await getReadingRecord(input.readingId || null);
  const freeReadingText =
    readingRecord?.ai_free ||
    (await generateReadingText({
      locale,
      layer: "free",
      readingType: "love",
      userInput: {
        name: input.name || undefined,
        birthDate: input.birthDate,
        question: input.heartQuestion || undefined,
        relationshipStage: stageLabel(input.relationshipStage, locale),
      },
      computedResults: {
        loveCompatibility: {
          yourPalace: you.displayLabel,
          theirPalace: counterpart.displayLabel,
          matchHeadline: compatibility.headline,
          matchNote: compatibility.note,
        },
      },
    }));
  const paidReadingText = isPaid
    ? readingRecord?.ai_paid ||
      (await generateReadingText({
        locale,
        layer: "paid",
        readingType: "love",
        userInput: {
          name: input.name || undefined,
          birthDate: input.birthDate,
          question: input.heartQuestion || undefined,
          relationshipStage: stageLabel(input.relationshipStage, locale),
        },
        computedResults: {
          loveCompatibility: {
            yourPalace: you.displayLabel,
            theirPalace: counterpart.displayLabel,
            matchHeadline: compatibility.headline,
            matchNote: compatibility.note,
          },
        },
      }))
    : null;

  if (input.readingId) {
    await saveReadingAnalysis({
      readingId: input.readingId,
      computed: {
        yourPalace: you.displayLabel,
        theirPalace: counterpart.displayLabel,
        matchLevel: compatibility.headline,
        compatibilityScore: compatibility.score,
      } as JsonValue,
      aiFree: freeReadingText,
      aiPaid: paidReadingText ?? undefined,
    });
  }

  return {
    stageLabel: stageLabel(input.relationshipStage, locale),
    focusLabel: theme.labels[locale],
    snapshotTone:
      locale === "zh"
        ? `${theme.tones[locale]}，匹配度 ${compatibility.score}/100`
        : `${theme.tones[locale]}, compatibility ${compatibility.score}/100`,
    keywords: [
      theme.labels[locale],
      stageLabel(input.relationshipStage, locale),
      compatibility.headline,
    ],
    compatibility,
    palaces: {
      you: you.displayLabel,
      counterpart: counterpart.displayLabel,
    },
    freeReadingText,
    paidReadingText,
    paidPreviewText:
      locale === "zh"
        ? "这一层之后，可以继续延展到更完整的 Love 方法，把匹配结论真正放进关系语境里展开。"
        : "A fuller love method can extend from this compatibility result into a deeper interpretation of how the relationship may actually feel and develop.",
  };
}

export async function buildMomentReadingExperience(
  input: MomentReadingInput,
  locale: Locale,
  isPaid: boolean,
): Promise<MomentReadingExperience> {
  const xiaoLiuRen = calculateXiaoLiuRen(new Date(input.momentIso), input.momentLocal);
  const readingRecord = await getReadingRecord(input.readingId || null);
  const freeReadingText =
    readingRecord?.ai_free ||
    (await generateReadingText({
      locale,
      layer: "free",
      readingType: "moment",
      userInput: {
        name: input.name || undefined,
        momentTime: input.momentLocal || input.momentIso,
        question: input.heartQuestion || undefined,
      },
      computedResults: {
        xiaoLiuRen,
      },
    }));
  const paidReadingText = isPaid
    ? readingRecord?.ai_paid ||
      (await generateReadingText({
        locale,
        layer: "paid",
        readingType: "moment",
        userInput: {
          name: input.name || undefined,
          momentTime: input.momentLocal || input.momentIso,
          question: input.heartQuestion || undefined,
        },
        computedResults: {
          xiaoLiuRen,
        },
      }))
    : null;

  if (input.readingId) {
    await saveReadingAnalysis({
      readingId: input.readingId,
      computed: {
        xiaoLiuRen: xiaoLiuRen as unknown as JsonValue,
      } as JsonValue,
      aiFree: freeReadingText,
      aiPaid: paidReadingText ?? undefined,
    });
  }

  return {
    focusLabel: defaultMomentFocus[locale],
    snapshotTone:
      locale === "zh"
        ? `${localizeDeityName(xiaoLiuRen.deity, locale)} 所主的时机信号`
        : `${localizeDeityName(xiaoLiuRen.deity, locale)} timing signal`,
    keywords: [
      defaultMomentFocus[locale],
      localizeDeityName(xiaoLiuRen.deity, locale),
    ],
    xiaoLiuRen: {
      deity: localizeDeityName(xiaoLiuRen.deity, locale),
      meaning: localizeDeityMeaning(xiaoLiuRen.deity, xiaoLiuRen.meaning, locale),
      advice: localizeDeityAdvice(xiaoLiuRen.deity, xiaoLiuRen.advice, locale),
      formulaLabel:
        locale === "zh"
          ? `公式：(${xiaoLiuRen.lunarMonth} + ${xiaoLiuRen.lunarDay} + ${xiaoLiuRen.shichen} - 3) mod 6`
          : `Formula: (${xiaoLiuRen.lunarMonth} + ${xiaoLiuRen.lunarDay} + ${xiaoLiuRen.shichen} - 3) mod 6`,
      shichenLabel:
        locale === "zh"
          ? `起念时段编号：${xiaoLiuRen.shichen}`
          : `Thought-cycle number: ${xiaoLiuRen.shichen}`,
    },
    freeReadingText,
    paidReadingText,
    paidPreviewText:
      locale === "zh"
        ? "更深层会继续把眼前这个信号展开成更完整的局势判断与动作建议。"
        : "The deeper layer expands this signal into a steadier interpretation and more grounded action guidance.",
  };
}

function findLoveTheme(heartQuestion: string) {
  const lower = heartQuestion.toLowerCase();
  return (
    loveThemeMap.find((theme) =>
      theme.keywords.some((keyword) => lower.includes(keyword.toLowerCase())),
    ) ?? defaultLoveTheme
  );
}

function localizeLoveCompatibility(
  match: ReturnType<typeof calculateMingGongMatch>,
  locale: Locale,
) {
  const headline =
    locale === "zh"
      ? {
          high: "高度匹配",
          secondary: "次级匹配",
          low: "不太匹配",
        }[match.matchLevel]
      : match.headline;
  const note =
    locale === "zh"
      ? {
          high: "按当前命宫方法看，这是一组天然更顺的组合。",
          secondary: "按当前命宫方法看，这组关系属于同一大类里仍可相合的组合。",
          low: "按当前命宫方法看，这组关系不属于天然顺配，更需要有意识地经营。",
        }[match.matchLevel]
      : match.note;

  return {
    score: match.score,
    headline,
    note,
  };
}

function localizeDeityName(deity: string, locale: Locale) {
  if (locale === "zh") {
    return deity;
  }

  const map: Record<string, string> = {
    大安: "Da An / Great Calm",
    留连: "Liu Lian / Lingering",
    速喜: "Su Xi / Swift Joy",
    赤口: "Chi Kou / Sharp Mouth",
    小吉: "Xiao Ji / Small Blessing",
    空亡: "Kong Wang / Void",
  };

  return map[deity] ?? deity;
}

function localizeDeityMeaning(deity: string, fallback: string, locale: Locale) {
  if (locale === "zh") {
    return fallback;
  }

  const map: Record<string, string> = {
    大安: "Peace, steadiness, and a calmer field around the matter.",
    留连: "Delay, entanglement, and repetitive emotional drag.",
    速喜: "A quicker, brighter opening where movement is supported.",
    赤口: "Misunderstanding, sharp words, and reactive friction.",
    小吉: "A gentler favorable turn, especially through modest action.",
    空亡: "Suspension, uncertainty, and difficulty anchoring the matter.",
  };

  return map[deity] ?? fallback;
}

function localizeDeityAdvice(deity: string, fallback: string, locale: Locale) {
  if (locale === "zh") {
    return fallback;
  }

  const map: Record<string, string> = {
    大安: "Stay steady and let the signal unfold without forcing it.",
    留连: "Pause major decisions and study the repeating pattern first.",
    速喜: "If you move, move gently and at the cleanest opening.",
    赤口: "Guard your tone and avoid reacting too fast.",
    小吉: "Trust smaller, steadier action more than dramatic gestures.",
    空亡: "Release the demand for certainty and return to what you can ground today.",
  };

  return map[deity] ?? fallback;
}

function readSingleValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
