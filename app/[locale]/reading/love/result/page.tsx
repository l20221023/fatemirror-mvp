import Link from "next/link";
import { notFound } from "next/navigation";

import { LanguageSwitcher } from "../../../../components/language-switcher";
import { joinWaitlist } from "../../../../reading/love/actions";
import {
  getDictionary,
  hasLocale,
  serializeSearchParams,
} from "../../../../../lib/i18n";
import {
  buildLoveReading,
  hasCompleteReadingInput,
  readLoveInputFromSearchParams,
} from "../../../../../lib/reading";

type LocalizedLoveResultPageProps = PageProps<"/[locale]/reading/love/result">;

export default async function LocalizedLoveResultPage(
  props: LocalizedLoveResultPageProps,
) {
  const { locale } = await props.params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const searchParams = await props.searchParams;
  const input = readLoveInputFromSearchParams(searchParams);
  const dict = getDictionary(locale);
  const localizedQuery = serializeSearchParams(searchParams);

  if (!hasCompleteReadingInput(input)) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-16 text-center sm:px-8">
        <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
          {dict.result.unavailableEyebrow}
        </p>
        <h1 className="mt-4 font-serif text-5xl text-balance">
          {dict.result.unavailableTitle}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--color-muted)]">
          {dict.result.unavailableText}
        </p>
        <Link
          href={`/${locale}/reading/love`}
          className="mt-10 inline-flex rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-accent-soft)]"
        >
          {dict.result.unavailableCta}
        </Link>
      </main>
    );
  }

  const reading = buildLoveReading(input, locale);
  const joined = searchParams.joined === "1";
  const joinError = searchParams.joinError === "missing";
  const savedEmail =
    typeof searchParams.email === "string" ? searchParams.email : "";
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
          <LanguageSwitcher
            locale={locale}
            pathSuffix="/reading/love/result"
            queryString={localizedQuery}
          />
          <Link
            href={`/${locale}/reading/love`}
            className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
          >
            {dict.result.restart}
          </Link>
        </div>
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 shadow-[0_24px_80px_rgba(4,10,16,0.35)] md:p-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.74fr]">
          <div>
            <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
              {dict.shared.categoryLove}
            </p>
            <h1
              className={`mt-4 font-serif text-balance ${
                isZh
                  ? "max-w-[18ch] text-4xl leading-[1.1] sm:text-[2.9rem]"
                  : "text-5xl"
              }`}
            >
              {dict.result.title}
            </h1>
            <p
              className={`mt-6 text-base leading-8 text-[color:var(--color-muted)] ${
                isZh ? "max-w-[42rem]" : "max-w-2xl"
              }`}
            >
              {dict.result.stageLabel}: {reading.stageLabel}. {dict.result.storyPrefix}{" "}
              {reading.keywords.join(" / ")}.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-black/12 p-6">
            <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
              {dict.result.snapshotTitle}
            </p>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-[color:var(--color-muted)]">
                  {dict.result.primaryTone}
                </dt>
                <dd className="text-right text-[color:var(--color-foreground)]">
                  {reading.snapshotTone}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-[color:var(--color-muted)]">
                  {dict.result.currentStage}
                </dt>
                <dd className="text-right text-[color:var(--color-foreground)]">
                  {reading.stageLabel}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-[color:var(--color-muted)]">
                  {dict.result.focusLabel}
                </dt>
                <dd className="text-right text-[color:var(--color-foreground)]">
                  {reading.focusLabel}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-10 grid gap-5">
          {reading.sections.map((section) => (
            <article
              key={section.title}
              className="rounded-[1.5rem] border border-white/8 bg-black/10 p-6"
            >
              <h2 className="font-serif text-3xl">{section.title}</h2>
              <p className="mt-4 text-base leading-8 text-[color:var(--color-muted)]">
                {section.text}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[1.5rem] border border-white/8 bg-black/10 p-6">
            <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
              {dict.result.traditionalSnapshot}
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                {
                  title: dict.result.youLabel,
                  profile: reading.profiles.you,
                },
                {
                  title: dict.result.theyLabel,
                  profile: reading.profiles.counterpart,
                },
              ].map(({ title, profile }) => (
                <article
                  key={title}
                  className="rounded-[1.25rem] border border-white/8 bg-white/5 p-5"
                >
                  <h3 className="font-serif text-2xl">{title}</h3>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-[color:var(--color-muted)]">
                        {dict.result.lunarDate}
                      </dt>
                      <dd className="text-right">{profile.lunarDateLabel}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-[color:var(--color-muted)]">
                        {dict.result.shiChen}
                      </dt>
                      <dd className="text-right">{profile.shiChenLabel}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-[color:var(--color-muted)]">
                        {dict.result.mingGong}
                      </dt>
                      <dd className="text-right">{profile.mingGongLabel}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-[color:var(--color-muted)]">
                        {dict.result.xiaoLiuRen}
                      </dt>
                      <dd className="text-right">{profile.xiaoLiuRenLabel}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-[color:var(--color-muted)]">
                        {dict.result.zodiac}
                      </dt>
                      <dd className="text-right">{profile.zodiacLabel}</dd>
                    </div>
                  </dl>

                  <p className="mt-4 text-sm leading-7 text-[color:var(--color-muted)]">
                    {profile.xiaoLiuRenNote}
                  </p>

                  {profile.usedEstimatedTime ? (
                    <p className="mt-3 text-xs leading-6 text-[color:var(--color-accent-soft)]">
                      {dict.result.estimatedTime}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[color:rgba(196,155,98,0.18)] bg-[rgba(196,155,98,0.08)] p-6">
            <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
              {dict.result.compatibilityMarker}
            </p>
            <h2 className="mt-4 font-serif text-3xl">
              {reading.compatibility.score}/100
            </h2>
            <p className="mt-3 text-lg text-[color:var(--color-foreground)]">
              {reading.compatibility.headline}
            </p>
            <p className="mt-4 text-sm leading-8 text-[color:var(--color-muted)]">
              {reading.compatibility.note}
            </p>
          </section>
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[0.98fr_1.02fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
            {dict.result.deeperPreviewEyebrow}
          </p>
          <h2
            className={`mt-4 font-serif text-balance ${
              isZh ? "max-w-[18ch] text-3xl leading-[1.14] sm:text-4xl" : "text-4xl"
            }`}
          >
            {dict.result.deeperPreviewTitle}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {reading.lockedModules.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.25rem] border border-dashed border-white/14 bg-black/10 p-5"
              >
                <p className="font-serif text-xl">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--color-muted)]">
                  {item.teaser}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[color:rgba(196,155,98,0.2)] bg-[linear-gradient(180deg,rgba(196,155,98,0.12),rgba(255,255,255,0.03))] p-8">
          <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
            {dict.result.unlockEyebrow}
          </p>
          <h2
            className={`mt-4 font-serif text-balance ${
              isZh ? "max-w-[18ch] text-3xl leading-[1.14] sm:text-4xl" : "text-4xl"
            }`}
          >
            {dict.result.unlockTitle}
          </h2>
          <p className="mt-5 text-base leading-8 text-[color:var(--color-muted)]">
            {dict.result.unlockText}
          </p>

          <form action={joinWaitlist} className="mt-8 space-y-5">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="birthDate" value={input.birthDate} />
            <input type="hidden" name="birthTime" value={input.birthTime} />
            <input
              type="hidden"
              name="theirBirthDate"
              value={input.theirBirthDate}
            />
            <input
              type="hidden"
              name="theirBirthTime"
              value={input.theirBirthTime}
            />
            <input
              type="hidden"
              name="relationshipStage"
              value={input.relationshipStage}
            />
            <input
              type="hidden"
              name="heartQuestion"
              value={input.heartQuestion}
            />

            <label className="block">
              <span className="mb-3 block text-sm text-[color:var(--color-muted)]">
                {dict.result.emailLabel}
              </span>
              <input
                name="email"
                type="email"
                defaultValue={savedEmail}
                placeholder="you@example.com"
                className="w-full rounded-[1rem] border border-white/12 bg-black/12 px-4 py-3 text-sm text-[color:var(--color-foreground)] outline-none transition placeholder:text-[color:rgba(244,239,228,0.34)] focus:border-[color:var(--color-accent)]"
              />
            </label>

            {joined ? (
              <p className="rounded-[1rem] border border-white/10 bg-black/12 px-4 py-3 text-sm text-[color:var(--color-foreground)]">
                {dict.result.joinedMessage}
              </p>
            ) : null}

            {joinError ? (
              <p className="rounded-[1rem] border border-[color:rgba(196,155,98,0.28)] bg-[rgba(196,155,98,0.08)] px-4 py-3 text-sm text-[color:var(--color-accent-soft)]">
                {dict.result.joinError}
              </p>
            ) : null}

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-accent-soft)]"
            >
              {dict.result.unlockButton}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
