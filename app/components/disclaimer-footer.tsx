import type { Locale } from "../../lib/i18n";
import Link from "next/link";

type DisclaimerFooterProps = {
  locale: Locale;
};

export function DisclaimerFooter({ locale }: DisclaimerFooterProps) {
  const items =
    locale === "zh"
      ? [
          "FateMirror 的计算基于公开整理的传统历法与命理规则，仅用于文化体验、自我观察和关系反思。",
          "结果不构成对婚姻、职业、投资、健康、法律或其他重大事项的确定性判断，不能替代专业意见。",
          "日期换算、命卦、六神和方向结果由固定程序规则计算；自然语言解释可能由模板或人工智能辅助生成，但不会改变基础计算结果。",
        ]
      : [
          "FateMirror uses fixed traditional-calendar and metaphysical rules for cultural reflection and self-observation.",
          "Results are not deterministic judgments about marriage, career, investment, health, law, or other major decisions.",
          "Dates, palaces, six-deity results, and directions are computed by code; language polish may be assisted by templates or AI, but never changes the underlying facts.",
        ];

  return (
    <footer className="rounded-[2rem] border border-white/10 bg-black/12 p-6">
      <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
        {locale === "zh" ? "免责声明" : "Disclaimer"}
      </p>
      <div className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--color-muted)]">
        {items.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <Link href={`/${locale}/disclaimer`} className="text-[color:var(--color-accent)] transition hover:text-[color:var(--color-accent-soft)]">
          {locale === "zh" ? "查看完整免责声明" : "Full disclaimer"}
        </Link>
        <Link href={`/${locale}/methodology`} className="text-[color:var(--color-accent)] transition hover:text-[color:var(--color-accent-soft)]">
          {locale === "zh" ? "查看方法说明" : "Methodology"}
        </Link>
      </div>
    </footer>
  );
}
