import { randomUUID } from "node:crypto";

import { getSupabaseAdminClient, type JsonValue } from "../../supabase";
import type { BetaAccessRepository } from "./beta-access-repository";
import type {
  BetaInvite,
  BetaInviteCreateInput,
  BetaInviteUpdateInput,
  BetaInvitesTableRow,
  BetaSession,
  BetaSessionCreateInput,
  BetaSessionUpdateInput,
  BetaSessionsTableRow,
} from "./types";

function rowToInvite(row: BetaInvitesTableRow): BetaInvite {
  return {
    id: row.id,
    codeHash: row.code_hash,
    status: row.status,
    maxUses: row.max_uses,
    usedCount: row.used_count,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    disabledAt: row.disabled_at,
    metadata: row.metadata,
  };
}

function rowToSession(row: BetaSessionsTableRow): BetaSession {
  return {
    id: row.id,
    inviteId: row.invite_id,
    tokenHash: row.token_hash,
    cohortId: row.cohort_id,
    subjectHash: row.subject_hash,
    status: row.status,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
    localUsageTotal: row.local_usage_total,
    localUsageToday: row.local_usage_today,
    aiUsageTotal: row.ai_usage_total,
    aiUsageToday: row.ai_usage_today,
    lastAiRequestAt: row.last_ai_request_at,
    pricingExperimentCode: row.pricing_experiment_code,
  };
}

export class DatabaseBetaAccessRepository implements BetaAccessRepository {
  private get client() {
    return getSupabaseAdminClient();
  }

  async listInvites() {
    const client = this.client;
    if (!client) return [];
    const { data } = await client.from("beta_invites").select("*");
    return (data ?? []).map((row: BetaInvitesTableRow) => rowToInvite(row));
  }

  async getInviteByCodeHash(codeHash: string) {
    const client = this.client;
    if (!client) return null;
    const { data } = await client.from("beta_invites").select("*").eq("code_hash", codeHash).maybeSingle();
    return data ? rowToInvite(data as BetaInvitesTableRow) : null;
  }

  async createInvite(input: BetaInviteCreateInput) {
    const client = this.client;
    if (!client) throw new Error("SUPABASE_UNAVAILABLE");
    const payload = {
      id: input.id ?? randomUUID(),
      code_hash: input.codeHash,
      status: input.status ?? "active",
      max_uses: input.maxUses ?? 1,
      used_count: input.usedCount ?? 0,
      expires_at: input.expiresAt ?? null,
      created_at: new Date().toISOString(),
      disabled_at: input.disabledAt ?? null,
      metadata: input.metadata ?? {},
    };

    const { data, error } = await client.from("beta_invites").upsert(payload, { onConflict: "id" }).select("*").single();
    if (error || !data) throw error ?? new Error("Failed to create beta invite");
    return rowToInvite(data as BetaInvitesTableRow);
  }

  async updateInvite(inviteId: string, patch: BetaInviteUpdateInput) {
    const client = this.client;
    if (!client) return null;
    const payload: Record<string, JsonValue> = {};
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.maxUses !== undefined) payload.max_uses = patch.maxUses;
    if (patch.usedCount !== undefined) payload.used_count = patch.usedCount;
    if (patch.expiresAt !== undefined) payload.expires_at = patch.expiresAt;
    if (patch.disabledAt !== undefined) payload.disabled_at = patch.disabledAt;
    if (patch.metadata !== undefined) payload.metadata = patch.metadata as JsonValue;
    const { data } = await client.from("beta_invites").update(payload).eq("id", inviteId).maybeSingle();
    return data ? rowToInvite(data as BetaInvitesTableRow) : null;
  }

  async redeemInviteByCodeHash(codeHash: string, nowIso: string) {
    const client = this.client;
    if (!client) return null;
    const { data } = await client
      .rpc("redeem_beta_invite", {
        p_code_hash: codeHash,
        p_now: nowIso,
      })
      .maybeSingle();
    return data ? rowToInvite(data as BetaInvitesTableRow) : null;
  }

  async listSessions() {
    const client = this.client;
    if (!client) return [];
    const { data } = await client.from("beta_sessions").select("*");
    return (data ?? []).map((row: BetaSessionsTableRow) => rowToSession(row));
  }

  async getSessionByTokenHash(tokenHash: string) {
    const client = this.client;
    if (!client) return null;
    const { data } = await client.from("beta_sessions").select("*").eq("token_hash", tokenHash).maybeSingle();
    return data ? rowToSession(data as BetaSessionsTableRow) : null;
  }

  async createSession(input: BetaSessionCreateInput) {
    const client = this.client;
    if (!client) throw new Error("SUPABASE_UNAVAILABLE");
    const payload = {
      id: input.id ?? randomUUID(),
      invite_id: input.inviteId,
      token_hash: input.tokenHash,
      cohort_id: input.cohortId,
      subject_hash: input.subjectHash ?? null,
      status: input.status ?? "active",
      expires_at: input.expiresAt,
      revoked_at: input.revokedAt ?? null,
      created_at: new Date().toISOString(),
      local_usage_total: input.localUsageTotal ?? 0,
      local_usage_today: input.localUsageToday ?? 0,
      ai_usage_total: input.aiUsageTotal ?? 0,
      ai_usage_today: input.aiUsageToday ?? 0,
      last_ai_request_at: input.lastAiRequestAt ?? null,
      pricing_experiment_code: input.pricingExperimentCode ?? null,
    };

    const { data, error } = await client.from("beta_sessions").insert(payload).select("*").single();
    if (error || !data) throw error ?? new Error("Failed to create beta session");
    return rowToSession(data as BetaSessionsTableRow);
  }

  async updateSession(sessionId: string, patch: BetaSessionUpdateInput) {
    const client = this.client;
    if (!client) return null;
    const payload: Record<string, JsonValue> = {};
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.expiresAt !== undefined) payload.expires_at = patch.expiresAt;
    if (patch.revokedAt !== undefined) payload.revoked_at = patch.revokedAt;
    if (patch.localUsageTotal !== undefined) payload.local_usage_total = patch.localUsageTotal;
    if (patch.localUsageToday !== undefined) payload.local_usage_today = patch.localUsageToday;
    if (patch.aiUsageTotal !== undefined) payload.ai_usage_total = patch.aiUsageTotal;
    if (patch.aiUsageToday !== undefined) payload.ai_usage_today = patch.aiUsageToday;
    if (patch.lastAiRequestAt !== undefined) payload.last_ai_request_at = patch.lastAiRequestAt;
    if (patch.pricingExperimentCode !== undefined) payload.pricing_experiment_code = patch.pricingExperimentCode;
    const { data } = await client.from("beta_sessions").update(payload).eq("id", sessionId).maybeSingle();
    return data ? rowToSession(data as BetaSessionsTableRow) : null;
  }

  async incrementSessionUsage(
    sessionId: string,
    kind: "local" | "ai",
    options?: { aiGrantedToday?: boolean; requestedAt?: string },
  ) {
    const client = this.client;
    if (!client) return null;
    const { data } = await client
      .rpc("increment_beta_session_usage", {
        p_session_id: sessionId,
        p_kind: kind,
        p_increment_ai_today: options?.aiGrantedToday !== false,
        p_requested_at: options?.requestedAt ?? new Date().toISOString(),
      })
      .maybeSingle();
    return data ? rowToSession(data as BetaSessionsTableRow) : null;
  }

  async revokeSession(sessionId: string) {
    return this.updateSession(sessionId, {
      status: "revoked",
      revokedAt: new Date().toISOString(),
    });
  }
}

export function createDatabaseBetaAccessRepository() {
  return new DatabaseBetaAccessRepository();
}
