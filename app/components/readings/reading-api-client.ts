"use client";

import type { ApiResponse } from "../../../lib/readings/api-response";

export async function postReading<TRequest, TResponse>(
  url: string,
  payload: TRequest,
): Promise<ApiResponse<TResponse>> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await response.json().catch(() => null)) as ApiResponse<TResponse> | null;
  if (!json) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "系统暂时不可用，请稍后再试。",
      },
    };
  }

  return json;
}
