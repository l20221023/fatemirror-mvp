import Link from "next/link";
import { notFound } from "next/navigation";

import { LanguageSwitcher } from "../../../components/language-switcher";
import { MomentStampField } from "../../../components/moment-stamp-field";
import { getDictionary, hasLocale } from "../../../../lib/i18n";
import { submitMomentReading } from "../../../reading/moment/actions";

type LocalizedMomentFormPageProps = PageProps<"/[locale]/reading/moment">;

export default async function LocalizedMomentFormPage(
  props: LocalizedMomentFormPageProps,
) {
  const { locale } = await props.params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const searchParams = await props.searchParams;
  const hasError = searchParams.error === "missing";
  const dict = getDictionary(locale);

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
          <LanguageSwitcher locale={locale} pathSuffix="/reading/moment" />
          <Link
            href={`/${locale}/about`}
            className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
          >
            {dict.shared.navAbout}
          </Link>
          <Link
            href={`/${locale}`}
            className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
          >
            {dict.momentForm.backHome}
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.94fr_1.06fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
            {dict.shared.categoryMoment}
          </p>
          <h1 className="mt-4 font-serif text-5xl text-balance leading-tight">
            {dict.momentForm.title}
          </h1>
          <p className="mt-6 text-base leading-8 text-[color:var(--color-muted)]">
            {dict.momentForm.intro}
          </p>

          <div className="mt-10 space-y-4">
            {dict.momentForm.highlights.map((item) => (
              <div
                key={item}
                className="rounded-[1.25rem] border border-white/8 bg-black/10 px-4 py-4 text-sm text-[color:var(--color-muted)]"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 shadow-[0_24px_80px_rgba(4,10,16,0.35)]">
          <div className="mb-8">
            <p className="text-xs tracking-[0.24em] text-[color:var(--color-muted)] uppercase">
              {dict.momentForm.eyebrow}
            </p>
            <h2 className="mt-3 font-serif text-3xl">{dict.shared.categoryMoment}</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">
              {dict.momentForm.helper}
            </p>
          </div>

          <form action={submitMomentReading} className="space-y-6">
            <input type="hidden" name="locale" value={locale} />
            <MomentStampField />

            <label className="block">
              <span className="mb-3 block text-sm text-[color:var(--color-muted)]">
                {dict.momentForm.yourName}
              </span>
              <input
                name="name"
                type="text"
                placeholder={dict.momentForm.yourNamePlaceholder}
                className="w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm text-[color:var(--color-foreground)] outline-none transition placeholder:text-[color:rgba(244,239,228,0.34)] focus:border-[color:var(--color-accent)]"
              />
            </label>

            <label className="block">
              <span className="mb-3 block text-sm text-[color:var(--color-muted)]">
                {dict.momentForm.question}
              </span>
              <textarea
                name="heartQuestion"
                required
                rows={6}
                placeholder={dict.momentForm.questionPlaceholder}
                className="w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm leading-7 text-[color:var(--color-foreground)] outline-none transition placeholder:text-[color:rgba(244,239,228,0.34)] focus:border-[color:var(--color-accent)]"
              />
            </label>

            {hasError ? (
              <p className="rounded-[1rem] border border-[color:rgba(196,155,98,0.28)] bg-[rgba(196,155,98,0.08)] px-4 py-3 text-sm text-[color:var(--color-accent-soft)]">
                {dict.momentForm.error}
              </p>
            ) : null}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-accent-soft)]"
              >
                {dict.momentForm.submit}
              </button>
              <p className="max-w-sm text-xs leading-6 text-[color:var(--color-muted)]">
                {dict.shared.disclaimer}
              </p>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
