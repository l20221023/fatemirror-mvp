import Link from "next/link";
import { notFound } from "next/navigation";

import { LanguageSwitcher } from "../../components/language-switcher";
import { getDictionary, hasLocale } from "../../../lib/i18n";

type DisclaimerPageProps = PageProps<"/[locale]/disclaimer">;

export default async function DisclaimerPage(props: DisclaimerPageProps) {
  const { locale } = await props.params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10 sm:px-8 lg:px-12">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/${locale}`}
          className="text-sm tracking-[0.28em] text-[color:var(--color-muted)] uppercase"
        >
          {dict.shared.brand}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <LanguageSwitcher locale={locale} pathSuffix="/disclaimer" />
          <Link
            href={`/${locale}`}
            className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
          >
            {dict.shared.navHome}
          </Link>
        </div>
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 md:p-10">
        <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
          {dict.disclaimerPage.eyebrow}
        </p>
        <h1 className="mt-4 font-serif text-5xl text-balance leading-tight">
          {dict.disclaimerPage.title}
        </h1>

        <div className="mt-10 grid gap-6">
          {[dict.disclaimerPage.divination, dict.disclaimerPage.health, dict.disclaimerPage.user].map(
            (item) => (
              <article
                key={item}
                className="rounded-[1.5rem] border border-white/10 bg-black/10 p-6 text-base leading-8 text-[color:var(--color-muted)]"
              >
                {item}
              </article>
            ),
          )}
        </div>
      </section>
    </main>
  );
}
