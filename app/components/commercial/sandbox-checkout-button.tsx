"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SandboxCheckoutButtonProps = {
  locale: "en" | "zh";
  orderId: string;
};

export function SandboxCheckoutButton({ locale, orderId }: SandboxCheckoutButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        setError(null);
        try {
          const response = await fetch("/api/commercial/mock/confirm", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ orderId }),
          });

          if (!response.ok) {
            throw new Error("sandbox checkout failed");
          }

          router.refresh();
        } catch {
          setError(locale === "zh" ? "沙箱支付失败" : "Sandbox payment failed");
        } finally {
          setBusy(false);
        }
      }}
      className="mt-5 inline-flex rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)] disabled:opacity-60"
    >
      {busy ? (locale === "zh" ? "处理中..." : "Processing...") : locale === "zh" ? "模拟支付完成" : "Simulate payment success"}
      {error ? <span className="sr-only">{error}</span> : null}
    </button>
  );
}
