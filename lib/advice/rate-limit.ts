import { createHash } from "node:crypto";

const counters = new Map<string, { date: string; count: number }>();

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function buildAdviceRateLimitKey(params: {
  sessionId?: string | null;
  betaAccessToken?: string | null;
}) {
  if (params.betaAccessToken) {
    return `beta:${hash(params.betaAccessToken)}`;
  }

  if (params.sessionId) {
    return `session:${hash(params.sessionId)}`;
  }

  return "anon";
}

export function consumeAdviceRequestBudget(
  key: string,
  limit: number,
): { allowed: boolean; remaining: number } {
  const day = todayKey();
  const current = counters.get(key);

  if (!current || current.date !== day) {
    counters.set(key, { date: day, count: 1 });
    return { allowed: true, remaining: Math.max(0, limit - 1) };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  current.count += 1;
  return { allowed: true, remaining: Math.max(0, limit - current.count) };
}

export function getAdviceRequestBudgetState(key: string, limit: number) {
  const day = todayKey();
  const current = counters.get(key);

  if (!current || current.date !== day) {
    return { used: 0, remaining: limit };
  }

  return { used: current.count, remaining: Math.max(0, limit - current.count) };
}

export function resetAdviceRateLimitState() {
  counters.clear();
}
