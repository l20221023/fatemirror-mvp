import { cookies } from "next/headers";

import { BETA_ACCESS_COOKIE_NAME, BETA_ACCESS_TOKEN_MAX_AGE_SECONDS } from "./constants";
import { createBetaAccessToken, hashBetaSessionToken, verifyBetaAccessToken } from "./tokens";
import { canUseBetaInviteCode, findActiveBetaSessionByToken } from "./service";
import { getAdviceRuntimeConfig } from "../advice/runtime";

export async function isBetaAccessGranted() {
  const cookieStore = await cookies();
  return Boolean(await findActiveBetaSessionByToken(cookieStore.get(BETA_ACCESS_COOKIE_NAME)?.value));
}

export function isBetaAccessGrantedFromCookieStore(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) {
  return verifyBetaAccessToken(cookieStore.get(BETA_ACCESS_COOKIE_NAME)?.value);
}

export function createBetaAccessCookieValue() {
  return createBetaAccessToken();
}

export function getBetaAccessTokenHash(value: string) {
  return hashBetaSessionToken(value);
}

export async function validateBetaInviteCode(code: string | undefined | null) {
  return canUseBetaInviteCode(code);
}

export function buildBetaAccessCookieOptions() {
  const config = getAdviceRuntimeConfig();
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: config.betaSessionTtlDays * 24 * 60 * 60 || BETA_ACCESS_TOKEN_MAX_AGE_SECONDS,
  };
}
