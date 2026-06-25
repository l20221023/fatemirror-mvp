import { NextResponse, type NextRequest } from "next/server";

import { getOrCreateSessionId } from "../../../../lib/session";
import {
  AdviceGenerateRequestSchema,
  createAdviceError,
  createAdviceErrorResponse,
  createAdviceSuccessResponse,
  submitAdvice,
} from "../../../../lib/advice";
import { createAdviceProvider } from "../../../../lib/advice/generate-advice";
import { getAdviceRuntimeConfig } from "../../../../lib/advice/runtime";
import {
  createAdviceIdempotencyKey,
  getProviderFuseState,
  getRequestIpHash,
  recordAdviceRequestRateLimit,
  recordAiRequestRateLimit,
  recordProviderFailure,
  recordProviderSuccess,
  runWithIdempotency,
} from "../../../../lib/advice/controls";
import { getAdviceDailyUsageSnapshot, recordAdviceDailyAttempt } from "../../../../lib/advice/usage";
import { getCommercialEntitlementForProduct } from "../../../../lib/commercial/entitlement-service";
import { BETA_ACCESS_COOKIE_NAME } from "../../../../lib/beta-access/constants";
import { findActiveBetaSessionByToken, recordBetaSessionUsage } from "../../../../lib/beta-access/service";

function readRequestCookie(request: NextRequest | Request, name: string) {
  const nextRequest = request as NextRequest & {
    cookies?: {
      get(cookieName: string): { value?: string } | undefined;
    };
  };

  const fromCookies = nextRequest.cookies?.get(name)?.value;
  if (fromCookies) {
    return fromCookies;
  }

  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const entry = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));

  if (!entry) {
    return null;
  }

  return entry.slice(name.length + 1) || null;
}

function buildQuotaNotice(locale: "en" | "zh", reason: string) {
  const messages: Record<string, string> = {
    ai_rate_limited:
      locale === "zh"
        ? "今日 AI 深度解析额度已用完，当前改为显示基础建议。"
        : "Today's AI quota is used up, so we are showing the local guidance instead.",
    session_limit:
      locale === "zh"
        ? "这个测试会话的 AI 额度或冷却限制已触发，当前改为显示基础建议。"
        : "This beta session has reached its AI limit, so we are showing the local guidance instead.",
    fuse:
      locale === "zh"
        ? "AI 增强暂时关闭，当前改为显示基础建议。"
        : "AI enhancement is temporarily off, so we are showing the local guidance instead.",
  };

  return messages[reason] ?? null;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = AdviceGenerateRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      createAdviceErrorResponse(createAdviceError("INVALID_ADVICE_INPUT")),
      { status: 400 },
    );
  }

  const config = getAdviceRuntimeConfig();
  const usageSnapshot = getAdviceDailyUsageSnapshot();
  if (usageSnapshot.submitted_count >= config.adviceGlobalDailyReportLimit) {
    recordAdviceDailyAttempt({
      aiRequested: false,
      aiSucceeded: false,
      aiDowngraded: false,
      rateLimited: true,
      inviteFailure: false,
    });
    return NextResponse.json(
      createAdviceErrorResponse(createAdviceError("RATE_LIMITED")),
      { status: 429 },
    );
  }

  const ipHash = getRequestIpHash(request);
  if (ipHash) {
    const requestBudget = recordAdviceRequestRateLimit(ipHash);
    if (!requestBudget.allowed) {
      recordAdviceDailyAttempt({
        aiRequested: false,
        aiSucceeded: false,
        aiDowngraded: false,
        rateLimited: true,
        inviteFailure: false,
      });
      return NextResponse.json(
        createAdviceErrorResponse(createAdviceError("RATE_LIMITED")),
        { status: 429 },
      );
    }
  }

  const sessionId = await getOrCreateSessionId();
  const betaToken = readRequestCookie(request, BETA_ACCESS_COOKIE_NAME);
  const betaSession = await findActiveBetaSessionByToken(betaToken);
  const betaAccessGranted = config.betaEnabled ? Boolean(betaSession) : true;
  const paidEntitlement = config.commercialEnabled
    ? await getCommercialEntitlementForProduct(sessionId, "deep_advice_single")
    : null;
  const aiAccessGranted = betaAccessGranted || Boolean(paidEntitlement);
  const entitlementType =
    paidEntitlement?.entitlementType ?? (betaAccessGranted ? "beta" : "free");

  const aiRequested = parsed.data.mode === "ai";
  const fuseState = getProviderFuseState();
  let aiAllowed = aiRequested && aiAccessGranted && !fuseState.tripped;
  let quotaReason: string | null = null;

  if (aiRequested && aiAllowed && ipHash) {
    const aiIpBudget = recordAiRequestRateLimit(ipHash);
    if (!aiIpBudget.allowed) {
      aiAllowed = false;
      quotaReason = "ai_rate_limited";
    }
  }

  if (aiRequested && aiAllowed && betaSession) {
    const sessionAiLimit = config.betaAiDailyLimit;
    const sessionTotalLimit = config.betaAiTotalLimit;
    const cooldownMs = config.betaAiCooldownMinutes * 60 * 1000;
    const lastAiRequestAt = betaSession.lastAiRequestAt ? new Date(betaSession.lastAiRequestAt).getTime() : 0;

    if (betaSession.aiUsageToday >= sessionAiLimit || betaSession.aiUsageTotal >= sessionTotalLimit) {
      aiAllowed = false;
      quotaReason = "session_limit";
    }

    if (aiAllowed && lastAiRequestAt > 0 && Date.now() - lastAiRequestAt < cooldownMs) {
      aiAllowed = false;
      quotaReason = "session_limit";
    }
  }

  if (!aiRequested && betaSession && betaSession.localUsageToday >= config.betaLocalDailyLimit) {
    recordAdviceDailyAttempt({
      aiRequested: false,
      aiSucceeded: false,
      aiDowngraded: false,
      rateLimited: true,
      inviteFailure: false,
    });
    return NextResponse.json(
      createAdviceErrorResponse(createAdviceError("RATE_LIMITED")),
      { status: 429 },
    );
  }

  if (config.adviceGlobalDailyBudgetUsd !== null && usageSnapshot.total_cost_usd >= config.adviceGlobalDailyBudgetUsd) {
    aiAllowed = false;
    quotaReason = quotaReason ?? "fuse";
  }

  const requestKey = createAdviceIdempotencyKey([
    sessionId,
    betaSession?.id,
    ipHash,
    JSON.stringify(parsed.data),
  ]);

  const provider = createAdviceProvider();

  const result = await runWithIdempotency(requestKey, 10 * 60 * 1000, async () => {
    try {
      const submitted = await submitAdvice({
        input: parsed.data,
        provider,
        betaAccessGranted: aiAccessGranted,
        aiRequestAllowed: aiAllowed,
        entitlementType,
        cohortId: betaSession?.cohortId ?? null,
      });

      if (aiRequested) {
        if (submitted.report.generation.mode === "ai") {
          recordProviderSuccess();
        } else if (aiAllowed) {
          recordProviderFailure(submitted.diagnostics.fallbackReasonCode ?? "ai_fallback");
        }
      }

      recordAdviceDailyAttempt({
        aiRequested,
        aiSucceeded: submitted.report.generation.mode === "ai",
        aiDowngraded: aiRequested && submitted.report.generation.mode !== "ai",
        rateLimited: Boolean(quotaReason),
        inviteFailure: false,
      });

      if (betaSession) {
        await recordBetaSessionUsage(betaSession.id, submitted.report.generation.mode === "ai" ? "ai" : "local");
      }

      const notice =
        aiRequested &&
        submitted.report.generation.mode !== "ai" &&
        (quotaReason || fuseState.tripped)
          ? buildQuotaNotice(parsed.data.locale, quotaReason ?? "fuse")
          : null;

      return {
        submitted,
        notice,
      };
    } catch (error) {
      if (aiRequested) {
        recordProviderFailure(error instanceof Error ? error.message : "unknown");
      }
      throw error;
    }
  });

  return NextResponse.json(
    createAdviceSuccessResponse(result.submitted.report, result.submitted.meta, {
      estimatedCost: result.submitted.diagnostics.estimatedCost,
      reportId: result.submitted.reportId,
      accessToken: result.submitted.accessToken,
      notice: result.notice,
    }),
  );
}
