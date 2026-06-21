import Link from "next/link";
import { notFound } from "next/navigation";

import { LanguageSwitcher } from "../../../components/language-switcher";
import { MingGuaMatchTool } from "../../../components/readings/ming-gua-match-tool";
import { getDictionary, hasLocale } from "../../../../lib/i18n";

type MingGuaMatchPageProps = PageProps<"/[locale]/reading/ming-gua-match">;

export default async function MingGuaMatchPage(props: MingGuaMatchPageProps) {
  const { locale } = await props.params;
  if (!hasLocale(locale)) notFound();

  const dict = getDictionary(locale);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-12">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link href={`/${locale}`} className="text-sm tracking-[0.28em] text-[color:var(--color-muted)] uppercase">
          {dict.shared.brand}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <LanguageSwitcher locale={locale} pathSuffix="/reading/ming-gua-match" />
          <Link href={`/${locale}`} className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {dict.shared.navHome}
          </Link>
        </div>
      </header>

      <MingGuaMatchTool locale={locale} />
    </main>
  );
}
