"use client";

import { useEffect, useState } from "react";

import type { Locale } from "../../../lib/i18n";
import type { MingGuaResult } from "../../../lib/ming-gong";
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

const STORAGE_KEY = "fatemirror:tool:ming-gua";

type Draft = {
  birthYear: string;
  gender: "" | "male" | "female";
  result?: MingGuaResult;
};

export function MingGuaTool({ locale }: { locale: Locale }) {
  const isZh = locale === "zh";
  const [draft, setDraft] = useState<Draft>({ birthYear: "", gender: "" });
  const [error, setError] = useState<string>("");
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
      birthYear: String(formData.get("birthYear") || "").trim(),
      gender: (formData.get("gender") as Draft["gender"]) || "",
    };

    setError("");
    setIsPending(true);
    setDraft(nextDraft);

    const response = await postReading<
      { birthYear: number; gender: "male" | "female" },
      MingGuaResult
    >("/api/readings/ming-gua", {
      birthYear: Number(nextDraft.birthYear),
      gender: nextDraft.gender as "male" | "female",
    });

    setIsPending(false);

    if (!response.success) {
      setError(response.error.message);
      return;
    }

    setDraft({ ...nextDraft, result: response.data });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <form action={onSubmit} className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
          {isZh ? "命卦" : "Ming Gua"}
        </p>
        <h1 className="mt-4 font-serif text-5xl text-balance">
          {isZh ? "计算我的命卦" : "Calculate my Ming Gua"}
        </h1>
        <p className="mt-5 text-sm leading-7 text-[color:var(--color-muted)]">
          {isZh
            ? "输入出生年份和性别，系统会用确定性规则计算九宫命卦，结果不会写进 URL。"
            : "Enter your birth year and gender. The app uses deterministic rules and keeps the result out of the URL."}
        </p>

        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-3 block text-sm text-[color:var(--color-muted)]">
              {isZh ? "出生年份" : "Birth year"}
            </span>
            <input
              name="birthYear"
              type="number"
              min="1900"
              max="2100"
              value={draft.birthYear}
              onChange={(event) => setDraft((current) => ({ ...current, birthYear: event.target.value }))}
              required
              className="min-h-11 w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-accent)]"
            />
          </label>

          <label className="block">
            <span className="mb-3 block text-sm text-[color:var(--color-muted)]">
              {isZh ? "性别" : "Gender"}
            </span>
            <select
              name="gender"
              value={draft.gender}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  gender: event.target.value as Draft["gender"],
                }))
              }
              required
              className="min-h-11 w-full rounded-[1rem] border border-white/12 bg-black/15 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-accent)]"
            >
              <option value="">{isZh ? "请选择" : "Choose one"}</option>
              <option value="male">{isZh ? "男" : "Male"}</option>
              <option value="female">{isZh ? "女" : "Female"}</option>
            </select>
          </label>
        </div>

        {error ? (
          <div className="mt-6">
            <ReadingError
              title={isZh ? "无法完成计算" : "Unable to calculate"}
              message={error}
            />
          </div>
        ) : null}

        <button
          type="submit"
          aria-busy={isPending}
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)]"
        >
          {isPending
            ? isZh
              ? "计算中..."
              : "Calculating..."
            : isZh
              ? "计算我的命卦"
              : "Calculate my Ming Gua"}
        </button>
      </form>

      {draft.result ? <MingGuaResultView locale={locale} result={draft.result} /> : null}
    </div>
  );
}

function MingGuaResultView({
  locale,
  result,
}: {
  locale: Locale;
  result: MingGuaResult;
}) {
  const isZh = locale === "zh";

  return (
    <ReadingResultShell
      eyebrow={isZh ? "基础结果" : "Base result"}
      title={isZh ? `${result.result.trigram}卦` : result.result.trigram}
      summary={
        isZh
          ? `你的命卦为 ${result.result.trigram} 卦，属于${result.result.groupLabel}。`
          : `Your Ming Gua is ${result.result.trigram}, in the ${result.result.groupLabel} group.`
      }
    >
      <ResultSummary
        sentence={
          isZh
            ? `你的命卦数字为 ${result.result.palaceNumber}，本卦方位是${result.result.direction}。`
            : `Your palace number is ${result.result.palaceNumber}, with ${result.result.direction} as the home direction.`
        }
      />
      <ResultFactsCard
        title={isZh ? "关键结果" : "Key facts"}
        items={[
          { label: isZh ? "命卦" : "Trigram", value: result.result.trigram },
          { label: isZh ? "数字" : "Number", value: String(result.result.palaceNumber) },
          { label: isZh ? "分组" : "Group", value: result.result.groupLabel },
          { label: isZh ? "本卦方位" : "Home direction", value: result.result.direction },
          {
            label: isZh ? "有利方向" : "Favorable directions",
            value: result.result.favorableDirections.join(isZh ? "、" : ", "),
          },
          { label: isZh ? "人物象" : "Role symbol", value: result.result.roleSymbol },
        ]}
      />
      <RealityGuidance
        traditional={
          isZh
            ? "这个结果展示的是九宫命卦中的传统分组、卦象和方向归属。"
            : "This result reflects the traditional nine-palace grouping, trigram image, and direction mapping."
        }
        reality={
          isZh
            ? "更适合作为空间偏好、自我观察和传统文化参考，不等于现实能力、职业或健康判断。"
            : "Use it as a lens for reflection and spatial preference, not as a claim about career, health, or personal worth."
        }
        caution={
          isZh
            ? "人物象只是传统卦象语言，不代表真实家庭角色，也不意味着命运已经固定。"
            : "The role symbol is traditional imagery only. It is not a literal family role or a fixed fate statement."
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
            ? "留意你在什么朝向或工作位置里更容易安静下来、进入节奏。"
            : "Notice which directions or work positions make it easier for you to settle and focus."
        }
        action={
          isZh
            ? "今天挑一个常用位置，试着按有利方向重新摆放座位或工作朝向。"
            : "Pick one everyday spot today and test a different seat or work direction."
        }
        labels={isZh ? undefined : { observation: "Observation", action: "Action" }}
      />
      <CalculationTrace
        items={result.calculation.trace}
        meta={[
          { label: isZh ? "算法版本" : "Method version", value: result.version },
          { label: isZh ? "计算模式" : "Mode", value: result.calculationMode },
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
      <MethodologyLink locale={locale} hash="ming-gua" />
      <ReadingDisclaimer locale={locale} />
    </ReadingResultShell>
  );
}
