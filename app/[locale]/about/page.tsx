import Link from "next/link";
import { notFound } from "next/navigation";

import { LanguageSwitcher } from "../../components/language-switcher";
import { getDictionary, hasLocale } from "../../../lib/i18n";

type AboutPageProps = PageProps<"/[locale]/about">;

const UPDATED_AT = "2026-07-01";

export default async function AboutPage(props: AboutPageProps) {
  const { locale } = await props.params;
  if (!hasLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const isZh = locale === "zh";

  const cards = isZh
    ? [
        ["FateMirror 是什么", "FateMirror 是一个把传统历法、命卦、小六壬和关系观察规则放进可复算程序中的阅读工具。它提供的是文化体验、自我观察和关系反思，而不是绝对化命运判断。"],
        ["当前版本", "当前版本为 V0.4 closed beta。重点包括关系建议报告、受控报告持久化、访问凭据、过期清理、Cohort 统计、基础工具和方法透明度。"],
        ["已经实现的方法", "当前已实现：公历转农历、小六壬、命卦、双方命卦匹配、婚配方位、关系建议报告，以及对应 API、trace、测试和封闭测试访问控制。"],
        ["暂未实现的方法", "本轮未实现也不会伪装预埋：梅花易数、称骨算命、五行体质、面相、声相、行相、医疗预测、灾祸预测和付费化解。"],
        ["计算层与 AI 文案层", "日期、农历、命卦、六神、匹配类型和方位由确定性程序计算。AI 只可用于关系建议的扩展表达和结构整理，不能改写基础事实、重算结果或制造虚构评分。"],
        ["产品定位与隐私", "基础工具仍以会话态和本地草稿为主；V0.4 的关系建议报告采用受控持久化，报告通过访问凭据读取，并支持用户主动删除与过期清理。"],
        ["反馈入口", "封闭测试阶段优先收集具体页面、文案和结果结构反馈。站内反馈会逐步补齐，当前先保证报告边界和方法说明可被验证。"],
        ["最后更新时间", UPDATED_AT],
      ]
    : [
        ["What FateMirror is", "FateMirror puts traditional calendar, Ming Gua, Xiao Liu Ren, and relationship-observation rules into reproducible code. It is for cultural reflection, not absolute fate claims."],
        ["Current version", "The current release is V0.4 closed beta, focused on relationship-advice reports, controlled report persistence, access credentials, expiration cleanup, cohort metrics, base tools, and methodology transparency."],
        ["Implemented methods", "Implemented today: Gregorian-to-lunar conversion, Xiao Liu Ren, Ming Gua, Ming Gua match, marriage direction, relationship-advice reports, APIs, traces, tests, and closed-beta access control."],
        ["Not implemented", "Explicitly excluded in this round: Plum Blossom Divination, bone-weight fortune, five-element constitution, face, voice, gait, medical prediction, disaster prediction, and paid remedies."],
        ["Calculation vs AI copy", "Dates, lunar conversion, palace values, six-deity results, match types, and directions are deterministic code outputs. AI can expand and structure relationship-advice language, but cannot alter base facts or recalculate results."],
        ["Positioning and privacy", "Base tools still rely mainly on session state and local drafts. V0.4 relationship-advice reports use controlled persistence, access credentials, active deletion, and expiration cleanup."],
        ["Feedback", "Closed beta prioritizes feedback on pages, copy, and result structure. In-product feedback will be expanded after the report boundaries are stable."],
        ["Last updated", UPDATED_AT],
      ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 py-8 sm:px-8 lg:px-12">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link href={`/${locale}`} className="font-serif text-base tracking-[0.18em] text-[color:var(--color-foreground)]">
          {dict.shared.brand}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
          <LanguageSwitcher locale={locale} pathSuffix="/about" />
          <Link href={`/${locale}/methodology`} className="text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {isZh ? "方法说明" : "Methodology"}
          </Link>
          <Link href={`/${locale}`} className="text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {dict.shared.navHome}
          </Link>
        </div>
      </div>

      <section className="rounded-[1.75rem] border border-[color:var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-6 md:p-9">
        <p className="text-xs tracking-[0.22em] text-[color:var(--color-accent-secondary)] uppercase">
          {isZh ? "关于 FateMirror" : "About FateMirror"}
        </p>
        <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight text-balance sm:text-5xl">
          {isZh ? "把规则讲清楚，比把结果说得神秘更重要。" : "Explaining the rules clearly matters more than making the result sound mystical."}
        </h1>

        <div className="mt-9 grid gap-5">
          {cards.map(([title, text]) => (
            <article key={title} className="rounded-[1.25rem] border border-[color:var(--color-border)] bg-[rgba(15,17,25,0.62)] p-5">
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
