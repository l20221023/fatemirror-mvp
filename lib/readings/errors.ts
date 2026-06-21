export const READING_ERROR_CODES = [
  "INVALID_INPUT",
  "INVALID_DATE",
  "UNSUPPORTED_GREGORIAN_YEAR",
  "INVALID_TIMEZONE",
  "LUNAR_CONVERSION_FAILED",
  "CALCULATION_FAILED",
  "INTERPRETATION_UNAVAILABLE",
  "INTERNAL_ERROR",
] as const;

export type ReadingErrorCode = (typeof READING_ERROR_CODES)[number];

export type ReadingError = {
  code: ReadingErrorCode;
  message: string;
  field?: string;
};

const ERROR_MESSAGES: Record<ReadingErrorCode, string> = {
  INVALID_INPUT: "输入内容不完整或格式不正确。",
  INVALID_DATE: "日期格式无效，请检查后重试。",
  UNSUPPORTED_GREGORIAN_YEAR: "当前只支持 1900 到 2100 年的公历日期。",
  INVALID_TIMEZONE: "时区参数无效，请使用标准 IANA 时区。",
  LUNAR_CONVERSION_FAILED: "农历转换失败，请改为手动输入或检查日期。",
  CALCULATION_FAILED: "本次计算未能完成，请稍后重试。",
  INTERPRETATION_UNAVAILABLE: "扩展解读暂时不可用，基础计算结果不受影响。",
  INTERNAL_ERROR: "系统暂时不可用，请稍后再试。",
};

export function createReadingError(
  code: ReadingErrorCode,
  overrides?: Partial<Omit<ReadingError, "code">>,
): ReadingError {
  return {
    code,
    message: overrides?.message ?? ERROR_MESSAGES[code],
    field: overrides?.field,
  };
}

export function mapErrorToReadingError(error: unknown): ReadingError {
  const message = error instanceof Error ? error.message : "INTERNAL_ERROR";

  switch (message) {
    case "INVALID_GREGORIAN_DATE":
    case "INVALID_GREGORIAN_MONTH":
    case "INVALID_GREGORIAN_DAY":
    case "INVALID_OCCURRED_AT":
      return createReadingError("INVALID_DATE");
    case "UNSUPPORTED_GREGORIAN_YEAR":
    case "INVALID_BIRTH_YEAR":
      return createReadingError("UNSUPPORTED_GREGORIAN_YEAR");
    case "INVALID_TIMEZONE":
      return createReadingError("INVALID_TIMEZONE");
    case "INVALID_INPUT":
    case "INVALID_GENDER":
    case "INVALID_PERSON":
    case "INVALID_VALUE":
    case "INVALID_PALACE_NUMBER":
    case "INVALID_HOUR":
    case "INVALID_LUNAR_MONTH":
    case "INVALID_LUNAR_DAY":
      return createReadingError("INVALID_INPUT");
    default:
      return createReadingError("CALCULATION_FAILED");
  }
}
