import { fromGregorian, type LunarDateResult } from "./lunar-converter";
import { mod, READING_DISCLAIMER } from "./xiaoliu-ren";

export const MARRIAGE_DIRECTION_ALGORITHM_VERSION = "1.0.0";

export type MarriageDirectionInput = {
  birthDate: string;
  timezone?: string;
  birthPlaceLabel?: string;
  lunarOverride?: {
    month: number;
    day: number;
    isLeapMonth?: boolean;
  };
};

export type MarriageDirectionResult = {
  method?: "marriage-direction";
  version?: typeof MARRIAGE_DIRECTION_ALGORITHM_VERSION;
  primaryDirection: string;
  secondaryDirection: string;
  description: string;
  lunarBirthMonth: number;
  lunarBirthDay: number;
  targetMonth: number;
  input?: {
    birthDate: string;
    timezone: string;
    birthPlaceLabel?: string;
    lunarMonth: number;
    lunarDay: number;
    isLeapMonth: boolean;
    lunarMonthLabel: string;
    lunarDayLabel: string;
  };
  calculation?: {
    formula: "mod(monthBranchIndex + lunarDay - 1, 12)";
    monthBranchIndex: number;
    monthBranch: Branch;
    lunarDay: number;
    targetBranchIndex: number;
    branch: Branch;
    direction: Direction;
    axis: DirectionAxis;
    trace: string[];
  };
  result?: {
    branch: Branch;
    direction: Direction;
    axis: DirectionAxis;
    placeReference: string;
    summary: string;
  };
  disclaimer?: string;
};

export const BRANCHES = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
] as const;

export type Branch = (typeof BRANCHES)[number];

export const LUNAR_MONTH_TO_BRANCH_INDEX = {
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
  6: 7,
  7: 8,
  8: 9,
  9: 10,
  10: 11,
  11: 0,
  12: 1,
} as const;

export const BRANCH_DIRECTION = {
  子: "北",
  丑: "东北",
  寅: "东北",
  卯: "东",
  辰: "东南",
  巳: "东南",
  午: "南",
  未: "西南",
  申: "西南",
  酉: "西",
  戌: "西北",
  亥: "西北",
} as const;

export type Direction = (typeof BRANCH_DIRECTION)[Branch];

export const DIRECTION_AXIS = {
  北: "南—北",
  南: "南—北",
  东: "东—西",
  西: "东—西",
  东北: "东北—西南",
  西南: "东北—西南",
  东南: "东南—西北",
  西北: "东南—西北",
} as const;

export type DirectionAxis = (typeof DIRECTION_AXIS)[Direction];

export function calculateMarriageDirectionFromLunar(
  lunarMonth: number,
  lunarDay: number,
) {
  validateLunarMonthDay(lunarMonth, lunarDay);

  const monthBranchIndex =
    LUNAR_MONTH_TO_BRANCH_INDEX[
      lunarMonth as keyof typeof LUNAR_MONTH_TO_BRANCH_INDEX
    ];
  const targetBranchIndex = mod(monthBranchIndex + lunarDay - 1, 12);
  const monthBranch = BRANCHES[monthBranchIndex];
  const branch = BRANCHES[targetBranchIndex];
  const direction = BRANCH_DIRECTION[branch];
  const axis = DIRECTION_AXIS[direction];

  return {
    lunarMonth,
    lunarDay,
    monthBranchIndex,
    monthBranch,
    targetBranchIndex,
    branch,
    direction,
    axis,
    trace: {
      formula: "mod(monthBranchIndex + lunarDay - 1, 12)" as const,
      values: { monthBranchIndex, lunarDay },
      expression: `mod(${monthBranchIndex} + ${lunarDay} - 1, 12)`,
      targetBranchIndex,
      branch,
      direction,
      axis,
    },
  };
}

export function createMarriageDirectionReading(
  input: MarriageDirectionInput,
): MarriageDirectionResult {
  const timezone = input.timezone || "Asia/Shanghai";
  const lunar = input.lunarOverride
    ? buildLunarOverride(input.lunarOverride)
    : fromGregorian(input.birthDate, timezone);
  const calculated = calculateMarriageDirectionFromLunar(lunar.month, lunar.day);
  const placeReference = input.birthPlaceLabel
    ? `以${input.birthPlaceLabel}为参考中心`
    : "以出生地为参考中心";

  return {
    method: "marriage-direction",
    version: MARRIAGE_DIRECTION_ALGORITHM_VERSION,
    primaryDirection: calculated.direction,
    secondaryDirection: getAxisMirrorDirection(calculated.direction),
    description: `${placeReference}，传统规则指向${calculated.direction}，同时参考${calculated.axis}这条对向轴。该结果不是对象出生地保证。`,
    lunarBirthMonth: lunar.month,
    lunarBirthDay: lunar.day,
    targetMonth: calculated.targetBranchIndex + 1,
    input: {
      birthDate: input.birthDate,
      timezone,
      birthPlaceLabel: input.birthPlaceLabel,
      lunarMonth: lunar.month,
      lunarDay: lunar.day,
      isLeapMonth: lunar.isLeapMonth,
      lunarMonthLabel: lunar.monthLabel,
      lunarDayLabel: lunar.dayLabel,
    },
    calculation: {
      formula: "mod(monthBranchIndex + lunarDay - 1, 12)",
      monthBranchIndex: calculated.monthBranchIndex,
      monthBranch: calculated.monthBranch,
      lunarDay: lunar.day,
      targetBranchIndex: calculated.targetBranchIndex,
      branch: calculated.branch,
      direction: calculated.direction,
      axis: calculated.axis,
      trace: [
        `农历月=${lunar.month}`,
        `农历日=${lunar.day}`,
        `月支=${calculated.monthBranch}`,
        `月支索引=${calculated.monthBranchIndex}`,
        `目标地支索引=mod(${calculated.monthBranchIndex}+${lunar.day}-1,12)=${calculated.targetBranchIndex}`,
        `目标地支=${calculated.branch}`,
        `方向=${calculated.direction}`,
        `方向轴=${calculated.axis}`,
      ],
    },
    result: {
      branch: calculated.branch,
      direction: calculated.direction,
      axis: calculated.axis,
      placeReference,
      summary: `从传统月上数日规则看，结果落在${calculated.branch}位，对应${calculated.direction}，并参考${calculated.axis}轴。`,
    },
    disclaimer: `${READING_DISCLAIMER} ${RELATIONSHIP_DISCLAIMER}`,
  };
}

export function calculateMarriageDirection(
  birthDate: Date | string,
): MarriageDirectionResult {
  const date = birthDate instanceof Date ? toDateOnly(birthDate) : birthDate;
  return createMarriageDirectionReading({ birthDate: date });
}

export const RELATIONSHIP_DISCLAIMER =
  "命宫和方位结果不能判断一段关系是否健康。涉及婚姻、分手、财产和人身安全时，请优先依据现实行为、法律权利和专业意见。";

function validateLunarMonthDay(lunarMonth: number, lunarDay: number) {
  if (!Number.isInteger(lunarMonth) || lunarMonth < 1 || lunarMonth > 12) {
    throw new Error("INVALID_LUNAR_MONTH");
  }

  if (!Number.isInteger(lunarDay) || lunarDay < 1 || lunarDay > 30) {
    throw new Error("INVALID_LUNAR_DAY");
  }
}

function buildLunarOverride(override: NonNullable<MarriageDirectionInput["lunarOverride"]>): LunarDateResult {
  validateLunarMonthDay(override.month, override.day);

  return {
    year: 0,
    month: override.month,
    day: override.day,
    isLeapMonth: Boolean(override.isLeapMonth),
    monthLabel: `${override.isLeapMonth ? "闰" : ""}${override.month}月`,
    dayLabel: `${override.day}日`,
    source: {
      library: "lunar-javascript",
      libraryVersion: "1.7.7",
      supportedYears: "manual override",
    },
  };
}

function getAxisMirrorDirection(direction: Direction) {
  const axis = DIRECTION_AXIS[direction];
  return axis
    .split("—")
    .filter((item) => item !== direction)
    .join(" / ") || axis;
}

function toDateOnly(date: Date) {
  if (Number.isNaN(date.getTime())) {
    throw new Error("INVALID_GREGORIAN_DATE");
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}
