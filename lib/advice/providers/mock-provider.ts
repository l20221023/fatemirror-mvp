import { ADVICE_ENGINE_VERSION } from "../types";
import type { AdviceProvider, AdviceProviderRequest, AdviceProviderResult } from "./types";

export type MockAdviceProviderBehavior =
  | "success"
  | "invalid_json"
  | "invalid_schema"
  | "prohibited"
  | "timeout"
  | "server_error"
  | "throw";

export class MockAdviceProvider implements AdviceProvider {
  readonly name = "mock" as const;

  constructor(private readonly behavior: MockAdviceProviderBehavior = "success") {}

  isAvailable() {
    return true;
  }

  async generate(request: AdviceProviderRequest): Promise<AdviceProviderResult> {
    if (this.behavior === "throw") {
      throw new Error("MOCK_PROVIDER_FAILURE");
    }

    if (this.behavior === "timeout") {
      throw new Error("ADVICE_AI_TIMEOUT");
    }

    if (this.behavior === "server_error") {
      throw new Error("ADVICE_AI_SERVER_ERROR");
    }

    if (this.behavior === "invalid_json") {
      return {
        provider: this.name,
        model: request.model,
        content: "{not-json",
      };
    }

    if (this.behavior === "invalid_schema") {
      return {
        provider: this.name,
        model: request.model,
        content: JSON.stringify({ headline: "missing required fields" }),
      };
    }

    if (this.behavior === "prohibited") {
      return {
        provider: this.name,
        model: request.model,
        content: JSON.stringify({
          kind: "extended-advice",
          version: ADVICE_ENGINE_VERSION,
          observedSummary: "This is guaranteed to end in marriage.",
          assumptionBoundary: "Some parts are uncertain.",
          traditionalPerspective: ["Destined soulmate match."],
          guidance: {
            nextSteps: ["Push harder until they say yes."],
            boundaries: ["Ignore ordinary boundaries."],
            reflection: "How can you force a final answer?",
            caution: "Absolute certainty is available here.",
          },
          sourceAnchors: {
            observedFacts: [],
            userAssumptions: [],
            traditionalFacts: [],
            unknownFacts: [],
          },
        }),
      };
    }

    return {
      provider: this.name,
      model: request.model,
      content: JSON.stringify({
        kind: "extended-advice",
        version: ADVICE_ENGINE_VERSION,
        observedSummary: request.localAdvice.summary.situation,
        assumptionBoundary:
          request.localAdvice.facts.userAssumptions.length > 0
            ? "Some parts of the story are still assumptions and should not be treated as confirmed."
            : "If a detail has not been confirmed, keep it in the uncertain category.",
        traditionalPerspective: request.localAdvice.summary.traditionalPerspective,
        guidance: {
          nextSteps: request.localAdvice.guidance.nextSteps,
          boundaries: request.localAdvice.guidance.boundaries,
          reflection: request.localAdvice.guidance.reflection,
          caution:
            request.input.locale === "zh"
              ? "请继续以已确认事实、边界和现实行动为准，不把不确定内容说成结论。"
              : "Stay grounded in verified facts, boundaries, and practical action without turning uncertainty into certainty.",
        },
        sourceAnchors: {
          observedFacts: request.localAdvice.facts.observedFacts,
          userAssumptions: request.localAdvice.facts.userAssumptions,
          traditionalFacts: request.localAdvice.facts.traditionalFacts,
          unknownFacts: request.localAdvice.facts.unknownFacts,
        },
      }),
    };
  }
}
