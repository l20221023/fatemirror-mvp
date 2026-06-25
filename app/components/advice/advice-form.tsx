"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  type AdviceClientErrorCode,
  type AdviceLocale,
  buildAdviceGenerateRequest,
  canAddKnownDetail,
  canAddTraditionalSignal,
  createEmptyAdviceForm,
  saveAdviceAccessToken,
  postAdviceRequest,
  validateAdviceForm,
} from "../../../lib/advice";
import type { AdviceUiCopy } from "../../../lib/advice/ui-copy";
import { useAdviceFlow } from "./advice-flow-provider";
import { AdviceSubmitState } from "./advice-submit-state";
import { KnownDetailsField } from "./known-details-field";
import { PrimaryConcernField } from "./primary-concern-field";
import { RelationshipStageField } from "./relationship-stage-field";
import { TraditionalSignalsField } from "./traditional-signals-field";

type AdviceFormProps = {
  locale: AdviceLocale;
  copy: AdviceUiCopy;
};

function mapErrorCodeToMessage(
  code: AdviceClientErrorCode | "validation" | "privacy_required" | "ai_confirmation_required",
  copy: AdviceUiCopy,
) {
  switch (code) {
    case "timeout":
      return copy.errors.timeout;
    case "network":
      return copy.errors.network;
    case "invalid_response":
      return copy.errors.invalidResponse;
    case "privacy_required":
      return copy.errors.privacyRequired;
    case "ai_confirmation_required":
      return copy.errors.aiConfirmationRequired;
    case "request_failed":
    case "validation":
    default:
      return copy.errors.requestFailed;
  }
}

export function AdviceForm({ locale, copy }: AdviceFormProps) {
  const router = useRouter();
  const flow = useAdviceFlow();
  const [draft, setDraft] = useState(() =>
    flow.draft?.locale === locale ? flow.draft : createEmptyAdviceForm(locale),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusAction, setStatusAction] = useState<"retry" | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function patchDraft(next: Partial<typeof draft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function updateKnownDetail(index: number, value: string) {
    setDraft((current) => ({
      ...current,
      knownDetails: current.knownDetails.map((item, itemIndex) =>
        itemIndex === index ? value : item,
      ),
    }));
  }

  function updateTraditionalSignal(
    index: number,
    value: { source: string; summary: string },
  ) {
    setDraft((current) => ({
      ...current,
      traditionalSignals: current.traditionalSignals.map((item, itemIndex) =>
        itemIndex === index
          ? {
              source: value.source as (typeof current.traditionalSignals)[number]["source"],
              summary: value.summary,
            }
          : item,
      ),
    }));
  }

  async function submitCurrentDraft() {
    if (isSubmitting) return;

    const validation = validateAdviceForm(draft);
    setFieldErrors(validation.fieldErrors);

    if (!validation.isValid) {
      const message =
        validation.formError === "privacy_required" ||
        validation.formError === "ai_confirmation_required"
          ? mapErrorCodeToMessage(validation.formError, copy)
          : copy.errors.validation;
      setStatusMessage(message);
      setStatusAction(null);
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    setStatusAction(null);

    try {
      const payload = buildAdviceGenerateRequest(draft);
      const response = await postAdviceRequest(payload);

      flow.setDraft({ ...draft, locale });
      flow.setResult(response.data, response.meta, response.notice ?? null);
      if (response.reportId && response.accessToken) {
        saveAdviceAccessToken(response.reportId, response.accessToken);
        router.push(`/${locale}/reading/advice/result/${response.reportId}`);
      } else {
        router.push(`/${locale}/reading/advice/result`);
      }
    } catch (error) {
      const errorCode =
        error instanceof Error && "code" in error
          ? (error.code as AdviceClientErrorCode)
          : "request_failed";

      setStatusMessage(mapErrorCodeToMessage(errorCode, copy));
      setStatusAction(errorCode === "timeout" ? "retry" : null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 shadow-[0_24px_80px_rgba(4,10,16,0.35)]">
      <div className="mb-8">
        <h2 className="font-serif text-3xl">{copy.page.formTitle}</h2>
        <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">
          {copy.page.formIntro}
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submitCurrentDraft();
        }}
        className="space-y-6"
      >
        <section className="rounded-[1.25rem] border border-white/10 bg-black/10 p-5">
          <p className="text-sm text-[color:var(--color-muted)]">
            {copy.form.modeLabel}
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {copy.form.modeOptions.map((option) => {
              const active = draft.mode === option.value;
              return (
                <label
                  key={option.value}
                  className={`rounded-[1.25rem] border p-4 transition ${
                    active
                      ? "border-[color:var(--color-accent)] bg-[rgba(196,155,98,0.12)]"
                      : "border-white/10 bg-white/4"
                  }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value={option.value}
                    checked={active}
                    onChange={() => patchDraft({ mode: option.value })}
                    className="sr-only"
                  />
                  <p className="text-sm text-[color:var(--color-foreground)]">
                    {option.label}
                  </p>
                  <p className="mt-2 text-xs leading-6 text-[color:var(--color-muted)]">
                    {option.description}
                  </p>
                </label>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6 sm:grid-cols-2">
          <RelationshipStageField
            label={copy.form.relationshipStage}
            value={draft.relationshipStage}
            options={copy.form.stageOptions}
            hasError={Boolean(fieldErrors.relationshipStage)}
            onChange={(value) =>
              patchDraft({
                relationshipStage:
                  value as (typeof draft)["relationshipStage"],
              })
            }
          />
          <PrimaryConcernField
            label={copy.form.primaryConcern}
            value={draft.primaryConcern}
            options={copy.form.concernOptions}
            hasError={Boolean(fieldErrors.primaryConcern)}
            onChange={(value) =>
              patchDraft({
                primaryConcern: value as (typeof draft)["primaryConcern"],
              })
            }
          />
        </div>

        <label className="block">
          <span className="mb-3 block text-sm text-[color:var(--color-muted)]">
            {copy.form.question}
          </span>
          <textarea
            value={draft.question}
            onChange={(event) => patchDraft({ question: event.target.value })}
            rows={5}
            maxLength={500}
            aria-invalid={Boolean(fieldErrors.question) || undefined}
            placeholder={copy.form.questionPlaceholder}
            className={`w-full rounded-[1rem] border bg-black/15 px-4 py-3 text-sm leading-7 outline-none placeholder:text-[color:rgba(244,239,228,0.34)] ${
              fieldErrors.question
                ? "border-[color:rgba(196,155,98,0.48)]"
                : "border-white/12 focus:border-[color:var(--color-accent)]"
            }`}
          />
          <p className="mt-2 text-xs text-[color:var(--color-muted)]">
            {copy.form.questionCountLabel}: {draft.question.trim().length}/500
          </p>
        </label>

        <label className="block">
          <span className="mb-3 block text-sm text-[color:var(--color-muted)]">
            {copy.form.contextNotes}
          </span>
          <textarea
            value={draft.contextNotes}
            onChange={(event) => patchDraft({ contextNotes: event.target.value })}
            rows={5}
            maxLength={1000}
            aria-invalid={Boolean(fieldErrors.contextNotes) || undefined}
            placeholder={copy.form.contextPlaceholder}
            className={`w-full rounded-[1rem] border bg-black/15 px-4 py-3 text-sm leading-7 outline-none placeholder:text-[color:rgba(244,239,228,0.34)] ${
              fieldErrors.contextNotes
                ? "border-[color:rgba(196,155,98,0.48)]"
                : "border-white/12 focus:border-[color:var(--color-accent)]"
            }`}
          />
          <p className="mt-2 text-xs text-[color:var(--color-muted)]">
            {copy.form.contextCountLabel}: {draft.contextNotes.trim().length}/1000
          </p>
        </label>

        <KnownDetailsField
          label={copy.form.knownDetails}
          hint={copy.form.knownDetailsHint}
          placeholder={copy.form.knownDetailsPlaceholder}
          removeLabel={copy.form.removeItem}
          addLabel={copy.form.addKnownDetail}
          details={draft.knownDetails}
          canAdd={canAddKnownDetail(draft)}
          hasError={Boolean(fieldErrors.knownDetails)}
          onChange={updateKnownDetail}
          onAdd={() =>
            setDraft((current) => ({
              ...current,
              knownDetails: [...current.knownDetails, ""],
            }))
          }
          onRemove={(index) =>
            setDraft((current) => {
              const next = current.knownDetails.filter((_, itemIndex) => itemIndex !== index);
              return {
                ...current,
                knownDetails: next.length > 0 ? next : [""],
              };
            })
          }
        />

        <TraditionalSignalsField
          title={copy.form.traditionalSignals}
          hint={copy.form.traditionalSignalsHint}
          sourceLabel={copy.form.signalSource}
          summaryLabel={copy.form.signalSummary}
          summaryPlaceholder={copy.form.signalSummaryPlaceholder}
          addLabel={copy.form.addTraditionalSignal}
          removeLabel={copy.form.removeItem}
          sourceOptions={copy.form.sourceOptions}
          items={draft.traditionalSignals}
          canAdd={canAddTraditionalSignal(draft)}
          hasError={Boolean(fieldErrors.traditionalSignals)}
          onAdd={() =>
            setDraft((current) => ({
              ...current,
              traditionalSignals: [
                ...current.traditionalSignals,
                { source: "custom", summary: "" },
              ],
            }))
          }
          onChange={updateTraditionalSignal}
          onRemove={(index) =>
            setDraft((current) => ({
              ...current,
              traditionalSignals: current.traditionalSignals.filter(
                (_, itemIndex) => itemIndex !== index,
              ),
            }))
          }
        />

        <div className="space-y-3 rounded-[1.25rem] border border-white/10 bg-black/10 p-5">
          <p className="text-sm leading-7 text-[color:var(--color-muted)]">
            {copy.form.privacyReminder}
          </p>
          <p className="text-sm leading-7 text-[color:var(--color-muted)]">
            {copy.form.identityReminder}
          </p>
          <label className="flex gap-3 text-sm leading-7 text-[color:var(--color-foreground)]">
            <input
              type="checkbox"
              checked={draft.privacyConfirmed}
              onChange={(event) =>
                patchDraft({ privacyConfirmed: event.target.checked })
              }
              className="mt-1 size-4 rounded border-white/20 bg-black/20"
            />
            <span>{copy.form.privacyConfirmation}</span>
          </label>
          <label className="flex gap-3 text-sm leading-7 text-[color:var(--color-foreground)]">
            <input
              type="checkbox"
              checked={draft.aiConfirmed}
              onChange={(event) =>
                patchDraft({ aiConfirmed: event.target.checked })
              }
              className="mt-1 size-4 rounded border-white/20 bg-black/20"
            />
            <span>{copy.form.aiConfirmation}</span>
          </label>
        </div>

        {statusMessage ? (
          <AdviceSubmitState
            message={statusMessage}
            actionLabel={statusAction === "retry" ? copy.form.retry : undefined}
            onAction={statusAction === "retry" ? () => void submitCurrentDraft() : undefined}
          />
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting
                ? `${copy.form.submitting}...`
                : draft.mode === "ai"
                  ? copy.form.submitAi
                  : copy.form.submitLocal}
            </button>
            <button
              type="button"
              onClick={() => {
                const empty = createEmptyAdviceForm(locale);
                setDraft(empty);
                flow.reset();
                setStatusMessage(null);
                setStatusAction(null);
                setFieldErrors({});
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-6 py-3 text-sm text-[color:var(--color-foreground)] transition hover:border-white/24 hover:bg-white/6"
            >
              {copy.form.startOver}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
