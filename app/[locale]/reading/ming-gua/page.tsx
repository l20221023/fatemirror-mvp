import Link from "next/link";
import { notFound } from "next/navigation";

import { DisclaimerFooter } from "../../../components/disclaimer-footer";
import { LanguageSwitcher } from "../../../components/language-switcher";
import { getDictionary, hasLocale } from "../../../../lib/i18n";
import { calculateMingGua, normalizeGender } from "../../../../lib/ming-gong";

type MingGuaPageProps = PageProps<"/[locale]/reading/ming-gua">;

export default async function MingGuaPage(props: MingGuaPageProps) {
  const { locale } = await props.params;
  if (!hasLocale(locale)) notFound();

  const searchParams = await props.searchParams;
  const dict = getDictionary(locale);
  const birthYear = readSingle(searchParams.birthYear);
  const gender = readSingle(searchParams.gender);
  const result = buildResult(birthYear, gender);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-12">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link href={`/${locale}`} className="text-sm tracking-[0.28em] text-[color:var(--color-muted)] uppercase">
          {dict.shared.brand}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <LanguageSwitcher locale={locale} pathSuffix="/reading/ming-gua" />
          <Link href={`/${locale}`} className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]">
            {dict.shared.navHome}
          </Link>
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <form className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
            {locale === "zh" ? "九宫命格" : "Ming Gua"}
          </p>
          <h1 className="mt-4 font-serif text-5xl text-balance">
            {locale === "zh" ? "计算我的命宫" : "Calculate my Ming Gua"}
          </h1>
          <p className="mt-5 text-sm leading-7 text-[color:var(--color-muted)]">
            {locale === "zh"
              ? "首版采用公历年份简算法，不引入立春换年、八字或属相。"
              : "The MVP uses the simple Gregorian-year method only."}
          </p>
          <div className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-3 block text-sm text-[color:var(--color-muted)]">
                {locale === "zh" ? "出生年份" : "Birth year"}
              </span>
              <input name="birthYear" type="number" min="1900" max="2100" defaultValue={birthYear} required className="w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-accent)]" />
            </label>
            <label className="block">
              <span className="mb-3 block text-sm text-[color:var(--color-muted)]">
                {locale === "zh" ? "公式性别" : "Formula gender"}
              </span>
              <select name="gender" defaultValue={gender} required className="w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-accent)]">
                <option value="">{locale === "zh" ? "选择一项" : "Choose one"}</option>
                <option value="male">{locale === "zh" ? "男性公式" : "Male formula"}</option>
                <option value="female">{locale === "zh" ? "女性公式" : "Female formula"}</option>
              </select>
            </label>
          </div>
          <button className="mt-8 rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)]">
            {locale === "zh" ? "查看结果" : "Show result"}
          </button>
        </form>

        {result ? (
          <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8">
            <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
              {locale === "zh" ? "确定性结果" : "Deterministic result"}
            </p>
            <h2 className="mt-4 font-serif text-5xl">
              {result.result.trigram} {result.result.palaceNumber}
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Info label={locale === "zh" ? "组别" : "Group"} value={result.result.groupLabel} />
              <Info label={locale === "zh" ? "本宫方位" : "Home direction"} value={result.result.direction} />
              <Info label={locale === "zh" ? "人物象" : "Role symbol"} value={result.result.roleSymbol} />
              <Info label={locale === "zh" ? "方向组" : "Direction group"} value={result.result.favorableDirections.join("、")} />
            </div>
            <Trace title={locale === "zh" ? "计算过程" : "Calculation trace"} items={result.calculation.trace} />
            <p className="mt-6 text-sm leading-7 text-[color:var(--color-muted)]">
              {locale === "zh"
                ? "人物象仅是八卦传统象意，不表示现实家庭身份、性格、健康或职业。"
                : "The role symbol is a traditional trigram image, not a real-life identity or personality claim."}
            </p>
          </section>
        ) : null}
      </section>

      <div className="mt-10">
        <DisclaimerFooter locale={locale} />
      </div>
    </main>
  );
}

function buildResult(birthYear: string, gender: string) {
  if (!birthYear || !gender) return null;

  try {
    return calculateMingGua({
      birthYear: Number(birthYear),
      gender: normalizeGender(gender),
    });
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
