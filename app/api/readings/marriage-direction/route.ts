import { NextResponse } from "next/server";

import { createMarriageDirectionReading } from "../../../../lib/marriage-direction";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  try {
    if (!body || typeof body !== "object") throw new Error("INVALID_INPUT");
    const input = body as Record<string, unknown>;
    const result = createMarriageDirectionReading({
      birthDate: readString(input.birthDate, "birthDate"),
      timezone: readOptionalString(input.timezone),
      birthPlaceLabel: readOptionalString(input.birthPlaceLabel),
      lunarOverride: readLunarOverride(input.lunarOverride),
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "INVALID_INPUT" },
      { status: 400 },
    );
  }
}

function readString(value: unknown, key: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`INVALID_${key.toUpperCase()}`);
  }

  return value.trim();
}

function readOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readLunarOverride(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const override = value as Record<string, unknown>;
  return {
    month: Number(override.month),
    day: Number(override.day),
    isLeapMonth: Boolean(override.isLeapMonth),
  };
}
