"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { Locale } from "../../../lib/i18n";
import type { XiaoliuRenResult } from "../../../lib/xiaoliu-ren";
import { buildMomentLocalTemplate, type MomentInterpretationFacts } from "../../../lib/readings/interpretation/local-templates";
import { postReading } from "./reading-api-client";
import { ActionSuggestion } from "./action-suggestion";
import { CalculationTrace } from "./calculation-trace";
import { MethodologyLink } from "./methodology-link";
import { ReadingDisclaimer } from "./reading-disclaimer";
import { ReadingResultShell } from "./reading-result-shell";
import { RealityGuidance } from "./reality-guidance";
import { ResultFactsCard } from "./result-facts-card";
import { ResultSummary } from "./result-summary";
import { loadReadingDraft } from "./session-storage";

import type { MomentReadingSessionDraft } from "./moment-reading-form";

type Props = {
  locale: Locale;
  sid: string;
  isPaid: boolean;
  labels: {
    unavailableTitle: string;
    unavailableText: string;
    unavailableCta: string;
    paidTitle: string;
    paidPreviewTitle: string;
    interpretationFallback: string;
  };
};

type InterpretationState = {
  freeText: string;
  paidText: string;
  interpretationUnavailable: boolean;
};

export function MomentReadingResult({ locale, sid, isPaid, labels }: Props) {
  const isZh = locale === "zh";
  const [draft, setDraft] = useState<MomentReadingSessionDraft | null | undefined>(undefined);
  const [result, setResult] = useState<XiaoliuRenResult | null>(null);
  const [error, setError] = useState("");
  const [interpretation, setInterpretation] = useState<InterpretationState | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDraft(loadReadingDraft<MomentReadingSessionDraft>(`fatemirror:reading:moment:${sid}`));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [sid]);

  useEffect(() => {
    if (!draft) return;
    const currentDraft = draft;

    let active = true;

    async function run() {
      const response = await postReading<
        { occurredAt: string; timezone: string; question?: string },
        XiaoliuRenResult
      >("/api/readings/xiaoliu-ren", {
        occurredAt: currentDraft.momentIso,
        timezone: "Asia/Shanghai",
        question: currentDraft.heartQuestion,
      });

      if (!active) return;
      if (!response.success) {
        setError(response.error.message);
        return;
      }

      setResult(response.data);
    }

    run();
    return () => {
      active = false;
    };
  }, [draft]);

  const facts = useMemo<MomentInterpretationFacts | null>(() => {
    if (!draft || !result) return null;
    return {
      method: "xiaoliu-ren",
      deityKey: result.result.key,
      deityName: result.result.name,
      summary: result.result.summary,
      action: result.result.action,
      occurredAtLabel: draft.momentLocal,
      question: draft.heartQuestion,
    };
  }, [draft, result]);

  useEffect(() => {
    if (!facts) return;
    const freeFallback = buildMomentLocalTemplate(locale, "free", facts);
    const paidFallback = buildMomentLocalTemplate(locale, "paid", facts);
    let active = true;

    async function run() {
      try {
        const [freeResponse, paidResponse] = await Promise.all([
          fetch("/api/reading", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ locale, layer: "free", readingType: "moment", facts }),
          }),
          fetch("/api/reading", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ locale, layer: "paid", readingType: "moment", facts }),
          }),
        ]);

        const freeJson = (await freeResponse.json().catch(() => null)) as { success?: boolean; text?: string } | null;
        const paidJson = (await paidResponse.json().catch(() => null)) as { success?: boolean; text?: string } | null;

        if (!active) return;

        setInterpretation({
          freeText: freeJson?.success && freeJson.text ? freeJson.text : freeFallback,
          paidText: paidJson?.success && paidJson.text ? paidJson.text : paidFallback,
          interpretationUnavailable: !(freeJson?.success && paidJson?.success),
        });
      } catch {
        if (!active) return;
        setInterpretation({
          freeText: freeFallback,
          paidText: paidFallback,
          interpretationUnavailable: true,
        });
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [facts, locale]);

  if (draft === undefined) {
    return null;
  }

  if (!draft) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
        <h2 className="font-serif text-4xl">{labels.unavailableTitle}</h2>
        <p className="mt-4 text-base leading-8 text-[color:var(--color-muted)]">{labels.unavailableText}</p>
        <Link
          href={`/${locale}/reading/moment`}
          className="mt-8 inline-flex rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)]"
        >
          {labels.unavailableCta}
        </Link>
      </div>
    );
  }

  if (error) {
    return <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8"><p>{error}</p></div>;
  }

  if (!result || !facts) {
    return null;
  }

  const freeText = interpretation?.freeText ?? buildMomentLocalTemplate(locale, "free", facts);
  const paidText = interpretation?.paidText ?? buildMomentLocalTemplate(locale, "paid", facts);

  return (
    <div className="space-y-8">
      <ReadingResultShell
        eyebrow={isZh ? "此刻之问" : "Moment reading"}
        title={result.result.name}
        summary={result.result.summary}
      >
        <ResultSummary
          sentence={
            isZh
              ? `这次结果落在“${result.result.name}”，对应的行动提示是：${result.result.action}`
              : `This reading lands on ${result.result.name}, with ${result.result.action} as the action cue.`
          }
        />
        <ResultFactsCard
          title={isZh ? "关键结果" : "Key facts"}
          items={[
            { label: isZh ? "六神结果" : "Result", value: result.result.name },
            { label: isZh ? "关键词" : "Keywords", value: result.result.keywords.join(isZh ? "、" : ", ") },
            { label: isZh ? "农历日期" : "Lunar date", value: `${result.input.lunarMonthLabel} ${result.input.lunarDayLabel}` },
            { label: isZh ? "时辰" : "Hour branch", value: `${result.input.hourBranch} / ${result.input.hourIndex}` },
          ]}
        />
        <RealityGuidance
          traditional={
            isZh
              ? "小六壬结果来自农历月、日与时辰序号的固定公式，不由模型重新计算。"
              : "The Xiao Liu Ren result comes from a fixed formula based on the lunar month, lunar day, and hour index."
          }
          reality={
            isZh
              ? "它更适合作为观察当下节奏和行动时机的提示，不等于外部世界一定会照此展开。"
              : "Use it as a prompt for timing and momentum, not as proof that reality must unfold this way."
          }
          caution={
            isZh
              ? "这里不做灾祸、疾病、死亡或投资收益预测。"
              : "This page does not predict disease, disaster, death, or investment outcomes."
          }
          labels={isZh ? undefined : { traditional: "Traditional view", reality: "Reality check", caution: "Caution" }}
        />
        <section className="rounded-[1.5rem] border border-white/10 bg-black/10 p-6">
          <p className="text-sm text-[color:var(--color-muted)]">{isZh ? "现实解释" : "Grounded interpretation"}</p>
          <p className="mt-3 text-sm leading-8 text-[color:var(--color-foreground)]">{freeText}</p>
          {interpretation?.interpretationUnavailable ? (
            <p className="mt-4 text-sm text-[color:var(--color-accent-soft)]">{labels.interpretationFallback}</p>
          ) : null}
        </section>
        <ActionSuggestion
          observation={
            isZh
              ? "先分清楚你现在是真的掌握了新信息，还是只是被情绪推着要一个立刻答案。"
              : "Separate the need for a real answer from the urge to resolve emotion immediately."
          }
          action={result.result.action}
          labels={isZh ? undefined : { observation: "Observation", action: "Action" }}
        />
        <CalculationTrace
          items={result.calculation.trace}
          meta={[
            { label: isZh ? "算法版本" : "Method version", value: result.version },
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
        <MethodologyLink locale={locale} hash="xiaoliu-ren" />
        <ReadingDisclaimer locale={locale} />
      </ReadingResultShell>

      <section className="space-y-6">
        {isPaid ? (
          <div className="rounded-[2rem] border border-[color:rgba(196,155,98,0.18)] bg-[linear-gradient(180deg,rgba(196,155,98,0.12),rgba(255,255,255,0.03))] p-8">
            <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
              {isZh ? "延展解读" : "Extended reading"}
            </p>
            <h2 className="mt-4 font-serif text-4xl text-balance">{labels.paidTitle}</h2>
            <p className="mt-6 text-base leading-8 text-[color:var(--color-muted)]">{paidText}</p>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <p className="text-sm tracking-[0.28em] text-[color:var(--color-accent)] uppercase">
              {isZh ? "预览" : "Preview"}
            </p>
            <h2 className="mt-4 font-serif text-4xl text-balance">{labels.paidPreviewTitle}</h2>
            <p className="mt-5 text-base leading-8 text-[color:var(--color-muted)]">{paidText}</p>
            <Link
              href={`/${locale}/reading/moment/result/unlock?sid=${sid}`}
              className="mt-6 inline-flex rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)]"
            >
              {isZh ? "继续查看完整层" : "Continue to unlock"}
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
