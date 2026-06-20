import { NextResponse } from "next/server";

import {
  calculateMingGua,
  calculateMingGuaMatch,
  normalizeGender,
} from "../../../../lib/ming-gong";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  try {
    if (!body || typeof body !== "object") throw new Error("INVALID_INPUT");
    const input = body as Record<string, unknown>;
    const personA = readPerson(input.personA);
    const personB = readPerson(input.personB);
    const result = calculateMingGuaMatch(
      calculateMingGua(personA),
      calculateMingGua(personB),
    );

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "INVALID_INPUT" },
      { status: 400 },
    );
  }
}

function readPerson(value: unknown) {
  if (!value || typeof value !== "object") throw new Error("INVALID_PERSON");
  const person = value as Record<string, unknown>;
  return {
    birthYear: Number(person.birthYear),
    gender: normalizeGender(String(person.gender)),
  };
}
