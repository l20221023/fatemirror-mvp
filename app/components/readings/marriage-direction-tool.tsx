"use client";

import { useEffect, useState } from "react";

import type { Locale } from "../../../lib/i18n";
import type { MarriageDirectionResult } from "../../../lib/marriage-direction";
import { postReading } from "./reading-api-client";
import { ActionSuggestion } from "./action-suggestion";
import { CalculationTrace } from "./calculation-trace";
import { MethodologyLink } from "./methodology-link";
import { ReadingDisclaimer } from "./reading-disclaimer";
import { ReadingError } from "./reading-error";
import { ReadingResultShell } from "./reading-result-shell";
import { RealityGuidance } from "./reality-guidance";
import { ResultFactsCard } from "./result-facts-card";
import { ResultSummary } from "./result-summary";
import { loadReadingDraft, saveReadingDraft } from "./session-storage";

const STORAGE_KEY = "fatemirror:tool:marriage-direction";

type Draft = {
  birthDate: string;
  birthPlaceLabel: string;
  result?: MarriageDirectionResult;
};

export function MarriageDirectionTool({ locale }: { locale: Locale }) {
  const isZh = locale === "zh";
  const [draft, setDraft] = useState<Draft>({ birthDate: "", birthPlaceLabel: "" });
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const restored = loadReadingDraft<Draft>(STORAGE_KEY);
    if (!restored) return;
    const timer = window.setTimeout(() => setDraft(restored), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    saveReadingDraft(STORAGE_KEY, draft);
  }, [draft]);

  async function onSubmit(formData: FormData) {
    const nextDraft: Draft = {
      birthDate: String(formData.get("birthDate") || "").trim(),
      birthPlaceLabel: String(formData.get("birthPlaceLabel") || "").trim(),
    };

    setError("");
    setDraft(nextDraft);
    setIsPending(true);

    const response = await postReading<
      { birthDate: string; birthPlaceLabel?: string },
      MarriageDirectionResult
    >("/api/readings/marriage-direction", {
      birthDate: nextDraft.birthDate,
      birthPlaceLabel: nextDraft.birthPlaceLabel || undefined,
    });

    setIsPending(false);

    if (!response.success) {
      setError(response.error.message);
      return;
    }

    setDraft({ ...nextDraft, result: response.data });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.94fr_1.06fr]">
      <form action={onSubmit} className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
          {isZh ? "婚配方位" : "Marriage Direction"}
        </p>
        <h1 className="mt-4 font-serif text-5xl text-balance">
          {isZh ? "计算婚配方位" : "Calculate the direction axis"}
        </h1>
        <p className="mt-5 text-sm leading-7 text-[color:var(--color-muted)]">
          {isZh
            ? "输入公历生日，系统会先换算农历，再按传统规则返回方向轴，不会把生日放进 URL。"
            : "Enter a Gregorian birth date. The app converts it to lunar data and returns a deterministic direction axis without exposing the date in the URL."}
        </p>

        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-3 block text-sm text-[color:var(--color-muted)]">
              {isZh ? "公历出生日期" : "Gregorian birth date"}
            </span>
            <input
              name="birthDate"
              type="date"
              value={draft.birthDate}
              onChange={(event) => setDraft((current) => ({ ...current, birthDate: event.target.value }))}
              required
              className="min-h-11 w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-accent)]"
            />
          </label>
          <label className="block">
            <span className="mb-3 block text-sm text-[color:var(--color-muted)]">
              {isZh ? "出生地说明（可选）" : "Birthplace label (optional)"}
            </span>
            <input
              name="birthPlaceLabel"
              type="text"
              value={draft.birthPlaceLabel}
              onChange={(event) => setDraft((current) => ({ ...current, birthPlaceLabel: event.target.value }))}
              placeholder={isZh ? "如：洛阳" : "e.g. Luoyang"}
              className="min-h-11 w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-accent)]"
            />
          </label>
        </div>

        {error ? (
          <div className="mt-6">
            <ReadingError title={isZh ? "无法完成计算" : "Unable to calculate"} message={error} />
          </div>
        ) : null}

        <button
          type="submit"
          aria-busy={isPending}
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)]"
        >
          {isPending ? (isZh ? "计算中..." : "Calculating...") : isZh ? "计算婚配方位" : "Show direction"}
        </button>
      </form>

      {draft.result ? <MarriageDirectionResultView locale={locale} result={draft.result} /> : null}
    </div>
  );
}

function MarriageDirectionResultView({
  locale,
  result,
}: {
  locale: Locale;
  result: MarriageDirectionResult;
}) {
  const isZh = locale === "zh";

  return (
    <ReadingResultShell
      eyebrow={isZh ? "基础结果" : "Base result"}
      title={isZh ? `${result.primaryDirection}方向` : result.primaryDirection}
      summary={result.description}
    >
      <ResultSummary
        sentence={
          isZh
            ? `传统规则把结果落在 ${result.primaryDirection}，并参考 ${result.secondaryDirection} 这一对向轴。`
            : `The traditional rule places the result at ${result.primaryDirection}, with ${result.secondaryDirection} as the paired axis.`
        }
      />
      <ResultFactsCard
        title={isZh ? "关键结果" : "Key facts"}
        items={[
          { label: isZh ? "主方向" : "Primary direction", value: result.primaryDirection },
          { label: isZh ? "对向参考" : "Axis pair", value: result.secondaryDirection },
          { label: isZh ? "农历生日" : "Lunar date", value: `${result.input?.lunarMonthLabel ?? ""} ${result.input?.lunarDayLabel ?? ""}`.trim() },
          { label: isZh ? "结果轴" : "Axis", value: result.result?.axis ?? "" },
        ]}
      />
      <RealityGuidance
        traditional={
          isZh
            ? "婚配方位是以农历月份、日期和地支方位推得的传统方向轴。"
            : "Marriage direction is a traditional directional axis derived from the lunar month, lunar day, and branch mapping."
        }
        reality={
          isZh
            ? "更适合作为观察和叙述关系空间感的文化参考，不对应精确城市，也不保证对象来自某个方向。"
            : "Use it as a cultural directional reference. It does not point to an exact city or guarantee where anyone comes from."
        }
        caution={
          isZh
            ? "方向结果不是择偶成败判断，也不能替代现实中的沟通、判断和安全感。"
            : "A direction result is not a verdict on relationship success and cannot replace real-world judgment or safety."
        }
        labels={
          isZh
            ? undefined
            : { traditional: "Traditional view", reality: "Reality check", caution: "Caution" }
        }
      />
      <ActionSuggestion
        observation={
          isZh
            ? "把这个方向当作一个观察提示，看看你对远近、迁移和生活半径的想象更偏向哪里。"
            : "Use the direction as a prompt and notice what it evokes about distance, migration, and the kind of life radius you imagine."
        }
        action={
          isZh
            ? "今天写下一条你对伴侣生活方式最看重的现实条件，比方向本身更值得反复确认。"
            : "Write down one real-life condition that matters most to you in partnership; that is more important than the direction itself."
        }
        labels={isZh ? undefined : { observation: "Observation", action: "Action" }}
      />
      <CalculationTrace
        items={result.calculation?.trace ?? []}
        meta={[
          { label: isZh ? "算法版本" : "Method version", value: result.version ?? "" },
          { label: isZh ? "农历库" : "Lunar adapter", value: `${result.input ? "lunar-javascript 1.7.7" : ""}` },
        ]}
        labels={
          isZh
            ? undefined
            : {
                summary: "See how this result was calculated",
                copy: "Copy calculation trace",
                copied: "Copied",
              }
        }
      />
      <MethodologyLink locale={locale} hash="marriage-direction" />
      <ReadingDisclaimer locale={locale} />
    </ReadingResultShell>
  );
}
