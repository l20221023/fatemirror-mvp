export const ADVICE_ENGINE_VERSION = "0.3.0";
export const ADVICE_PROMPT_VERSION = "v0.3.0";

export const ADVICE_LOCALES = ["zh", "en"] as const;
export type AdviceLocale = (typeof ADVICE_LOCALES)[number];
export const ADVICE_MODES = ["local", "ai"] as const;
export type AdviceMode = (typeof ADVICE_MODES)[number];
export const ADVICE_GENERATION_MODES = [
  "local",
  "ai",
  "ai_fallback",
  "high_risk_local",
] as const;
export type AdviceGenerationMode = (typeof ADVICE_GENERATION_MODES)[number];
export const ADVICE_PROVIDER_NAMES = ["openai", "mock"] as const;
export type AdviceProviderName = (typeof ADVICE_PROVIDER_NAMES)[number];

export const RELATIONSHIP_STAGES = [
  "early-contact",
  "getting-closer",
  "unclear-relationship",
  "committed",
  "conflict-distance",
  "separation",
] as const;
export type RelationshipStage = (typeof RELATIONSHIP_STAGES)[number];

export const PRIMARY_CONCERNS = [
  "intentions",
  "communication",
  "trust",
  "distance",
  "commitment",
  "breakup",
] as const;
export type PrimaryConcern = (typeof PRIMARY_CONCERNS)[number];

export const SAFETY_FLAG_CODES = [
  "violence_or_threat",
  "self_harm",
  "stalking_or_surveillance",
  "coercion_or_control",
  "revenge_or_manipulation",
  "minor_related",
  "medical_or_pregnancy",
  "severe_delusion",
] as const;
export type SafetyFlagCode = (typeof SAFETY_FLAG_CODES)[number];

export type TraditionalSignal = {
  source: "ming-gua-match" | "xiaoliu-ren" | "marriage-direction" | "custom";
  summary: string;
};

export type AdviceInput = {
  locale: AdviceLocale;
  question: string;
  relationshipStage: RelationshipStage;
  primaryConcern: PrimaryConcern;
  contextNotes?: string;
  knownDetails?: string[];
  traditionalSignals?: TraditionalSignal[];
};

export type SafetyClassification = {
  code: SafetyFlagCode;
  severity: "high" | "medium";
  matchedText: string;
  reason: string;
};

export type AdviceFacts = {
  observedFacts: string[];
  userAssumptions: string[];
  traditionalFacts: string[];
  unknownFacts: string[];
  safetyFlags: SafetyFlagCode[];
};

export type LocalAdviceResult = {
  kind: "local-advice";
  version: typeof ADVICE_ENGINE_VERSION;
  locale: AdviceLocale;
  relationshipStage: RelationshipStage;
  primaryConcern: PrimaryConcern;
  facts: AdviceFacts;
  safety: {
    isHighRisk: boolean;
    classifications: SafetyClassification[];
  };
  summary: {
    headline: string;
    situation: string;
    traditionalPerspective: string[];
    caution: string;
  };
  guidance: {
    nextSteps: string[];
    boundaries: string[];
    reflection: string;
  };
};

export type ExtendedAdviceResult = {
  kind: "extended-advice";
  version: typeof ADVICE_ENGINE_VERSION;
  observedSummary: string;
  assumptionBoundary: string;
  traditionalPerspective: string[];
  guidance: {
    nextSteps: string[];
    boundaries: string[];
    reflection: string;
    caution: string;
  };
  sourceAnchors: {
    observedFacts: string[];
    userAssumptions: string[];
    traditionalFacts: string[];
    unknownFacts: string[];
  };
};

export type AdviceDisplay = {
  headline: string;
  situation: string;
  traditionalPerspective: string[];
  nextSteps: string[];
  boundaries: string[];
  reflection: string;
  caution: string;
};

export type AdviceReport = {
  kind: "advice-report";
  version: typeof ADVICE_ENGINE_VERSION;
  locale: AdviceLocale;
  relationshipStage: RelationshipStage;
  primaryConcern: PrimaryConcern;
  facts: AdviceFacts;
  safety: LocalAdviceResult["safety"];
  localAdvice: LocalAdviceResult;
  extendedAdvice: ExtendedAdviceResult | null;
  display: AdviceDisplay;
  generation: {
    requestedMode: AdviceMode;
    mode: AdviceGenerationMode;
    provider: AdviceProviderName | null;
    model: string | null;
    aiAvailable: boolean;
  };
};

export type AdviceMeta = {
  engine: "advice";
  engineVersion: typeof ADVICE_ENGINE_VERSION;
  generatedAt: string;
  requestedMode: AdviceMode;
  generationMode: AdviceGenerationMode;
  provider: AdviceProviderName | null;
  model: string | null;
  aiAvailable: boolean;
  safetyRouted: boolean;
};

export type AdviceGenerateRequest = AdviceInput & {
  mode: AdviceMode;
};
