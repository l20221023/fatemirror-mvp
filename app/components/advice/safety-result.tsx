type SafetyResultProps = {
  title: string;
  summary: string;
  professionalHelp: string;
  emergencySupport: string;
  nextStepsTitle: string;
  boundariesTitle: string;
  cautionTitle: string;
  nextSteps: string[];
  boundaries: string[];
  caution: string;
};

export function SafetyResult({
  title,
  summary,
  professionalHelp,
  emergencySupport,
  nextStepsTitle,
  boundariesTitle,
  cautionTitle,
  nextSteps,
  boundaries,
  caution,
}: SafetyResultProps) {
  return (
    <section className="rounded-[1.5rem] border border-[color:rgba(196,155,98,0.28)] bg-[rgba(196,155,98,0.08)] p-6">
      <p className="text-sm tracking-[0.18em] text-[color:var(--color-accent)] uppercase">
        {title}
      </p>
      <p className="mt-4 text-sm leading-7 text-[color:var(--color-foreground)]">
        {summary}
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.25rem] border border-white/10 bg-black/10 p-4">
          <h3 className="text-sm text-[color:var(--color-foreground)]">
            {nextStepsTitle}
          </h3>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-[color:var(--color-muted)]">
            {nextSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-[1.25rem] border border-white/10 bg-black/10 p-4">
          <h3 className="text-sm text-[color:var(--color-foreground)]">
            {boundariesTitle}
          </h3>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-[color:var(--color-muted)]">
            {boundaries.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
      <div className="mt-6 space-y-3 text-sm leading-7 text-[color:var(--color-muted)]">
        <p>{professionalHelp}</p>
        <p>{emergencySupport}</p>
        <p>
          <span className="text-[color:var(--color-foreground)]">{cautionTitle}: </span>
          {caution}
        </p>
      </div>
    </section>
  );
}
