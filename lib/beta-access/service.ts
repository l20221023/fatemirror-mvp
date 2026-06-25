import { createBetaInviteCode, hashBetaInviteCode } from "./code";
import { createDefaultBetaAccessRepository } from "./repository";
import type { BetaInvite, BetaSession } from "./repository";
import type { JsonValue } from "../supabase";
import { createBetaAccessToken, hashBetaSessionToken } from "./tokens";
import { getAdviceRuntimeConfig } from "../advice/runtime";

const repository = createDefaultBetaAccessRepository();

export type CreateBetaInviteInput = {
  code?: string;
  maxUses?: number;
  expiresAt?: string | null;
  metadata?: JsonValue;
};

export async function listBetaInvites() {
  return repository.listInvites();
}

export async function listBetaSessions() {
  return repository.listSessions();
}

export async function getBetaSessionByToken(token: string | undefined | null) {
  if (!token) return null;
  const normalized = token.trim();
  if (!normalized) return null;

  return repository.getSessionByTokenHash(hashBetaSessionToken(normalized));
}

export async function createBetaSession(input: {
  inviteId: string;
  cohortId?: string;
  subjectHash?: string | null;
  pricingExperimentCode?: string | null;
}) {
  const config = getAdviceRuntimeConfig();
  const token = createBetaAccessToken();
  if (!token) {
    return null;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.betaSessionTtlDays * 24 * 60 * 60 * 1000).toISOString();

  const session = await repository.createSession({
    inviteId: input.inviteId,
    tokenHash: hashBetaSessionToken(token),
    cohortId: input.cohortId ?? "beta-default",
    subjectHash: input.subjectHash ?? null,
    expiresAt,
    localUsageTotal: 0,
    localUsageToday: 0,
    aiUsageTotal: 0,
    aiUsageToday: 0,
    lastAiRequestAt: null,
    pricingExperimentCode: input.pricingExperimentCode ?? null,
  });

  return { token, session };
}

export async function createBetaInvite(input: CreateBetaInviteInput = {}) {
  const code = input.code ?? createBetaInviteCode();
  const invite = await repository.createInvite({
    codeHash: hashBetaInviteCode(code),
    maxUses: input.maxUses,
    expiresAt: input.expiresAt ?? null,
    metadata: input.metadata ?? {},
  });

  return {
    code,
    invite,
  };
}

export async function disableBetaInvite(inviteId: string) {
  return repository.updateInvite(inviteId, {
    status: "disabled",
    disabledAt: new Date().toISOString(),
  });
}

export async function revokeBetaSession(sessionId: string) {
  return repository.revokeSession(sessionId);
}

export async function markBetaInviteUsed(inviteId: string) {
  const invite = await repository.listInvites().then((items) => items.find((item) => item.id === inviteId) ?? null);
  if (!invite) return null;

  return repository.redeemInviteByCodeHash(invite.codeHash, new Date().toISOString());
}

export async function recordBetaSessionUsage(
  sessionId: string,
  kind: "local" | "ai",
  options?: { aiGrantedToday?: boolean },
) {
  return repository.incrementSessionUsage(sessionId, kind, {
    aiGrantedToday: options?.aiGrantedToday,
    requestedAt: new Date().toISOString(),
  });
}

export async function adjustBetaSessionAiCounters(
  sessionId: string,
  patch: {
    aiUsageToday?: number;
    aiUsageTotal?: number;
    lastAiRequestAt?: string | null;
  },
) {
  return repository.updateSession(sessionId, patch);
}

export async function findActiveBetaSessionByToken(token: string | undefined | null) {
  if (!token) return null;
  const normalized = token.trim();
  if (!normalized) return null;

  const tokenHash = hashBetaSessionToken(normalized);
  const session = await repository.getSessionByTokenHash(tokenHash);
  if (!session) return null;

  const now = Date.now();
  if (session.status !== "active") return null;
  if (new Date(session.expiresAt).getTime() <= now) return null;
  if (session.revokedAt) return null;

  return session;
}

export async function canUseBetaInviteCode(code: string | undefined | null) {
  if (!code) return false;

  const normalized = code.trim();
  if (!normalized) return false;

  const envCode = process.env.ADVICE_BETA_TEST_ACCESS_CODE?.trim();
  if (envCode && normalized === envCode) {
    return true;
  }

  const envCodes = (process.env.ADVICE_BETA_INVITE_CODES || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (envCodes.some((item) => item === normalized)) {
    return true;
  }

  const invite = await repository.getInviteByCodeHash(hashBetaInviteCode(normalized));
  if (!invite) return false;

  const now = Date.now();
  if (invite.status !== "active") return false;
  if (invite.expiresAt && new Date(invite.expiresAt).getTime() < now) return false;
  if (invite.usedCount >= invite.maxUses) return false;

  return true;
}

export async function redeemBetaInviteCode(code: string | undefined | null) {
  if (!code) return null;

  const normalized = code.trim();
  if (!normalized) return null;

  const envCode = process.env.ADVICE_BETA_TEST_ACCESS_CODE?.trim();
  if (envCode && normalized === envCode) {
    let invite = await repository.getInviteByCodeHash(hashBetaInviteCode(normalized));
    if (!invite) {
      invite = await repository.createInvite({
        codeHash: hashBetaInviteCode(normalized),
        maxUses: 999999,
        usedCount: 0,
        metadata: { source: "env_test_access" },
      });
    }

    return {
      invite,
      envCode: true,
    };
  }

  const invite = await repository.getInviteByCodeHash(hashBetaInviteCode(normalized));
  if (!invite) return null;

  const now = Date.now();
  if (invite.status !== "active") return null;
  if (invite.expiresAt && new Date(invite.expiresAt).getTime() < now) return null;
  if (invite.usedCount >= invite.maxUses) return null;

  const updated = await repository.redeemInviteByCodeHash(invite.codeHash, new Date(now).toISOString());
  if (!updated) return null;

  return {
    invite: updated,
    envCode: false,
  };
}

export type BetaInviteRecord = BetaInvite;
export type BetaSessionRecord = BetaSession;
