import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StartReadingButton } from "../components/start-reading-button";
import { TrackEvent } from "../components/track-event";
import { LanguageSwitcher } from "../components/language-switcher";
import { getDictionary, hasLocale } from "../../lib/i18n";

type LocalizedHomePageProps = PageProps<"/[locale]">;

export default async function LocalizedHomePage(props: LocalizedHomePageProps) {
  const { locale } = await props.params;
  if (!hasLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const isZh = locale === "zh";

  const relationshipTools = [
    {
      title: isZh ? "关系与连接解读" : "Relationship & Connection Reading",
      description: isZh
        ? "需要双方出生日期、性别、关系阶段和一个真实问题。先给出确定性匹配结果，再给出现实解释和行动建议。"
        : "Use both birthdays, genders, the current stage, and one real question. The flow returns a deterministic match result first, then a grounded interpretation.",
      href: "/reading/love",
      cta: isZh ? "开始关系解读" : "Start relationship reading",
      note: isZh ? "综合 Reading" : "Guided reading",
      source: "home_relationship_primary",
    },
    {
      title: dict.advice.homeEntry.title,
      description: dict.advice.homeEntry.description,
      href: "/reading/advice",
      cta: dict.advice.homeEntry.cta,
      note: dict.advice.homeEntry.note,
      source: "home_relationship_advice_alpha",
    },
    {
      title: isZh ? "双方命卦匹配" : "Ming Gua Match",
      description: isZh
        ? "需要双方出生年份和性别，会得到传统正配、同组或跨组匹配结果，并附现实关系提醒。"
        : "Use two birth years and genders to compare the two Ming Gua groups and see the traditional match type.",
      href: "/reading/ming-gua-match",
      cta: isZh ? "查看双方匹配" : "View match",
      note: isZh ? "基础工具" : "Base tool",
      source: "home_relationship_match",
    },
    {
      title: isZh ? "婚配方位" : "Marriage Direction",
      description: isZh
        ? "需要公历生日，可选出生地说明。会返回传统方位轴与完整计算轨迹。"
        : "Use a Gregorian birth date and optional birthplace note to get the traditional direction axis and full calculation trace.",
      href: "/reading/marriage-direction",
      cta: isZh ? "计算婚配方位" : "Calculate direction",
      note: isZh ? "基础工具" : "Base tool",
      source: "home_relationship_direction",
    },
  ];

  const otherTools = [
    {
      title: isZh ? "我的命卦" : "My Ming Gua",
      description: isZh
        ? "需要出生年份和性别，会得到命卦数字、分组、本卦方位和有利方向。"
        : "Use a birth year and gender to calculate the palace number, group, home direction, and favorable directions.",
      href: "/reading/ming-gua",
      cta: isZh ? "计算我的命卦" : "Calculate my Ming Gua",
      note: isZh ? "个人解读" : "Personal",
      source: "home_personal_ming_gua",
    },
    {
      title: isZh ? "此刻之问" : "Moment Question",
      description: isZh
        ? "需要起念时刻和你此刻最想问的问题。会根据农历与时辰计算小六壬结果。"
        : "Use the moment of inquiry and your current question to calculate a deterministic Xiao Liu Ren result.",
      href: "/reading/moment",
      cta: isZh ? "开始此刻之问" : "Start moment question",
      note: isZh ? "即时解读" : "Immediate",
      source: "home_moment_question",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-6 pb-14 pt-8 sm:px-8 lg:px-12">
      <TrackEvent eventName="landing_view" page={`/${locale}`} metadata={{ locale, surface: "home" }} />
      <header className="flex flex-wrap items-center justify-between gap-4 py-4">
        <Link href={`/${locale}`} className="text-sm tracking-[0.32em] text-[color:var(--color-muted)] uppercase">
          {dict.shared.brand}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Link href={`/${locale}/about`} className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {dict.shared.navAbout}
          </Link>
          <Link href={`/${locale}/methodology`} className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {isZh ? "方法说明" : "Methodology"}
          </Link>
          <Link href={`/${locale}/disclaimer`} className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {dict.shared.navDisclaimer}
          </Link>
          <LanguageSwitcher locale={locale} pathSuffix="" />
        </div>
      </header>

      <section className="py-12 lg:py-16">
        <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
          {isZh ? "传统规则，现代界面，保留判断权" : "Traditional rules, modern interface, retained judgment"}
        </p>
        <h1 className="mt-6 max-w-4xl font-serif text-5xl leading-tight text-balance sm:text-6xl">
          {isZh
            ? "先看关系、自己和当下，再决定怎么行动。"
            : "Read relationship, self, and timing without handing over your judgment."}
        </h1>
        <p className="mt-8 max-w-3xl text-lg leading-8 text-[color:var(--color-muted)]">
          {isZh
            ? "FateMirror 用确定性代码完成日期、农历、命卦、六神和方位计算，再把结果整理成适合现实反思的阅读界面。"
            : "FateMirror uses deterministic code for dates, lunar conversion, palace values, six-deity results, and directions, then presents them in a reflection-friendly interface."}
        </p>
        <div className="mt-10">
          <StartReadingButton locale={locale} source="home_primary_relationship_cta" pagePath={`/${locale}`} destinationPath="/reading/love" className="inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-accent-soft)]">
            {isZh ? "开始关系解读" : "Start relationship reading"}
          </StartReadingButton>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[color:var(--color-muted)]">
            {isZh
              ? "如果你主要想看两个人的关系走向、匹配方式和现实提醒，就从这里开始。"
              : "If your main goal is to understand a connection between two people, this is the clearest starting point."}
          </p>
        </div>
      </section>

      <SectionBand eyebrow={isZh ? "关系解读" : "Relationship"} title={isZh ? "当问题的核心是两个人之间会发生什么" : "When the question is fundamentally about two people"}>
        <ToolGrid locale={locale} items={relationshipTools} />
      </SectionBand>

      <SectionBand eyebrow={isZh ? "个人与即时" : "Personal & Immediate"} title={isZh ? "当你只想确认自己的命卦，或读一下此刻的节奏" : "When you only need your own profile or a quick read of the moment"}>
        <ToolGrid locale={locale} items={otherTools} />
      </SectionBand>
    </main>
  );
}

function SectionBand({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode; }) {
  return (
    <section className="py-8">
      <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-8">
        <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">{eyebrow}</p>
        <h2 className="mt-4 max-w-4xl font-serif text-4xl text-balance">{title}</h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function ToolGrid({ locale, items }: { locale: string; items: Array<{ title: string; description: string; href: string; cta: string; source: string; note?: string; }>; }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {items.map((item) => (
        <article key={item.title} className="rounded-[1.5rem] border border-white/10 bg-black/10 p-6">
          {item.note ? <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">{item.note}</p> : null}
          <h3 className="mt-3 font-serif text-3xl leading-tight">{item.title}</h3>
          <p className="mt-5 text-sm leading-7 text-[color:var(--color-muted)]">{item.description}</p>
          <StartReadingButton locale={locale as "en" | "zh"} source={item.source} pagePath={`/${locale}`} destinationPath={item.href} className="mt-8 inline-flex min-h-11 items-center rounded-full border border-white/14 px-5 py-2.5 text-sm font-medium text-[color:var(--color-foreground)] transition hover:border-white/28 hover:bg-white/6">
            {item.cta}
          </StartReadingButton>
        </article>
      ))}
    </div>
  );
}