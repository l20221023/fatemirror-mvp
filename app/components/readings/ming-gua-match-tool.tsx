"use client";

import { useEffect, useState } from "react";

import type { Locale } from "../../../lib/i18n";
import type { MingGuaMatchResult, MingGuaResult } from "../../../lib/ming-gong";
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

const STORAGE_KEY = "fatemirror:tool:ming-gua-match";

type Draft = {
  aYear: string;
  aGender: "" | "male" | "female";
  bYear: string;
  bGender: "" | "male" | "female";
  result?: MingGuaMatchResult;
  personA?: MingGuaResult;
  personB?: MingGuaResult;
};

export function MingGuaMatchTool({ locale }: { locale: Locale }) {
  const isZh = locale === "zh";
  const [draft, setDraft] = useState<Draft>({
    aYear: "",
    aGender: "",
    bYear: "",
    bGender: "",
  });
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
      aYear: String(formData.get("aYear") || "").trim(),
      aGender: (formData.get("aGender") as Draft["aGender"]) || "",
      bYear: String(formData.get("bYear") || "").trim(),
      bGender: (formData.get("bGender") as Draft["bGender"]) || "",
    };

    setError("");
    setIsPending(true);
    setDraft(nextDraft);

    const [aResponse, bResponse, matchResponse] = await Promise.all([
      postReading<{ birthYear: number; gender: "male" | "female" }, MingGuaResult>("/api/readings/ming-gua", {
        birthYear: Number(nextDraft.aYear),
        gender: nextDraft.aGender as "male" | "female",
      }),
      postReading<{ birthYear: number; gender: "male" | "female" }, MingGuaResult>("/api/readings/ming-gua", {
        birthYear: Number(nextDraft.bYear),
        gender: nextDraft.bGender as "male" | "female",
      }),
      postReading<
        {
          personA: { birthYear: number; gender: "male" | "female" };
          personB: { birthYear: number; gender: "male" | "female" };
        },
        MingGuaMatchResult
      >("/api/readings/ming-gua-match", {
        personA: { birthYear: Number(nextDraft.aYear), gender: nextDraft.aGender as "male" | "female" },
        personB: { birthYear: Number(nextDraft.bYear), gender: nextDraft.bGender as "male" | "female" },
      }),
    ]);

    setIsPending(false);

    if (!aResponse.success) return setError(aResponse.error.message);
    if (!bResponse.success) return setError(bResponse.error.message);
    if (!matchResponse.success) return setError(matchResponse.error.message);

    setDraft({
      ...nextDraft,
      personA: aResponse.data,
      personB: bResponse.data,
      result: matchResponse.data,
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.96fr_1.04fr]">
      <form action={onSubmit} className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
          {isZh ? "双方命卦匹配" : "Ming Gua Match"}
        </p>
        <h1 className="mt-4 font-serif text-5xl text-balance">
          {isZh ? "查看双方命卦匹配" : "Compare two Ming Gua groups"}
        </h1>
        <p className="mt-5 text-sm leading-7 text-[color:var(--color-muted)]">
          {isZh
            ? "输入双方出生年份和性别，系统会按确定性规则返回传统正配、同组或跨组结果。"
            : "Enter the two birth years and genders to get a deterministic traditional match type."}
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <PersonFields
            locale={locale}
            title={isZh ? "A 方" : "Person A"}
            year={draft.aYear}
            gender={draft.aGender}
            onYearChange={(value) => setDraft((current) => ({ ...current, aYear: value }))}
            onGenderChange={(value) => setDraft((current) => ({ ...current, aGender: value }))}
            namePrefix="a"
          />
          <PersonFields
            locale={locale}
            title={isZh ? "B 方" : "Person B"}
            year={draft.bYear}
            gender={draft.bGender}
            onYearChange={(value) => setDraft((current) => ({ ...current, bYear: value }))}
            onGenderChange={(value) => setDraft((current) => ({ ...current, bGender: value }))}
            namePrefix="b"
          />
        </div>

        {error ? (
          <div className="mt-6">
            <ReadingError title={isZh ? "无法完成匹配" : "Unable to compare"} message={error} />
          </div>
        ) : null}

        <button
          type="submit"
          aria-busy={isPending}
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)]"
        >
          {isPending ? (isZh ? "匹配中..." : "Calculating...") : isZh ? "查看双方匹配" : "Show match"}
        </button>
      </form>

      {draft.result && draft.personA && draft.personB ? (
        <MingGuaMatchResultView
          locale={locale}
          result={draft.result}
          personA={draft.personA}
          personB={draft.personB}
        />
      ) : null}
    </div>
  );
}

function PersonFields({
  locale,
  title,
  year,
  gender,
  onYearChange,
  onGenderChange,
  namePrefix,
}: {
  locale: Locale;
  title: string;
  year: string;
  gender: "" | "male" | "female";
  onYearChange: (value: string) => void;
  onGenderChange: (value: "" | "male" | "female") => void;
  namePrefix: "a" | "b";
}) {
  const isZh = locale === "zh";

  return (
    <fieldset className="rounded-[1.25rem] border border-white/10 bg-black/10 p-5">
      <legend className="px-2 text-sm text-[color:var(--color-muted)]">{title}</legend>
      <label className="mt-3 block">
        <span className="mb-2 block text-sm text-[color:var(--color-muted)]">
          {isZh ? "出生年份" : "Birth year"}
        </span>
        <input
          name={`${namePrefix}Year`}
          type="number"
          min="1900"
          max="2100"
          value={year}
          onChange={(event) => onYearChange(event.target.value)}
          required
          className="min-h-11 w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-accent)]"
        />
      </label>
      <label className="mt-4 block">
        <span className="mb-2 block text-sm text-[color:var(--color-muted)]">
          {isZh ? "性别" : "Gender"}
        </span>
        <select
          name={`${namePrefix}Gender`}
          value={gender}
          onChange={(event) => onGenderChange(event.target.value as "" | "male" | "female")}
          required
          className="min-h-11 w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-accent)]"
        >
          <option value="">{isZh ? "请选择" : "Choose one"}</option>
          <option value="male">{isZh ? "男" : "Male"}</option>
          <option value="female">{isZh ? "女" : "Female"}</option>
        </select>
      </label>
    </fieldset>
  );
}

function MingGuaMatchResultView({
  locale,
  result,
  personA,
  personB,
}: {
  locale: Locale;
  result: MingGuaMatchResult;
  personA: MingGuaResult;
  personB: MingGuaResult;
}) {
  const isZh = locale === "zh";

  return (
    <ReadingResultShell
      eyebrow={isZh ? "基础结果" : "Base result"}
      title={result.result.label}
      summary={result.result.summary}
    >
      <ResultSummary
        sentence={
          isZh
            ? `A 方为 ${personA.result.trigram} ${personA.result.palaceNumber}，B 方为 ${personB.result.trigram} ${personB.result.palaceNumber}。两者的传统匹配类型为“${result.result.label}”。`
            : `Person A is ${personA.result.trigram} ${personA.result.palaceNumber}, person B is ${personB.result.trigram} ${personB.result.palaceNumber}. The traditional match type is ${result.result.label}.`
        }
      />
      <ResultFactsCard
        title={isZh ? "关键结果" : "Key facts"}
        items={[
          { label: "A", value: `${personA.result.trigram} ${personA.result.palaceNumber} / ${personA.result.groupLabel}` },
          { label: "B", value: `${personB.result.trigram} ${personB.result.palaceNumber} / ${personB.result.groupLabel}` },
          { label: isZh ? "匹配类型" : "Match type", value: result.result.label },
          { label: isZh ? "分组关系" : "Group relation", value: personA.result.group === personB.result.group ? (isZh ? "同组" : "Same group") : isZh ? "跨组" : "Cross-group" },
        ]}
      />
      <RealityGuidance
        traditional={
          isZh
            ? "命卦匹配反映的是传统分组、正配表和方向同异，不是情感质量的完整判断。"
            : "Ming Gua matching reflects traditional grouping, classic pair tables, and direction affinity rather than the full quality of a relationship."
        }
        reality={
          isZh
            ? "真正重要的仍是沟通方式、边界感、共同规划与现实处境是否能长期协商。"
            : "What matters in real life is still communication, boundaries, shared plans, and whether the two people can negotiate reality well."
        }
        caution={
          isZh
            ? "这里不会给出“克夫”“克妻”“凶婚”之类判断，也不把关系说成注定成功或失败。"
            : "This result does not label anyone as harmful, cursed, or destined for success or failure."
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
            ? "观察你们在讨论金钱、时间安排和未来规划时，最容易卡住的是哪一类分歧。"
            : "Notice where disagreement appears most easily when the two of you talk about money, time, or future plans."
        }
        action={
          isZh
            ? "挑一个最常重复的分歧主题，用一句不带评判的话先确认对方最在意的点。"
            : "Pick one recurring point of friction and name the other person's main concern without judgment."
        }
        labels={isZh ? undefined : { observation: "Observation", action: "Action" }}
      />
      <CalculationTrace
        items={result.calculation.trace}
        meta={[{ label: isZh ? "算法版本" : "Method version", value: result.version }]}
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
      <MethodologyLink locale={locale} hash="ming-gua-match" />
      <ReadingDisclaimer locale={locale} />
    </ReadingResultShell>
  );
}
