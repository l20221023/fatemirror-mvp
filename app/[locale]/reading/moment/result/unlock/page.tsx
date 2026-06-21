import Link from "next/link";
import { notFound } from "next/navigation";

import { LanguageSwitcher } from "../../../../../components/language-switcher";
import { getDictionary, hasLocale } from "../../../../../../lib/i18n";

type UnlockPageProps = PageProps<"/[locale]/reading/moment/result/unlock">;

export default async function UnlockPage(props: UnlockPageProps) {
  const { locale } = await props.params;
  if (!hasLocale(locale)) notFound();

  const searchParams = await props.searchParams;
  const sid = typeof searchParams.sid === "string" ? searchParams.sid : "";
  const dict = getDictionary(locale);
  const query = sid ? `sid=${sid}` : "";

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10 sm:px-8 lg:px-12">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link href={`/${locale}`} className="text-sm tracking-[0.28em] text-[color:var(--color-muted)] uppercase">
          {dict.shared.brand}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <LanguageSwitcher locale={locale} pathSuffix="/reading/moment/result/unlock" queryString={query} />
          <Link href={`/${locale}`} className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {dict.shared.navHome}
          </Link>
        </div>
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 shadow-[0_24px_80px_rgba(4,10,16,0.35)] md:p-10">
        <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
          {locale === "zh" ? "演示入口" : dict.momentResult.paywallTitle}
        </p>
        <h1 className="mt-4 font-serif text-5xl text-balance">
          {locale === "zh" ? "查看完整层" : dict.momentResult.unlockPageTitle}
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-[color:var(--color-muted)]">
          {locale === "zh"
            ? "当前 MVP 保留了解锁页形态，但默认不持久化问题原文。继续后会仅以 `paid=1` 的演示方式返回结果页。"
            : dict.momentResult.unlockPageText}
        </p>
        <Link
          href={`/${locale}/reading/moment/result?sid=${sid}&paid=1`}
          className="mt-10 inline-flex rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)]"
        >
          {locale === "zh" ? "返回完整结果" : dict.momentResult.unlockPageDemo}
        </Link>
      </section>
    </main>
  );
}
