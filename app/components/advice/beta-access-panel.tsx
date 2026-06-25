"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BetaAccessPanelProps = {
  enabled: boolean;
  verified: boolean;
  label: string;
  placeholder: string;
  submitLabel: string;
  successLabel: string;
  invalidLabel: string;
};

export function BetaAccessPanel({
  enabled,
  verified,
  label,
  placeholder,
  submitLabel,
  successLabel,
  invalidLabel,
}: BetaAccessPanelProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(verified ? successLabel : null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!enabled) {
    return null;
  }

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-black/10 p-5">
      <p className="text-sm text-[color:var(--color-muted)]">{label}</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder={placeholder}
          className="min-h-11 flex-1 rounded-full border border-white/12 bg-black/20 px-4 text-sm text-[color:var(--color-foreground)] outline-none placeholder:text-[color:rgba(244,239,228,0.34)]"
        />
        <button
          type="button"
          disabled={isSubmitting || verified}
          onClick={async () => {
            if (!code.trim()) {
              setMessage(invalidLabel);
              return;
            }

            setIsSubmitting(true);
            setMessage(null);
            try {
              const response = await fetch("/api/beta/verify", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ code }),
              });

              if (!response.ok) {
                setMessage(invalidLabel);
                return;
              }

              setMessage(successLabel);
              router.refresh();
            } catch {
              setMessage(invalidLabel);
            } finally {
              setIsSubmitting(false);
            }
          }}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--color-accent)] px-5 py-3 text-sm font-medium text-[color:var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? `${submitLabel}...` : submitLabel}
        </button>
      </div>
      {message ? <p className="mt-3 text-xs leading-6 text-[color:var(--color-muted)]">{message}</p> : null}
    </section>
  );
}
