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

      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-18 pt-8 sm:px-8 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4 py-4">
          <Link
            href={`/${locale}`}
            className="text-sm tracking-[0.32em] text-[color:var(--color-muted)] uppercase"
          >
            {dict.shared.brand}
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link
              href={`/${locale}/about`}
              className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
            >
              {dict.shared.navAbout}
            </Link>
            <Link
              href={`/${locale}/disclaimer`}
              className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
            >
              {dict.shared.navDisclaimer}
            </Link>
            <LanguageSwitcher locale={locale} pathSuffix="" />
          </div>
        </header>

        <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
          <div className="max-w-3xl">
            <p className="mb-6 text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
              {dict.home.eyebrow}
            </p>
            <h1 className="font-serif text-5xl leading-[0.96] text-balance sm:text-6xl lg:text-7xl">
              {dict.home.title}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[color:var(--color-muted)] sm:text-xl">
              {dict.home.subtitle}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <StartReadingButton
                locale={locale}
                source="hero_love_cta"
                pagePath={`/${locale}`}
                destinationPath="/reading/love"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-accent-soft)]"
              >
                {dict.home.primaryCta}
              </StartReadingButton>
              <StartReadingButton
                locale={locale}
                source="hero_moment_cta"
                pagePath={`/${locale}`}
                destinationPath="/reading/moment"
                className="inline-flex items-center justify-center rounded-full border border-white/14 px-6 py-3 text-sm font-medium text-[color:var(--color-foreground)] transition hover:border-white/28 hover:bg-white/6"
              >
                {dict.home.secondaryCta}
              </StartReadingButton>
            </div>
          </div>

          <div className="grid gap-5">
            {[
              {
                title: dict.shared.categoryLove,
                description: dict.home.loveDescription,
                href: "/reading/love",
                source: "home_love_card",
              },
              {
                title: dict.shared.categoryMoment,
                description: dict.home.momentDescription,
                href: "/reading/moment",
                source: "home_moment_card",
              },
              {
                title: locale === "zh" ? "我的命宫" : "My Ming Gua",
                description:
                  locale === "zh"
                    ? "按公历出生年份和公式性别，计算九宫命格、组别和方向组。"
                    : "Calculate the palace number, group, and direction set from birth year and formula gender.",
                href: "/reading/ming-gua",
                source: "home_ming_gua_card",
              },
              {
                title: locale === "zh" ? "婚配方位" : "Marriage Direction",
                description:
                  locale === "zh"
                    ? "把公历生日转为农历生日，再按月支顺数得到传统方向轴。"
                    : "Convert the Gregorian birthday to lunar date, then count from the month branch to a direction axis.",
                href: "/reading/marriage-direction",
                source: "home_marriage_direction_card",
              },
              {
                title: locale === "zh" ? "关系命宫" : "Ming Gua Match",
                description:
                  locale === "zh"
                    ? "比较双方命宫，展示传统正配、同组匹配或跨组匹配。"
                    : "Compare two Ming Gua results as traditional pair, same group, or cross group.",
                href: "/reading/ming-gua-match",
                source: "home_ming_gua_match_card",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_24px_80px_rgba(4,10,16,0.28)] backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
                      {dict.shared.openNow}
                    </p>
                    <h2 className="mt-3 font-serif text-3xl leading-tight">
                      {item.title}
                    </h2>
                  </div>
                  <div className="h-14 w-14 rounded-full border border-white/10 bg-[radial-gradient(circle,_rgba(255,248,235,0.28),_rgba(255,248,235,0.02))]" />
                </div>
                <p className="mt-5 text-sm leading-7 text-[color:var(--color-muted)]">
                  {item.description}
                </p>
                <StartReadingButton
                  locale={locale}
                  source={item.source}
                  pagePath={`/${locale}`}
                  destinationPath={item.href}
                  className="mt-8 inline-flex text-sm text-[color:var(--color-accent)] transition hover:text-[color:var(--color-accent-soft)]"
                >
                  {locale === "zh" ? "进入体验" : "Enter reading"}
                </StartReadingButton>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-8 md:flex md:items-end md:justify-between md:gap-10">
          <div className="max-w-3xl">
            <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
              {dict.home.differenceEyebrow}
            </p>
            <h2 className="mt-4 font-serif text-4xl text-balance">
              {dict.home.differenceTitle}
            </h2>
            <p className="mt-5 text-base leading-8 text-[color:var(--color-muted)]">
              {dict.home.differenceText}
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-4 md:mt-0">
            <StartReadingButton
              locale={locale}
              source="footer_love_cta"
              pagePath={`/${locale}`}
              destinationPath="/reading/love"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-accent-soft)]"
            >
              {dict.home.finalCtaLove}
            </StartReadingButton>
            <StartReadingButton
              locale={locale}
              source="footer_moment_cta"
              pagePath={`/${locale}`}
              destinationPath="/reading/moment"
              className="inline-flex items-center justify-center rounded-full border border-white/14 px-6 py-3 text-sm font-medium text-[color:var(--color-foreground)] transition hover:border-white/28 hover:bg-white/6"
            >
              {dict.home.finalCtaMoment}
            </StartReadingButton>
          </div>
        </div>
      </section>
    </main>
  );
}
