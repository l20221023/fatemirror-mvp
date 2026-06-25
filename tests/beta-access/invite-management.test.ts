import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  canUseBetaInviteCode,
  createBetaInvite,
  createBetaSession,
  disableBetaInvite,
  findActiveBetaSessionByToken,
  redeemBetaInviteCode,
  recordBetaSessionUsage,
  revokeBetaSession,
} from "../../lib/beta-access/service";
import { resetMemoryBetaAccessRepository } from "../../lib/beta-access/repository/memory-beta-access-repository";
import { resetAdviceControlState } from "../../lib/advice/controls";

describe("beta invite management", () => {
  beforeEach(() => {
    resetMemoryBetaAccessRepository();
    resetAdviceControlState();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates, validates, and disables invites", async () => {
    vi.stubEnv("ADVICE_BETA_INVITE_CODES", "");
    vi.stubEnv("ADVICE_BETA_TEST_ACCESS_CODE", "");

    const created = await createBetaInvite({ code: "invite-xyz", maxUses: 2 });
    expect(created.invite.maxUses).toBe(2);
    expect(await canUseBetaInviteCode("invite-xyz")).toBe(true);

    const disabled = await disableBetaInvite(created.invite.id);
    expect(disabled?.status).toBe("disabled");
    expect(await canUseBetaInviteCode("invite-xyz")).toBe(false);
  });

  it("creates, finds, updates, and revokes beta sessions", async () => {
    vi.stubEnv("ADVICE_BETA_INVITE_CODES", "");
    vi.stubEnv("ADVICE_BETA_TEST_ACCESS_CODE", "");

    const created = await createBetaInvite({ code: "invite-session", maxUses: 1 });
    const session = await createBetaSession({ inviteId: created.invite.id, cohortId: "cohort-a" });

    expect(session?.token).toBeTruthy();
    const found = await findActiveBetaSessionByToken(session?.token);
    expect(found?.id).toBe(session?.session.id);

    await recordBetaSessionUsage(session!.session.id, "local");
    await recordBetaSessionUsage(session!.session.id, "ai");
    await recordBetaSessionUsage(session!.session.id, "ai", { aiGrantedToday: false });

    const afterUsage = await findActiveBetaSessionByToken(session!.token);
    expect(afterUsage?.localUsageToday).toBe(1);
    expect(afterUsage?.localUsageTotal).toBe(1);
    expect(afterUsage?.aiUsageToday).toBe(1);
    expect(afterUsage?.aiUsageTotal).toBe(2);
    expect(afterUsage?.lastAiRequestAt).toBeTruthy();

    await revokeBetaSession(session!.session.id);
    const revoked = await findActiveBetaSessionByToken(session?.token);
    expect(revoked).toBeNull();
  });

  it("allows a single redeem for a single-use invite even under repeated attempts", async () => {
    vi.stubEnv("ADVICE_BETA_INVITE_CODES", "");
    vi.stubEnv("ADVICE_BETA_TEST_ACCESS_CODE", "");

    await createBetaInvite({ code: "single-use", maxUses: 1 });

    const [first, second] = await Promise.all([
      redeemBetaInviteCode("single-use"),
      redeemBetaInviteCode("single-use"),
    ]);

    const successes = [first, second].filter(Boolean);
    const failures = [first, second].filter((result) => result === null);

    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(1);
    expect(successes[0]?.invite.usedCount).toBe(1);
    expect(await canUseBetaInviteCode("single-use")).toBe(false);
  });
});
