import Link from "next/link";
import { notFound } from "next/navigation";

import { StartReadingButton } from "../components/start-reading-button";
import { TrackEvent } from "../components/track-event";
import { LanguageSwitcher } from "../components/language-switcher";
import { getDictionary, hasLocale } from "../../lib/i18n";

type LocalizedHomePageProps = PageProps<"/[locale]">;

export default async function LocalizedHomePage(
  props: LocalizedHomePageProps,
) {
  const { locale } = await props.params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const isZh = locale === "zh";

  return (
    <main className="relative overflow-hidden">
      <TrackEvent
        eventName="landing_view"
        page={`/${locale}`}
        metadata={{ locale, surface: "home" }}
      />

      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(196,155,98,0.18),_transparent_68%)] blur-3xl" />
        <div className="absolute right-[-8rem] top-[24rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,_rgba(157,97,89,0.16),_transparent_70%)] blur-3xl" />
        <div className="absolute left-[-10rem] top-[42rem] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,_rgba(111,151,148,0.12),_transparent_70%)] blur-3xl" />
      </div>

      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-16 pt-8 sm:px-8 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4 py-4">
          <Link
            href={`/${locale}`}
            className="text-sm tracking-[0.32em] text-[color:var(--color-muted)] uppercase"
          >
            FateMirror
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <LanguageSwitcher locale={locale} pathSuffix="" />
            <StartReadingButton
              locale={locale}
              source="header_cta"
              pagePath={`/${locale}`}
              className="rounded-full border border-white/14 bg-white/8 px-4 py-2 text-sm text-[color:var(--color-foreground)] transition hover:border-[color:var(--color-accent)] hover:bg-white/12"
            >
              {dict.home.headerCta}
            </StartReadingButton>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-14 py-14 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
          <div className={isZh ? "max-w-[52rem]" : "max-w-3xl"}>
            <p className="mb-6 text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
              {dict.home.eyebrow}
            </p>
            <h1
              className={`font-serif text-balance ${
                isZh
                  ? "text-4xl leading-[1.08] sm:text-5xl lg:text-[4.4rem]"
                  : "text-5xl leading-[0.94] sm:text-6xl lg:text-7xl"
              }`}
            >
              {dict.home.title}
            </h1>
            <p
              className={`mt-8 text-[color:var(--color-muted)] ${
                isZh
                  ? "max-w-3xl text-base leading-8 sm:text-lg"
                  : "max-w-2xl text-lg leading-8 sm:text-xl"
              }`}
            >
              {dict.home.subtitle}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <StartReadingButton
                locale={locale}
                source="hero_primary_cta"
                pagePath={`/${locale}`}
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-accent-soft)]"
              >
                {dict.home.primaryCta}
              </StartReadingButton>
              <a
                href="#sample-reading"
                className="inline-flex items-center justify-center rounded-full border border-white/14 px-6 py-3 text-sm font-medium text-[color:var(--color-foreground)] transition hover:border-white/28 hover:bg-white/6"
              >
                {dict.home.secondaryCta}
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_58%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-white/6 p-6 shadow-[0_24px_80px_rgba(4,10,16,0.45)] backdrop-blur-md">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs tracking-[0.22em] text-[color:var(--color-muted)] uppercase">
                    {dict.home.liveNow}
                  </p>
                  <p className="mt-2 font-serif text-3xl">
                    {dict.shared.categoryLove}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full border border-white/12 bg-[radial-gradient(circle,_rgba(255,248,235,0.32),_rgba(255,248,235,0.02))]" />
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-black/12 p-5">
                  <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
                    {dict.home.exploreTitle}
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--color-muted)]">
                    {dict.home.explorePoints.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[1.5rem] border border-[color:rgba(196,155,98,0.24)] bg-[linear-gradient(180deg,rgba(196,155,98,0.12),rgba(255,255,255,0.03))] p-5">
                  <p className="font-serif text-2xl leading-tight">
                    {dict.home.highlightTitle}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">
                    {dict.home.highlightText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className={isZh ? "max-w-3xl" : "max-w-2xl"}>
            <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
              {dict.home.categoryEyebrow}
            </p>
            <h2
              className={`mt-4 font-serif text-balance ${
                isZh ? "text-3xl leading-[1.14] sm:text-4xl" : "text-4xl"
              }`}
            >
              {dict.home.categoryTitle}
            </h2>
          </div>
          <p
            className={`text-sm leading-7 text-[color:var(--color-muted)] ${
              isZh ? "max-w-2xl" : "max-w-xl"
            }`}
          >
            {dict.home.categoryText}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: dict.shared.categoryLove,
              description: dict.home.categoryLoveDescription,
              status: dict.shared.openNow,
              href: `/${locale}/reading/love`,
              source: "category_preview_love",
            },
            {
              title: dict.shared.categoryTiming,
              description: dict.home.categoryTimingDescription,
              status: dict.shared.comingSoon,
            },
            {
              title: dict.shared.categoryFace,
              description: dict.home.categoryFaceDescription,
              status: dict.shared.comingSoon,
            },
          ].map((category) => (
            <article
              key={category.title}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-serif text-2xl">{category.title}</h3>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs tracking-[0.16em] text-[color:var(--color-muted)] uppercase">
                  {category.status}
                </span>
              </div>
              <p className="mt-5 text-sm leading-7 text-[color:var(--color-muted)]">
                {category.description}
              </p>
              {category.href ? (
                <StartReadingButton
                  locale={locale}
                  source={category.source}
                  pagePath={`/${locale}`}
                  className="mt-8 inline-flex text-sm text-[color:var(--color-accent)] transition hover:text-[color:var(--color-accent-soft)]"
                >
                  {dict.home.enterReading}
                </StartReadingButton>
              ) : (
                <p className="mt-8 text-sm text-[color:var(--color-muted)]">
                  {dict.home.availableLater}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-16 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-12">
        <div>
          <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
            {dict.home.differenceEyebrow}
          </p>
          <h2
            className={`mt-4 font-serif text-balance ${
              isZh ? "max-w-xl text-3xl leading-[1.14] sm:text-4xl" : "text-4xl"
            }`}
          >
            {dict.home.differenceTitle}
          </h2>
        </div>
        <div className="space-y-6 text-base leading-8 text-[color:var(--color-muted)]">
          <p>{dict.home.differenceTextOne}</p>
          <p>{dict.home.differenceTextTwo}</p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-8 md:p-10">
          <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
            {dict.home.howItWorksEyebrow}
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {dict.home.steps.map((item, index) => (
              <div
                key={item.title}
                className="rounded-[1.5rem] border border-white/10 bg-black/10 p-6"
              >
                <p className="text-xs tracking-[0.2em] text-[color:var(--color-accent)] uppercase">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 font-serif text-2xl">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[color:var(--color-muted)]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="sample-reading"
        className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-12"
      >
        <div className={isZh ? "mb-10 max-w-3xl" : "mb-10 max-w-2xl"}>
          <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
            {dict.home.sampleEyebrow}
          </p>
          <h2
            className={`mt-4 font-serif text-balance ${
              isZh ? "text-3xl leading-[1.16] sm:text-4xl" : "text-4xl"
            }`}
          >
            {dict.home.sampleTitle}
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
                  {dict.home.sampleCardEyebrow}
                </p>
                <p className="mt-2 font-serif text-3xl">
                  {dict.shared.categoryLove}
                </p>
              </div>
              <span className="rounded-full border border-[color:rgba(196,155,98,0.22)] px-3 py-1 text-xs tracking-[0.18em] text-[color:var(--color-accent)] uppercase">
                {dict.home.previewLabel}
              </span>
            </div>

            <div className="space-y-5">
              {dict.home.sampleReading.map((section) => (
                <article
                  key={section.title}
                  className="rounded-[1.5rem] border border-white/8 bg-black/10 p-5"
                >
                  <h3 className="font-serif text-2xl">{section.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">
                    {section.text}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-5 rounded-[2rem] border border-white/10 bg-white/4 p-6 md:p-8">
            <div>
              <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
                {dict.home.lockedEyebrow}
              </p>
              <h3 className="mt-3 font-serif text-3xl">
                {dict.home.lockedTitle}
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {dict.home.lockedModules.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] border border-dashed border-white/14 bg-black/10 p-5 text-sm text-[color:var(--color-muted)]"
                >
                  {item}
                </div>
              ))}
            </div>
            <p className="text-sm leading-7 text-[color:var(--color-muted)]">
              {dict.home.lockedText}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-24 pt-12 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] border border-[color:rgba(196,155,98,0.2)] bg-[linear-gradient(180deg,rgba(196,155,98,0.12),rgba(255,255,255,0.03))] p-8 md:flex md:items-end md:justify-between md:gap-10">
          <div className={isZh ? "max-w-3xl" : "max-w-2xl"}>
            <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
              {dict.home.finalEyebrow}
            </p>
            <h2
              className={`mt-4 font-serif text-balance ${
                isZh ? "text-3xl leading-[1.14] sm:text-4xl" : "text-4xl"
              }`}
            >
              {dict.home.finalTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[color:var(--color-muted)]">
              {dict.shared.disclaimer}
            </p>
          </div>
          <StartReadingButton
            locale={locale}
            source="footer_cta"
            pagePath={`/${locale}`}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-accent-soft)] md:mt-0"
          >
            {dict.home.finalCta}
          </StartReadingButton>
        </div>
      </section>
    </main>
  );
}
