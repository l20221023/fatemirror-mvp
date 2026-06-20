import Link from "next/link";
import { notFound } from "next/navigation";

import { DisclaimerFooter } from "../../../components/disclaimer-footer";
import { LanguageSwitcher } from "../../../components/language-switcher";
import { getDictionary, hasLocale } from "../../../../lib/i18n";
import {
  calculateMingGua,
  calculateMingGuaMatch,
  normalizeGender,
} from "../../../../lib/ming-gong";

type MingGuaMatchPageProps = PageProps<"/[locale]/reading/ming-gua-match">;

export default async function MingGuaMatchPage(props: MingGuaMatchPageProps) {
  const { locale } = await props.params;
  if (!hasLocale(locale)) notFound();

  const searchParams = await props.searchParams;
  const dict = getDictionary(locale);
  const result = buildResult(searchParams);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-12">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link href={`/${locale}`} className="text-sm tracking-[0.28em] text-[color:var(--color-muted)] uppercase">
          {dict.shared.brand}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <LanguageSwitcher locale={locale} pathSuffix="/reading/ming-gua-match" />
          <Link href={`/${locale}`} className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {dict.shared.navHome}
          </Link>
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <form className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
            {locale === "zh" ? "命宫关系匹配" : "Ming Gua Match"}
          </p>
          <h1 className="mt-4 font-serif text-5xl text-balance">
            {locale === "zh" ? "看双方命宫关系" : "Read the two Ming Gua groups"}
          </h1>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <PersonFields prefix="a" title={locale === "zh" ? "A 方" : "Person A"} searchParams={searchParams} locale={locale} />
            <PersonFields prefix="b" title={locale === "zh" ? "B 方" : "Person B"} searchParams={searchParams} locale={locale} />
          </div>
          <button className="mt-8 rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)]">
            {locale === "zh" ? "查看匹配" : "Show match"}
          </button>
        </form>

        {result ? (
          <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8">
            <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
              {locale === "zh" ? "传统层级" : "Traditional level"}
            </p>
            <h2 className="mt-4 font-serif text-5xl">{result.match.result.label}</h2>
            <p className="mt-5 text-base leading-8 text-[color:var(--color-muted)]">
              {result.match.result.summary}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Info label="A" value={`${result.a.result.trigram} ${result.a.result.palaceNumber} · ${result.a.result.groupLabel}`} />
              <Info label="B" value={`${result.b.result.trigram} ${result.b.result.palaceNumber} · ${result.b.result.groupLabel}`} />
            </div>
            <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-black/10 p-5">
              <p className="text-sm text-[color:var(--color-muted)]">
                {locale === "zh" ? "现实关系自查" : "Reality checklist"}
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--color-muted)]">
                {result.match.result.realityChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <Trace title={locale === "zh" ? "计算过程" : "Calculation trace"} items={result.match.calculation.trace} />
          </section>
        ) : null}
      </section>

      <div className="mt-10">
        <DisclaimerFooter locale={locale} />
      </div>
    </main>
  );
}

function PersonFields({
  prefix,
  title,
  searchParams,
  locale,
}: {
  prefix: "a" | "b";
  title: string;
  searchParams: Record<string, string | string[] | undefined>;
  locale: string;
}) {
  return (
    <fieldset className="rounded-[1.25rem] border border-white/10 bg-black/10 p-5">
      <legend className="px-2 text-sm text-[color:var(--color-muted)]">{title}</legend>
      <label className="mt-3 block">
        <span className="mb-2 block text-sm text-[color:var(--color-muted)]">
          {locale === "zh" ? "出生年份" : "Birth year"}
        </span>
        <input name={`${prefix}Year`} type="number" min="1900" max="2100" defaultValue={readSingle(searchParams[`${prefix}Year`])} required className="w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-accent)]" />
      </label>
      <label className="mt-4 block">
        <span className="mb-2 block text-sm text-[color:var(--color-muted)]">
          {locale === "zh" ? "公式性别" : "Formula gender"}
        </span>
        <select name={`${prefix}Gender`} defaultValue={readSingle(searchParams[`${prefix}Gender`])} required className="w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-accent)]">
          <option value="">{locale === "zh" ? "选择一项" : "Choose one"}</option>
          <option value="male">{locale === "zh" ? "男性公式" : "Male formula"}</option>
          <option value="female">{locale === "zh" ? "女性公式" : "Female formula"}</option>
        </select>
      </label>
    </fieldset>
  );
}

function buildResult(searchParams: Record<string, string | string[] | undefined>) {
  const aYear = readSingle(searchParams.aYear);
  const aGender = readSingle(searchParams.aGender);
  const bYear = readSingle(searchParams.bYear);
  const bGender = readSingle(searchParams.bGender);
  if (!aYear || !aGender || !bYear || !bGender) return null;

  try {
    const a = calculateMingGua({ birthYear: Number(aYear), gender: normalizeGender(aGender) });
    const b = calculateMingGua({ birthYear: Number(bYear), gender: normalizeGender(bGender) });
    return { a, b, match: calculateMingGuaMatch(a, b) };
  } catch {
    return null;
  }
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-black/10 p-5">
      <p className="text-sm text-[color:var(--color-muted)]">{label}</p>
      <p className="mt-3 text-lg text-[color:var(--color-foreground)]">{value}</p>
    </div>
  );
}

function Trace({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-black/10 p-5">
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
