import Link from "next/link";

import type { Locale } from "../../lib/i18n";

type PaywallGateProps = {
  locale: Locale;
  unlockHref: string;
  title: string;
  subtitle: string;
  price: string;
  teaser: string;
};

export function PaywallGate({
  locale,
  unlockHref,
  title,
  subtitle,
  price,
  teaser,
}: PaywallGateProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-[color:rgba(196,155,98,0.2)] bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-6">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-0 bg-[linear-gradient(180deg,rgba(7,19,26,0.1),rgba(7,19,26,0.34))]" />
      <div className="relative">
        <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
          {locale === "zh" ? "深层付费层" : "Paid Layer Preview"}
        </p>
        <h3 className="mt-4 font-serif text-3xl">{title}</h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--color-muted)]">
          {subtitle}
        </p>

        <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/14 bg-black/10 p-5">
          <div className="space-y-3 blur-[3px]">
            <div className="h-4 w-3/4 rounded-full bg-white/12" />
            <div className="h-4 w-5/6 rounded-full bg-white/12" />
            <div className="h-4 w-2/3 rounded-full bg-white/12" />
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="h-28 rounded-[1rem] bg-white/8" />
              <div className="h-28 rounded-[1rem] bg-white/8" />
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-[color:var(--color-muted)]">
            {teaser}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
              {locale === "zh" ? "当前占位价" : "Preview Price"}
            </p>
            <p className="mt-2 font-serif text-3xl">{price}</p>
          </div>
          <Link
            href={unlockHref}
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-accent-soft)]"
          >
            {locale === "zh" ? "继续解锁" : "Unlock deeper layer"}
          </Link>
        </div>
      </div>
    </section>
  );
}
