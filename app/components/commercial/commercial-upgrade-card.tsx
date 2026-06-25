"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { PaywallGate } from "../paywall-gate";

type CommercialUpgradeCardProps = {
  locale: "en" | "zh";
};

export function CommercialUpgradeCard({ locale }: CommercialUpgradeCardProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <div className="mt-8">
      <PaywallGate
        locale={locale}
        unlockHref={`/${locale}/reading/advice`}
        title={locale === "zh" ? "更完整的深度报告" : "Deeper report preview"}
        subtitle={
          locale === "zh"
            ? "闭测阶段只开放沙箱支付。完成后会获得付费权益，再生成更完整的 AI 扩展建议。"
            : "Closed beta uses sandbox payment only. After completion you receive an entitlement and can generate the fuller AI layer."
        }
        price={locale === "zh" ? "￥3.99（沙箱）" : "$3.99 sandbox"}
        teaser={
          locale === "zh"
            ? "包含更多行动路径、沟通示例和边界说明，不会覆盖免费的基础结果。"
            : "Includes more action paths, communication examples, and boundary framing without replacing the free result."
        }
      />
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const response = await fetch("/api/commercial/orders", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ productCode: "deep_advice_single", locale }),
            });

            const json = (await response.json()) as
              | { success: true; data: { checkoutUrl: string } }
              | { success: false; error?: string };

            if (response.ok && json.success) {
              router.push(json.data.checkoutUrl);
            }
          } finally {
            setBusy(false);
          }
        }}
        className="mt-4 inline-flex rounded-full border border-white/12 px-5 py-3 text-sm text-[color:var(--color-foreground)] transition hover:border-white/24 hover:bg-white/6 disabled:opacity-60"
      >
        {busy ? (locale === "zh" ? "创建订单..." : "Creating order...") : locale === "zh" ? "进入沙箱支付" : "Start sandbox checkout"}
      </button>
    </div>
  );
}
