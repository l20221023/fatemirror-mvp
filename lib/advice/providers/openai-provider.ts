import OpenAI from "openai";

import type { AdviceProvider, AdviceProviderRequest, AdviceProviderResult } from "./types";

type OpenAIClientLike = {
  responses: {
    create: (input: {
      model: string;
      input: Array<{
        role: "system" | "user";
        content: Array<{ type: "input_text"; text: string }>;
      }>;
      max_output_tokens: number;
    }) => Promise<{ output_text?: string }>;
  };
};

function createTimeoutPromise(timeoutMs: number) {
  return new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("ADVICE_AI_TIMEOUT")), timeoutMs);
  });
}

export class OpenAIAdviceProvider implements AdviceProvider {
  readonly name = "openai" as const;
  private readonly client: OpenAIClientLike | null;

  constructor(apiKey: string | undefined, client?: OpenAIClientLike) {
    this.client = client ?? (apiKey ? new OpenAI({ apiKey }) : null);
  }

  isAvailable() {
    return Boolean(this.client);
  }

  async generate(request: AdviceProviderRequest): Promise<AdviceProviderResult> {
    if (!this.client) {
      throw new Error("ADVICE_AI_UNAVAILABLE");
    }

    const response = await Promise.race([
      this.client.responses.create({
        model: request.model,
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: request.prompt.system }],
          },
          {
            role: "user",
            content: [{ type: "input_text", text: request.prompt.user }],
          },
        ],
        max_output_tokens: request.maxOutputTokens,
      }),
      createTimeoutPromise(request.timeoutMs),
    ]);

    const content = response.output_text?.trim();
    if (!content) {
      throw new Error("ADVICE_AI_EMPTY_RESPONSE");
    }

    return {
      provider: this.name,
      model: request.model,
      content,
    };
  }
}
