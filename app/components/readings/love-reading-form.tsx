"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Locale } from "../../../lib/i18n";
import { createReadingSessionId, saveReadingDraft } from "./session-storage";

type Props = {
  locale: Locale;
  labels: {
    title: string;
    intro: string;
    yourName: string;
    yourNamePlaceholder: string;
    yourGender: string;
    yourBirthDate: string;
    theirGender: string;
    theirBirthDate: string;
    relationshipStage: string;
    stagePlaceholder: string;
    heartQuestion: string;
    heartPlaceholder: string;
    submit: string;
    error: string;
    birthTimeNote: string;
    disclaimer: string;
    man: string;
    woman: string;
    chooseOne: string;
    stageOptions: Array<{ value: string; label: string }>;
  };
};

export type LoveReadingSessionDraft = {
  sid: string;
  name: string;
  gender: "man" | "woman" | "";
  birthDate: string;
  theirGender: "man" | "woman" | "";
  theirBirthDate: string;
  relationshipStage: string;
  heartQuestion: string;
  createdAt: string;
};

export function LoveReadingForm({ locale, labels }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(formData: FormData) {
    const draft: LoveReadingSessionDraft = {
      sid: createReadingSessionId("love"),
      name: String(formData.get("name") || "").trim(),
      gender: (String(formData.get("gender") || "").trim() as LoveReadingSessionDraft["gender"]) || "",
      birthDate: String(formData.get("birthDate") || "").trim(),
      theirGender: (String(formData.get("theirGender") || "").trim() as LoveReadingSessionDraft["theirGender"]) || "",
      theirBirthDate: String(formData.get("theirBirthDate") || "").trim(),
      relationshipStage: String(formData.get("relationshipStage") || "").trim(),
      heartQuestion: String(formData.get("heartQuestion") || "").trim(),
      createdAt: new Date().toISOString(),
    };

    if (
      !draft.gender ||
      !draft.birthDate ||
      !draft.theirGender ||
      !draft.theirBirthDate ||
      !draft.relationshipStage ||
      !draft.heartQuestion
    ) {
      setError(labels.error);
      return;
    }

    setError("");
    setIsPending(true);
    saveReadingDraft(`fatemirror:reading:love:${draft.sid}`, draft);
    saveReadingDraft("fatemirror:reading:love:last", { sid: draft.sid });
    router.push(`/${locale}/reading/love/result?sid=${draft.sid}`);
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 shadow-[0_24px_80px_rgba(4,10,16,0.35)]">
      <div className="mb-8">
        <h2 className="font-serif text-3xl">{labels.title}</h2>
        <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">{labels.intro}</p>
      </div>

      <form action={onSubmit} className="space-y-6">
        <label className="block">
          <span className="mb-3 block text-sm text-[color:var(--color-muted)]">{labels.yourName}</span>
          <input
            name="name"
            type="text"
            placeholder={labels.yourNamePlaceholder}
            className="min-h-11 w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm outline-none placeholder:text-[color:rgba(244,239,228,0.34)] focus:border-[color:var(--color-accent)]"
          />
        </label>

        <div className="grid gap-6 sm:grid-cols-2">
          <SelectField
            name="gender"
            label={labels.yourGender}
            emptyLabel={labels.chooseOne}
            options={[
              { value: "man", label: labels.man },
              { value: "woman", label: labels.woman },
            ]}
          />
          <DateField name="birthDate" label={labels.yourBirthDate} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <SelectField
            name="theirGender"
            label={labels.theirGender}
            emptyLabel={labels.chooseOne}
            options={[
              { value: "man", label: labels.man },
              { value: "woman", label: labels.woman },
            ]}
          />
          <DateField name="theirBirthDate" label={labels.theirBirthDate} />
        </div>

        <SelectField
          name="relationshipStage"
          label={labels.relationshipStage}
          emptyLabel={labels.stagePlaceholder}
          options={labels.stageOptions}
        />

        <label className="block">
          <span className="mb-3 block text-sm text-[color:var(--color-muted)]">{labels.heartQuestion}</span>
          <textarea
            name="heartQuestion"
            required
            rows={5}
            placeholder={labels.heartPlaceholder}
            className="w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm leading-7 outline-none placeholder:text-[color:rgba(244,239,228,0.34)] focus:border-[color:var(--color-accent)]"
          />
        </label>

        <p className="text-xs leading-6 text-[color:var(--color-muted)]">{labels.birthTimeNote}</p>

        {error ? (
          <p className="rounded-[1rem] border border-[color:rgba(196,155,98,0.28)] bg-[rgba(196,155,98,0.08)] px-4 py-3 text-sm text-[color:var(--color-accent-soft)]">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <button
            type="submit"
            aria-busy={isPending}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)]"
          >
            {isPending ? `${labels.submit}...` : labels.submit}
          </button>
          <p className="max-w-sm text-xs leading-6 text-[color:var(--color-muted)]">{labels.disclaimer}</p>
        </div>
      </form>
    </section>
  );
}

function SelectField({
  name,
  label,
  emptyLabel,
  options,
}: {
  name: string;
  label: string;
  emptyLabel: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-3 block text-sm text-[color:var(--color-muted)]">{label}</span>
      <select
        name={name}
        required
        defaultValue=""
        className="min-h-11 w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-accent)]"
      >
        <option value="" disabled>
          {emptyLabel}
        </option>
        {options.map((option) => (
          <option key={`${name}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function DateField({ name, label }: { name: string; label: string }) {
  return (
    <label className="block">
      <span className="mb-3 block text-sm text-[color:var(--color-muted)]">{label}</span>
      <input
        name={name}
        type="date"
        required
        className="min-h-11 w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-accent)]"
      />
    </label>
  );
}
