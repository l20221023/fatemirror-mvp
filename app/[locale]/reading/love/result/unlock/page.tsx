import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { LanguageSwitcher } from "../../../../../components/language-switcher";
import { getDictionary, hasLocale, serializeSearchParams } from "../../../../../../lib/i18n";
import { markReadingPaidForTesting } from "../../../../../../lib/paywall";
import { readLoveInputFromSearchParams } from "../../../../../../lib/reading";

type UnlockPageProps = PageProps<"/[locale]/reading/love/result/unlock">;

async function demoUnlock(formData: FormData) {
  "use server";

  const locale = formData.get("locale")?.toString() ?? "en";
  const readingId = formData.get("readingId")?.toString() ?? "";
  const queryString = formData.get("queryString")?.toString() ?? "";

  if (readingId) {
    await markReadingPaidForTesting(readingId);
  }

  redirect(`/${locale}/reading/love/result${queryString ? `?${queryString}` : ""}`);
}

export default async function UnlockPage(props: UnlockPageProps) {
  const { locale } = await props.params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const searchParams = await props.searchParams;
  const input = readLoveInputFromSearchParams(searchParams);
  const queryString = serializeSearchParams(searchParams);
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10 sm:px-8 lg:px-12">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/${locale}`}
          className="text-sm tracking-[0.28em] text-[color:var(--color-muted)] uppercase"
        >
          {dict.shared.brand}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <LanguageSwitcher
            locale={locale}
            pathSuffix="/reading/love/result/unlock"
            queryString={queryString}
          />
          <Link
            href={`/${locale}`}
            className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
          >
            {dict.shared.navHome}
          </Link>
          <Link
            href={`/${locale}/reading/love/result?${queryString}`}
            className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
          >
            {dict.loveResult.restart}
          </Link>
        </div>
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 shadow-[0_24px_80px_rgba(4,10,16,0.35)] md:p-10">
        <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
          {dict.loveResult.paywallTitle}
        </p>
        <h1 className="mt-4 font-serif text-5xl text-balance">
          {dict.loveResult.unlockPageTitle}
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-[color:var(--color-muted)]">
          {dict.loveResult.unlockPageText}
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/10 p-6">
            <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
              {locale === "zh" ? "当前 reading" : "Current reading"}
            </p>
            <p className="mt-4 text-sm leading-7 text-[color:var(--color-muted)]">
              {input.heartQuestion || (locale === "zh" ? "未提供问题" : "No question provided")}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
              {locale === "zh" ? "测试状态" : "Testing status"}
            </p>
            <p className="mt-4 text-sm leading-7 text-[color:var(--color-muted)]">
              {locale === "zh"
                ? "点击下方按钮后，会把当前 reading 标记为已解锁，并跳回结果页显示完整层。"
                : "The button below marks this reading as unlocked for testing, then returns to the result page with the full layer visible."}
            </p>
          </div>
        </div>

        <form action={demoUnlock} className="mt-10">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="readingId" value={input.readingId} />
          <input type="hidden" name="queryString" value={queryString} />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-accent-soft)]"
          >
            {dict.loveResult.unlockPageDemo}
          </button>
        </form>
      </section>
    </main>
  );
}
