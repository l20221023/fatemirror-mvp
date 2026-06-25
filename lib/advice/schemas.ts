import { z } from "zod";

import {
  ADVICE_GENERATION_MODES,
  ADVICE_ENGINE_VERSION,
  ADVICE_LOCALES,
  ADVICE_MODES,
  ADVICE_PROVIDER_NAMES,
  PRIMARY_CONCERNS,
  RELATIONSHIP_STAGES,
  SAFETY_FLAG_CODES,
} from "./types";
import { getAdviceRuntimeConfig } from "./runtime";

const { maxInputChars } = getAdviceRuntimeConfig();
const contextMaxChars = maxInputChars * 2;

export const TraditionalSignalSchema = z.object({
  source: z.enum(["ming-gua-match", "xiaoliu-ren", "marriage-direction", "custom"]),
  summary: z.string().min(1).max(240),
});

export const AdviceInputSchema = z.object({
  locale: z.enum(ADVICE_LOCALES),
  question: z.string().trim().min(1).max(maxInputChars),
  relationshipStage: z.enum(RELATIONSHIP_STAGES),
  primaryConcern: z.enum(PRIMARY_CONCERNS),
  contextNotes: z.string().trim().max(contextMaxChars).optional(),
  knownDetails: z.array(z.string().trim().min(1).max(200)).max(12).optional(),
  traditionalSignals: z.array(TraditionalSignalSchema).max(6).optional(),
});

export const AdviceGenerateRequestSchema = AdviceInputSchema.extend({
  mode: z.enum(ADVICE_MODES),
});

export const SafetyClassificationSchema = z.object({
  code: z.enum(SAFETY_FLAG_CODES),
  severity: z.enum(["high", "medium"]),
  matchedText: z.string(),
  reason: z.string(),
});

export const AdviceFactsSchema = z.object({
  observedFacts: z.array(z.string()),
  userAssumptions: z.array(z.string()),
  traditionalFacts: z.array(z.string()),
  unknownFacts: z.array(z.string()),
  safetyFlags: z.array(z.enum(SAFETY_FLAG_CODES)),
});

export const LocalAdviceResultSchema = z.object({
  kind: z.literal("local-advice"),
  version: z.literal(ADVICE_ENGINE_VERSION),
  locale: z.enum(ADVICE_LOCALES),
  relationshipStage: z.enum(RELATIONSHIP_STAGES),
  primaryConcern: z.enum(PRIMARY_CONCERNS),
  facts: AdviceFactsSchema,
  safety: z.object({
    isHighRisk: z.boolean(),
    classifications: z.array(SafetyClassificationSchema),
  }),
  summary: z.object({
    headline: z.string(),
    situation: z.string(),
    traditionalPerspective: z.array(z.string()),
    caution: z.string(),
  }),
  guidance: z.object({
    nextSteps: z.array(z.string()).min(1),
    boundaries: z.array(z.string()).min(1),
    reflection: z.string(),
  }),
});

export const ExtendedAdviceResultSchema = z.object({
  kind: z.literal("extended-advice"),
  version: z.literal(ADVICE_ENGINE_VERSION),
  observedSummary: z.string().min(1).max(500),
  assumptionBoundary: z.string().min(1).max(500),
  traditionalPerspective: z.array(z.string().min(1).max(300)).max(6),
  guidance: z.object({
    nextSteps: z.array(z.string().min(1).max(240)).min(1).max(5),
    boundaries: z.array(z.string().min(1).max(240)).min(1).max(5),
    reflection: z.string().min(1).max(300),
    caution: z.string().min(1).max(300),
  }),
  sourceAnchors: z.object({
    observedFacts: z.array(z.string()).max(12),
    userAssumptions: z.array(z.string()).max(12),
    traditionalFacts: z.array(z.string()).max(6),
    unknownFacts: z.array(z.string()).max(12),
  }),
});

export const AdviceDisplaySchema = z.object({
  headline: z.string(),
  situation: z.string(),
  traditionalPerspective: z.array(z.string()),
  nextSteps: z.array(z.string()).min(1),
  boundaries: z.array(z.string()).min(1),
  reflection: z.string(),
  caution: z.string(),
});

export const AdviceReportSchema = z.object({
  kind: z.literal("advice-report"),
  version: z.literal(ADVICE_ENGINE_VERSION),
  locale: z.enum(ADVICE_LOCALES),
  relationshipStage: z.enum(RELATIONSHIP_STAGES),
  primaryConcern: z.enum(PRIMARY_CONCERNS),
  facts: AdviceFactsSchema,
  safety: z.object({
    isHighRisk: z.boolean(),
    classifications: z.array(SafetyClassificationSchema),
  }),
  localAdvice: LocalAdviceResultSchema,
  extendedAdvice: ExtendedAdviceResultSchema.nullable(),
  display: AdviceDisplaySchema,
  generation: z.object({
    requestedMode: z.enum(ADVICE_MODES),
    mode: z.enum(ADVICE_GENERATION_MODES),
    provider: z.enum(ADVICE_PROVIDER_NAMES).nullable(),
    model: z.string().nullable(),
    aiAvailable: z.boolean(),
  }),
});

export const AdviceMetaSchema = z.object({
  engine: z.literal("advice"),
  engineVersion: z.literal(ADVICE_ENGINE_VERSION),
  generatedAt: z.string().datetime(),
  requestedMode: z.enum(ADVICE_MODES),
  generationMode: z.enum(ADVICE_GENERATION_MODES),
  provider: z.enum(ADVICE_PROVIDER_NAMES).nullable(),
  model: z.string().nullable(),
  aiAvailable: z.boolean(),
  safetyRouted: z.boolean(),
});
