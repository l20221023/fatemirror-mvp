import Link from "next/link";
import { notFound } from "next/navigation";

import { LanguageSwitcher } from "../../../components/language-switcher";
import { MingGuaTool } from "../../../components/readings/ming-gua-tool";
import { getDictionary, hasLocale } from "../../../../lib/i18n";

type MingGuaPageProps = PageProps<"/[locale]/reading/ming-gua">;

export default async function MingGuaPage(props: MingGuaPageProps) {
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
          <LanguageSwitcher locale={locale} pathSuffix="/reading/ming-gua" />
          <Link href={`/${locale}`} className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {dict.shared.navHome}
          </Link>
        </div>
      </header>

      <MingGuaTool locale={locale} />
    </main>
  );
}
