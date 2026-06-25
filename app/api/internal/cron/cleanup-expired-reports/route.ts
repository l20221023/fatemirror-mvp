import { NextResponse, type NextRequest } from "next/server";

import { cleanupExpiredAdviceReports } from "@/lib/advice/services/cleanup-expired-reports";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET || process.env.ADVICE_CLEANUP_CRON_SECRET || "";
  if (!secret) return process.env.NODE_ENV !== "production";

  const header = request.headers.get("x-cron-secret") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return header === secret;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: "ACCESS_DENIED" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    dryRun?: boolean;
    retentionDays?: number;
    limit?: number;
    offset?: number;
  } | null;
  const result = await cleanupExpiredAdviceReports({
    dryRun: body?.dryRun ?? true,
    retentionDays: body?.retentionDays,
    limit: body?.limit,
    offset: body?.offset,
  });

  return NextResponse.json({ success: true, data: result });
}
