import { NextResponse } from "next/server";

import {
  buildBetaAccessCookieOptions,
} from "../../../../lib/beta-access/server";
import { BETA_ACCESS_COOKIE_NAME } from "../../../../lib/beta-access/constants";
import { getAdviceRuntimeConfig } from "../../../../lib/advice/runtime";
import { getRequestIpHash, recordInviteFailureRateLimit } from "../../../../lib/advice/controls";
import { createBetaSession, redeemBetaInviteCode } from "../../../../lib/beta-access/service";

function readMetadataField(metadata: unknown, key: string) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  return (metadata as Record<string, unknown>)[key] ?? null;
}

export async function POST(request: Request) {
  const config = getAdviceRuntimeConfig();
  if (!config.betaEnabled) {
    return NextResponse.json({ success: false, error: "BETA_DISABLED" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { code?: string } | null;
  const ipHash = getRequestIpHash(request);

  const redeemed = await redeemBetaInviteCode(body?.code);
  if (!redeemed) {
    if (ipHash) {
      const state = recordInviteFailureRateLimit(ipHash);
      if (!state.allowed) {
        return NextResponse.json({ success: false, error: "INVITE_RATE_LIMITED" }, { status: 429 });
      }
    }

    return NextResponse.json({ success: false, error: "INVALID_CODE" }, { status: 403 });
  }

  const session = await createBetaSession({
    inviteId: redeemed.invite?.id ?? "beta-test-access",
    cohortId: (readMetadataField(redeemed.invite?.metadata, "cohortId") as string | null) ?? "beta-default",
    pricingExperimentCode: (readMetadataField(redeemed.invite?.metadata, "pricingExperimentCode") as string | null) ?? null,
    subjectHash: ipHash,
  });

  if (!session) {
    return NextResponse.json({ success: false, error: "BETA_SESSION_UNAVAILABLE" }, { status: 500 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(BETA_ACCESS_COOKIE_NAME, session.token, buildBetaAccessCookieOptions());
  return response;
}
