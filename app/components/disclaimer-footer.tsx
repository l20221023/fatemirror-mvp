import type { Locale } from "../../lib/i18n";

type DisclaimerFooterProps = {
  locale: Locale;
};

export function DisclaimerFooter({ locale }: DisclaimerFooterProps) {
  const items =
    locale === "zh"
      ? [
          "本平台内容基于传统命理方法，属于趋势推演，不构成绝对命运判断。",
          "涉及情绪、体质或调养的内容，仅作传统文化参考，不构成医疗建议。",
          "你基于本平台内容所做的任何决定，仍应由你自己负责与判断。",
        ]
      : [
          "All content is based on traditional metaphysical interpretation and reflects tendencies, not absolute destiny.",
          "Any emotional, wellness, or body-related guidance is cultural reference only and not medical advice.",
          "Decisions made from this reading remain the user's own responsibility and judgment.",
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
    </footer>
  );
}
