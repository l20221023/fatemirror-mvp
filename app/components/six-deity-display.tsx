import type { Locale } from "../../lib/i18n";

type SixDeityDisplayProps = {
  locale: Locale;
  deity: string;
  meaning: string;
  advice: string;
  formulaLabel: string;
  shichenLabel: string;
};

export function SixDeityDisplay({
  locale,
  deity,
  meaning,
  advice,
  formulaLabel,
  shichenLabel,
}: SixDeityDisplayProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-[color:rgba(196,155,98,0.22)] bg-[linear-gradient(180deg,rgba(196,155,98,0.12),rgba(255,255,255,0.04))] p-6 shadow-[0_24px_80px_rgba(4,10,16,0.28)]">
      <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-[radial-gradient(circle,_rgba(255,245,227,0.22),_transparent_68%)] blur-2xl" />
      <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
        {locale === "zh" ? "小六壬" : "Six Deity Signal"}
      </p>
      <h2 className="mt-4 font-serif text-4xl">{deity}</h2>
      <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--color-muted)]">
        {meaning}
      </p>
      <p className="mt-4 rounded-[1.25rem] border border-white/10 bg-black/12 px-4 py-4 text-sm leading-7 text-[color:var(--color-foreground)]">
        {advice}
      </p>
      <div className="mt-5 flex flex-wrap gap-3 text-xs text-[color:var(--color-muted)]">
        <span className="rounded-full border border-white/10 px-3 py-2">
          {shichenLabel}
        </span>
        <span className="rounded-full border border-white/10 px-3 py-2">
          {formulaLabel}
        </span>
      </div>
    </section>
  );
}
