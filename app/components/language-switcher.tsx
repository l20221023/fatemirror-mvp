import Link from "next/link";

import { getLocaleLabel, locales, type Locale } from "../../lib/i18n";

type LanguageSwitcherProps = {
  locale: Locale;
  pathSuffix: string;
  queryString?: string;
};

export function LanguageSwitcher({
  locale,
  pathSuffix,
  queryString,
}: LanguageSwitcherProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1 text-xs uppercase tracking-[0.18em]">
      {locales.map((targetLocale) => {
        const href = `/${targetLocale}${pathSuffix}${
          queryString ? `?${queryString}` : ""
        }`;
        const active = targetLocale === locale;

        return (
          <Link
            key={targetLocale}
            href={href}
            className={`rounded-full px-3 py-2 transition ${
              active
                ? "bg-[color:var(--color-accent)] text-[color:var(--color-ink)]"
                : "text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]"
            }`}
          >
            {getLocaleLabel(targetLocale)}
          </Link>
        );
      })}
    </div>
  );
}
