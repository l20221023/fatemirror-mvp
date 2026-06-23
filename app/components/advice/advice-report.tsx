"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { AdviceUiCopy } from "../../../lib/advice/ui-copy";
import { buildAdviceResultViewModel } from "../../../lib/advice/view-model";
import { ReadingResultShell } from "../readings/reading-result-shell";
import { useAdviceFlow } from "./advice-flow-provider";
import { AdviceFeedback } from "./advice-feedback";
import { FactBoundaries } from "./fact-boundaries";
import { GenerationStatus } from "./generation-status";
import { SafetyResult } from "./safety-result";
import { TraditionalPerspective } from "./traditional-perspective";

type AdviceReportProps = {
  locale: "en" | "zh";
  copy: AdviceUiCopy;
};

export function AdviceReport({ locale, copy }: AdviceReportProps) {
  const router = useRouter();
  const flow = useAdviceFlow();
  const result = flow.result;

  if (!result) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
        <h2 className="font-serif text-4xl">{copy.page.resultMissingTitle}</h2>
        <p className="mt-4 text-base leading-8 text-[color:var(--color-muted)]">
          {copy.page.resultMissingText}
        </p>
        <Link
          href={`/${locale}/reading/advice`}
          className="mt-8 inline-flex rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)]"
        >
          {copy.page.resultMissingCta}
        </Link>
      </div>
    );
  }

  const { report } = result;
  const viewModel = buildAdviceResultViewModel(
    report,
    copy.result.statusLabels,
    copy.result.statusDescriptions,
  );
  const traditionalPerspective =
    report.extendedAdvice?.traditionalPerspective ??
    report.localAdvice.summary.traditionalPerspective;

  return (
    <div className="space-y-8">
      <ReadingResultShell
        eyebrow={copy.page.eyebrow}
        title={report.display.headline}
        summary={report.display.situation}
      >
        <GenerationStatus
          title={copy.result.generationTitle}
          label={viewModel.statusLabel}
          description={viewModel.statusDescription}
        />

        <FactBoundaries
          title={copy.result.factsTitle}
          observedTitle={copy.result.observedFacts}
          assumptionsTitle={copy.result.userAssumptions}
          unknownTitle={copy.result.unknownFacts}
          emptyLabel={copy.result.emptyFacts}
          observedFacts={report.facts.observedFacts}
          userAssumptions={report.facts.userAssumptions}
          unknownFacts={report.facts.unknownFacts}
        />

        {viewModel.showTraditionalPerspective ? (
          <TraditionalPerspective
            title={copy.result.traditionalPerspectiveTitle}
            hint={copy.result.traditionalPerspectiveHint}
            items={traditionalPerspective}
          />
        ) : null}

        {viewModel.isHighRisk ? (
          <SafetyResult
            title={copy.safety.title}
            summary={copy.safety.summary}
            professionalHelp={copy.safety.professionalHelp}
            emergencySupport={copy.safety.emergencySupport}
            nextStepsTitle={copy.result.nextSteps}
            boundariesTitle={copy.result.boundaries}
            cautionTitle={copy.result.caution}
            nextSteps={report.localAdvice.guidance.nextSteps}
            boundaries={report.localAdvice.guidance.boundaries}
            caution={report.localAdvice.summary.caution}
          />
        ) : (
          <section className="rounded-[1.5rem] border border-white/10 bg-black/10 p-6">
            <p className="text-sm text-[color:var(--color-muted)]">
              {copy.result.actionAdviceTitle}
            </p>

            <article className="mt-5 rounded-[1.25rem] border border-white/8 bg-white/4 p-4">
              <h3 className="text-sm text-[color:var(--color-foreground)]">
                {copy.result.localGuidanceTitle}
              </h3>
              <AdviceGuidanceBlock
                nextStepsTitle={copy.result.nextSteps}
                boundariesTitle={copy.result.boundaries}
                reflectionTitle={copy.result.reflection}
                cautionTitle={copy.result.caution}
                nextSteps={report.localAdvice.guidance.nextSteps}
                boundaries={report.localAdvice.guidance.boundaries}
                reflection={report.localAdvice.guidance.reflection}
                caution={report.localAdvice.summary.caution}
              />
            </article>

            {viewModel.showExtendedAdvice && report.extendedAdvice ? (
              <article className="mt-5 rounded-[1.25rem] border border-[color:rgba(196,155,98,0.22)] bg-[rgba(196,155,98,0.08)] p-4">
                <p className="text-xs tracking-[0.18em] text-[color:var(--color-accent)] uppercase">
                  {copy.result.aiBadge}
                </p>
                <p className="mt-3 text-xs leading-6 text-[color:var(--color-muted)]">
                  {copy.result.aiBadgeHint}
                </p>
                <h3 className="mt-4 text-sm text-[color:var(--color-foreground)]">
                  {copy.result.aiGuidanceTitle}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">
                  {report.extendedAdvice.observedSummary}
                </p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">
                  {report.extendedAdvice.assumptionBoundary}
                </p>
                <AdviceGuidanceBlock
                  nextStepsTitle={copy.result.nextSteps}
                  boundariesTitle={copy.result.boundaries}
                  reflectionTitle={copy.result.reflection}
                  cautionTitle={copy.result.caution}
                  nextSteps={report.extendedAdvice.guidance.nextSteps}
                  boundaries={report.extendedAdvice.guidance.boundaries}
                  reflection={report.extendedAdvice.guidance.reflection}
                  caution={report.extendedAdvice.guidance.caution}
                />
                {process.env.NODE_ENV !== "production" ? (
                  <details className="mt-4 rounded-[1rem] border border-white/8 bg-black/10 p-4">
                    <summary className="cursor-pointer text-xs text-[color:var(--color-muted)]">
                      {copy.result.devAnchors}
                    </summary>
                    <pre className="mt-3 overflow-x-auto text-xs leading-6 text-[color:var(--color-muted)]">
                      {JSON.stringify(report.extendedAdvice.sourceAnchors, null, 2)}
                    </pre>
                  </details>
                ) : null}
              </article>
            ) : null}
          </section>
        )}

        <div className="flex flex-wrap gap-4 text-sm">
          <Link
            href={`/${locale}/methodology`}
            className="text-[color:var(--color-accent)] transition hover:text-[color:var(--color-accent-soft)]"
          >
            {copy.result.links.methodology}
          </Link>
          <Link
            href={`/${locale}/privacy`}
            className="text-[color:var(--color-accent)] transition hover:text-[color:var(--color-accent-soft)]"
          >
            {copy.result.links.privacy}
          </Link>
          <Link
            href={`/${locale}/disclaimer`}
            className="text-[color:var(--color-accent)] transition hover:text-[color:var(--color-accent-soft)]"
          >
            {copy.result.links.disclaimer}
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              flow.clearReport();
              router.push(`/${locale}/reading/advice`);
            }}
            className="inline-flex min-h-11 items-center rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)]"
          >
            {copy.result.rewrite}
          </button>
          <button
            type="button"
            onClick={() => {
              flow.reset();
              router.push(`/${locale}/reading/advice`);
            }}
            className="inline-flex min-h-11 items-center rounded-full border border-white/12 px-6 py-3 text-sm text-[color:var(--color-foreground)] transition hover:border-white/24 hover:bg-white/6"
          >
            {copy.result.startOver}
          </button>
        </div>

        <AdviceFeedback
          title={copy.feedback.title}
          levels={copy.feedback.levels}
          reasonsLabel={copy.feedback.reasonsLabel}
          reasons={copy.feedback.reasons}
          submitted={copy.feedback.submitted}
        />
      </ReadingResultShell>
    </div>
  );
}

function AdviceGuidanceBlock({
  nextStepsTitle,
  boundariesTitle,
  reflectionTitle,
  cautionTitle,
  nextSteps,
  boundaries,
  reflection,
  caution,
}: {
  nextStepsTitle: string;
  boundariesTitle: string;
  reflectionTitle: string;
  cautionTitle: string;
  nextSteps: string[];
  boundaries: string[];
  reflection: string;
  caution: string;
}) {
  return (
    <div className="mt-4 space-y-4 text-sm leading-7">
      <div>
        <p className="text-[color:var(--color-foreground)]">{nextStepsTitle}</p>
        <ul className="mt-2 space-y-2 text-[color:var(--color-muted)]">
          {nextSteps.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[color:var(--color-foreground)]">{boundariesTitle}</p>
        <ul className="mt-2 space-y-2 text-[color:var(--color-muted)]">
          {boundaries.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <p className="text-[color:var(--color-muted)]">
        <span className="text-[color:var(--color-foreground)]">{reflectionTitle}: </span>
        {reflection}
      </p>
      <p className="text-[color:var(--color-muted)]">
        <span className="text-[color:var(--color-foreground)]">{cautionTitle}: </span>
        {caution}
      </p>
    </div>
  );
}
