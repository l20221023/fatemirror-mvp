import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LanguageSwitcher } from "../../components/language-switcher";
import { getDictionary, hasLocale } from "../../../lib/i18n";

type PrivacyPageProps = PageProps<"/[locale]/privacy">;

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PrivacyPage(props: PrivacyPageProps) {
  const { locale } = await props.params;
  if (!hasLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const isZh = locale === "zh";

  const sections = isZh
    ? [
        {
          title: "默认不持久化",
          text: "Advice 内测结果默认只保留在当前页面会话内，不写入 URL，也不会自动长期保存到浏览器本地存储。",
        },
        {
          title: "敏感文本最小化",
          text: "请不要填写真实姓名、手机号、住址、证件号、单位或其他第三方真实身份信息。页面与前端错误处理不会主动打印完整问题正文。",
        },
        {
          title: "AI 与日志边界",
          text: "如启用 AI 扩展，传递给模型的是结构化事实和本地建议，不向普通用户暴露完整 Prompt、模型原始响应或内部错误栈。",
        },
      ]
    : [
        {
          title: "No default persistence",
          text: "Advice test results stay in the current page session by default, are not written into the URL, and are not automatically persisted to browser storage.",
        },
        {
          title: "Minimum sensitive text",
          text: "Do not include names, phone numbers, addresses, IDs, workplaces, or real third-party identity details. The page and frontend error handling do not intentionally print your raw question text.",
        },
        {
          title: "AI and logging boundaries",
          text: "When AI expansion is enabled, only structured facts and local advice are sent to the model. Production users are not shown full prompts, raw model responses, or internal stack traces.",
        },
      ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-12">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/${locale}`}
          className="text-sm tracking-[0.28em] text-[color:var(--color-muted)] uppercase"
        >
          {dict.shared.brand}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <LanguageSwitcher locale={locale} pathSuffix="/privacy" />
          <Link
            href={`/${locale}/disclaimer`}
            className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
          >
            {isZh ? "免责声明" : dict.shared.navDisclaimer}
          </Link>
          <Link
            href={`/${locale}`}
            className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
          >
            {isZh ? "首页" : dict.shared.navHome}
          </Link>
        </div>
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 md:p-10">
        <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
          {isZh ? "隐私说明" : "Privacy"}
        </p>
        <h1 className="mt-4 font-serif text-5xl text-balance leading-tight">
          {isZh
            ? "先说明输入边界和存储边界，再继续做建议生成。"
            : "Explain input and storage boundaries first, then continue with advice generation."}
        </h1>
        <p className="mt-6 max-w-4xl text-base leading-8 text-[color:var(--color-muted)]">
          {isZh
            ? "这个页面用于说明 Advice 内部测试目前如何处理文本输入、结果展示、AI 扩展和默认存储策略。"
            : "This page explains how the Advice internal test currently handles text input, result display, AI expansion, and default storage policy."}
        </p>

        <div className="mt-10 space-y-6">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-[1.5rem] border border-white/10 bg-black/10 p-6"
            >
              <h2 className="font-serif text-3xl">{section.title}</h2>
              <p className="mt-4 text-base leading-8 text-[color:var(--color-muted)]">
                {section.text}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
