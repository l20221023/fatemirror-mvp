import { createAdviceError } from "./errors";
import { generateLocalAdvice } from "./generate-local-advice";
import { createAdviceMeta } from "./meta";
import { buildAdvicePrompt } from "./prompt-builder";
import { AdviceGenerateRequestSchema, AdviceReportSchema } from "./schemas";
import { getAdviceRuntimeConfig, isRetryableAdviceAiError } from "./runtime";
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
) {
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

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}

function estimateCost(inputTokens: number, outputTokens: number) {
  return Number(((inputTokens * 0.0000018) + (outputTokens * 0.0000024)).toFixed(4));
}

export function getAdviceRuntimeConfigForProvider() {
  return getAdviceRuntimeConfig();
}

export function createAdviceProvider(): AdviceProvider {
  const config = getAdviceRuntimeConfig();

  if (config.provider === "openai") {
    return new OpenAIAdviceProvider(process.env.OPENAI_API_KEY);
  }

  return new MockAdviceProvider(config.mockBehavior as MockAdviceProviderBehavior);
}

export type GenerateAdviceResult = {
  report: AdviceReport;
  meta: ReturnType<typeof createAdviceMeta>;
  diagnostics: {
    durationMs: number;
    estimatedInputTokens: number;
    estimatedOutputTokens: number;
    estimatedCost: number;
    fallbackReasonCode: string | null;
    validationFailureCodes: string[] | null;
  };
};

type GenerateAdviceOptions = {
  betaAccessGranted?: boolean;
  aiRequestAllowed?: boolean;
};

export async function generateAdvice(
  rawInput: AdviceGenerateRequest,
  provider = createAdviceProvider(),
  options: GenerateAdviceOptions = {},
): Promise<GenerateAdviceResult> {
  const startedAt = Date.now();
  const input = AdviceGenerateRequestSchema.parse(rawInput);
  const localAdvice = generateLocalAdvice(input);
  const config = getAdviceRuntimeConfig();
  const betaAccessGranted = options.betaAccessGranted ?? (process.env.NODE_ENV !== "production" || config.betaEnabled);
  const aiRequestAllowed = options.aiRequestAllowed ?? true;

  const estimatedInputTokens = estimateTokens(JSON.stringify(input));

  if (localAdvice.safety.isHighRisk) {
    const report = createFallbackReport(
      input,
      localAdvice,
      "high_risk_local",
      false,
      null,
      null,
    );

    const diagnostics = {
      durationMs: Date.now() - startedAt,
      estimatedInputTokens,
      estimatedOutputTokens: estimateTokens(JSON.stringify(report.display)),
      estimatedCost: 0,
      fallbackReasonCode: "high_risk",
      validationFailureCodes: null,
    };

    return { report, meta: createAdviceMeta(report), diagnostics };
  }

  if (input.mode === "local") {
    const report = createFallbackReport(input, localAdvice, "local", false, null, null);

    const diagnostics = {
      durationMs: Date.now() - startedAt,
      estimatedInputTokens,
      estimatedOutputTokens: estimateTokens(JSON.stringify(report.display)),
      estimatedCost: 0,
      fallbackReasonCode: "local_mode",
      validationFailureCodes: null,
    };

    return { report, meta: createAdviceMeta(report), diagnostics };
  }

  const aiAvailable =
    config.aiEnabled && betaAccessGranted && aiRequestAllowed && provider.isAvailable();

  if (!aiAvailable) {
    const fallbackReasonCode = !config.aiEnabled
      ? "ai_disabled"
      : !betaAccessGranted
        ? "beta_required"
        : !aiRequestAllowed
          ? "rate_limited"
          : provider.isAvailable()
            ? "beta_required"
            : "provider_unavailable";

    const report = createFallbackReport(
      input,
      localAdvice,
      "ai_fallback",
      false,
      provider.isAvailable() ? provider.name : null,
      config.model,
    );

    const diagnostics = {
      durationMs: Date.now() - startedAt,
      estimatedInputTokens,
      estimatedOutputTokens: estimateTokens(JSON.stringify(report.display)),
      estimatedCost: 0,
      fallbackReasonCode,
      validationFailureCodes: null,
    };

    return { report, meta: createAdviceMeta(report), diagnostics };
  }

  try {
    const prompt = buildAdvicePrompt(input, localAdvice);
    const aiResult = await provider.generate({
      model: config.model,
      timeoutMs: config.requestTimeoutMs,
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

      const diagnostics = {
        durationMs: Date.now() - startedAt,
        estimatedInputTokens,
        estimatedOutputTokens: estimateTokens(aiResult.content),
        estimatedCost: estimateCost(estimatedInputTokens, estimateTokens(aiResult.content)),
        fallbackReasonCode: validated.reason,
        validationFailureCodes: validated.violations ?? null,
      };

      return { report, meta: createAdviceMeta(report), diagnostics };
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

    const diagnostics = {
      durationMs: Date.now() - startedAt,
      estimatedInputTokens,
      estimatedOutputTokens: estimateTokens(aiResult.content),
      estimatedCost: estimateCost(estimatedInputTokens, estimateTokens(aiResult.content)),
      fallbackReasonCode: null,
      validationFailureCodes: null,
    };

    return { report, meta: createAdviceMeta(report), diagnostics };
  } catch (error) {
    if (isRetryableAdviceAiError(error)) {
      try {
        const prompt = buildAdvicePrompt(input, localAdvice);
        const aiResult = await provider.generate({
          model: config.model,
          timeoutMs: config.requestTimeoutMs,
          maxOutputTokens: config.maxOutputTokens,
          prompt,
          input,
          localAdvice,
        });

        const validated = parseAndValidateExtendedAdvice(
          aiResult.content,
          localAdvice.facts,
        );

        if (validated.success) {
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

          const diagnostics = {
            durationMs: Date.now() - startedAt,
            estimatedInputTokens,
            estimatedOutputTokens: estimateTokens(aiResult.content),
            estimatedCost: estimateCost(estimatedInputTokens, estimateTokens(aiResult.content)),
            fallbackReasonCode: null,
            validationFailureCodes: null,
          };

          return { report, meta: createAdviceMeta(report), diagnostics };
        }
      } catch {
        // fall through to local fallback
      }
    }

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

    const diagnostics = {
      durationMs: Date.now() - startedAt,
      estimatedInputTokens,
      estimatedOutputTokens: estimateTokens(JSON.stringify(report.display)),
      estimatedCost: 0,
      fallbackReasonCode: isRetryableAdviceAiError(error)
        ? "provider_retry_failed"
        : error instanceof Error && error.message.toLowerCase().includes("timeout")
          ? "timeout"
          : "provider_error",
      validationFailureCodes: null,
    };

    return { report, meta: createAdviceMeta(report), diagnostics };
  }
}

export function mapAdviceError(error: unknown) {
  if (error instanceof Error && error.message.includes("invalid")) {
    return createAdviceError("INVALID_ADVICE_INPUT");
  }

  return createAdviceError("INVALID_ADVICE_INPUT");
}
