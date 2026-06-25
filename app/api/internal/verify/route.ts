import { NextResponse } from "next/server";

import {
  buildInternalAccessCookieOptions,
  createInternalAccessCookieValue,
  validateInternalAccessCode,
} from "@/lib/internal-access/server";
import { INTERNAL_ACCESS_COOKIE_NAME } from "@/lib/internal-access/constants";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { code?: string } | null;

  if (!(await validateInternalAccessCode(body?.code))) {
    return NextResponse.json({ success: false, error: "INVALID_CODE" }, { status: 403 });
  }

  const token = createInternalAccessCookieValue();
  if (!token) {
    return NextResponse.json({ success: false, error: "INTERNAL_TOKEN_UNAVAILABLE" }, { status: 500 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(INTERNAL_ACCESS_COOKIE_NAME, token, buildInternalAccessCookieOptions());
  return response;
}
