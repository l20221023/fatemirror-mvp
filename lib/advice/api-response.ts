import type { AdviceMeta, AdviceReport } from "./types";
import type { AdviceError } from "./errors";

export type AdviceApiResponse =
  | {
      success: true;
      data: AdviceReport;
      meta: AdviceMeta;
    }
  | {
      success: false;
      error: AdviceError;
    };

export function createAdviceSuccessResponse(
  data: AdviceReport,
  meta: AdviceMeta,
): AdviceApiResponse {
  return {
    success: true,
    data,
    meta,
  };
}

export function createAdviceErrorResponse(error: AdviceError): AdviceApiResponse {
  return {
    success: false,
    error,
  };
}
