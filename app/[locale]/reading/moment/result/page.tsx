import Link from "next/link";
import { notFound } from "next/navigation";

import { LanguageSwitcher } from "../../../../components/language-switcher";
import { MomentReadingResult } from "../../../../components/readings/moment-reading-result";
import { getDictionary, hasLocale } from "../../../../../lib/i18n";
import { readPreviewUnlockFlag } from "../../../../../lib/preview-unlock";

type LocalizedMomentResultPageProps = PageProps<"/[locale]/reading/moment/result">;

export default async function LocalizedMomentResultPage(props: LocalizedMomentResultPageProps) {
  const { locale } = await props.params;
  if (!hasLocale(locale)) notFound();

  const searchParams = await props.searchParams;
  const sid = typeof searchParams.sid === "string" ? searchParams.sid : "";
  const isPaid = readPreviewUnlockFlag(searchParams.preview);
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-12">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link href={`/${locale}`} className="text-sm tracking-[0.28em] text-[color:var(--color-muted)] uppercase">
          {dict.shared.brand}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <LanguageSwitcher locale={locale} pathSuffix="/reading/moment/result" queryString={sid ? `sid=${sid}${isPaid ? "&preview=1" : ""}` : undefined} />
          <Link href={`/${locale}`} className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {dict.shared.navHome}
          </Link>
          <Link href={`/${locale}/reading/moment`} className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {dict.momentResult.restart}
          </Link>
        </div>
      </div>

      <MomentReadingResult
        locale={locale}
        sid={sid}
        isPaid={isPaid}
        labels={{
          unavailableTitle: dict.momentResult.unavailableTitle,
          unavailableText:
            locale === "zh"
              ? "没有找到本次会话中的问题和时间信息。出于隐私保护，这些内容不会写入 URL。"
              : dict.momentResult.unavailableText,
          unavailableCta: dict.momentResult.unavailableCta,
          paidTitle: locale === "zh" ? "更完整的此刻解读" : dict.momentResult.paidLayerTitle,
          paidPreviewTitle: locale === "zh" ? "延展层预览" : dict.momentResult.unlockPreviewTitle,
          interpretationFallback:
            locale === "zh"
              ? "扩展解读暂时不可用，基础计算结果不受影响。"
              : "Extended interpretation is temporarily unavailable. The base calculation remains intact.",
        }}
      />
    </main>
  );
}
