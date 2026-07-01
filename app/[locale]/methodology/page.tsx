import Link from "next/link";
import { notFound } from "next/navigation";

import { LanguageSwitcher } from "../../components/language-switcher";
import { getDictionary, hasLocale } from "../../../lib/i18n";
import { LUNAR_LIBRARY } from "../../../lib/lunar-converter";
import { MARRIAGE_DIRECTION_ALGORITHM_VERSION } from "../../../lib/marriage-direction";
import { MING_GUA_ALGORITHM_VERSION } from "../../../lib/ming-gong";
import { XIAOLIU_REN_ALGORITHM_VERSION } from "../../../lib/xiaoliu-ren";

type MethodologyPageProps = PageProps<"/[locale]/methodology">;

export default async function MethodologyPage(props: MethodologyPageProps) {
  const { locale } = await props.params;
  if (!hasLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const isZh = locale === "zh";

  const sections = isZh
    ? [
        {
          id: "general",
          title: "通用规则",
          items: [
            "支持公历年份：1900-2100。",
            `农历适配库：${LUNAR_LIBRARY.name} ${LUNAR_LIBRARY.version}。`,
            "日期、农历、命卦、六神、匹配类型和方位都由确定性规则计算。",
            "传统文化方法不是科学预测，同一输入应得到同一结果。",
          ],
        },
        {
          id: "xiaoliu-ren",
          title: "小六壬 / 此刻之问",
          items: [
            "输入：ISO 时间、IANA 时区，以及可选问题文本。",
            "计算：农历月 + 农历日 + 时辰序号，再按 mod 6 落位。",
            "23:00-23:59 视为子时；当前版本仍按本地日期对应的农历日期计算。",
            "闰月沿用同名月份数字，同时保留闰月标记。",
            `算法版本：${XIAOLIU_REN_ALGORITHM_VERSION}。`,
          ],
        },
        {
          id: "ming-gua",
          title: "命卦",
          items: [
            "输入：出生年份与性别。命卦也常被称为命宫或三元命卦。",
            "公式：男命 11 - 基数；女命 4 + 基数。",
            "5 中宫规则：男命转 2，女命转 8。",
            "结果只分为东四命与西四命，作为传统观察视角参考。",
            `算法版本：${MING_GUA_ALGORITHM_VERSION}。`,
          ],
        },
        {
          id: "ming-gua-match",
          title: "双方命卦匹配",
          items: [
            "结果只分为：传统正配、同组匹配、跨组匹配。",
            "不使用“凶婚”“克夫”“克妻”等恐吓性表达。",
            "现实关系仍需结合沟通、边界、价值观和生活条件判断。",
            `算法版本：${MING_GUA_ALGORITHM_VERSION}。`,
          ],
        },
        {
          id: "marriage-direction",
          title: "婚配方位",
          items: [
            "结果来自农历月支起点加日数顺推。",
            "输出是方向轴，不是精确城市或地理坐标。",
            "不代表伴侣一定来自该方位。",
            `算法版本：${MARRIAGE_DIRECTION_ALGORITHM_VERSION}。`,
          ],
        },
        {
          id: "advice",
          title: "关系建议 / Advice Engine",
          items: [
            "可观察事实、用户推测、传统结果和未知信息会分开展示。",
            "本地建议始终先生成；AI 只在可用且通过校验时补充扩展内容。",
            "高风险输入会切换到安全优先结果，不继续生成普通关系推进建议。",
            "V0.4 关系建议报告采用受控持久化：报告通过访问凭据读取，支持主动删除，并由过期清理任务处理生命周期。",
            "问题正文不会写进公开 URL；报告页面应保持 noindex，并避免公开分享敏感内容。",
          ],
        },
      ]
    : [
        {
          id: "general",
          title: "General",
          items: [
            "Supported Gregorian years: 1900-2100.",
            `Lunar adapter: ${LUNAR_LIBRARY.name} ${LUNAR_LIBRARY.version}.`,
            "Dates, lunar conversion, palace values, six-deity results, match types, and directions are deterministic code outputs.",
            "Traditional cultural methods are not scientific prediction, and the same input should always produce the same result.",
          ],
        },
        {
          id: "xiaoliu-ren",
          title: "Xiao Liu Ren / Moment Question",
          items: [
            "Input: ISO time, IANA timezone, and optional question text.",
            "Formula: lunar month + lunar day + hour index, then mod 6.",
            "23:00-23:59 is treated as Zi hour; the current version keeps the local-date lunar day mapping.",
            "Leap months keep the same month number while preserving the leap flag.",
            `Method version: ${XIAOLIU_REN_ALGORITHM_VERSION}.`,
          ],
        },
        {
          id: "ming-gua",
          title: "Ming Gua",
          items: [
            "Input: birth year and gender. Ming Gua is also referred to as Ming Gong or San Yuan Ming Gua.",
            "Formula: male 11 - base number; female 4 + base number.",
            "Five-palace rule: male 5 becomes 2, female 5 becomes 8.",
            "Results are grouped as east or west and are presented as a traditional reference only.",
            `Method version: ${MING_GUA_ALGORITHM_VERSION}.`,
          ],
        },
        {
          id: "ming-gua-match",
          title: "Ming Gua Match",
          items: [
            "Outputs are limited to: traditional best pair, same-group match, or cross-group match.",
            "The product avoids fear-based labels or harmful marriage claims.",
            "Real relationships still depend on communication, boundaries, values, and practical life.",
            `Method version: ${MING_GUA_ALGORITHM_VERSION}.`,
          ],
        },
        {
          id: "marriage-direction",
          title: "Marriage Direction",
          items: [
            "The result starts from the lunar month branch and counts forward by the lunar day.",
            "The output is a direction axis, not a precise city or coordinate.",
            "It does not imply that a partner must come from that direction.",
            `Method version: ${MARRIAGE_DIRECTION_ALGORITHM_VERSION}.`,
          ],
        },
        {
          id: "advice",
          title: "Relationship Advice / Advice Engine",
          items: [
            "Observed facts, user inferences, traditional results, and unknowns are displayed separately.",
            "Local advice is always generated first; AI only expands content when available and validated.",
            "High-risk input switches to a safety-first result instead of normal relationship-advancement advice.",
            "V0.4 relationship-advice reports use controlled persistence: reports are read through access credentials, support active deletion, and are covered by expiration cleanup.",
            "Question text is not written into a public URL; report pages should remain noindex and avoid public sharing of sensitive content.",
          ],
        },
      ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-12">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link href={`/${locale}`} className="font-serif text-base tracking-[0.18em] text-[color:var(--color-foreground)]">
          {dict.shared.brand}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
          <LanguageSwitcher locale={locale} pathSuffix="/methodology" />
          <Link href={`/${locale}/about`} className="text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {dict.shared.navAbout}
          </Link>
          <Link href={`/${locale}`} className="text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {dict.shared.navHome}
          </Link>
        </div>
      </div>
      <section className="rounded-[1.75rem] border border-[color:var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-6 md:p-9">
        <p className="text-xs tracking-[0.22em] text-[color:var(--color-accent-secondary)] uppercase">
          {isZh ? "方法说明" : "Methodology"}
        </p>
        <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight text-balance sm:text-5xl">
          {isZh ? "先把规则说清楚，再谈怎么读结果。" : "Explain the rules first, then talk about how to read the result."}
        </h1>
        <p className="mt-5 max-w-4xl text-sm leading-7 text-[color:var(--color-muted)] sm:text-base">
          {isZh
            ? "FateMirror 的基础事实来自可测试的确定性函数。AI 只能作为可选的语言整理层，不能重算、改写或替代现实判断。"
            : "Every base fact in FateMirror comes from testable deterministic functions. AI is an optional language layer and cannot recalculate, alter facts, or replace real-world judgment."}
        </p>
        <div className="mt-9 space-y-5">
          {sections.map((section) => (
            <article key={section.id} id={section.id} className="scroll-mt-24 rounded-[1.25rem] border border-[color:var(--color-border)] bg-[rgba(15,17,25,0.62)] p-5">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <ul className="mt-4 space-y-2 text-sm leading-7 text-[color:var(--color-muted)]">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
