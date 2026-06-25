import { randomUUID } from "node:crypto";

import type {
  BetaInvite,
  BetaInviteCreateInput,
  BetaInviteUpdateInput,
  BetaSession,
  BetaSessionCreateInput,
  BetaSessionUpdateInput,
} from "./types";
import type { BetaAccessRepository } from "./beta-access-repository";

const invites = new Map<string, BetaInvite>();
const sessions = new Map<string, BetaSession>();

function cloneInvite(record: BetaInvite) {
  return structuredClone(record);
}

function cloneSession(record: BetaSession) {
  return structuredClone(record);
}

export function resetMemoryBetaAccessRepository() {
  invites.clear();
  sessions.clear();
}

export class MemoryBetaAccessRepository implements BetaAccessRepository {
  async listInvites() {
    return Array.from(invites.values()).map(cloneInvite);
  }

  async getInviteByCodeHash(codeHash: string) {
    const record = Array.from(invites.values()).find((item) => item.codeHash === codeHash);
    return record ? cloneInvite(record) : null;
  }

  async createInvite(input: BetaInviteCreateInput) {
    const createdAt = new Date().toISOString();
    const record: BetaInvite = {
      id: input.id ?? randomUUID(),
      codeHash: input.codeHash,
      status: input.status ?? "active",
      maxUses: input.maxUses ?? 1,
      usedCount: input.usedCount ?? 0,
      expiresAt: input.expiresAt ?? null,
      createdAt,
      disabledAt: input.disabledAt ?? null,
      metadata: input.metadata ?? {},
    };

    invites.set(record.id, cloneInvite(record));
    return cloneInvite(record);
  }

  async updateInvite(inviteId: string, patch: BetaInviteUpdateInput) {
    const record = invites.get(inviteId);
    if (!record) return null;

    const next: BetaInvite = {
      ...record,
      ...patch,
      expiresAt: patch.expiresAt !== undefined ? patch.expiresAt : record.expiresAt,
      disabledAt: patch.disabledAt !== undefined ? patch.disabledAt : record.disabledAt,
      metadata: patch.metadata ?? record.metadata,
    };

    invites.set(inviteId, cloneInvite(next));
    return cloneInvite(next);
  }

  async redeemInviteByCodeHash(codeHash: string, nowIso: string) {
    const record = Array.from(invites.values()).find((item) => item.codeHash === codeHash);
    if (!record) return null;
    if (record.status !== "active") return null;
    if (record.disabledAt) return null;
    if (record.expiresAt && new Date(record.expiresAt).getTime() < new Date(nowIso).getTime()) {
      return null;
    }
    if (record.usedCount >= record.maxUses) return null;

    const next: BetaInvite = {
      ...record,
      usedCount: record.usedCount + 1,
    };

    invites.set(record.id, cloneInvite(next));
    return cloneInvite(next);
  }

  async listSessions() {
    return Array.from(sessions.values()).map(cloneSession);
  }

  async getSessionByTokenHash(tokenHash: string) {
    const record = Array.from(sessions.values()).find((item) => item.tokenHash === tokenHash);
    return record ? cloneSession(record) : null;
  }

  async createSession(input: BetaSessionCreateInput) {
    const record: BetaSession = {
      id: input.id ?? randomUUID(),
      inviteId: input.inviteId,
      tokenHash: input.tokenHash,
      cohortId: input.cohortId,
      subjectHash: input.subjectHash ?? null,
      status: input.status ?? "active",
      expiresAt: input.expiresAt,
      revokedAt: input.revokedAt ?? null,
      createdAt: new Date().toISOString(),
      localUsageTotal: input.localUsageTotal ?? 0,
      localUsageToday: input.localUsageToday ?? 0,
      aiUsageTotal: input.aiUsageTotal ?? 0,
      aiUsageToday: input.aiUsageToday ?? 0,
      lastAiRequestAt: input.lastAiRequestAt ?? null,
      pricingExperimentCode: input.pricingExperimentCode ?? null,
    };

    sessions.set(record.id, cloneSession(record));
    return cloneSession(record);
  }

  async updateSession(sessionId: string, patch: BetaSessionUpdateInput) {
    const record = sessions.get(sessionId);
    if (!record) return null;

    const next: BetaSession = {
      ...record,
      ...patch,
      expiresAt: patch.expiresAt ?? record.expiresAt,
      revokedAt: patch.revokedAt !== undefined ? patch.revokedAt : record.revokedAt,
      localUsageTotal: patch.localUsageTotal ?? record.localUsageTotal,
      localUsageToday: patch.localUsageToday ?? record.localUsageToday,
      aiUsageTotal: patch.aiUsageTotal ?? record.aiUsageTotal,
      aiUsageToday: patch.aiUsageToday ?? record.aiUsageToday,
      lastAiRequestAt: patch.lastAiRequestAt !== undefined ? patch.lastAiRequestAt : record.lastAiRequestAt,
      pricingExperimentCode:
        patch.pricingExperimentCode !== undefined ? patch.pricingExperimentCode : record.pricingExperimentCode,
    };

    sessions.set(sessionId, cloneSession(next));
    return cloneSession(next);
  }

  async incrementSessionUsage(
    sessionId: string,
    kind: "local" | "ai",
    options?: { aiGrantedToday?: boolean; requestedAt?: string },
  ) {
    const record = sessions.get(sessionId);
    if (!record) return null;

    const requestedAt = options?.requestedAt ?? new Date().toISOString();
    const next: BetaSession = {
      ...record,
      localUsageTotal: record.localUsageTotal + (kind === "local" ? 1 : 0),
      localUsageToday: record.localUsageToday + (kind === "local" ? 1 : 0),
      aiUsageTotal: record.aiUsageTotal + (kind === "ai" ? 1 : 0),
      aiUsageToday:
        record.aiUsageToday + (kind === "ai" && options?.aiGrantedToday !== false ? 1 : 0),
      lastAiRequestAt: kind === "ai" ? requestedAt : record.lastAiRequestAt,
    };

    sessions.set(sessionId, cloneSession(next));
    return cloneSession(next);
  }

  async revokeSession(sessionId: string) {
    return this.updateSession(sessionId, {
      status: "revoked",
      revokedAt: new Date().toISOString(),
    });
  }
}

export function createMemoryBetaAccessRepository() {
  return new MemoryBetaAccessRepository();
}
