import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { getAdviceMetrics } from "../../../../lib/advice/services/metrics";
import { getAdviceRuntimeConfig } from "../../../../lib/advice/runtime";
import { getCommercialOrders } from "../../../../lib/commercial/order-service";
import { listCommercialEntitlements } from "../../../../lib/commercial/entitlement-service";
import { isBetaAccessGrantedFromCookieStore } from "../../../../lib/beta-access/server";
import { getDictionary, hasLocale } from "../../../../lib/i18n";

type InternalAdviceMetricsPageProps = PageProps<"/[locale]/internal/advice-metrics">;

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function InternalAdviceMetricsPage(
  props: InternalAdviceMetricsPageProps,
) {
  const { locale } = await props.params;
  if (!hasLocale(locale)) notFound();

  const config = getAdviceRuntimeConfig();
  const cookieStore = await cookies();
  if (!config.internalMetricsEnabled || !isBetaAccessGrantedFromCookieStore(cookieStore)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const metrics = await getAdviceMetrics();
  const commercialOrders = config.commercialEnabled ? await getCommercialOrders() : [];
  const commercialEntitlements = config.commercialEnabled ? await listCommercialEntitlements() : [];

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-12">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/${locale}`}
          className="text-sm tracking-[0.28em] text-[color:var(--color-muted)] uppercase"
        >
          {dict.shared.brand}
        </Link>
        <Link
          href={`/${locale}/reading/advice`}
          className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
        >
          Back to Advice
        </Link>
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
          Internal Advice Metrics
        </p>
        <h1 className="mt-4 font-serif text-4xl">Advice internal metrics</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <MetricCard label="Total reports" value={metrics.totalReports} />
          <MetricCard label="AI enhanced" value={metrics.aiEnhancedCount} />
          <MetricCard label="AI fallback" value={metrics.aiFallbackCount} />
          <MetricCard label="Local only" value={metrics.localOnlyCount} />
          <MetricCard label="High risk" value={metrics.highRiskCount} />
          <MetricCard label="Average duration (ms)" value={Math.round(metrics.averageGenerationMs)} />
          <MetricCard label="Sandbox orders" value={commercialOrders.length} />
          <MetricCard
            label="Active entitlements"
            value={commercialEntitlements.filter((item) => item.status === "active" || item.status === "consumed").length}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <MetricList
            title="Feedback distribution"
            items={Object.entries(metrics.feedbackBreakdown).map(([key, value]) => ({
              label: key,
              value,
            }))}
          />
          <MetricList
            title="Common fallbackReasonCode"
            items={metrics.commonFallbackReasonCodes.map((item) => ({
              label: item.code,
              value: item.count,
            }))}
          />
          <MetricList
            title="Common validationFailureCodes"
            items={metrics.commonValidationFailureCodes.map((item) => ({
              label: item.code,
              value: item.count,
            }))}
          />
          <MetricList
            title="Token and cost"
            items={[
              { label: "input tokens", value: Math.round(metrics.estimatedInputTokens ?? 0) },
              { label: "output tokens", value: Math.round(metrics.estimatedOutputTokens ?? 0) },
              { label: "estimated cost", value: (metrics.estimatedCost ?? 0).toFixed(4) },
            ]}
          />
        </div>
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-black/10 p-4">
      <p className="text-xs text-[color:var(--color-muted)]">{label}</p>
      <p className="mt-2 font-serif text-3xl text-[color:var(--color-foreground)]">{value}</p>
    </div>
  );
}

function MetricList({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: string | number }>;
}) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-black/10 p-5">
      <p className="text-sm text-[color:var(--color-muted)]">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4 text-sm">
            <span className="text-[color:var(--color-muted)]">{item.label}</span>
            <span className="text-[color:var(--color-foreground)]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
