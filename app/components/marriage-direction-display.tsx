import type { Locale } from "../../lib/i18n";

type MarriageDirectionDisplayProps = {
  locale: Locale;
  primaryDirection: string;
  secondaryDirection: string;
  description: string;
  axisLabel: string;
};

export function MarriageDirectionDisplay({
  locale,
  primaryDirection,
  secondaryDirection,
  description,
  axisLabel,
}: MarriageDirectionDisplayProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
        {locale === "zh" ? "婚配方位" : "Marriage Direction"}
      </p>
      <div className="mt-5 grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="rounded-[1.5rem] border border-white/10 bg-black/10 p-5">
          <p className="text-sm text-[color:var(--color-muted)]">
            {locale === "zh" ? "主方向" : "Primary"}
          </p>
          <h3 className="mt-3 font-serif text-3xl">{primaryDirection}</h3>
          <p className="mt-5 text-sm text-[color:var(--color-muted)]">
            {locale === "zh" ? "对轴方向" : "Mirror axis"}
          </p>
          <p className="mt-2 text-lg text-[color:var(--color-foreground)]">
            {secondaryDirection}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-black/8 p-5">
          <p className="text-sm text-[color:var(--color-muted)]">{axisLabel}</p>
          <p className="mt-4 text-sm leading-8 text-[color:var(--color-muted)]">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
