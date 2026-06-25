import { NextResponse } from "next/server";

import { getApplicationHealthSnapshot } from "../../../lib/health";

export async function GET() {
  const snapshot = getApplicationHealthSnapshot();
  return NextResponse.json(snapshot, {
    status: snapshot.healthy ? 200 : 503,
  });
}
