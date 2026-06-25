import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdviceReport } from "../../../../components/advice/advice-report";
import { LanguageSwitcher } from "../../../../components/language-switcher";
import { getDictionary, hasLocale } from "../../../../../lib/i18n";

type LocalizedAdviceResultPageProps = PageProps<"/[locale]/reading/advice/result">;

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LocalizedAdviceResultPage(
  props: LocalizedAdviceResultPageProps,
) {
  const { locale } = await props.params;
  if (!hasLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const { advice } = dict;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-12">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/${locale}`}
          className="text-sm tracking-[0.28em] text-[color:var(--color-muted)] uppercase"
        >
          {dict.shared.brand}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <LanguageSwitcher locale={locale} pathSuffix="/reading/advice/result" />
          <Link
            href={`/${locale}/reading/advice`}
            className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
          >
            {advice.form.rewrite}
          </Link>
          <Link
            href={`/${locale}`}
            className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
          >
            {dict.shared.navHome}
          </Link>
        </div>
      </div>

      <AdviceReport locale={locale} copy={advice} />
    </main>
  );
}
