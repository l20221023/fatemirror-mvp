import type { ReadingError } from "./errors";
import type { MethodMeta } from "./meta";

export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      meta: MethodMeta;
    }
  | {
      success: false;
      error: ReadingError;
    };

export function createSuccessResponse<T>(data: T, meta: MethodMeta): ApiResponse<T> {
  return {
    success: true,
    data,
    meta,
  };
}

export function createErrorResponse(error: ReadingError): ApiResponse<never> {
  return {
    success: false,
    error,
  };
}
