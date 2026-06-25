import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { AdviceForm } from "../../../components/advice/advice-form";
import { BetaAccessPanel } from "../../../components/advice/beta-access-panel";
import { CommercialUpgradeCard } from "../../../components/commercial/commercial-upgrade-card";
import { LanguageSwitcher } from "../../../components/language-switcher";
import { isBetaAccessGrantedFromCookieStore } from "../../../../lib/beta-access/server";
import { getAdviceRuntimeConfig } from "../../../../lib/advice/runtime";
import { getDictionary, hasLocale } from "../../../../lib/i18n";

type LocalizedAdvicePageProps = PageProps<"/[locale]/reading/advice">;

export default async function LocalizedAdvicePage(
  props: LocalizedAdvicePageProps,
) {
  const { locale } = await props.params;
  if (!hasLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const { advice } = dict;
  const betaAccessGranted = isBetaAccessGrantedFromCookieStore(await cookies());
  const { betaEnabled, commercialEnabled } = getAdviceRuntimeConfig();
  const isZh = locale === "zh";

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-12">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/${locale}`}
          className="text-sm tracking-[0.28em] text-[color:var(--color-muted)] uppercase"
        >
          {dict.shared.brand}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <LanguageSwitcher locale={locale} pathSuffix="/reading/advice" />
          <Link
            href={`/${locale}/methodology`}
            className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
          >
            {isZh ? "方法说明" : "Methodology"}
          </Link>
          <Link
            href={`/${locale}`}
            className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
          >
            {isZh ? "首页" : dict.shared.navHome}
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.94fr_1.06fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
              {advice.page.eyebrow}
            </p>
            <span className="rounded-full border border-[color:rgba(196,155,98,0.22)] bg-[rgba(196,155,98,0.12)] px-3 py-1 text-xs text-[color:var(--color-accent)]">
              {advice.alphaBadge}
            </span>
          </div>
          <h1 className="mt-4 font-serif text-5xl text-balance leading-tight">
            {advice.page.title}
          </h1>
          <p className="mt-6 text-base leading-8 text-[color:var(--color-muted)]">
            {advice.page.intro}
          </p>
          <div className="mt-10 space-y-4">
            {advice.page.highlights.map((item) => (
              <div
                key={item}
                className="rounded-[1.25rem] border border-white/8 bg-black/10 px-4 py-4 text-sm text-[color:var(--color-muted)]"
              >
                {item}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <BetaAccessPanel
              enabled={betaEnabled}
              verified={betaAccessGranted}
              label={isZh ? "Beta 访问码" : "Beta access code"}
              placeholder={
                isZh ? "输入邀请码或测试访问码" : "Enter invite or test access code"
              }
              submitLabel={isZh ? "验证" : "Verify"}
              successLabel={isZh ? "Beta 访问已启用" : "Beta access enabled"}
              invalidLabel={
                isZh ? "访问码无效或 Beta 未开启" : "Invalid code or beta is disabled"
              }
            />
          </div>
          {commercialEnabled ? <CommercialUpgradeCard locale={locale} /> : null}
        </section>

        <AdviceForm locale={locale} copy={advice} />
      </div>
    </main>
  );
}
