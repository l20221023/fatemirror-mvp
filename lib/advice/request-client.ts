import type { AdviceApiResponse } from "./api-response";
import type { AdviceGenerateRequest } from "./types";

export type AdviceClientErrorCode =
  | "timeout"
  | "network"
  | "invalid_response"
  | "request_failed";

export class AdviceClientError extends Error {
  constructor(
    readonly code: AdviceClientErrorCode,
    readonly status?: number,
    readonly apiCode?: string,
  ) {
    super(code);
    this.name = "AdviceClientError";
  }
}

export type AdviceRequestClientOptions = {
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export async function postAdviceRequest(
  payload: AdviceGenerateRequest,
  options: AdviceRequestClientOptions = {},
) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 9000);

  try {
    const response = await fetchImpl("/api/advice/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const json = (await response.json().catch(() => null)) as AdviceApiResponse | null;
    if (!json) {
      throw new AdviceClientError("invalid_response", response.status);
    }

    if (!json.success) {
      throw new AdviceClientError(
        "request_failed",
        response.status,
        json.error.code,
      );
    }

    return json;
  } catch (error) {
    if (error instanceof AdviceClientError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new AdviceClientError("timeout");
    }

    throw new AdviceClientError("network");
  } finally {
    clearTimeout(timeout);
  }
}
