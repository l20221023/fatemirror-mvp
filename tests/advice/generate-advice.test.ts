import { afterEach, describe, expect, it, vi } from "vitest";

import { generateAdvice } from "../../lib/advice/generate-advice";
import { MockAdviceProvider } from "../../lib/advice/providers/mock-provider";

describe("generate-advice", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns local mode without AI", async () => {
    const { report } = await generateAdvice(
      {
        mode: "local",
        locale: "en",
        question: "How should I communicate better?",
        relationshipStage: "conflict-distance",
        primaryConcern: "communication",
      },
      new MockAdviceProvider("success"),
    );

    expect(report.generation.mode).toBe("local");
    expect(report.extendedAdvice).toBeNull();
  });

  it("returns ai mode when AI succeeds", async () => {
    vi.stubEnv("ADVICE_AI_ENABLED", "true");

    const { report } = await generateAdvice(
      {
        mode: "ai",
        locale: "en",
        question: "How should I communicate better?",
        relationshipStage: "conflict-distance",
        primaryConcern: "communication",
      },
      new MockAdviceProvider("success"),
    );

    expect(report.generation.mode).toBe("ai");
    expect(report.extendedAdvice).not.toBeNull();
  });

  it("falls back safely when AI output is invalid", async () => {
    vi.stubEnv("ADVICE_AI_ENABLED", "true");

    const { report } = await generateAdvice(
      {
        mode: "ai",
        locale: "en",
        question: "How should I communicate better?",
        relationshipStage: "conflict-distance",
        primaryConcern: "communication",
      },
      new MockAdviceProvider("invalid_json"),
    );

    expect(report.generation.mode).toBe("ai_fallback");
    expect(report.extendedAdvice).toBeNull();
  });

  it("short-circuits high-risk input before AI generation", async () => {
    vi.stubEnv("ADVICE_AI_ENABLED", "true");

    const { report } = await generateAdvice(
      {
        mode: "ai",
        locale: "en",
        question: "How do I track her phone and make her regret leaving?",
        relationshipStage: "separation",
        primaryConcern: "breakup",
      },
      new MockAdviceProvider("success"),
    );

    expect(report.generation.mode).toBe("high_risk_local");
    expect(report.extendedAdvice).toBeNull();
    expect(report.safety.isHighRisk).toBe(true);
  });
});
