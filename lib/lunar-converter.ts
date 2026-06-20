import { Solar } from "lunar-javascript";

export const LUNAR_LIBRARY = {
  name: "lunar-javascript",
  version: "1.7.7",
  supportedYearStart: 1900,
  supportedYearEnd: 2100,
} as const;

export type LunarDateResult = {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
  monthLabel: string;
  dayLabel: string;
  source: {
    library: typeof LUNAR_LIBRARY.name;
    libraryVersion: typeof LUNAR_LIBRARY.version;
    supportedYears: string;
  };
};

export type GregorianDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const LUNAR_MONTH_LABELS = [
  "",
  "正月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "冬月",
  "腊月",
] as const;

const LUNAR_DAY_PREFIX = ["初", "十", "廿", "三"] as const;
const LUNAR_DAY_DIGITS = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"] as const;

export function fromGregorian(date: string, timezone = "Asia/Shanghai"): LunarDateResult {
  if (!date || typeof date !== "string") {
    throw new Error("INVALID_GREGORIAN_DATE");
  }

  assertValidTimezone(timezone);

  const dateOnly = parseDateOnly(date);
  if (dateOnly) {
    return fromGregorianParts({ ...dateOnly, hour: 12, minute: 0, second: 0 });
  }

  const instant = new Date(date);
  if (Number.isNaN(instant.getTime())) {
    throw new Error("INVALID_GREGORIAN_DATE");
  }

  return fromGregorianParts(getDatePartsInTimezone(instant, timezone));
}

export function fromGregorianParts(parts: GregorianDateParts): LunarDateResult {
  validateGregorianParts(parts);

  const solar = Solar.fromYmd(parts.year, parts.month, parts.day);
  const lunar = solar.getLunar();
  const rawMonth = lunar.getMonth();
  const month = Math.abs(rawMonth);
  const day = lunar.getDay();

  return {
    year: lunar.getYear(),
    month,
    day,
    isLeapMonth: rawMonth < 0,
    monthLabel: `${rawMonth < 0 ? "闰" : ""}${LUNAR_MONTH_LABELS[month]}`,
    dayLabel: getLunarDayLabel(day),
    source: {
      library: LUNAR_LIBRARY.name,
      libraryVersion: LUNAR_LIBRARY.version,
      supportedYears: `${LUNAR_LIBRARY.supportedYearStart}-${LUNAR_LIBRARY.supportedYearEnd}`,
    },
  };
}

export function solarToLunar(input: Date | string): LunarDateResult {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) {
      throw new Error("INVALID_GREGORIAN_DATE");
    }

    return fromGregorianParts({
      year: input.getFullYear(),
      month: input.getMonth() + 1,
      day: input.getDate(),
      hour: input.getHours(),
      minute: input.getMinutes(),
      second: input.getSeconds(),
    });
  }

  return fromGregorian(input);
}

export function getDatePartsInTimezone(date: Date, timezone: string): GregorianDateParts {
  assertValidTimezone(timezone);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    calendar: "gregory",
    numberingSystem: "latn",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const values = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

export function assertValidTimezone(timezone: string) {
  if (!timezone || typeof timezone !== "string") {
    throw new Error("INVALID_TIMEZONE");
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
  } catch {
    throw new Error("INVALID_TIMEZONE");
  }
}

function parseDateOnly(date: string) {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function validateGregorianParts(parts: GregorianDateParts) {
  if (!Number.isInteger(parts.year) || parts.year < LUNAR_LIBRARY.supportedYearStart || parts.year > LUNAR_LIBRARY.supportedYearEnd) {
    throw new Error("UNSUPPORTED_GREGORIAN_YEAR");
  }

  if (!Number.isInteger(parts.month) || parts.month < 1 || parts.month > 12) {
    throw new Error("INVALID_GREGORIAN_MONTH");
  }

  if (!Number.isInteger(parts.day) || parts.day < 1 || parts.day > 31) {
    throw new Error("INVALID_GREGORIAN_DAY");
  }

  const normalized = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  if (
    normalized.getUTCFullYear() !== parts.year ||
    normalized.getUTCMonth() + 1 !== parts.month ||
    normalized.getUTCDate() !== parts.day
  ) {
    throw new Error("INVALID_GREGORIAN_DATE");
  }
}

function getLunarDayLabel(day: number) {
  if (!Number.isInteger(day) || day < 1 || day > 30) {
    throw new Error("INVALID_LUNAR_DAY");
  }

  if (day === 10) return "初十";
  if (day === 20) return "二十";
  if (day === 30) return "三十";

  const prefix = LUNAR_DAY_PREFIX[Math.floor(day / 10)];
  const digit = LUNAR_DAY_DIGITS[day % 10];
  return `${prefix}${digit}`;
}
