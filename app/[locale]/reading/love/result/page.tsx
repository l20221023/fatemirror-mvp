import Link from "next/link";
import { notFound } from "next/navigation";

import { LanguageSwitcher } from "../../../../components/language-switcher";
import { LoveReadingResult } from "../../../../components/readings/love-reading-result";
import { getDictionary, hasLocale } from "../../../../../lib/i18n";

type LocalizedLoveResultPageProps = PageProps<"/[locale]/reading/love/result">;

export default async function LocalizedLoveResultPage(props: LocalizedLoveResultPageProps) {
  const { locale } = await props.params;
  if (!hasLocale(locale)) notFound();

  const searchParams = await props.searchParams;
  const sid = typeof searchParams.sid === "string" ? searchParams.sid : "";
  const isPaid = searchParams.paid === "1";
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-12">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link href={`/${locale}`} className="text-sm tracking-[0.28em] text-[color:var(--color-muted)] uppercase">
          {dict.shared.brand}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <LanguageSwitcher locale={locale} pathSuffix="/reading/love/result" queryString={sid ? `sid=${sid}${isPaid ? "&paid=1" : ""}` : undefined} />
          <Link href={`/${locale}`} className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {dict.shared.navHome}
          </Link>
          <Link href={`/${locale}/reading/love`} className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {dict.loveResult.restart}
          </Link>
        </div>
      </div>

      <LoveReadingResult
        locale={locale}
        sid={sid}
        isPaid={isPaid}
        labels={{
          unavailableTitle: dict.loveResult.unavailableTitle,
          unavailableText:
            locale === "zh"
              ? "没有找到本次会话中的输入信息。出于隐私保护，关系问题和生日不会写入 URL。"
              : dict.loveResult.unavailableText,
          unavailableCta: dict.loveResult.unavailableCta,
          restart: dict.loveResult.restart,
          paidTitle: locale === "zh" ? "更完整的关系解读" : dict.loveResult.paidLayerTitle,
          paidPreviewTitle: locale === "zh" ? "延展层预览" : dict.loveResult.unlockPreviewTitle,
          interpretationFallback:
            locale === "zh"
              ? "扩展解读暂时不可用，基础计算结果不受影响。"
              : "Extended interpretation is temporarily unavailable. The base calculation remains intact.",
        }}
      />
    </main>
  );
}
