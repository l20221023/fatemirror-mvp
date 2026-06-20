import { NextResponse } from "next/server";

import { markReadingPaidForTesting } from "../../../lib/paywall";

export async function POST(request: Request) {
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
