import Link from "next/link";
import { notFound } from "next/navigation";

import { DisclaimerFooter } from "../../../../components/disclaimer-footer";
import { LanguageSwitcher } from "../../../../components/language-switcher";
import { PaywallGate } from "../../../../components/paywall-gate";
import { SixDeityDisplay } from "../../../../components/six-deity-display";
import { getDictionary, hasLocale, serializeSearchParams } from "../../../../../lib/i18n";
import { getReadingPaymentState } from "../../../../../lib/paywall";
import {
  buildMomentReadingExperience,
  hasCompleteMomentReadingInput,
  readMomentInputFromSearchParams,
} from "../../../../../lib/reading";

type LocalizedMomentResultPageProps = PageProps<"/[locale]/reading/moment/result">;

export default async function LocalizedMomentResultPage(
  props: LocalizedMomentResultPageProps,
) {
  const { locale } = await props.params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const searchParams = await props.searchParams;
  const input = readMomentInputFromSearchParams(searchParams);
  const dict = getDictionary(locale);
  const localizedQuery = serializeSearchParams(searchParams);

  if (!hasCompleteMomentReadingInput(input)) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-16 text-center sm:px-8">
        <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
          {dict.momentResult.unavailableEyebrow}
        </p>
        <h1 className="mt-4 font-serif text-5xl text-balance">
          {dict.momentResult.unavailableTitle}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--color-muted)]">
          {dict.momentResult.unavailableText}
        </p>
        <Link
          href={`/${locale}/reading/moment`}
          className="mt-10 inline-flex rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-accent-soft)]"
        >
          {dict.momentResult.unavailableCta}
        </Link>
      </main>
    );
  }

  const isPaid = await getReadingPaymentState(input.readingId || null);
  const reading = await buildMomentReadingExperience(input, locale, isPaid);

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
          <LanguageSwitcher
            locale={locale}
            pathSuffix="/reading/moment/result"
            queryString={localizedQuery}
          />
          <Link
            href={`/${locale}`}
            className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
          >
            {dict.shared.navHome}
          </Link>
          <Link
            href={`/${locale}/reading/moment`}
            className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
          >
            {dict.momentResult.restart}
          </Link>
        </div>
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 shadow-[0_24px_80px_rgba(4,10,16,0.35)] md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.04fr_0.96fr]">
          <div>
            <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
              {dict.momentResult.freeLayerEyebrow}
            </p>
            <h1 className="mt-4 font-serif text-5xl text-balance leading-tight">
              {dict.momentResult.title}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[color:var(--color-muted)]">
              {reading.snapshotTone}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {reading.keywords.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs tracking-[0.16em] text-[color:var(--color-muted)] uppercase"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-black/12 p-6">
            <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
              {dict.momentResult.snapshotTitle}
            </p>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-[color:var(--color-muted)]">
                  {dict.momentResult.primaryTone}
                </dt>
                <dd className="text-right text-[color:var(--color-foreground)]">
                  {reading.snapshotTone}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-[color:var(--color-muted)]">
                  {dict.momentResult.focusLabel}
                </dt>
                <dd className="text-right text-[color:var(--color-foreground)]">
                  {reading.focusLabel}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <SixDeityDisplay
              locale={locale}
              deity={reading.xiaoLiuRen.deity}
              meaning={reading.xiaoLiuRen.meaning}
              advice={reading.xiaoLiuRen.advice}
              formulaLabel={reading.xiaoLiuRen.formulaLabel}
              shichenLabel={reading.xiaoLiuRen.shichenLabel}
            />

            <article className="rounded-[2rem] border border-white/10 bg-black/10 p-6">
              <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
                {dict.momentResult.freeTextTitle}
              </p>
              <p className="mt-4 text-base leading-8 text-[color:var(--color-muted)]">
                {reading.freeReadingText}
              </p>
            </article>
          </div>

          <section className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
              {dict.momentResult.currentQuestion}
            </p>
            <p className="mt-4 text-base leading-8 text-[color:var(--color-muted)]">
              {input.heartQuestion}
            </p>
            <div className="mt-6 rounded-[1.25rem] border border-white/8 bg-black/10 p-5">
              <p className="text-sm text-[color:var(--color-muted)]">
                {dict.momentResult.currentSignal}
              </p>
              <p className="mt-3 font-serif text-3xl">{reading.xiaoLiuRen.deity}</p>
            </div>
          </section>
        </div>
      </section>

      <section className="mt-10">
        {isPaid ? (
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[color:rgba(196,155,98,0.18)] bg-[linear-gradient(180deg,rgba(196,155,98,0.12),rgba(255,255,255,0.03))] p-8">
              <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
                {dict.momentResult.paidLayerEyebrow}
              </p>
              <h2 className="mt-4 font-serif text-4xl text-balance">
                {dict.momentResult.paidLayerTitle}
              </h2>
              <p className="mt-6 max-w-4xl text-base leading-8 text-[color:var(--color-muted)]">
                {reading.paidReadingText}
              </p>
            </div>

            <DisclaimerFooter locale={locale} />
          </div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
              <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
                {dict.momentResult.unlockPreviewEyebrow}
              </p>
              <h2 className="mt-4 font-serif text-4xl text-balance">
                {dict.momentResult.unlockPreviewTitle}
              </h2>
              <p className="mt-5 max-w-4xl text-base leading-8 text-[color:var(--color-muted)]">
                {dict.momentResult.unlockPreviewText}
              </p>
              <p className="mt-4 max-w-4xl text-base leading-8 text-[color:var(--color-muted)]">
                {reading.paidPreviewText}
              </p>
            </section>

            <PaywallGate
              locale={locale}
              unlockHref={`/${locale}/reading/moment/result/unlock?${localizedQuery}`}
              title={dict.momentResult.paywallTitle}
              subtitle={dict.momentResult.paywallSubtitle}
              price={dict.momentResult.paywallPrice}
              teaser={dict.momentResult.unlockTeaser}
            />
          </div>
        )}
      </section>
    </main>
  );
}
