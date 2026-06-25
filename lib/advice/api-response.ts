import type { AdviceMeta, AdviceReport } from "./types";
import type { AdviceError } from "./errors";

export type AdviceApiResponse =
  | {
      success: true;
      data: AdviceReport;
      meta: AdviceMeta;
      estimatedCost?: number | null;
      reportId?: string;
      accessToken?: string;
      notice?: string | null;
    }
  | {
      success: false;
      error: AdviceError;
    };

export function createAdviceSuccessResponse(
  data: AdviceReport,
  meta: AdviceMeta,
  extras?: { estimatedCost?: number | null; reportId?: string; accessToken?: string; notice?: string | null },
): AdviceApiResponse {
  return {
    success: true,
    data,
    meta,
    ...extras,
  };
}

export function createAdviceErrorResponse(error: AdviceError): AdviceApiResponse {
  return {
    success: false,
    error,
  };
}
