import Link from "next/link";
import { notFound } from "next/navigation";

import { LanguageSwitcher } from "../../components/language-switcher";
import { getDictionary, hasLocale } from "../../../lib/i18n";

type DisclaimerPageProps = PageProps<"/[locale]/disclaimer">;

export default async function DisclaimerPage(props: DisclaimerPageProps) {
  const { locale } = await props.params;
  if (!hasLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const isZh = locale === "zh";

  const items = isZh
    ? [
        "FateMirror 的计算基于公开整理的传统历法与命理规则，仅用于文化体验、自我观察和关系反思。",
        "结果不构成对婚姻、职业、投资、健康、法律或其他重大事项的确定性判断，不能替代专业意见。",
        "日期换算、命卦、六神、匹配类型和方向结果由固定程序计算；自然语言说明可能由模板或 AI 辅助生成，但不会改变基础事实。",
        "当前版本不提供医疗、疾病、怀孕、灾祸、死亡、投资收益或付费化解相关预测。",
      ]
    : [
        "FateMirror is based on publicly documented traditional calendar and metaphysical rules and is intended only for cultural exploration, self-observation, and relationship reflection.",
        "Its results are not deterministic judgments about marriage, career, investment, health, law, or any other major decision, and they do not replace professional advice.",
        "Date conversion, palace values, six-deity results, match types, and directions are computed by fixed code. Natural-language explanation may use templates or AI assistance, but it cannot change the underlying facts.",
        "This version does not provide medical, pregnancy, disaster, death, investment-return, or paid-remedy prediction.",
      ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10 sm:px-8 lg:px-12">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link href={`/${locale}`} className="text-sm tracking-[0.28em] text-[color:var(--color-muted)] uppercase">
          {dict.shared.brand}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <LanguageSwitcher locale={locale} pathSuffix="/disclaimer" />
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
          {isZh ? "免责声明" : "Disclaimer"}
        </p>
        <h1 className="mt-4 font-serif text-5xl text-balance leading-tight">
          {isZh
            ? "传统视角可以提供提示，但不能替代现实责任与专业判断。"
            : "Traditional perspective can be useful, but it does not replace real-world responsibility or professional judgment."}
        </h1>

        <div className="mt-10 grid gap-6">
          {items.map((item) => (
            <article key={item} className="rounded-[1.5rem] border border-white/10 bg-black/10 p-6 text-base leading-8 text-[color:var(--color-muted)]">
              {item}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
