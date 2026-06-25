import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAdviceRuntimeConfig } from "@/lib/advice/runtime";
import { getDictionary, hasLocale } from "@/lib/i18n";

type HelpPageProps = PageProps<"/[locale]/help">;

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
};

export default async function HelpPage(props: HelpPageProps) {
  const { locale } = await props.params;
  if (!hasLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const config = getAdviceRuntimeConfig();
  const isZh = locale === "zh";

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 sm:px-8 lg:px-12">
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
          Help
        </p>
        <h1 className="mt-4 font-serif text-4xl">
          {isZh ? "帮助中心" : "Help center"}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--color-muted)]">
          {isZh
            ? "这里汇总封闭测试期间最常见的问题、反馈入口和运行说明。"
            : "This page collects the most common questions, feedback routes, and operating notes for the closed beta."}
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <InfoCard
            title={isZh ? "如何进入封闭测试" : "How to join the beta"}
            body={
              isZh
                ? "如果你收到了测试码，请在 Advice 页面输入；如果你是管理团队成员，请先进入运营后台。"
                : "If you received a test code, enter it on the Advice page. If you are on the management team, use the internal operations panel first."
            }
          />
          <InfoCard
            title={isZh ? "报告多久会清理" : "When reports are cleaned"}
            body={
              isZh
                ? `当前保留期是 ${config.reportRetentionDays} 天。过期报告会先进入清理队列，再由 cron 或命令行任务删除。`
                : `Current retention is ${config.reportRetentionDays} days. Expired reports first enter the cleanup queue and are then removed by cron or the CLI.`
            }
          />
          <InfoCard
            title={isZh ? "商业支付怎么运行" : "How commercial checkout works"}
            body={
              isZh
                ? "当前仅使用沙箱支付。下单后会先生成订单和权益，再通过沙箱 webhook 或 mock confirm 完成状态流转。"
                : "We only use sandbox payments. Orders and entitlements are created first, then the sandbox webhook or mock confirm flow advances their state."
            }
          />
          <InfoCard
            title={isZh ? "出问题了怎么办" : "What to do if something breaks"}
            body={
              isZh
                ? "先看运营后台里的运行健康和质量指标，再检查环境变量、Supabase 和 webhook secret。"
                : "Check the internal operations dashboard for runtime health and quality signals, then verify environment variables, Supabase, and webhook secrets."
            }
          />
        </div>
      </section>
    </main>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-[1.4rem] border border-white/10 bg-black/10 p-5">
      <h2 className="font-serif text-2xl text-[color:var(--color-foreground)]">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">
        {body}
      </p>
    </article>
  );
}
