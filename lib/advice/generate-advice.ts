import { createAdviceError } from "./errors";
import { generateLocalAdvice } from "./generate-local-advice";
import { createAdviceMeta } from "./meta";
import { buildAdvicePrompt } from "./prompt-builder";
import { AdviceGenerateRequestSchema, AdviceReportSchema } from "./schemas";
import { parseAndValidateExtendedAdvice } from "./validators/output-validator";
import { MockAdviceProvider, type MockAdviceProviderBehavior } from "./providers/mock-provider";
import { OpenAIAdviceProvider } from "./providers/openai-provider";
import type { AdviceProvider } from "./providers/types";
import type {
  AdviceDisplay,
  AdviceGenerateRequest,
  AdviceProviderName,
  AdviceReport,
  ExtendedAdviceResult,
} from "./types";

function envFlag(name: string, fallback = false) {
  const value = process.env[name];
  if (!value) return fallback;
  return value === "1" || value.toLowerCase() === "true";
}

function envNumber(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function getAdviceRuntimeConfig() {
  return {
    aiEnabled: envFlag("ADVICE_AI_ENABLED", false),
    provider: (process.env.ADVICE_AI_PROVIDER === "openai" ? "openai" : "mock") as AdviceProviderName,
    model: process.env.ADVICE_AI_MODEL || "gpt-4o-mini",
    timeoutMs: envNumber("ADVICE_AI_TIMEOUT_MS", 8000),
    maxOutputTokens: envNumber("ADVICE_AI_MAX_OUTPUT", 700),
    mockBehavior: (process.env.MOCK_ADVICE_PROVIDER_BEHAVIOR || "success") as MockAdviceProviderBehavior,
  };
}

export function createAdviceProvider(): AdviceProvider {
  const config = getAdviceRuntimeConfig();

  if (config.provider === "openai") {
    return new OpenAIAdviceProvider(process.env.OPENAI_API_KEY);
  }

  return new MockAdviceProvider(config.mockBehavior);
}

function buildDisplay(
  localAdvice: AdviceReport["localAdvice"],
  extendedAdvice: ExtendedAdviceResult | null,
): AdviceDisplay {
  return extendedAdvice
    ? {
        headline: localAdvice.summary.headline,
        situation: extendedAdvice.observedSummary,
        traditionalPerspective: extendedAdvice.traditionalPerspective,
        nextSteps: extendedAdvice.guidance.nextSteps,
        boundaries: extendedAdvice.guidance.boundaries,
        reflection: extendedAdvice.guidance.reflection,
        caution: extendedAdvice.guidance.caution,
      }
    : {
        headline: localAdvice.summary.headline,
        situation: localAdvice.summary.situation,
        traditionalPerspective: localAdvice.summary.traditionalPerspective,
        nextSteps: localAdvice.guidance.nextSteps,
        boundaries: localAdvice.guidance.boundaries,
        reflection: localAdvice.guidance.reflection,
        caution: localAdvice.summary.caution,
      };
}

function createFallbackReport(
  input: AdviceGenerateRequest,
  localAdvice: AdviceReport["localAdvice"],
  mode: AdviceReport["generation"]["mode"],
  aiAvailable: boolean,
  provider: AdviceProviderName | null,
  model: string | null,
): AdviceReport {
  return AdviceReportSchema.parse({
    kind: "advice-report",
    version: localAdvice.version,
    locale: input.locale,
    relationshipStage: input.relationshipStage,
    primaryConcern: input.primaryConcern,
    facts: localAdvice.facts,
    safety: localAdvice.safety,
    localAdvice,
    extendedAdvice: null,
    display: buildDisplay(localAdvice, null),
    generation: {
      requestedMode: input.mode,
      mode,
      provider,
      model,
      aiAvailable,
    },
  });
}

function logAdviceEvent(event: string, details: Record<string, unknown>) {
  console.error(`[advice] ${event}`, details);
}

export async function generateAdvice(
  rawInput: AdviceGenerateRequest,
  provider = createAdviceProvider(),
) {
  const input = AdviceGenerateRequestSchema.parse(rawInput);
  const localAdvice = generateLocalAdvice(input);
  const config = getAdviceRuntimeConfig();

  if (localAdvice.safety.isHighRisk) {
    const report = createFallbackReport(
      input,
      localAdvice,
      "high_risk_local",
      false,
      null,
      null,
    );
    return { report, meta: createAdviceMeta(report) };
  }

  if (input.mode === "local") {
    const report = createFallbackReport(input, localAdvice, "local", false, null, null);
    return { report, meta: createAdviceMeta(report) };
  }

  const aiAvailable = config.aiEnabled && provider.isAvailable();
  if (!aiAvailable) {
    const report = createFallbackReport(
      input,
      localAdvice,
      "ai_fallback",
      false,
      provider.isAvailable() ? provider.name : null,
      config.model,
    );
    return { report, meta: createAdviceMeta(report) };
  }

  try {
    const prompt = buildAdvicePrompt(input, localAdvice);
    const aiResult = await provider.generate({
      model: config.model,
      timeoutMs: config.timeoutMs,
      maxOutputTokens: config.maxOutputTokens,
      prompt,
      input,
      localAdvice,
    });

    const validated = parseAndValidateExtendedAdvice(
      aiResult.content,
      localAdvice.facts,
    );

    if (!validated.success) {
      logAdviceEvent("ai_output_rejected", {
        provider: aiResult.provider,
        model: aiResult.model,
        reason: validated.reason,
        violations: validated.violations?.length ?? 0,
      });
      const report = createFallbackReport(
        input,
        localAdvice,
        "ai_fallback",
        true,
        aiResult.provider,
        aiResult.model,
      );
      return { report, meta: createAdviceMeta(report) };
    }

    const report = AdviceReportSchema.parse({
      kind: "advice-report",
      version: localAdvice.version,
      locale: input.locale,
      relationshipStage: input.relationshipStage,
      primaryConcern: input.primaryConcern,
      facts: localAdvice.facts,
      safety: localAdvice.safety,
      localAdvice,
      extendedAdvice: validated.data,
      display: buildDisplay(localAdvice, validated.data),
      generation: {
        requestedMode: input.mode,
        mode: "ai",
        provider: aiResult.provider,
        model: aiResult.model,
        aiAvailable: true,
      },
    });

    return { report, meta: createAdviceMeta(report) };
  } catch (error) {
    logAdviceEvent("ai_generation_failed", {
      provider: provider.name,
      model: config.model,
      reason: error instanceof Error ? error.message : "unknown",
    });
    const report = createFallbackReport(
      input,
      localAdvice,
      "ai_fallback",
      true,
      provider.name,
      config.model,
    );
    return { report, meta: createAdviceMeta(report) };
  }
}

export function mapAdviceError(error: unknown) {
  if (error instanceof Error && error.message.includes("invalid")) {
    return createAdviceError("INVALID_ADVICE_INPUT");
  }

  return createAdviceError("INVALID_ADVICE_INPUT");
}
