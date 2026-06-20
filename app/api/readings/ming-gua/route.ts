import { NextResponse } from "next/server";

import { calculateMingGua, normalizeGender } from "../../../../lib/ming-gong";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  try {
    if (!body || typeof body !== "object") throw new Error("INVALID_INPUT");
    const input = body as Record<string, unknown>;
    const result = calculateMingGua({
      birthYear: Number(input.birthYear),
      gender: normalizeGender(String(input.gender)),
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "INVALID_INPUT" },
      { status: 400 },
    );
  }
}
