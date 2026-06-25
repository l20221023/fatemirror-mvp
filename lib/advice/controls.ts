import { createHmac, createHash, randomUUID } from "node:crypto";

import { getAdviceRuntimeConfig } from "./runtime";

type WindowCounter = {
  count: number;
  windowStart: number;
  windowMs: number;
};

type CacheEntry<T> = {
  expiresAt: number;
  value?: T;
  pending?: Promise<T>;
};

type FuseState = {
  failureTimestamps: number[];
  trippedUntil: number;
  lastFailureReason: string | null;
};

const windowCounters = new Map<string, WindowCounter>();
const idempotencyCache = new Map<string, CacheEntry<unknown>>();
const fuseState: FuseState = {
  failureTimestamps: [],
  trippedUntil: 0,
  lastFailureReason: null,
};

function secretForHash() {
  return (
    process.env.RATE_LIMIT_IP_HASH_SECRET ||
    process.env.ADVICE_BETA_ACCESS_SECRET ||
    process.env.OPENAI_API_KEY ||
    process.env.ADVICE_BETA_TEST_ACCESS_CODE ||
    "fatemirror"
  );
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function hashRequestIp(ip: string) {
  return createHmac("sha256", secretForHash()).update(ip).digest("hex");
}

export function extractRequestIp(request: Request) {
  const headerOrder = ["x-forwarded-for", "x-real-ip", "cf-connecting-ip"];

  for (const headerName of headerOrder) {
    const value = request.headers.get(headerName);
    if (!value) continue;

    const first = value.split(",")[0]?.trim();
    if (first) return first;
  }

  return null;
}

export function getRequestIpHash(request: Request) {
  const ip = extractRequestIp(request);
  return ip ? hashRequestIp(ip) : null;
}

function getWindowCounter(key: string, windowMs: number) {
  const now = Date.now();
  const current = windowCounters.get(key);

  if (!current || now - current.windowStart >= windowMs) {
    const next = { count: 0, windowStart: now, windowMs };
    windowCounters.set(key, next);
    return next;
  }

  return current;
}

export function consumeWindowLimit(key: string, limit: number, windowMs: number) {
  const counter = getWindowCounter(key, windowMs);
  if (counter.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  counter.count += 1;
  return { allowed: true, remaining: Math.max(0, limit - counter.count) };
}

export function getWindowLimitState(key: string, limit: number, windowMs: number) {
  const counter = windowCounters.get(key);
  if (!counter || Date.now() - counter.windowStart >= windowMs) {
    return { used: 0, remaining: limit };
  }

  return { used: counter.count, remaining: Math.max(0, limit - counter.count) };
}

export function recordAdviceRequestRateLimit(ipHash: string) {
  const config = getAdviceRuntimeConfig();
  return consumeWindowLimit(
    `advice:req:${ipHash}`,
    config.rateLimitAdviceRequestsPerHour,
    60 * 60 * 1000,
  );
}

export function recordAiRequestRateLimit(ipHash: string) {
  const config = getAdviceRuntimeConfig();
  return consumeWindowLimit(
    `advice:ai:${ipHash}`,
    config.rateLimitAiRequestsPerIpPerDay,
    24 * 60 * 60 * 1000,
  );
}

export function recordInviteFailureRateLimit(ipHash: string) {
  const config = getAdviceRuntimeConfig();
  return consumeWindowLimit(
    `invite:fail:${ipHash}`,
    config.rateLimitInviteFailuresPer15Minutes,
    15 * 60 * 1000,
  );
}

export function getInviteFailureState(ipHash: string) {
  const config = getAdviceRuntimeConfig();
  return getWindowLimitState(
    `invite:fail:${ipHash}`,
    config.rateLimitInviteFailuresPer15Minutes,
    15 * 60 * 1000,
  );
}

export async function runWithIdempotency<T>(
  key: string,
  ttlMs: number,
  task: () => Promise<T>,
) {
  const now = Date.now();
  const current = idempotencyCache.get(key);

  if (current && current.expiresAt > now) {
    if (current.value !== undefined) {
      return current.value as T;
    }

    if (current.pending) {
      return current.pending as Promise<T>;
    }
  }

  const entry: CacheEntry<T> = {
    expiresAt: now + ttlMs,
  };

  const pending = (async () => task())();
  entry.pending = pending;
  idempotencyCache.set(key, entry);

  try {
    const value = await pending;
    entry.value = value;
    entry.pending = undefined;
    entry.expiresAt = Date.now() + ttlMs;
    return value;
  } catch (error) {
    if (idempotencyCache.get(key) === entry) {
      idempotencyCache.delete(key);
    }
    throw error;
  }
}

function pruneFuseFailures(now = Date.now()) {
  const config = getAdviceRuntimeConfig();
  const windowMs = config.providerFailureFuseWindowMinutes * 60 * 1000;
  fuseState.failureTimestamps = fuseState.failureTimestamps.filter(
    (timestamp) => now - timestamp <= windowMs,
  );
}

export function recordProviderFailure(reason: string) {
  const config = getAdviceRuntimeConfig();
  const now = Date.now();
  pruneFuseFailures(now);
  fuseState.failureTimestamps.push(now);
  fuseState.lastFailureReason = reason;

  if (
    fuseState.failureTimestamps.length >= config.providerFailureFuseThreshold &&
    now >= fuseState.trippedUntil
  ) {
    fuseState.trippedUntil =
      now + config.providerFailureFuseCooldownMinutes * 60 * 1000;
  }
}

export function recordProviderSuccess() {
  pruneFuseFailures();
  if (fuseState.failureTimestamps.length === 0) {
    fuseState.lastFailureReason = null;
  }
}

export function getProviderFuseState() {
  pruneFuseFailures();
  const now = Date.now();
  return {
    tripped: now < fuseState.trippedUntil,
    trippedUntil: fuseState.trippedUntil ? new Date(fuseState.trippedUntil).toISOString() : null,
    failureCount: fuseState.failureTimestamps.length,
    lastFailureReason: fuseState.lastFailureReason,
  };
}

export function resetAdviceControlState() {
  windowCounters.clear();
  idempotencyCache.clear();
  fuseState.failureTimestamps = [];
  fuseState.trippedUntil = 0;
  fuseState.lastFailureReason = null;
}

export function createAdviceIdempotencyKey(parts: Array<string | null | undefined>) {
  const raw = parts.filter(Boolean).join("|");
  return hash(raw || randomUUID());
}
