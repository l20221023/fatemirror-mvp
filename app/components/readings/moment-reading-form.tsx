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
    question: string;
    questionPlaceholder: string;
    submit: string;
    error: string;
    disclaimer: string;
  };
};

export type MomentReadingSessionDraft = {
  sid: string;
  name: string;
  heartQuestion: string;
  momentIso: string;
  momentLocal: string;
  createdAt: string;
};

export function MomentReadingForm({ locale, labels }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(formData: FormData) {
    const momentLocal = String(formData.get("momentLocal") || "").trim();
    const momentIso = toShanghaiIso(momentLocal);

    const draft: MomentReadingSessionDraft = {
      sid: createReadingSessionId("moment"),
      name: String(formData.get("name") || "").trim(),
      heartQuestion: String(formData.get("heartQuestion") || "").trim(),
      momentIso,
      momentLocal,
      createdAt: new Date().toISOString(),
    };

    if (!draft.heartQuestion || !draft.momentLocal || !draft.momentIso) {
      setError(labels.error);
      return;
    }

    setError("");
    setIsPending(true);
    saveReadingDraft(`fatemirror:reading:moment:${draft.sid}`, draft);
    saveReadingDraft("fatemirror:reading:moment:last", { sid: draft.sid });
    router.push(`/${locale}/reading/moment/result?sid=${draft.sid}`);
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 shadow-[0_24px_80px_rgba(4,10,16,0.35)]">
      <div className="mb-8">
        <h2 className="font-serif text-3xl">{labels.title}</h2>
        <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">{labels.intro}</p>
      </div>

      <form action={onSubmit} className="space-y-6">
        <label className="block">
          <span className="mb-3 block text-sm text-[color:var(--color-muted)]">{locale === "zh" ? "起念时间" : "Moment of inquiry"}</span>
          <input
            name="momentLocal"
            type="datetime-local"
            required
            className="min-h-11 w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-accent)]"
          />
        </label>

        <label className="block">
          <span className="mb-3 block text-sm text-[color:var(--color-muted)]">{labels.yourName}</span>
          <input
            name="name"
            type="text"
            placeholder={labels.yourNamePlaceholder}
            className="min-h-11 w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm outline-none placeholder:text-[color:rgba(244,239,228,0.34)] focus:border-[color:var(--color-accent)]"
          />
        </label>

        <label className="block">
          <span className="mb-3 block text-sm text-[color:var(--color-muted)]">{labels.question}</span>
          <textarea
            name="heartQuestion"
            required
            rows={6}
            placeholder={labels.questionPlaceholder}
            className="w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm leading-7 outline-none placeholder:text-[color:rgba(244,239,228,0.34)] focus:border-[color:var(--color-accent)]"
          />
        </label>

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

function toShanghaiIso(momentLocal: string) {
  const match = momentLocal.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/);
  if (!match) return "";
  return `${match[1]}T${match[2]}:00+08:00`;
}
