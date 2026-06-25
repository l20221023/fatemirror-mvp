import type {
  BetaInvite,
  BetaInviteCreateInput,
  BetaInviteUpdateInput,
  BetaSession,
  BetaSessionCreateInput,
  BetaSessionUpdateInput,
} from "./types";

export type BetaAccessRepository = {
  listInvites(): Promise<BetaInvite[]>;
  getInviteByCodeHash(codeHash: string): Promise<BetaInvite | null>;
  createInvite(input: BetaInviteCreateInput): Promise<BetaInvite>;
  updateInvite(inviteId: string, patch: BetaInviteUpdateInput): Promise<BetaInvite | null>;
  redeemInviteByCodeHash(codeHash: string, nowIso: string): Promise<BetaInvite | null>;
  listSessions(): Promise<BetaSession[]>;
  getSessionByTokenHash(tokenHash: string): Promise<BetaSession | null>;
  createSession(input: BetaSessionCreateInput): Promise<BetaSession>;
  updateSession(sessionId: string, patch: BetaSessionUpdateInput): Promise<BetaSession | null>;
  incrementSessionUsage(
    sessionId: string,
    kind: "local" | "ai",
    options?: { aiGrantedToday?: boolean; requestedAt?: string },
  ): Promise<BetaSession | null>;
  revokeSession(sessionId: string): Promise<BetaSession | null>;
};
