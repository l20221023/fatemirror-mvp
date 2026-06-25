"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type BetaInvite = {
  id: string;
  codeHash: string;
  status: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
  disabledAt: string | null;
};

type BetaInviteManagerProps = {
  locale: "en" | "zh";
  invites: BetaInvite[];
};

export function BetaInviteManager({ locale, invites }: BetaInviteManagerProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [cohortId, setCohortId] = useState("");
  const [maxUses, setMaxUses] = useState("1");
  const [expiresAt, setExpiresAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const rows = useMemo(() => invites, [invites]);

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-black/10 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[color:var(--color-muted)]">{locale === "zh" ? "Beta 邀请码管理" : "Beta invite manager"}</p>
          <h2 className="mt-1 font-serif text-2xl">{locale === "zh" ? "创建和停用邀请码" : "Create and disable invites"}</h2>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_0.6fr_0.8fr_auto]">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder={locale === "zh" ? "留空则自动生成" : "Leave blank to auto-generate"}
          className="min-h-11 rounded-full border border-white/12 bg-black/20 px-4 text-sm outline-none placeholder:text-[color:rgba(244,239,228,0.34)]"
        />
        <input
          value={cohortId}
          onChange={(event) => setCohortId(event.target.value)}
          placeholder={locale === "zh" ? "cohort ID（可选）" : "cohort ID (optional)"}
          className="min-h-11 rounded-full border border-white/12 bg-black/20 px-4 text-sm outline-none placeholder:text-[color:rgba(244,239,228,0.34)]"
        />
        <input
          value={maxUses}
          onChange={(event) => setMaxUses(event.target.value)}
          inputMode="numeric"
          className="min-h-11 rounded-full border border-white/12 bg-black/20 px-4 text-sm outline-none"
        />
        <input
          value={expiresAt}
          onChange={(event) => setExpiresAt(event.target.value)}
          placeholder="2026-07-31T00:00:00Z"
          className="min-h-11 rounded-full border border-white/12 bg-black/20 px-4 text-sm outline-none placeholder:text-[color:rgba(244,239,228,0.34)]"
        />
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setMessage(null);
            try {
              const response = await fetch("/api/internal/beta-invites", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  code: code.trim() || undefined,
                  cohortId: cohortId.trim() || undefined,
                  maxUses: Number(maxUses) > 0 ? Number(maxUses) : 1,
                  expiresAt: expiresAt.trim() || null,
                }),
              });

              if (!response.ok) {
                setMessage(locale === "zh" ? "创建失败" : "Failed to create invite");
                return;
              }

              const data = (await response.json()) as { data?: { code?: string } };
              const createdCode = data.data?.code ?? "";
              setMessage(
                locale === "zh"
                  ? `邀请码已创建，明文只显示一次：${createdCode}`
                  : `Invite created. Plaintext code is shown once: ${createdCode}`,
              );
              setCode("");
              setCohortId("");
              setMaxUses("1");
              setExpiresAt("");
              router.refresh();
            } catch {
              setMessage(locale === "zh" ? "创建失败" : "Failed to create invite");
            } finally {
              setBusy(false);
            }
          }}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--color-accent)] px-5 py-3 text-sm font-medium text-[color:var(--color-ink)] disabled:opacity-60"
        >
          {busy ? (locale === "zh" ? "创建中..." : "Creating...") : locale === "zh" ? "创建邀请码" : "Create invite"}
        </button>
      </div>

      {message ? <p className="mt-3 text-xs text-[color:var(--color-muted)]">{message}</p> : null}

      <div className="mt-6 space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-[color:var(--color-muted)]">{locale === "zh" ? "暂无邀请码" : "No invites yet."}</p>
        ) : (
          rows.map((invite) => (
            <div key={invite.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-white/10 bg-black/15 p-4">
              <div>
                <p className="text-sm text-[color:var(--color-foreground)]">{invite.codeHash.slice(0, 12)}...</p>
                <p className="mt-1 text-xs text-[color:var(--color-muted)]">
                  {invite.status} · {invite.usedCount}/{invite.maxUses} · {invite.expiresAt ?? (locale === "zh" ? "无到期时间" : "no expiry")}
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const response = await fetch(`/api/internal/beta-invites/${invite.id}`, {
                    method: "PATCH",
                  });
                  if (response.ok) {
                    router.refresh();
                  }
                }}
                className="rounded-full border border-white/12 px-4 py-2 text-xs text-[color:var(--color-foreground)]"
              >
                {locale === "zh" ? "停用" : "Disable"}
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
