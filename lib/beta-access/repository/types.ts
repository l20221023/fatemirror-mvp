import type { JsonValue } from "../../supabase";

export type BetaInviteStatus = "active" | "disabled" | "expired";

export type BetaSessionStatus = "active" | "revoked" | "expired";

export type BetaInvite = {
  id: string;
  codeHash: string;
  status: BetaInviteStatus;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
  disabledAt: string | null;
  metadata: JsonValue;
};

export type BetaSession = {
  id: string;
  inviteId: string;
  tokenHash: string;
  cohortId: string;
  subjectHash: string | null;
  status: BetaSessionStatus;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  localUsageTotal: number;
  localUsageToday: number;
  aiUsageTotal: number;
  aiUsageToday: number;
  lastAiRequestAt: string | null;
  pricingExperimentCode: string | null;
};

export type BetaInviteCreateInput = {
  id?: string;
  codeHash: string;
  status?: BetaInviteStatus;
  maxUses?: number;
  usedCount?: number;
  expiresAt?: string | null;
  disabledAt?: string | null;
  metadata?: JsonValue;
};

export type BetaInviteUpdateInput = Partial<
  Pick<BetaInvite, "status" | "maxUses" | "usedCount" | "expiresAt" | "disabledAt" | "metadata">
>;

export type BetaSessionCreateInput = {
  id?: string;
  inviteId: string;
  tokenHash: string;
  cohortId: string;
  subjectHash?: string | null;
  status?: BetaSessionStatus;
  expiresAt: string;
  revokedAt?: string | null;
  localUsageTotal?: number;
  localUsageToday?: number;
  aiUsageTotal?: number;
  aiUsageToday?: number;
  lastAiRequestAt?: string | null;
  pricingExperimentCode?: string | null;
};

export type BetaSessionUpdateInput = Partial<
  Pick<
    BetaSession,
    | "status"
    | "expiresAt"
    | "revokedAt"
    | "localUsageTotal"
    | "localUsageToday"
    | "aiUsageTotal"
    | "aiUsageToday"
    | "lastAiRequestAt"
    | "pricingExperimentCode"
  >
>;

export type BetaInvitesTableRow = {
  id: string;
  code_hash: string;
  status: BetaInviteStatus;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  created_at: string;
  disabled_at: string | null;
  metadata: JsonValue;
};

export type BetaSessionsTableRow = {
  id: string;
  invite_id: string;
  token_hash: string;
  cohort_id: string;
  subject_hash: string;
  status: BetaSessionStatus;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
  local_usage_total: number;
  local_usage_today: number;
  ai_usage_total: number;
  ai_usage_today: number;
  last_ai_request_at: string | null;
  pricing_experiment_code: string | null;
};
