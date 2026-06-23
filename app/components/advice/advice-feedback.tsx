"use client";

import { useState } from "react";

type AdviceFeedbackProps = {
  title: string;
  levels: Array<{ value: "helpful" | "partial" | "not_helpful"; label: string }>;
  reasonsLabel: string;
  reasons: Array<{ value: string; label: string }>;
  submitted: string;
};

export function AdviceFeedback({
  title,
  levels,
  reasonsLabel,
  reasons,
  submitted,
}: AdviceFeedbackProps) {
  const [selectedLevel, setSelectedLevel] = useState<
    "helpful" | "partial" | "not_helpful" | ""
  >("");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

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
              onClick={() => setSelectedLevel(level.value)}
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
                      active
                        ? current.filter((item) => item !== reason.value)
                        : [...current, reason.value],
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
          <p className="mt-4 text-xs leading-6 text-[color:var(--color-muted)]">
            {submitted}
          </p>
        </div>
      ) : null}
    </section>
  );
}
