"use client";

import { useState } from "react";

export function CalculationTrace({
  items,
  meta,
  labels,
}: {
  items: string[];
  meta: Array<{ label: string; value: string }>;
  labels?: {
    summary: string;
    copy: string;
    copied: string;
  };
}) {
  const [copied, setCopied] = useState(false);
  const content = [...items, ...meta.map((item) => `${item.label}: ${item.value}`)].join("\n");

  return (
    <details className="rounded-[1.5rem] border border-white/10 bg-black/10 p-6">
      <summary className="cursor-pointer list-none text-sm text-[color:var(--color-foreground)]">
        {labels?.summary ?? "查看本次结果如何计算"}
      </summary>
      <div className="mt-4 space-y-4">
        <ol className="space-y-2 text-sm leading-6 text-[color:var(--color-muted)]">
          {items.map((item) => (
            <li key={item} className="break-words">
              {item}
            </li>
          ))}
        </ol>
        <div className="grid gap-2 text-sm text-[color:var(--color-muted)] sm:grid-cols-2">
          {meta.map((item) => (
            <p key={`${item.label}-${item.value}`} className="break-words">
              {item.label}: {item.value}
            </p>
          ))}
        </div>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(content);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            } catch {
              setCopied(false);
            }
          }}
          className="rounded-full border border-white/14 px-4 py-2 text-sm text-[color:var(--color-foreground)] transition hover:bg-white/6"
        >
          {copied ? labels?.copied ?? "已复制计算过程" : labels?.copy ?? "复制计算过程"}
        </button>
      </div>
    </details>
  );
}
