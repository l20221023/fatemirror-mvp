import { NextResponse, type NextRequest } from "next/server";

import { createBetaInvite, listBetaInvites } from "@/lib/beta-access/service";
import { isInternalAccessGrantedFromRequest } from "@/lib/internal-access/server";

export async function GET(request: NextRequest) {
  if (!isInternalAccessGrantedFromRequest(request)) {
    return NextResponse.json({ success: false, error: "ACCESS_DENIED" }, { status: 403 });
  }

  const invites = await listBetaInvites();
  return NextResponse.json({ success: true, data: invites });
}

export async function POST(request: NextRequest) {
  if (!isInternalAccessGrantedFromRequest(request)) {
    return NextResponse.json({ success: false, error: "ACCESS_DENIED" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    code?: string;
    cohortId?: string;
    maxUses?: number;
    expiresAt?: string | null;
    pricingExperimentCode?: string | null;
  } | null;

  const created = await createBetaInvite({
    code: body?.code,
    maxUses: body?.maxUses,
    expiresAt: body?.expiresAt ?? null,
    metadata: {
      source: "internal_ops",
      cohortId: body?.cohortId ?? null,
      pricingExperimentCode: body?.pricingExperimentCode ?? null,
    },
  });

  return NextResponse.json({ success: true, data: created });
}
