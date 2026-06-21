import Link from "next/link";
import { notFound } from "next/navigation";

import { LanguageSwitcher } from "../../components/language-switcher";
import { getDictionary, hasLocale } from "../../../lib/i18n";

type AboutPageProps = PageProps<"/[locale]/about">;

const UPDATED_AT = "2026-06-21";

export default async function AboutPage(props: AboutPageProps) {
  const { locale } = await props.params;
  if (!hasLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const isZh = locale === "zh";

  const cards = isZh
    ? [
        ["FateMirror 是什么", "FateMirror 是一个把传统历法、命卦、小六壬和婚配方位规则放进可复算程序中的阅读工具。它提供的是文化体验、自我观察和关系反思，而不是绝对化命运判断。"],
        ["当前版本", "当前版本为 MVP 0.2，重点完成基础 Reading Engine、统一结果页、隐私边界、方法透明度和测试基线。"],
        ["已经实现的方法", "当前已实现：公历转农历、小六壬、命卦、双方命卦匹配、婚配方位，以及对应 API、trace 和测试。"],
        ["暂未实现的方法", "本轮未实现也不会偷偷预埋：梅花易数、称骨算命、五行体质、面相、声相、行相、医疗预测、灾祸预测、付费化解等被排除内容。"],
        ["计算层与 AI 文案层", "日期、农历、命卦、六神、匹配类型和方向都由确定性程序计算。AI 只可用于可选文案整理，不能改写事实、重算结果或制造虚构评分。"],
        ["产品定位与隐私", "FateMirror 默认不持久化用户生日、关系问题和历史结果。含个人输入的结果页改为会话态传递，不再直接暴露在 URL 查询参数中。"],
        ["反馈入口", "当前可通过仓库协作渠道反馈问题与文案建议。站内正式反馈入口尚未在本轮实现。"],
        ["最后更新时间", UPDATED_AT],
      ]
    : [
        ["What FateMirror is", "FateMirror is a reading tool that puts traditional calendar, palace, Xiao Liu Ren, and direction rules into reproducible code. It is for cultural reflection, not absolute fate claims."],
        ["Current version", "The current release is MVP 0.2, focused on the base reading engine, unified result pages, privacy boundaries, methodology, and test coverage."],
        ["Implemented methods", "Implemented today: Gregorian-to-lunar conversion, Xiao Liu Ren, Ming Gua, Ming Gua match, marriage direction, plus the related APIs, traces, and tests."],
        ["Not implemented", "Explicitly excluded in this round: Plum Blossom Divination, bone-weight fortune, five-element constitution, face, voice, gait, medical prediction, disaster prediction, and paid remedies."],
        ["Calculation vs AI copy", "Dates, lunar conversion, palace numbers, six-deity results, match types, and directions are deterministic code outputs. AI is optional language polish only and cannot change the facts."],
        ["Positioning and privacy", "FateMirror does not persist birthdays, relationship questions, or result history by default. Personal-input result flows now use session state instead of raw query strings."],
        ["Feedback", "Feedback currently goes through the repository and team collaboration channels. An in-product feedback surface is still pending."],
        ["Last updated", UPDATED_AT],
      ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10 sm:px-8 lg:px-12">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link href={`/${locale}`} className="text-sm tracking-[0.28em] text-[color:var(--color-muted)] uppercase">
          {dict.shared.brand}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <LanguageSwitcher locale={locale} pathSuffix="/about" />
          <Link href={`/${locale}/methodology`} className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {isZh ? "方法说明" : "Methodology"}
          </Link>
          <Link href={`/${locale}`} className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {dict.shared.navHome}
          </Link>
        </div>
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 md:p-10">
        <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
          {isZh ? "关于 FateMirror" : "About FateMirror"}
        </p>
        <h1 className="mt-4 font-serif text-5xl text-balance leading-tight">
          {isZh
            ? "把传统规则讲清楚，比把结果说得神秘更重要。"
            : "Explaining the rules clearly matters more than making the result sound mystical."}
        </h1>

        <div className="mt-10 grid gap-6">
          {cards.map(([title, text]) => (
            <article key={title} className="rounded-[1.5rem] border border-white/10 bg-black/10 p-6">
              <h2 className="font-serif text-3xl">{title}</h2>
              <p className="mt-4 text-base leading-8 text-[color:var(--color-muted)]">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
