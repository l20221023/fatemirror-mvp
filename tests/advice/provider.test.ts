import { describe, expect, it } from "vitest";

import { MockAdviceProvider } from "../../lib/advice/providers/mock-provider";
import { OpenAIAdviceProvider } from "../../lib/advice/providers/openai-provider";

describe("advice providers", () => {
  it("returns deterministic mock provider JSON", async () => {
    const provider = new MockAdviceProvider("success");
    const result = await provider.generate({
      model: "mock-model",
      timeoutMs: 1000,
      maxOutputTokens: 500,
      prompt: { system: "system", user: "user" },
      input: {
        locale: "en",
        question: "How should I handle this?",
        relationshipStage: "getting-closer",
        primaryConcern: "communication",
      },
      localAdvice: {
        kind: "local-advice",
        version: "0.1.0",
        locale: "en",
        relationshipStage: "getting-closer",
        primaryConcern: "communication",
        facts: {
          observedFacts: ["They reply slowly."],
          userAssumptions: [],
          traditionalFacts: [],
          unknownFacts: [],
          safetyFlags: [],
        },
        safety: { isHighRisk: false, classifications: [] },
        summary: {
          headline: "Lower the heat.",
          situation: "The pace feels uneven.",
          traditionalPerspective: ["No traditional signal was provided."],
          caution: "Stay grounded.",
        },
        guidance: {
          nextSteps: ["Ask one clear question."],
          boundaries: ["Do not spam messages."],
          reflection: "What is actually happening?",
        },
      },
    });

    expect(result.provider).toBe("mock");
    expect(result.content).toContain("extended-advice");
  });

  it("uses the injected OpenAI-like client without real network access", async () => {
    const provider = new OpenAIAdviceProvider("fake-key", {
      responses: {
        create: async () => ({ output_text: "{\"ok\":true}" }),
      },
    });

    const result = await provider.generate({
      model: "fake-model",
      timeoutMs: 1000,
      maxOutputTokens: 300,
      prompt: { system: "system", user: "user" },
      input: {
        locale: "en",
        question: "How should I handle this?",
        relationshipStage: "getting-closer",
        primaryConcern: "communication",
      },
      localAdvice: {
        kind: "local-advice",
        version: "0.1.0",
        locale: "en",
        relationshipStage: "getting-closer",
        primaryConcern: "communication",
        facts: {
          observedFacts: [],
          userAssumptions: [],
          traditionalFacts: [],
          unknownFacts: [],
          safetyFlags: [],
        },
        safety: { isHighRisk: false, classifications: [] },
        summary: {
          headline: "Lower the heat.",
          situation: "The pace feels uneven.",
          traditionalPerspective: ["No traditional signal was provided."],
          caution: "Stay grounded.",
        },
        guidance: {
          nextSteps: ["Ask one clear question."],
          boundaries: ["Do not spam messages."],
          reflection: "What is actually happening?",
        },
      },
    });

    expect(result.provider).toBe("openai");
    expect(result.content).toBe("{\"ok\":true}");
  });
});
