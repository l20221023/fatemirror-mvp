"use client";

import { useState } from "react";

type AdviceFeedbackProps = {
  locale: "en" | "zh";
  title: string;
  levels: Array<{ value: "helpful" | "partial" | "not_helpful"; label: string }>;
  reasonsLabel: string;
  reasons: Array<{ value: string; label: string }>;
  submitted: string;
  reportId?: string | null;
  accessToken?: string | null;
};

export function AdviceFeedback({
  locale,
  title,
  levels,
  reasonsLabel,
  reasons,
  submitted,
  reportId,
  accessToken,
}: AdviceFeedbackProps) {
  const [selectedLevel, setSelectedLevel] = useState<"helpful" | "partial" | "not_helpful" | "">("");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted" | "error">("idle");

  const isRemoteFeedbackEnabled = Boolean(reportId && accessToken);

  async function submitFeedback() {
    if (!reportId || !accessToken || !selectedLevel) {
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch(`/api/advice/reports/${reportId}/feedback`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-advice-access-token": accessToken,
        },
        body: JSON.stringify({
          helpfulness: selectedLevel === "partial" ? "partly_helpful" : selectedLevel,
          reasons: selectedReasons,
        }),
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      setStatus("submitted");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-black/10 p-6">
      <p className="text-sm text-[color:var(--color-muted)]">{title}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {levels.map((level) => {
          const active = selectedLevel === level.value;
          return (
            <button
              key={level.value}
              type="button"
              onClick={() => {
                setSelectedLevel(level.value);
                setStatus("idle");
              }}
              className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition ${
                active
                  ? "border-[color:var(--color-accent)] bg-[rgba(196,155,98,0.14)] text-[color:var(--color-foreground)]"
                  : "border-white/12 text-[color:var(--color-muted)] hover:border-white/24 hover:text-[color:var(--color-foreground)]"
              }`}
            >
              {level.label}
            </button>
          );
        })}
      </div>

      {selectedLevel ? (
        <div className="mt-5">
          <p className="text-xs text-[color:var(--color-muted)]">{reasonsLabel}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {reasons.map((reason) => {
              const active = selectedReasons.includes(reason.value);
              return (
                <button
                  key={reason.value}
                  type="button"
                  onClick={() =>
                    setSelectedReasons((current) =>
                      active ? current.filter((item) => item !== reason.value) : [...current, reason.value],
                    )
                  }
                  className={`inline-flex min-h-10 items-center rounded-full border px-3 text-xs transition ${
                    active
                      ? "border-[color:var(--color-accent)] bg-[rgba(196,155,98,0.14)] text-[color:var(--color-foreground)]"
                      : "border-white/12 text-[color:var(--color-muted)] hover:border-white/24 hover:text-[color:var(--color-foreground)]"
                  }`}
                >
                  {reason.label}
                </button>
              );
            })}
          </div>

          {isRemoteFeedbackEnabled ? (
            <button
              type="button"
              onClick={() => void submitFeedback()}
              disabled={status === "submitting"}
              className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[color:var(--color-accent)] px-5 py-3 text-sm font-medium text-[color:var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "submitting"
                ? locale === "zh"
                  ? "提交中..."
                  : "Submitting..."
                : locale === "zh"
                  ? "提交反馈"
                  : "Submit feedback"}
            </button>
          ) : null}

          <p className="mt-4 text-xs leading-6 text-[color:var(--color-muted)]">
            {status === "submitted"
              ? locale === "zh"
                ? "反馈已保存。"
                : "Feedback saved."
              : status === "error"
                ? locale === "zh"
                  ? "反馈保存失败。"
                  : "Feedback could not be saved."
                : submitted}
          </p>
        </div>
      ) : null}
    </section>
  );
}
