import { NextResponse } from "next/server";

import { createXiaoliuRenReading } from "../../../../lib/xiaoliu-ren";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  try {
    const result = createXiaoliuRenReading({
      occurredAt: readString(body, "occurredAt"),
      timezone: readString(body, "timezone"),
      question: readOptionalString(body, "question"),
      lunarOverride: readLunarOverride(body),
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "INVALID_INPUT" },
      { status: 400 },
    );
  }
}

function readString(body: unknown, key: string) {
  if (!body || typeof body !== "object") throw new Error("INVALID_INPUT");
  const value = (body as Record<string, unknown>)[key];
  if (typeof value !== "string" || !value.trim()) throw new Error(`INVALID_${key.toUpperCase()}`);
  return value.trim();
}

function readOptionalString(body: unknown, key: string) {
  if (!body || typeof body !== "object") return undefined;
  const value = (body as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readLunarOverride(body: unknown) {
  if (!body || typeof body !== "object") return undefined;
  const value = (body as Record<string, unknown>).lunarOverride;
  if (!value || typeof value !== "object") return undefined;
  const override = value as Record<string, unknown>;
  return {
    month: Number(override.month),
    day: Number(override.day),
    isLeapMonth: Boolean(override.isLeapMonth),
  };
}
