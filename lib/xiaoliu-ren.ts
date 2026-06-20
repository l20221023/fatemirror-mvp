import {
  assertValidTimezone,
  fromGregorian,
  getDatePartsInTimezone,
  type LunarDateResult,
} from "./lunar-converter";

export const XIAOLIU_REN_ALGORITHM_VERSION = "1.0.0";

export type XiaoLiuRenKey =
  | "da-an"
  | "liu-lian"
  | "su-xi"
  | "chi-kou"
  | "xiao-ji"
  | "kong-wang";

export type XiaoliuRenInput = {
  occurredAt: string;
  timezone: string;
  question?: string;
  lunarOverride?: {
    month: number;
    day: number;
    isLeapMonth?: boolean;
  };
};

export type XiaoliuRenResult = {
  method: "xiaoliu-ren";
  version: typeof XIAOLIU_REN_ALGORITHM_VERSION;
  input: {
    occurredAt: string;
    timezone: string;
    lunarMonth: number;
    lunarDay: number;
    isLeapMonth: boolean;
    lunarMonthLabel: string;
    lunarDayLabel: string;
    hourBranch: string;
    hourIndex: number;
    localDateTime: string;
    questionIncludedInCalculation: false;
  };
  calculation: {
    formula: "mod(lunarMonth + lunarDay + hourIndex - 3, 6)";
    lunarMonth: number;
    lunarDay: number;
    hourIndex: number;
    resultIndex: number;
    trace: string[];
  };
  result: {
    key: XiaoLiuRenKey;
    name: string;
    keywords: string[];
    summary: string;
    relationship: string;
    work: string;
    action: string;
  };
  disclaimer: string;
};

export type XiaoLiuRenResult = {
  deity: string;
  deityIndex: number;
  deityKey: XiaoLiuRenKey;
  meaning: string;
  advice: string;
  lunarMonth: number;
  lunarDay: number;
  shichen: number;
  trace: XiaoliuRenResult["calculation"];
};

export const SIX_GODS = ["大安", "留连", "速喜", "赤口", "小吉", "空亡"] as const;

export const HOUR_BRANCHES = [
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

const SIX_GOD_CONTENT = [
  {
    key: "da-an",
    name: "大安",
    keywords: ["稳定", "静守", "秩序"],
    summary: "从这套传统规则看，当前信号偏向稳定和守成。",
    relationship: "关系趋于稳定，暂不必强推。",
    work: "适合先维持节奏，确认事实和既有安排。",
    action: "维持节奏，确认一件已经发生的事实。",
  },
  {
    key: "liu-lian",
    name: "留连",
    keywords: ["拖延", "反复", "未决"],
    summary: "这个结果更适合被理解为事情仍在反复和拖延中。",
    relationship: "容易纠缠或迟迟没有答复。",
    work: "适合设定期限，减少无效等待。",
    action: "为下一步设一个清晰期限。",
  },
  {
    key: "su-xi",
    name: "速喜",
    keywords: ["快速", "消息", "推进"],
    summary: "当前信息更支持及时确认或小范围推进。",
    relationship: "适合及时表达或确认，但需要保留边界。",
    work: "适合抓住窗口推进一个明确动作。",
    action: "把要做的事压缩成一个十分钟内能开始的小动作。",
  },
  {
    key: "chi-kou",
    name: "赤口",
    keywords: ["争执", "误会", "冲动"],
    summary: "这个结果提醒先注意表达方式和情绪温度。",
    relationship: "容易因表达方式发生冲突。",
    work: "适合先降温，再处理争议或谈判。",
    action: "暂缓争辩，先写下三个可验证事实。",
  },
  {
    key: "xiao-ji",
    name: "小吉",
    keywords: ["回归", "协作", "小进展"],
    summary: "从传统规则看，局面更适合以小步行动促成缓和。",
    relationship: "关系有缓和或重新连接机会。",
    work: "适合通过协作和小进展重建节奏。",
    action: "采取一个低风险的小步行动，不夸大预期。",
  },
  {
    key: "kong-wang",
    name: "空亡",
    keywords: ["落空", "不确定", "信息不足"],
    summary: "当前可能难以形成明确结论，更适合补充信息。",
    relationship: "当前可能难以形成明确结果。",
    work: "适合先查缺口，避免把资源压在单一路径上。",
    action: "补充一条关键信息，避免孤注一掷。",
  },
] as const satisfies ReadonlyArray<{
  key: XiaoLiuRenKey;
  name: string;
  keywords: readonly string[];
  summary: string;
  relationship: string;
  work: string;
  action: string;
}>;

export const READING_DISCLAIMER =
  "FateMirror 提供传统文化娱乐和自我反思内容，不构成科学预测或专业建议。请结合现实信息自主判断。";

export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function getHourIndex(hour: number): number {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new Error("INVALID_HOUR");
  }

  if (hour === 23 || hour === 0) return 1;
  return Math.floor((hour + 1) / 2) + 1;
}

export function calculateXiaoliuRen(
  lunarMonth: number,
  lunarDay: number,
  localHour: number,
) {
  validateLunarMonthDay(lunarMonth, lunarDay);

  const hourIndex = getHourIndex(localHour);
  const resultIndex = mod(lunarMonth + lunarDay + hourIndex - 3, 6);

  return {
    lunarMonth,
    lunarDay,
    hourIndex,
    hourBranch: HOUR_BRANCHES[hourIndex - 1],
    resultIndex,
    result: SIX_GODS[resultIndex],
    trace: {
      formula: "mod(lunarMonth + lunarDay + hourIndex - 3, 6)" as const,
      values: { lunarMonth, lunarDay, hourIndex },
      expression: `mod(${lunarMonth} + ${lunarDay} + ${hourIndex} - 3, 6)`,
      resultIndex,
      resultName: SIX_GODS[resultIndex],
    },
  };
}

export function createXiaoliuRenReading(input: XiaoliuRenInput): XiaoliuRenResult {
  const instant = parseInstant(input.occurredAt);
  assertValidTimezone(input.timezone);

  const parts = getDatePartsInTimezone(instant, input.timezone);
  const lunar = input.lunarOverride
    ? buildLunarOverride(input.lunarOverride)
    : fromGregorian(input.occurredAt, input.timezone);
  const calculated = calculateXiaoliuRen(lunar.month, lunar.day, parts.hour);
  const result = SIX_GOD_CONTENT[calculated.resultIndex];

  return {
    method: "xiaoliu-ren",
    version: XIAOLIU_REN_ALGORITHM_VERSION,
    input: {
      occurredAt: input.occurredAt,
      timezone: input.timezone,
      lunarMonth: lunar.month,
      lunarDay: lunar.day,
      isLeapMonth: lunar.isLeapMonth,
      lunarMonthLabel: lunar.monthLabel,
      lunarDayLabel: lunar.dayLabel,
      hourBranch: calculated.hourBranch,
      hourIndex: calculated.hourIndex,
      localDateTime: formatLocalDateTime(parts),
      questionIncludedInCalculation: false,
    },
    calculation: {
      formula: "mod(lunarMonth + lunarDay + hourIndex - 3, 6)",
      lunarMonth: lunar.month,
      lunarDay: lunar.day,
      hourIndex: calculated.hourIndex,
      resultIndex: calculated.resultIndex,
      trace: [
        `农历月=${lunar.month}`,
        `农历日=${lunar.day}`,
        `本地小时=${parts.hour}`,
        `时辰=${calculated.hourBranch}`,
        `时辰序号=${calculated.hourIndex}`,
        `结果索引=mod(${lunar.month}+${lunar.day}+${calculated.hourIndex}-3,6)=${calculated.resultIndex}`,
      ],
    },
    result: {
      key: result.key,
      name: result.name,
      keywords: [...result.keywords],
      summary: result.summary,
      relationship: result.relationship,
      work: result.work,
      action: result.action,
    },
    disclaimer: READING_DISCLAIMER,
  };
}

export function calculateXiaoLiuRen(
  datetime: Date,
  momentLocal?: string,
): XiaoLiuRenResult {
  const occurredAt = momentLocal ? localMomentToIso(momentLocal) : datetime.toISOString();
  const reading = createXiaoliuRenReading({
    occurredAt,
    timezone: "Asia/Shanghai",
  });

  return {
    deity: reading.result.name,
    deityIndex: reading.calculation.resultIndex,
    deityKey: reading.result.key,
    meaning: reading.result.summary,
    advice: reading.result.action,
    lunarMonth: reading.input.lunarMonth,
    lunarDay: reading.input.lunarDay,
    shichen: reading.input.hourIndex,
    trace: reading.calculation,
  };
}

function validateLunarMonthDay(lunarMonth: number, lunarDay: number) {
  if (!Number.isInteger(lunarMonth) || lunarMonth < 1 || lunarMonth > 12) {
    throw new Error("INVALID_LUNAR_MONTH");
  }

  if (!Number.isInteger(lunarDay) || lunarDay < 1 || lunarDay > 30) {
    throw new Error("INVALID_LUNAR_DAY");
  }
}

function buildLunarOverride(override: NonNullable<XiaoliuRenInput["lunarOverride"]>): LunarDateResult {
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

function parseInstant(occurredAt: string) {
  if (!occurredAt || typeof occurredAt !== "string") {
    throw new Error("INVALID_OCCURRED_AT");
  }

  const instant = new Date(occurredAt);
  if (Number.isNaN(instant.getTime())) {
    throw new Error("INVALID_OCCURRED_AT");
  }

  return instant;
}

function formatLocalDateTime(parts: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}) {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`;
}

function localMomentToIso(momentLocal: string) {
  const match = momentLocal.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (!match) {
    throw new Error("INVALID_OCCURRED_AT");
  }

  return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6] ?? "00"}+08:00`;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}
