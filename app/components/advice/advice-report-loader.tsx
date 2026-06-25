"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { AdviceMeta, AdviceReport } from "../../../lib/advice/types";
import { readAdviceAccessToken } from "../../../lib/advice/frontend";
import type { AdviceUiCopy } from "../../../lib/advice/ui-copy";
import { useAdviceFlow } from "./advice-flow-provider";
import { AdviceReport as AdviceReportView } from "./advice-report";

type AdviceReportLoaderProps = {
  locale: "en" | "zh";
  copy: AdviceUiCopy;
  reportId: string;
};

export function AdviceReportLoader({ locale, copy, reportId }: AdviceReportLoaderProps) {
  const flow = useAdviceFlow();
  const initialAccessToken = readAdviceAccessToken(reportId);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">(
    initialAccessToken ? "loading" : "missing",
  );
  const [accessToken] = useState<string | null>(initialAccessToken);
  const [report, setReport] = useState<AdviceReport | null>(null);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const controller = new AbortController();

    void fetch(`/api/advice/reports/${reportId}`, {
      headers: {
        "x-advice-access-token": accessToken,
      },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          setStatus("missing");
          return;
        }

        const json = (await response.json()) as
          | { success: true; data: AdviceReport; meta: AdviceMeta }
          | { success: false; error?: { code?: string } };

        if (!json.success) {
          setStatus("missing");
          return;
        }

        flow.setResult(json.data, json.meta);
        setReport(json.data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));

    return () => controller.abort();
  }, [accessToken, flow, reportId]);

  if (status === "loading") {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-sm text-[color:var(--color-muted)]">
        {locale === "zh" ? "正在读取报告..." : "Loading report..."}
      </div>
    );
  }

  if (status !== "ready") {
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

  return <AdviceReportView locale={locale} copy={copy} report={report ?? flow.result?.report} reportId={reportId} accessToken={accessToken} />;
}
