import { getSupabaseAdminClient } from "../../supabase";
import { createDatabaseBetaAccessRepository } from "./database-beta-access-repository";
import { createMemoryBetaAccessRepository } from "./memory-beta-access-repository";
import type { BetaAccessRepository } from "./beta-access-repository";

function hasDatabase() {
  return Boolean(getSupabaseAdminClient());
}

export class DefaultBetaAccessRepository implements BetaAccessRepository {
  private readonly database = createDatabaseBetaAccessRepository();
  private readonly memory = createMemoryBetaAccessRepository();
  private readonly databaseEnabled = hasDatabase();

  async listInvites() {
    return this.databaseEnabled ? this.database.listInvites() : this.memory.listInvites();
  }

  async getInviteByCodeHash(codeHash: string) {
    return this.databaseEnabled ? (await this.database.getInviteByCodeHash(codeHash)) ?? this.memory.getInviteByCodeHash(codeHash) : this.memory.getInviteByCodeHash(codeHash);
  }

  async createInvite(input: Parameters<BetaAccessRepository["createInvite"]>[0]) {
    if (this.databaseEnabled) {
      try {
        return await this.database.createInvite(input);
      } catch {
        // fall through
      }
    }
    return this.memory.createInvite(input);
  }

  async updateInvite(inviteId: string, patch: Parameters<BetaAccessRepository["updateInvite"]>[1]) {
    return this.databaseEnabled ? (await this.database.updateInvite(inviteId, patch)) ?? this.memory.updateInvite(inviteId, patch) : this.memory.updateInvite(inviteId, patch);
  }

  async redeemInviteByCodeHash(codeHash: string, nowIso: string) {
    if (this.databaseEnabled) {
      try {
        return await this.database.redeemInviteByCodeHash(codeHash, nowIso);
      } catch {
        return this.memory.redeemInviteByCodeHash(codeHash, nowIso);
      }
    }

    return this.memory.redeemInviteByCodeHash(codeHash, nowIso);
  }

  async listSessions() {
    return this.databaseEnabled ? this.database.listSessions() : this.memory.listSessions();
  }

  async getSessionByTokenHash(tokenHash: string) {
    return this.databaseEnabled ? (await this.database.getSessionByTokenHash(tokenHash)) ?? this.memory.getSessionByTokenHash(tokenHash) : this.memory.getSessionByTokenHash(tokenHash);
  }

  async createSession(input: Parameters<BetaAccessRepository["createSession"]>[0]) {
    if (this.databaseEnabled) {
      try {
        return await this.database.createSession(input);
      } catch {
        // fall through
      }
    }
    return this.memory.createSession(input);
  }

  async updateSession(sessionId: string, patch: Parameters<BetaAccessRepository["updateSession"]>[1]) {
    return this.databaseEnabled ? (await this.database.updateSession(sessionId, patch)) ?? this.memory.updateSession(sessionId, patch) : this.memory.updateSession(sessionId, patch);
  }

  async incrementSessionUsage(
    sessionId: string,
    kind: "local" | "ai",
    options?: { aiGrantedToday?: boolean; requestedAt?: string },
  ) {
    if (this.databaseEnabled) {
      try {
        return await this.database.incrementSessionUsage(sessionId, kind, options);
      } catch {
        return this.memory.incrementSessionUsage(sessionId, kind, options);
      }
    }

    return this.memory.incrementSessionUsage(sessionId, kind, options);
  }

  async revokeSession(sessionId: string) {
    return this.databaseEnabled ? (await this.database.revokeSession(sessionId)) ?? this.memory.revokeSession(sessionId) : this.memory.revokeSession(sessionId);
  }
}

export function createDefaultBetaAccessRepository() {
  return new DefaultBetaAccessRepository();
}
