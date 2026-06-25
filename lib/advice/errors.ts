export const ADVICE_ERROR_CODES = [
  "INVALID_ADVICE_INPUT",
  "HIGH_RISK_INPUT",
  "TEMPLATE_NOT_FOUND",
  "AI_UNAVAILABLE",
  "AI_OUTPUT_INVALID",
  "REPORT_NOT_FOUND",
  "REPORT_EXPIRED",
  "REPORT_DELETED",
  "ACCESS_DENIED",
  "BETA_DISABLED",
  "RATE_LIMITED",
  "SESSION_EXPIRED",
  "SESSION_REVOKED",
  "INTERNAL_ERROR",
] as const;

export type AdviceErrorCode = (typeof ADVICE_ERROR_CODES)[number];

export type AdviceError = {
  code: AdviceErrorCode;
  message: string;
  field?: string;
};

const ERROR_MESSAGES: Record<AdviceErrorCode, string> = {
  INVALID_ADVICE_INPUT: "Advice input is invalid.",
  HIGH_RISK_INPUT: "High-risk input requires a safety-first response.",
  TEMPLATE_NOT_FOUND: "No local advice template is available for this input.",
  AI_UNAVAILABLE: "AI advice is currently unavailable.",
  AI_OUTPUT_INVALID: "AI advice output did not pass validation.",
  REPORT_NOT_FOUND: "The advice report could not be found.",
  REPORT_EXPIRED: "The advice report has expired.",
  REPORT_DELETED: "The advice report has been deleted.",
  ACCESS_DENIED: "You do not have access to this advice report.",
  BETA_DISABLED: "Closed beta access is currently disabled.",
  RATE_LIMITED: "Too many requests. Please wait and try again.",
  SESSION_EXPIRED: "Your beta session has expired.",
  SESSION_REVOKED: "Your beta session has been revoked.",
  INTERNAL_ERROR: "Advice generation is temporarily unavailable.",
};

export function createAdviceError(
  code: AdviceErrorCode,
  overrides?: Partial<Omit<AdviceError, "code">>,
): AdviceError {
  return {
    code,
    message: overrides?.message ?? ERROR_MESSAGES[code],
    field: overrides?.field,
  };
}
