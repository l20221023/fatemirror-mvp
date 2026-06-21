import Link from "next/link";

import type { Locale } from "../../../lib/i18n";

export function ReadingDisclaimer({ locale }: { locale: Locale }) {
  const isZh = locale === "zh";

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/12 p-5 text-sm leading-7 text-[color:var(--color-muted)]">
      {isZh
        ? "FateMirror 的计算基于公开整理的传统历法与命理规则，仅用于文化体验、自我观察和关系反思。结果不构成对婚姻、职业、投资、健康、法律或其他重大事项的确定性判断，不能替代专业意见。"
        : "FateMirror uses deterministic rules drawn from publicly documented traditional calendar and divination methods. Results are for cultural exploration and reflection only, and they do not replace professional advice on relationships, health, law, finance, or other major decisions."}
      <div className="mt-3 flex flex-wrap gap-4">
        <Link
          href={`/${locale}/disclaimer`}
          className="text-[color:var(--color-accent)] transition hover:text-[color:var(--color-accent-soft)]"
        >
          {isZh ? "查看免责声明" : "View disclaimer"}
        </Link>
        <Link
          href={`/${locale}/methodology`}
          className="text-[color:var(--color-accent)] transition hover:text-[color:var(--color-accent-soft)]"
        >
          {isZh ? "查看方法说明" : "View methodology"}
        </Link>
      </div>
    </div>
  );
}
