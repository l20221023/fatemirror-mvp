import { READING_DISCLAIMER } from "./xiaoliu-ren";

export const MING_GUA_ALGORITHM_VERSION = "1.0.0";

export type Gender = "male" | "female";
export type LegacyGender = "man" | "woman";
export type MingGuaGroup = "east" | "west";
export type PalaceNumber = 1 | 2 | 3 | 4 | 6 | 7 | 8 | 9;
export type PalaceName =
  | "Kan"
  | "Kun"
  | "Zhen"
  | "Xun"
  | "Qian"
  | "Dui"
  | "Gen"
  | "Li";

export type MingGongResult = {
  palaceNumber: PalaceNumber;
  palaceName: PalaceName;
  displayLabel: string;
};

export type MingGuaResult = {
  method: "ming-gua";
  version: typeof MING_GUA_ALGORITHM_VERSION;
  calculationMode: "gregorian-year-simple";
  input: {
    birthYear: number;
    gender: Gender;
  };
  calculation: {
    digitSum: number;
    baseNumber: number;
    rawPalace: number;
    normalizedPalace: number;
    usedFivePalaceRule: boolean;
    trace: string[];
  };
  result: {
    palaceNumber: PalaceNumber;
    trigram: string;
    palaceName: PalaceName;
    roleSymbol: string;
    group: MingGuaGroup;
    groupLabel: "东四命" | "西四命";
    direction: string;
    favorableDirections: string[];
  };
  disclaimer: string;
};

export type MingGuaMatchLevel =
  | "traditional-best-pair"
  | "same-group"
  | "cross-group";

export type MingGuaMatchResult = {
  method: "ming-gua-match";
  version: typeof MING_GUA_ALGORITHM_VERSION;
  input: {
    personA: MingGuaResult["input"];
    personB: MingGuaResult["input"];
  };
  calculation: {
    pairKey: string;
    personAGroup: MingGuaGroup;
    personBGroup: MingGuaGroup;
    trace: string[];
  };
  result: {
    level: MingGuaMatchLevel;
    label: string;
    summary: string;
    realityChecklist: string[];
  };
  disclaimer: string;
};

export type MingGongMatchLevel = "high" | "secondary" | "low";

export type MingGongMatchResult = {
  matchLevel: MingGongMatchLevel;
  score: number;
  headline: string;
  note: string;
  deterministicLevel: MingGuaMatchLevel;
  trace: MingGuaMatchResult["calculation"];
};

export const EAST_DIRECTIONS = ["北", "东", "东南", "南"] as const;
export const WEST_DIRECTIONS = ["西南", "西", "西北", "东北"] as const;

export const MING_GUA_MAP: Record<
  PalaceNumber,
  {
    trigram: string;
    palaceName: PalaceName;
    roleSymbol: string;
    group: MingGuaGroup;
    groupLabel: "东四命" | "西四命";
    direction: string;
    favorableDirections: readonly string[];
  }
> = {
  1: {
    trigram: "坎",
    palaceName: "Kan",
    roleSymbol: "中男",
    group: "east",
    groupLabel: "东四命",
    direction: "北",
    favorableDirections: EAST_DIRECTIONS,
  },
  2: {
    trigram: "坤",
    palaceName: "Kun",
    roleSymbol: "母亲",
    group: "west",
    groupLabel: "西四命",
    direction: "西南",
    favorableDirections: WEST_DIRECTIONS,
  },
  3: {
    trigram: "震",
    palaceName: "Zhen",
    roleSymbol: "长男",
    group: "east",
    groupLabel: "东四命",
    direction: "东",
    favorableDirections: EAST_DIRECTIONS,
  },
  4: {
    trigram: "巽",
    palaceName: "Xun",
    roleSymbol: "长女",
    group: "east",
    groupLabel: "东四命",
    direction: "东南",
    favorableDirections: EAST_DIRECTIONS,
  },
  6: {
    trigram: "乾",
    palaceName: "Qian",
    roleSymbol: "父亲",
    group: "west",
    groupLabel: "西四命",
    direction: "西北",
    favorableDirections: WEST_DIRECTIONS,
  },
  7: {
    trigram: "兑",
    palaceName: "Dui",
    roleSymbol: "少女",
    group: "west",
    groupLabel: "西四命",
    direction: "西",
    favorableDirections: WEST_DIRECTIONS,
  },
  8: {
    trigram: "艮",
    palaceName: "Gen",
    roleSymbol: "少男",
    group: "west",
    groupLabel: "西四命",
    direction: "东北",
    favorableDirections: WEST_DIRECTIONS,
  },
  9: {
    trigram: "离",
    palaceName: "Li",
    roleSymbol: "中女",
    group: "east",
    groupLabel: "东四命",
    direction: "南",
    favorableDirections: EAST_DIRECTIONS,
  },
};

const BEST_MING_GUA_PAIRS = new Set(["2-6", "3-4", "1-9", "7-8"]);

export function parseGender(value: string): LegacyGender | null {
  if (value === "man" || value === "woman") {
    return value;
  }

  if (value === "male") return "man";
  if (value === "female") return "woman";
  return null;
}

export function normalizeGender(gender: string): Gender {
  if (gender === "male" || gender === "man") return "male";
  if (gender === "female" || gender === "woman") return "female";
  throw new Error("INVALID_GENDER");
}

export function digitalRoot(value: number): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("INVALID_VALUE");
  }

  return 1 + ((value - 1) % 9);
}

export function getYearDigitSum(year: number): number {
  validateBirthYear(year);
  return String(year)
    .split("")
    .reduce((acc, digit) => acc + Number(digit), 0);
}

export function getYearBaseNumber(year: number): number {
  return digitalRoot(getYearDigitSum(year));
}

export function normalizePalace(value: number): number {
  let palace = value;
  while (palace > 9) palace -= 9;
  while (palace < 1) palace += 9;
  return palace;
}

export function calculateMingGuaNumber(year: number, genderInput: Gender | LegacyGender): PalaceNumber {
  const gender = normalizeGender(genderInput);
  const base = getYearBaseNumber(year);
  const rawPalace = gender === "male" ? 11 - base : 4 + base;
  const normalizedPalace = normalizePalace(rawPalace);

  if (normalizedPalace === 5) {
    return gender === "male" ? 2 : 8;
  }

  if (!isPalaceNumber(normalizedPalace)) {
    throw new Error("INVALID_PALACE_NUMBER");
  }

  return normalizedPalace;
}

export function calculateMingGua(
  input: { birthYear: number; gender: Gender | LegacyGender },
): MingGuaResult {
  const gender = normalizeGender(input.gender);
  const birthYear = validateBirthYear(input.birthYear);
  const digitSum = getYearDigitSum(birthYear);
  const baseNumber = digitalRoot(digitSum);
  const rawPalace = gender === "male" ? 11 - baseNumber : 4 + baseNumber;
  const normalizedPalace = normalizePalace(rawPalace);
  const palaceNumber = calculateMingGuaNumber(birthYear, gender);
  const usedFivePalaceRule = normalizedPalace === 5;
  const entry = MING_GUA_MAP[palaceNumber];

  return {
    method: "ming-gua",
    version: MING_GUA_ALGORITHM_VERSION,
    calculationMode: "gregorian-year-simple",
    input: { birthYear, gender },
    calculation: {
      digitSum,
      baseNumber,
      rawPalace,
      normalizedPalace,
      usedFivePalaceRule,
      trace: [
        `年份=${birthYear}`,
        `各位数字和=${digitSum}`,
        `基数=${baseNumber}`,
        gender === "male" ? `男性公式=11-${baseNumber}=${rawPalace}` : `女性公式=4+${baseNumber}=${rawPalace}`,
        `归一化命宫=${normalizedPalace}`,
        usedFivePalaceRule
          ? `中宫5寄宫规则：${gender === "male" ? "男性5寄坤2" : "女性5寄艮8"}`
          : "未触发中宫5寄宫规则",
        `最终命宫=${palaceNumber}`,
      ],
    },
    result: {
      palaceNumber,
      trigram: entry.trigram,
      palaceName: entry.palaceName,
      roleSymbol: entry.roleSymbol,
      group: entry.group,
      groupLabel: entry.groupLabel,
      direction: entry.direction,
      favorableDirections: [...entry.favorableDirections],
    },
    disclaimer: READING_DISCLAIMER,
  };
}

export function calculateMingGong(
  birthDate: string,
  gender: Gender | LegacyGender,
): MingGongResult {
  const birthYear = Number(birthDate.slice(0, 4));
  const result = calculateMingGua({ birthYear, gender });

  return {
    palaceNumber: result.result.palaceNumber,
    palaceName: result.result.palaceName,
    displayLabel: `${result.result.trigram} ${result.result.palaceNumber}`,
  };
}

export function pairKey(a: number, b: number): string {
  return [a, b].sort((x, y) => x - y).join("-");
}

export function calculateMingGuaMatch(
  personA: MingGuaResult,
  personB: MingGuaResult,
): MingGuaMatchResult {
  const key = pairKey(personA.result.palaceNumber, personB.result.palaceNumber);
  const sameGroup = personA.result.group === personB.result.group;
  let level: MingGuaMatchLevel;
  let label: string;
  let summary: string;

  if (BEST_MING_GUA_PAIRS.has(key)) {
    level = "traditional-best-pair";
    label = "传统正配";
    summary = "双方在传统命宫人物象中构成对应组合。";
  } else if (sameGroup) {
    level = "same-group";
    label = "同组匹配";
    summary = "双方同属东四命或西四命，传统上视为方向较接近。";
  } else {
    level = "cross-group";
    label = "跨组匹配";
    summary = "双方分属东四命和西四命，传统上视为方向偏好存在差异。";
  }

  return {
    method: "ming-gua-match",
    version: MING_GUA_ALGORITHM_VERSION,
    input: {
      personA: personA.input,
      personB: personB.input,
    },
    calculation: {
      pairKey: key,
      personAGroup: personA.result.group,
      personBGroup: personB.result.group,
      trace: [
        `A命宫=${personA.result.palaceNumber}${personA.result.trigram}`,
        `B命宫=${personB.result.palaceNumber}${personB.result.trigram}`,
        `排序配对键=${key}`,
        BEST_MING_GUA_PAIRS.has(key) ? "命中传统正配表" : "未命中传统正配表",
        sameGroup ? "双方同组" : "双方跨组",
        `匹配层级=${label}`,
      ],
    },
    result: {
      level,
      label,
      summary,
      realityChecklist: [
        "双方是否能直接表达需求",
        "冲突发生后是否能修复",
        "对金钱、家庭和未来规划是否基本一致",
        "是否尊重彼此边界和自主选择",
      ],
    },
    disclaimer:
      "命宫和方位结果不能判断一段关系是否健康。涉及婚姻、分手、财产和人身安全时，请优先依据现实行为、法律权利和专业意见。",
  };
}

export function calculateMingGongMatch(
  person: MingGongResult,
  counterpart: MingGongResult,
): MingGongMatchResult {
  const personResult = resultFromMingGong(person);
  const counterpartResult = resultFromMingGong(counterpart);
  const match = calculateMingGuaMatch(personResult, counterpartResult);

  if (match.result.level === "traditional-best-pair") {
    return {
      matchLevel: "high",
      score: 92,
      headline: "传统正配",
      note: "从命宫人物象看，双方构成传统对应组合；现实关系仍取决于沟通、边界和共同选择。",
      deterministicLevel: match.result.level,
      trace: match.calculation,
    };
  }

  if (match.result.level === "same-group") {
    return {
      matchLevel: "secondary",
      score: 76,
      headline: "同组匹配",
      note: "从命宫分组看，双方方向偏好较接近；现实关系仍取决于沟通、边界、价值观和生活条件。",
      deterministicLevel: match.result.level,
      trace: match.calculation,
    };
  }

  return {
    matchLevel: "low",
    score: 48,
    headline: "跨组匹配",
    note: "从传统分组看，双方方向偏好不同，可能需要更多协商。该结果不代表关系一定不合。",
    deterministicLevel: match.result.level,
    trace: match.calculation,
  };
}

function resultFromMingGong(result: MingGongResult): MingGuaResult {
  const entry = MING_GUA_MAP[result.palaceNumber];

  return {
    method: "ming-gua",
    version: MING_GUA_ALGORITHM_VERSION,
    calculationMode: "gregorian-year-simple",
    input: { birthYear: 0, gender: "male" },
    calculation: {
      digitSum: 0,
      baseNumber: 0,
      rawPalace: result.palaceNumber,
      normalizedPalace: result.palaceNumber,
      usedFivePalaceRule: false,
      trace: ["legacy MingGongResult input"],
    },
    result: {
      palaceNumber: result.palaceNumber,
      trigram: entry.trigram,
      palaceName: entry.palaceName,
      roleSymbol: entry.roleSymbol,
      group: entry.group,
      groupLabel: entry.groupLabel,
      direction: entry.direction,
      favorableDirections: [...entry.favorableDirections],
    },
    disclaimer: READING_DISCLAIMER,
  };
}

function validateBirthYear(year: number) {
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    throw new Error("INVALID_BIRTH_YEAR");
  }

  return year;
}

function isPalaceNumber(value: number): value is PalaceNumber {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 6 || value === 7 || value === 8 || value === 9;
}
