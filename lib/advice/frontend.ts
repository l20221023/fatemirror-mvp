import { AdviceGenerateRequestSchema } from "./schemas";
import type {
  AdviceGenerateRequest,
  AdviceLocale,
  AdviceMode,
  PrimaryConcern,
  RelationshipStage,
  TraditionalSignal,
} from "./types";

export const QUESTION_MAX_LENGTH = 500;
export const CONTEXT_MAX_LENGTH = 1000;
export const KNOWN_DETAIL_MAX_LENGTH = 200;
export const KNOWN_DETAILS_MAX_ITEMS = 12;
export const TRADITIONAL_SIGNAL_MAX_LENGTH = 240;
export const TRADITIONAL_SIGNALS_MAX_ITEMS = 6;

export type AdviceFormDraft = {
  locale: AdviceLocale;
  mode: AdviceMode;
  relationshipStage: RelationshipStage | "";
  primaryConcern: PrimaryConcern | "";
  question: string;
  contextNotes: string;
  knownDetails: string[];
  traditionalSignals: Array<{
    source: TraditionalSignal["source"];
    summary: string;
  }>;
  privacyConfirmed: boolean;
  aiConfirmed: boolean;
};

export type AdviceFormValidation = {
  isValid: boolean;
  formError:
    | null
    | "validation"
    | "privacy_required"
    | "ai_confirmation_required";
  fieldErrors: Partial<
    Record<
      | "relationshipStage"
      | "primaryConcern"
      | "question"
      | "contextNotes"
      | "knownDetails"
      | "traditionalSignals",
      string
    >
  >;
};

export function createEmptyAdviceForm(locale: AdviceLocale): AdviceFormDraft {
  return {
    locale,
    mode: "local",
    relationshipStage: "",
    primaryConcern: "",
    question: "",
    contextNotes: "",
    knownDetails: [""],
    traditionalSignals: [],
    privacyConfirmed: false,
    aiConfirmed: false,
  };
}

function trimList(items: string[]) {
  return items.map((item) => item.trim()).filter(Boolean);
}

function trimSignals(items: AdviceFormDraft["traditionalSignals"]) {
  return items
    .map((item) => ({
      source: item.source,
      summary: item.summary.trim(),
    }))
    .filter((item) => item.summary);
}

export function buildAdviceGenerateRequest(
  draft: AdviceFormDraft,
): AdviceGenerateRequest {
  const payload = {
    locale: draft.locale,
    mode: draft.mode,
    relationshipStage: draft.relationshipStage,
    primaryConcern: draft.primaryConcern,
    question: draft.question.trim(),
    contextNotes: draft.contextNotes.trim() || undefined,
    knownDetails: trimList(draft.knownDetails),
    traditionalSignals: trimSignals(draft.traditionalSignals),
  };

  return AdviceGenerateRequestSchema.parse({
    ...payload,
    knownDetails: payload.knownDetails.length > 0 ? payload.knownDetails : undefined,
    traditionalSignals:
      payload.traditionalSignals.length > 0 ? payload.traditionalSignals : undefined,
  });
}

export function validateAdviceForm(draft: AdviceFormDraft): AdviceFormValidation {
  const fieldErrors: AdviceFormValidation["fieldErrors"] = {};

  if (!draft.relationshipStage) {
    fieldErrors.relationshipStage = "required";
  }

  if (!draft.primaryConcern) {
    fieldErrors.primaryConcern = "required";
  }

  if (!draft.question.trim()) {
    fieldErrors.question = "required";
  } else if (draft.question.trim().length > QUESTION_MAX_LENGTH) {
    fieldErrors.question = "too_long";
  }

  if (draft.contextNotes.trim().length > CONTEXT_MAX_LENGTH) {
    fieldErrors.contextNotes = "too_long";
  }

  const knownDetails = trimList(draft.knownDetails);
  if (knownDetails.length > KNOWN_DETAILS_MAX_ITEMS) {
    fieldErrors.knownDetails = "too_many";
  } else if (knownDetails.some((item) => item.length > KNOWN_DETAIL_MAX_LENGTH)) {
    fieldErrors.knownDetails = "too_long";
  }

  const traditionalSignals = trimSignals(draft.traditionalSignals);
  if (traditionalSignals.length > TRADITIONAL_SIGNALS_MAX_ITEMS) {
    fieldErrors.traditionalSignals = "too_many";
  } else if (
    traditionalSignals.some((item) => item.summary.length > TRADITIONAL_SIGNAL_MAX_LENGTH)
  ) {
    fieldErrors.traditionalSignals = "too_long";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      isValid: false,
      formError: "validation",
      fieldErrors,
    };
  }

  if (!draft.privacyConfirmed) {
    return {
      isValid: false,
      formError: "privacy_required",
      fieldErrors,
    };
  }

  if (draft.mode === "ai" && !draft.aiConfirmed) {
    return {
      isValid: false,
      formError: "ai_confirmation_required",
      fieldErrors,
    };
  }

  try {
    buildAdviceGenerateRequest(draft);
    return { isValid: true, formError: null, fieldErrors };
  } catch {
    return {
      isValid: false,
      formError: "validation",
      fieldErrors: {
        ...fieldErrors,
        question: fieldErrors.question ?? "invalid",
      },
    };
  }
}

export function canAddKnownDetail(draft: AdviceFormDraft) {
  return draft.knownDetails.length < KNOWN_DETAILS_MAX_ITEMS;
}

export function canAddTraditionalSignal(draft: AdviceFormDraft) {
  return draft.traditionalSignals.length < TRADITIONAL_SIGNALS_MAX_ITEMS;
}
