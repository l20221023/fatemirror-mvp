import type { ReactNode } from "react";

export function ReadingResultShell({
  title,
  eyebrow,
  summary,
  children,
}: {
  title: string;
  eyebrow: string;
  summary?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 shadow-[0_24px_80px_rgba(4,10,16,0.35)] md:p-10">
      <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-serif text-4xl text-balance">{title}</h2>
      {summary ? (
        <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--color-muted)]">
          {summary}
        </p>
      ) : null}
      <div className="mt-8 space-y-6">{children}</div>
    </section>
  );
}
