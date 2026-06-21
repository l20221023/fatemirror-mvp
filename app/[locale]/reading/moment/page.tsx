import Link from "next/link";
import { notFound } from "next/navigation";

import { LanguageSwitcher } from "../../../components/language-switcher";
import { MomentReadingForm } from "../../../components/readings/moment-reading-form";
import { getDictionary, hasLocale } from "../../../../lib/i18n";

type LocalizedMomentFormPageProps = PageProps<"/[locale]/reading/moment">;

export default async function LocalizedMomentFormPage(props: LocalizedMomentFormPageProps) {
  const { locale } = await props.params;
  if (!hasLocale(locale)) notFound();

  const dict = getDictionary(locale);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-12">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link href={`/${locale}`} className="text-sm tracking-[0.28em] text-[color:var(--color-muted)] uppercase">
          {dict.shared.brand}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <LanguageSwitcher locale={locale} pathSuffix="/reading/moment" />
          <Link href={`/${locale}/about`} className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {dict.shared.navAbout}
          </Link>
          <Link href={`/${locale}`} className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {dict.momentForm.backHome}
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.94fr_1.06fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
            {locale === "zh" ? "此刻之问" : dict.shared.categoryMoment}
          </p>
          <h1 className="mt-4 font-serif text-5xl text-balance leading-tight">
            {locale === "zh" ? "此刻之问" : dict.momentForm.title}
          </h1>
          <p className="mt-6 text-base leading-8 text-[color:var(--color-muted)]">
            {locale === "zh"
              ? "这条路径会根据你起念的时刻换算农历与时辰，再按小六壬公式给出确定性结果。"
              : dict.momentForm.intro}
          </p>
          <div className="mt-10 space-y-4">
            {(locale === "zh"
              ? [
                  "需要输入起念时刻和你此刻最想问的问题。",
                  "先给出六神结果、可复算 trace，再补一层现实解释与行动建议。",
                  "问题原文和时间不会写入 URL，只保留在当前会话。",
                ]
              : dict.momentForm.highlights
            ).map((item) => (
              <div key={item} className="rounded-[1.25rem] border border-white/8 bg-black/10 px-4 py-4 text-sm text-[color:var(--color-muted)]">
                {item}
              </div>
            ))}
          </div>
        </section>

        <MomentReadingForm
          locale={locale}
          labels={{
            title: locale === "zh" ? "开始此刻之问" : dict.shared.categoryMoment,
            intro:
              locale === "zh"
                ? "计算仍由确定性规则完成，解释层不可用时会自动退回本地模板。"
                : dict.momentForm.helper,
            yourName: dict.momentForm.yourName,
            yourNamePlaceholder: dict.momentForm.yourNamePlaceholder,
            question: dict.momentForm.question,
            questionPlaceholder: dict.momentForm.questionPlaceholder,
            submit: locale === "zh" ? "开始此刻之问" : dict.momentForm.submit,
            error: dict.momentForm.error,
            disclaimer: dict.shared.disclaimer,
          }}
        />
      </div>
    </main>
  );
}
