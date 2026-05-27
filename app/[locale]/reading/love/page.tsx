import Link from "next/link";
import { notFound } from "next/navigation";

import { LanguageSwitcher } from "../../../components/language-switcher";
import { getDictionary, hasLocale } from "../../../../lib/i18n";
import { submitLoveReading } from "../../../reading/love/actions";

type LocalizedLoveFormPageProps = PageProps<"/[locale]/reading/love">;

export default async function LocalizedLoveFormPage(
  props: LocalizedLoveFormPageProps,
) {
  const { locale } = await props.params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const searchParams = await props.searchParams;
  const hasError = searchParams.error === "missing";
  const dict = getDictionary(locale);
  const isZh = locale === "zh";

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-12">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/${locale}`}
          className="text-sm tracking-[0.28em] text-[color:var(--color-muted)] uppercase"
        >
          FateMirror
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <LanguageSwitcher locale={locale} pathSuffix="/reading/love" />
          <Link
            href={`/${locale}`}
            className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
          >
            {dict.form.backHome}
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.94fr_1.06fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
            {dict.shared.categoryLove}
          </p>
          <h1
            className={`mt-4 font-serif text-balance ${
              isZh
                ? "max-w-[20ch] text-4xl leading-[1.12] sm:text-[2.9rem]"
                : "text-5xl leading-tight"
            }`}
          >
            {dict.form.title}
          </h1>
          <p
            className={`mt-6 text-[color:var(--color-muted)] ${
              isZh ? "max-w-[34rem] text-[15px] leading-8" : "text-base leading-8"
            }`}
          >
            {dict.form.intro}
          </p>

          <div className="mt-10 space-y-4">
            {dict.form.highlights.map((item) => (
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
              {dict.form.eyebrow}
            </p>
            <h2 className="mt-3 font-serif text-3xl">
              {dict.shared.categoryLove}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">
              {dict.form.helper}
            </p>
          </div>

          <form action={submitLoveReading} className="space-y-6">
            <input type="hidden" name="locale" value={locale} />

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="mb-3 block text-sm text-[color:var(--color-muted)]">
                  {dict.form.yourBirthDate}
                </span>
                <input
                  name="birthDate"
                  type="date"
                  required
                  className="w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)]"
                />
              </label>

              <label className="block">
                <span className="mb-3 block text-sm text-[color:var(--color-muted)]">
                  {dict.form.yourBirthTime}
                </span>
                <input
                  name="birthTime"
                  type="time"
                  className="w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)]"
                />
              </label>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="mb-3 block text-sm text-[color:var(--color-muted)]">
                  {dict.form.theirBirthDate}
                </span>
                <input
                  name="theirBirthDate"
                  type="date"
                  required
                  className="w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)]"
                />
              </label>

              <label className="block">
                <span className="mb-3 block text-sm text-[color:var(--color-muted)]">
                  {dict.form.theirBirthTime}
                </span>
                <input
                  name="theirBirthTime"
                  type="time"
                  className="w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)]"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-3 block text-sm text-[color:var(--color-muted)]">
                {dict.form.relationshipStage}
              </span>
              <select
                name="relationshipStage"
                required
                defaultValue=""
                className="w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)]"
              >
                <option value="" disabled>
                  {dict.form.stagePlaceholder}
                </option>
                {dict.shared.stageOptions.map((stage) => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-3 block text-sm text-[color:var(--color-muted)]">
                {dict.form.heartQuestion}
              </span>
              <textarea
                name="heartQuestion"
                required
                rows={5}
                placeholder={dict.form.heartPlaceholder}
                className="w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm leading-7 text-[color:var(--color-foreground)] outline-none transition placeholder:text-[color:rgba(244,239,228,0.34)] focus:border-[color:var(--color-accent)]"
              />
            </label>

            <p className="text-xs leading-6 text-[color:var(--color-muted)]">
              {dict.form.birthTimeNote}
            </p>

            {hasError ? (
              <p className="rounded-[1rem] border border-[color:rgba(196,155,98,0.28)] bg-[rgba(196,155,98,0.08)] px-4 py-3 text-sm text-[color:var(--color-accent-soft)]">
                {dict.form.error}
              </p>
            ) : null}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-accent-soft)]"
              >
                {dict.form.submit}
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
