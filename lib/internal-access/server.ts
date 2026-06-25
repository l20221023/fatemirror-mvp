import { cookies } from "next/headers";

import { INTERNAL_ACCESS_COOKIE_NAME, INTERNAL_ACCESS_TOKEN_MAX_AGE_SECONDS } from "./constants";
import { createInternalAccessToken, verifyInternalAccessToken, verifyInternalAccessCode } from "./tokens";

export async function isInternalAccessGranted() {
  const cookieStore = await cookies();
  return verifyInternalAccessToken(cookieStore.get(INTERNAL_ACCESS_COOKIE_NAME)?.value);
}

export function isInternalAccessGrantedFromCookieStore(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) {
  return verifyInternalAccessToken(cookieStore.get(INTERNAL_ACCESS_COOKIE_NAME)?.value);
}

export function isInternalAccessGrantedFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return false;

  const token = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${INTERNAL_ACCESS_COOKIE_NAME}=`))
    ?.slice(INTERNAL_ACCESS_COOKIE_NAME.length + 1);

  return verifyInternalAccessToken(token ?? null);
}

export function createInternalAccessCookieValue() {
  return createInternalAccessToken();
}

export async function validateInternalAccessCode(code: string | undefined | null) {
  return verifyInternalAccessCode(code);
}

export function buildInternalAccessCookieOptions() {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: INTERNAL_ACCESS_TOKEN_MAX_AGE_SECONDS,
  };
}
