import Link from "next/link";
import { notFound } from "next/navigation";

import { DisclaimerFooter } from "../../../components/disclaimer-footer";
import { LanguageSwitcher } from "../../../components/language-switcher";
import { MarriageDirectionDisplay } from "../../../components/marriage-direction-display";
import { getDictionary, hasLocale } from "../../../../lib/i18n";
import { createMarriageDirectionReading } from "../../../../lib/marriage-direction";

type MarriageDirectionPageProps = PageProps<"/[locale]/reading/marriage-direction">;

export default async function MarriageDirectionPage(
  props: MarriageDirectionPageProps,
) {
  const { locale } = await props.params;
  if (!hasLocale(locale)) notFound();

  const searchParams = await props.searchParams;
  const dict = getDictionary(locale);
  const birthDate = readSingle(searchParams.birthDate);
  const birthPlaceLabel = readSingle(searchParams.birthPlaceLabel);
  const result = buildResult(birthDate, birthPlaceLabel);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-12">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link href={`/${locale}`} className="text-sm tracking-[0.28em] text-[color:var(--color-muted)] uppercase">
          {dict.shared.brand}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <LanguageSwitcher locale={locale} pathSuffix="/reading/marriage-direction" />
          <Link href={`/${locale}`} className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {dict.shared.navHome}
          </Link>
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <form className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
            {locale === "zh" ? "婚配方位" : "Marriage Direction"}
          </p>
          <h1 className="mt-4 font-serif text-5xl text-balance">
            {locale === "zh" ? "计算传统方位轴" : "Calculate the traditional direction axis"}
          </h1>
          <p className="mt-5 text-sm leading-7 text-[color:var(--color-muted)]">
            {locale === "zh"
              ? "结果只作为出生地参考中心下的传统方向视角，不保证对象来自某地。"
              : "This is a traditional direction reference around the birthplace, not a guarantee about anyone's origin."}
          </p>
          <div className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-3 block text-sm text-[color:var(--color-muted)]">
                {locale === "zh" ? "公历出生日期" : "Gregorian birth date"}
              </span>
              <input name="birthDate" type="date" defaultValue={birthDate} required className="w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-accent)]" />
            </label>
            <label className="block">
              <span className="mb-3 block text-sm text-[color:var(--color-muted)]">
                {locale === "zh" ? "出生地说明（可选）" : "Birthplace label (optional)"}
              </span>
              <input name="birthPlaceLabel" type="text" defaultValue={birthPlaceLabel} placeholder={locale === "zh" ? "如：洛阳" : "e.g. Luoyang"} className="w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-accent)]" />
            </label>
          </div>
          <button className="mt-8 rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)]">
            {locale === "zh" ? "查看方位" : "Show direction"}
          </button>
        </form>

        {result ? (
          <section className="space-y-6">
            <MarriageDirectionDisplay
              locale={locale}
              primaryDirection={result.primaryDirection}
              secondaryDirection={result.secondaryDirection}
              description={result.description}
              axisLabel={result.result?.axis ?? ""}
            />
            <div className="rounded-[1.5rem] border border-white/10 bg-black/10 p-5">
              <p className="text-sm text-[color:var(--color-muted)]">
                {locale === "zh" ? "农历生日" : "Lunar birthday"}
              </p>
              <p className="mt-3 text-lg text-[color:var(--color-foreground)]">
                {result.input?.lunarMonthLabel} {result.input?.lunarDayLabel}
                {result.input?.isLeapMonth ? ` (${locale === "zh" ? "闰月" : "leap month"})` : ""}
              </p>
            </div>
            <Trace title={locale === "zh" ? "计算过程" : "Calculation trace"} items={result.calculation?.trace ?? []} />
          </section>
        ) : null}
      </section>

      <div className="mt-10">
        <DisclaimerFooter locale={locale} />
      </div>
    </main>
  );
}

function buildResult(birthDate: string, birthPlaceLabel: string) {
  if (!birthDate) return null;

  try {
    return createMarriageDirectionReading({
      birthDate,
      birthPlaceLabel: birthPlaceLabel || undefined,
    });
  } catch {
    return null;
  }
}

function Trace({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-black/10 p-5">
      <p className="text-sm text-[color:var(--color-muted)]">{title}</p>
      <ol className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--color-muted)]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </div>
  );
}

function readSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
