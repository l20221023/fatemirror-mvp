type DailyPracticeProps = {
  locale: "en" | "zh";
  title: string;
  steps: string[];
};

export function DailyPractice({ locale, title, steps }: DailyPracticeProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6">
      <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
        {locale === "zh" ? "今日修炼" : "Daily Practice"}
      </p>
      <h3 className="mt-4 font-serif text-3xl">{title}</h3>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {steps.map((step, index) => (
          <div
            key={step}
            className="rounded-[1.25rem] border border-white/10 bg-black/10 p-5"
          >
            <p className="text-xs tracking-[0.2em] text-[color:var(--color-accent)] uppercase">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">
              {step}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
