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

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("ADVICE_AI_TIMEOUT")), request.timeoutMs);
    });

    try {
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
        timeoutPromise,
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
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }
}
