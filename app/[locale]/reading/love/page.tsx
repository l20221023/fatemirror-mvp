import Link from "next/link";
import { notFound } from "next/navigation";

import { LanguageSwitcher } from "../../../components/language-switcher";
import { LoveReadingForm } from "../../../components/readings/love-reading-form";
import { getDictionary, hasLocale } from "../../../../lib/i18n";

type LocalizedLoveFormPageProps = PageProps<"/[locale]/reading/love">;

export default async function LocalizedLoveFormPage(props: LocalizedLoveFormPageProps) {
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
          <LanguageSwitcher locale={locale} pathSuffix="/reading/love" />
          <Link href={`/${locale}/about`} className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {dict.shared.navAbout}
          </Link>
          <Link href={`/${locale}`} className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {dict.loveForm.backHome}
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.94fr_1.06fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
            {locale === "zh" ? "关系解读" : dict.shared.categoryLove}
          </p>
          <h1 className="mt-4 font-serif text-5xl text-balance leading-tight">
            {locale === "zh" ? "关系与连接解读" : dict.loveForm.title}
          </h1>
          <p className="mt-6 text-base leading-8 text-[color:var(--color-muted)]">
            {locale === "zh"
              ? "这条路径会先用双方命卦给出确定性匹配结果，再在不改变事实的前提下生成可选解释。"
              : dict.loveForm.intro}
          </p>
          <div className="mt-10 space-y-4">
            {(locale === "zh"
              ? [
                  "需要输入双方出生日期、公式性别、关系阶段和你当前最在意的问题。",
                  "先给出双方命卦与匹配类型，再补一层现实解释和行动建议。",
                  "生日和问题不会进入 URL，只保留在当前浏览器会话里。",
                ]
              : dict.loveForm.highlights
            ).map((item) => (
              <div key={item} className="rounded-[1.25rem] border border-white/8 bg-black/10 px-4 py-4 text-sm text-[color:var(--color-muted)]">
                {item}
              </div>
            ))}
          </div>
        </section>

        <LoveReadingForm
          locale={locale}
          labels={{
            title: locale === "zh" ? "开始关系解读" : dict.shared.categoryLove,
            intro:
              locale === "zh"
                ? "本页只把输入保存在当前会话，不会默认长期保存。"
                : dict.loveForm.helper,
            yourName: dict.loveForm.yourName,
            yourNamePlaceholder: dict.loveForm.yourNamePlaceholder,
            yourGender: locale === "zh" ? "你的性别" : dict.loveForm.yourGender,
            yourBirthDate: dict.loveForm.yourBirthDate,
            theirGender: locale === "zh" ? "对方性别" : dict.loveForm.theirGender,
            theirBirthDate: dict.loveForm.theirBirthDate,
            relationshipStage: dict.loveForm.relationshipStage,
            stagePlaceholder: dict.loveForm.stagePlaceholder,
            heartQuestion: dict.loveForm.heartQuestion,
            heartPlaceholder: dict.loveForm.heartPlaceholder,
            submit: locale === "zh" ? "开始关系解读" : dict.loveForm.submit,
            error: dict.loveForm.error,
            birthTimeNote: dict.loveForm.birthTimeNote,
            disclaimer: dict.shared.disclaimer,
            man: dict.shared.man,
            woman: dict.shared.woman,
            chooseOne: locale === "zh" ? "请选择" : "Choose one",
            stageOptions: dict.shared.stageOptions,
          }}
        />
      </div>
    </main>
  );
}
