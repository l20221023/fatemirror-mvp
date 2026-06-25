import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { BetaInviteManager } from "@/app/components/internal/beta-invite-manager";
import { InternalAccessPanel } from "@/app/components/internal/internal-access-panel";
import { getOperationsSnapshot } from "@/lib/operations";
import { getAdviceRuntimeConfig } from "@/lib/advice/runtime";
import { isInternalAccessGrantedFromCookieStore } from "@/lib/internal-access/server";
import { getDictionary, hasLocale } from "@/lib/i18n";

type InternalOperationsPageProps = PageProps<"/[locale]/internal/operations">;

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function InternalOperationsPage(
  props: InternalOperationsPageProps,
) {
  const { locale } = await props.params;
  if (!hasLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const config = getAdviceRuntimeConfig();
  const cookieStore = await cookies();
  const internalAccessGranted = isInternalAccessGrantedFromCookieStore(cookieStore);
  const isZh = locale === "zh";

  if (!config.internalMetricsEnabled) {
    notFound();
  }

  if (!internalAccessGranted) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-10 sm:px-8 lg:px-12">
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
            {isZh ? "返回 Advice" : "Back to Advice"}
          </Link>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
            Internal Operations
          </p>
          <h1 className="mt-4 font-serif text-4xl">
            {isZh ? "内部运营面板" : "Internal operations"}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--color-muted)]">
            {isZh
              ? "这里是管理入口。先输入内部访问码，再查看运营、质量、清理和测试数据。"
              : "This is the manager-only entry point. Enter the internal access code to reveal ops, quality, cleanup, and testing data."}
          </p>
          <div className="mt-8">
            <InternalAccessPanel
              enabled={true}
              verified={false}
              label={isZh ? "内部访问码" : "Internal access code"}
              placeholder={isZh ? "输入管理访问码" : "Enter manager access code"}
              submitLabel={isZh ? "验证访问" : "Verify access"}
              successLabel={isZh ? "访问已授权" : "Access granted"}
              invalidLabel={
                isZh ? "访问码无效或面板未开启" : "Invalid code or access is disabled"
              }
            />
          </div>
        </section>
      </main>
    );
  }

  const snapshot = await getOperationsSnapshot();
  const reportCleanup = snapshot.cleanupPreview;

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-8 lg:px-12">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/${locale}`}
          className="text-sm tracking-[0.28em] text-[color:var(--color-muted)] uppercase"
        >
          {dict.shared.brand}
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/${locale}/internal/advice-metrics`}
            className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
          >
            {isZh ? "Advice 指标" : "Advice metrics"}
          </Link>
          <Link
            href={`/${locale}/help`}
            className="text-sm text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
          >
            {isZh ? "帮助" : "Help"}
          </Link>
        </div>
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-xs tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
          Internal Operations
        </p>
        <h1 className="mt-4 font-serif text-4xl">
          {isZh ? "V0.4 封闭测试运营台" : "V0.4 closed-beta operations"}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--color-muted)]">
          {isZh
            ? "这里把封闭测试使用量、清理、额度、熔断、商业和 cohort 统计放在一起，方便快速判断当前发布状态。"
            : "This dashboard brings closed-beta usage, cleanup, quotas, fuse state, commerce, and cohort stats into one place for fast release decisions."}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label={isZh ? "总报告数" : "Total reports"}
            value={snapshot.adviceMetrics.totalReports}
          />
          <MetricCard
            label={isZh ? "AI 增强" : "AI enhanced"}
            value={snapshot.adviceMetrics.aiEnhancedCount}
          />
          <MetricCard
            label={isZh ? "高风险本地" : "High risk local"}
            value={snapshot.adviceMetrics.highRiskCount}
          />
          <MetricCard
            label={isZh ? "待清理报告" : "Reports eligible for cleanup"}
            value={reportCleanup.eligible}
          />
          <MetricCard
            label={isZh ? "今日 AI 请求" : "Today AI requests"}
            value={snapshot.adviceUsage.ai_request_count}
          />
          <MetricCard
            label={isZh ? "今日限流" : "Today rate limited"}
            value={snapshot.adviceUsage.rate_limited_count}
          />
          <MetricCard
            label={isZh ? "熔断状态" : "Fuse state"}
            value={snapshot.fuse.tripped ? (isZh ? "已熔断" : "tripped") : (isZh ? "正常" : "normal")}
          />
          <MetricCard
            label={isZh ? "活跃 Beta Session" : "Active beta sessions"}
            value={snapshot.beta.activeSessions.length}
          />
        </div>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Panel title={isZh ? "运行健康" : "Runtime health"}>
          <KeyValue
            label={isZh ? "运行环境" : "Environment"}
            value={snapshot.health.runtime.environment}
          />
          <KeyValue
            label={isZh ? "Supabase 已配置" : "Supabase configured"}
            value={snapshot.health.supabaseConfigured ? "yes" : "no"}
          />
          <KeyValue
            label={isZh ? "商业功能已启用" : "Commercial enabled"}
            value={snapshot.health.advice.commercialEnabled ? "yes" : "no"}
          />
          <KeyValue
            label={isZh ? "支付模式" : "Payment mode"}
            value={snapshot.health.advice.paymentMode}
          />
          <KeyValue
            label={isZh ? "缺失关键环境变量" : "Missing critical env"}
            value={
              snapshot.health.missingCriticalEnv.length > 0
                ? snapshot.health.missingCriticalEnv.join(", ")
                : isZh
                  ? "无"
                  : "none"
            }
          />
        </Panel>

        <Panel title={isZh ? "质量回路" : "Quality loop"}>
          <KeyValue
            label={isZh ? "反馈：有帮助" : "Feedback: helpful"}
            value={snapshot.adviceMetrics.feedbackBreakdown.helpful}
          />
          <KeyValue
            label={isZh ? "反馈：部分有帮助" : "Feedback: partly helpful"}
            value={snapshot.adviceMetrics.feedbackBreakdown.partly_helpful}
          />
          <KeyValue
            label={isZh ? "反馈：没有帮助" : "Feedback: not helpful"}
            value={snapshot.adviceMetrics.feedbackBreakdown.not_helpful}
          />
          <KeyValue
            label={isZh ? "平均生成耗时(ms)" : "Average generation ms"}
            value={Math.round(snapshot.adviceMetrics.averageGenerationMs)}
          />
          <KeyValue
            label={isZh ? "清理预演" : "Cleanup dry-run"}
            value={reportCleanup.dryRun ? "yes" : "no"}
          />
        </Panel>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Panel title={isZh ? "防滥用与额度" : "Anti-abuse and quotas"}>
          <KeyValue
            label={isZh ? "今日 AI 成功" : "AI success count"}
            value={snapshot.adviceUsage.ai_success_count}
          />
          <KeyValue
            label={isZh ? "今日 AI 降级" : "AI downgrade count"}
            value={snapshot.adviceUsage.ai_downgrade_count}
          />
          <KeyValue
            label={isZh ? "邀请码失败" : "Invite failures"}
            value={snapshot.adviceUsage.invite_failure_count}
          />
          <KeyValue
            label={isZh ? "熔断原因" : "Fuse reason"}
            value={snapshot.fuse.lastFailureReason ?? (isZh ? "无" : "none")}
          />
          <KeyValue
            label={isZh ? "是否熔断" : "Tripped"}
            value={snapshot.fuse.tripped ? (isZh ? "是" : "yes") : (isZh ? "否" : "no")}
          />
          <KeyValue
            label={isZh ? "熔断截止" : "Fuse until"}
            value={snapshot.fuse.trippedUntil ?? (isZh ? "无" : "none")}
          />
        </Panel>

        <Panel title={isZh ? "Cohort 统计" : "Cohort stats"}>
          {snapshot.beta.cohortStats.length === 0 ? (
            <p className="text-sm text-[color:var(--color-muted)]">
              {isZh ? "暂无 cohort 统计" : "No cohort stats yet."}
            </p>
          ) : (
            snapshot.beta.cohortStats.map((item) => (
              <div
                key={item.cohortId}
                className="mb-3 rounded-[1rem] border border-white/10 bg-black/10 p-4 text-sm"
              >
                <KeyValue label="Cohort" value={item.cohortId} />
                <KeyValue
                  label={isZh ? "邀请码数量" : "Invite count"}
                  value={item.inviteCount}
                />
                <KeyValue
                  label={isZh ? "Session 数量" : "Session count"}
                  value={item.sessionCount}
                />
                <KeyValue
                  label={isZh ? "AI 报告数" : "AI reports"}
                  value={item.aiReportCount}
                />
                <KeyValue
                  label={isZh ? "平均成本" : "Average cost"}
                  value={item.averageCost.toFixed(4)}
                />
                <KeyValue
                  label={isZh ? "达到阈值次数" : "Threshold hits"}
                  value={item.thresholdHits}
                />
                <KeyValue
                  label={isZh ? "反馈：有帮助" : "Helpful feedback"}
                  value={item.feedbackBreakdown.helpful}
                />
                <KeyValue
                  label={isZh ? "反馈：部分有帮助" : "Partly helpful"}
                  value={item.feedbackBreakdown.partly_helpful}
                />
                <KeyValue
                  label={isZh ? "反馈：没有帮助" : "Not helpful"}
                  value={item.feedbackBreakdown.not_helpful}
                />
              </div>
            ))
          )}
        </Panel>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Panel title={isZh ? "商业与定价" : "Commercial and pricing"}>
          {snapshot.commercial.pricingValidation.map((item) => (
            <KeyValue
              key={item.code}
              label={item.label}
              value={`${(item.currentPriceCents / 100).toFixed(2)} USD ${item.matchesExpectation ? "" : "(mismatch)"}`}
            />
          ))}
        </Panel>
        <Panel title={isZh ? "数据生命周期" : "Data lifecycle"}>
          <KeyValue
            label={isZh ? "扫描到的报告" : "Scanned reports"}
            value={reportCleanup.scanned}
          />
          <KeyValue
            label={isZh ? "可清理报告" : "Eligible reports"}
            value={reportCleanup.eligible}
          />
          <KeyValue
            label={isZh ? "已删除" : "Already deleted"}
            value={reportCleanup.alreadyDeleted}
          />
          <KeyValue
            label={isZh ? "保留天数" : "Retention days"}
            value={reportCleanup.retentionDays}
          />
        </Panel>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Panel title={isZh ? "Beta 邀请码" : "Beta invites"}>
          <div className="space-y-3">
            {snapshot.beta.invites.length === 0 ? (
              <p className="text-sm text-[color:var(--color-muted)]">
                {isZh ? "暂无邀请码记录" : "No invite records yet."}
              </p>
            ) : (
              snapshot.beta.invites.map((invite) => (
                <div
                  key={invite.id}
                  className="rounded-[1rem] border border-white/10 bg-black/10 p-4 text-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span>{invite.codeHash.slice(0, 12)}...</span>
                    <span className="text-[color:var(--color-muted)]">
                      {invite.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[color:var(--color-muted)]">
                    {invite.usedCount}/{invite.maxUses} used{" "}
                    {invite.expiresAt ?? (isZh ? "无到期时间" : "no expiry")}
                  </p>
                </div>
              ))
            )}
          </div>
        </Panel>
        <Panel title={isZh ? "邀请码管理" : "Invite management"}>
          <BetaInviteManager locale={locale} invites={snapshot.beta.invites} />
        </Panel>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-black/10 p-4">
      <p className="text-xs text-[color:var(--color-muted)]">{label}</p>
      <p className="mt-2 font-serif text-3xl text-[color:var(--color-foreground)]">
        {value}
      </p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[1.6rem] border border-white/10 bg-white/5 p-6">
      <h2 className="font-serif text-2xl text-[color:var(--color-foreground)]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/8 py-3 text-sm last:border-0">
      <span className="text-[color:var(--color-muted)]">{label}</span>
      <span className="text-right text-[color:var(--color-foreground)]">{value}</span>
    </div>
  );
}
