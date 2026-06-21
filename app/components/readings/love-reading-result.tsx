"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { Locale } from "../../../lib/i18n";
import { calculateMingGua, calculateMingGuaMatch, type Gender } from "../../../lib/ming-gong";
import { buildLoveLocalTemplate, type LoveInterpretationFacts } from "../../../lib/readings/interpretation/local-templates";
import { ActionSuggestion } from "./action-suggestion";
import { CalculationTrace } from "./calculation-trace";
import { MethodologyLink } from "./methodology-link";
import { ReadingDisclaimer } from "./reading-disclaimer";
import { ReadingResultShell } from "./reading-result-shell";
import { RealityGuidance } from "./reality-guidance";
import { ResultFactsCard } from "./result-facts-card";
import { ResultSummary } from "./result-summary";
import { loadReadingDraft } from "./session-storage";

import type { LoveReadingSessionDraft } from "./love-reading-form";

type Props = {
  locale: Locale;
  sid: string;
  isPaid: boolean;
  labels: {
    unavailableTitle: string;
    unavailableText: string;
    unavailableCta: string;
    restart: string;
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

export function LoveReadingResult({ locale, sid, isPaid, labels }: Props) {
  const isZh = locale === "zh";
  const [draft, setDraft] = useState<LoveReadingSessionDraft | null | undefined>(undefined);
  const [interpretation, setInterpretation] = useState<InterpretationState | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDraft(loadReadingDraft<LoveReadingSessionDraft>(`fatemirror:reading:love:${sid}`));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [sid]);

  const computed = useMemo(() => {
    if (!draft) return null;

    const personA = calculateMingGua({
      birthYear: Number(draft.birthDate.slice(0, 4)),
      gender: normalizeLegacyGender(draft.gender),
    });
    const personB = calculateMingGua({
      birthYear: Number(draft.theirBirthDate.slice(0, 4)),
      gender: normalizeLegacyGender(draft.theirGender),
    });
    const match = calculateMingGuaMatch(personA, personB);

    return { personA, personB, match };
  }, [draft]);

  const facts = useMemo<LoveInterpretationFacts | null>(() => {
    if (!draft || !computed) return null;

    return {
      method: "ming-gua-match",
      personA: {
        palaceNumber: computed.personA.result.palaceNumber,
        trigram: computed.personA.result.trigram,
        groupLabel: computed.personA.result.groupLabel,
      },
      personB: {
        palaceNumber: computed.personB.result.palaceNumber,
        trigram: computed.personB.result.trigram,
        groupLabel: computed.personB.result.groupLabel,
      },
      matchType: computed.match.result.level,
      matchLabel: computed.match.result.label,
      matchSummary: computed.match.result.summary,
      relationshipStage: draft.relationshipStage,
      question: draft.heartQuestion,
    };
  }, [draft, computed]);

  useEffect(() => {
    if (!facts) return;

    const freeFallback = buildLoveLocalTemplate(locale, "free", facts);
    const paidFallback = buildLoveLocalTemplate(locale, "paid", facts);
    let active = true;

    async function run() {
      try {
        const [freeResponse, paidResponse] = await Promise.all([
          fetch("/api/reading", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              locale,
              layer: "free",
              readingType: "love",
              facts,
            }),
          }),
          fetch("/api/reading", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              locale,
              layer: "paid",
              readingType: "love",
              facts,
            }),
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

  if (!draft || !computed || !facts) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
        <h2 className="font-serif text-4xl">{labels.unavailableTitle}</h2>
        <p className="mt-4 text-base leading-8 text-[color:var(--color-muted)]">{labels.unavailableText}</p>
        <Link
          href={`/${locale}/reading/love`}
          className="mt-8 inline-flex rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)]"
        >
          {labels.unavailableCta}
        </Link>
      </div>
    );
  }

  const freeText = interpretation?.freeText ?? buildLoveLocalTemplate(locale, "free", facts);
  const paidText = interpretation?.paidText ?? buildLoveLocalTemplate(locale, "paid", facts);

  return (
    <div className="space-y-8">
      <ReadingResultShell
        eyebrow={isZh ? "关系解读" : "Relationship reading"}
        title={computed.match.result.label}
        summary={computed.match.result.summary}
      >
        <ResultSummary
          sentence={
            isZh
              ? `你为 ${computed.personA.result.trigram} ${computed.personA.result.palaceNumber}，对方为 ${computed.personB.result.trigram} ${computed.personB.result.palaceNumber}。这次结果属于“${computed.match.result.label}”。`
              : `You are ${computed.personA.result.trigram} ${computed.personA.result.palaceNumber}, and the other person is ${computed.personB.result.trigram} ${computed.personB.result.palaceNumber}. This result falls under ${computed.match.result.label}.`
          }
        />
        <ResultFactsCard
          title={isZh ? "关键结果" : "Key facts"}
          items={[
            { label: isZh ? "你的命卦" : "Your Ming Gua", value: `${computed.personA.result.trigram} ${computed.personA.result.palaceNumber}` },
            { label: isZh ? "对方命卦" : "Their Ming Gua", value: `${computed.personB.result.trigram} ${computed.personB.result.palaceNumber}` },
            { label: isZh ? "匹配类型" : "Match type", value: computed.match.result.label },
            { label: isZh ? "关系阶段" : "Stage", value: draft.relationshipStage },
          ]}
        />
        <RealityGuidance
          traditional={
            isZh
              ? "这次结果来自双方命卦的分组关系与传统正配规则。"
              : "This result comes from the directional grouping of the two Ming Gua values and the classic best-pair table."
          }
          reality={
            isZh
              ? "关系能否走稳，仍要看现实里的沟通、边界、修复能力与生活安排。"
              : "Whether a relationship can actually hold depends on communication, boundaries, repair, and real life logistics."
          }
          caution={
            isZh
              ? "这里不做命定判断，不生成虚构评分，也不会推导婚姻必然成败。"
              : "This page does not claim destiny, invent a score, or predict inevitable marriage outcomes."
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
              ? "回看最近一次真正让你介意的互动，问题更像是节奏不合、表达受伤，还是现实安排没有对齐。"
              : "Revisit the most recent interaction that stayed with you and ask whether the tension came from pace, expression, or real-life alignment."
          }
          action={
            isZh
              ? "用一句不带控诉的话，说清楚你最想确认的一件现实问题。"
              : "Name one concrete relationship question you want clarified without accusation."
          }
          labels={isZh ? undefined : { observation: "Observation", action: "Action" }}
        />
        <CalculationTrace
          items={[
            ...computed.personA.calculation.trace.map((item) => `A: ${item}`),
            ...computed.personB.calculation.trace.map((item) => `B: ${item}`),
            ...computed.match.calculation.trace,
          ]}
          meta={[{ label: isZh ? "算法版本" : "Method version", value: computed.match.version }]}
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
              href={`/${locale}/reading/love/result/unlock?sid=${sid}`}
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

function normalizeLegacyGender(value: "man" | "woman" | ""): Gender {
  return value === "woman" ? "female" : "male";
}
