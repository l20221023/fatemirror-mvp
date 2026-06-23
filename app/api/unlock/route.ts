import { NextResponse } from "next/server";

import { markReadingPaidForTesting } from "../../../lib/paywall";
import { isPreviewUnlockAllowed } from "../../../lib/preview-unlock";

export async function POST(request: Request) {
  if (!isPreviewUnlockAllowed()) {
    return NextResponse.json({ ok: false, error: "PREVIEW_UNLOCK_DISABLED" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        readingId?: string;
      }
    | null;

  if (!body?.readingId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ok = await markReadingPaidForTesting(body.readingId);

  return NextResponse.json({ ok });
}
