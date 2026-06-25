import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

import { INTERNAL_ACCESS_TOKEN_MAX_AGE_SECONDS } from "./constants";

function getSecret() {
  const secret =
    process.env.ADVICE_INTERNAL_ACCESS_SECRET ||
    process.env.ADVICE_BETA_ACCESS_SECRET ||
    process.env.OPENAI_API_KEY ||
    process.env.ADVICE_INTERNAL_ACCESS_CODE ||
    "";

  return secret || null;
}

function sign(value: string) {
  const secret = getSecret();
  if (!secret) return null;

  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createInternalAccessToken() {
  const issuedAt = Math.floor(Date.now() / 1000);
  const nonce = randomUUID();
  const payload = `${issuedAt}.${nonce}`;
  const signature = sign(payload);

  if (!signature) {
    return null;
  }

  return `${payload}.${signature}`;
}

export function verifyInternalAccessToken(token: string | undefined | null) {
  const secret = getSecret();
  if (!secret || !token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [issuedAtText, nonce, signature] = parts;
  const issuedAt = Number(issuedAtText);
  if (!Number.isFinite(issuedAt) || issuedAt <= 0 || !nonce || !signature) {
    return false;
  }

  const age = Math.floor(Date.now() / 1000) - issuedAt;
  if (age < 0 || age > INTERNAL_ACCESS_TOKEN_MAX_AGE_SECONDS) {
    return false;
  }

  const expected = sign(`${issuedAtText}.${nonce}`);
  if (!expected) return false;

  const receivedBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (receivedBytes.length !== expectedBytes.length) {
    return false;
  }

  return timingSafeEqual(receivedBytes, expectedBytes);
}

export function verifyInternalAccessCode(code: string | undefined | null) {
  if (!code) return false;

  const normalized = code.trim();
  if (!normalized) return false;

  const envCode = process.env.ADVICE_INTERNAL_ACCESS_CODE?.trim();
  const envCodes = (process.env.ADVICE_INTERNAL_ACCESS_CODES || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (envCode && normalized === envCode) {
    return true;
  }

  return envCodes.some((item) => item === normalized);
}
