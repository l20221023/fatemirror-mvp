import { NextResponse, type NextRequest } from "next/server";

import { disableBetaInvite } from "@/lib/beta-access/service";
import { isInternalAccessGrantedFromRequest } from "@/lib/internal-access/server";

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ inviteId: string }> }) {
  if (!isInternalAccessGrantedFromRequest(request)) {
    return NextResponse.json({ success: false, error: "ACCESS_DENIED" }, { status: 403 });
  }

  const { inviteId } = await ctx.params;
  const updated = await disableBetaInvite(inviteId);
  if (!updated) {
    return NextResponse.json({ success: false, error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: updated });
}
