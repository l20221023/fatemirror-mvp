import { z } from "zod";
import { NextResponse, type NextRequest } from "next/server";

import { createAdviceError, createAdviceErrorResponse } from "../../../../../../lib/advice";
import { saveAdviceFeedback } from "../../../../../../lib/advice/services/create-report";
import { getAdviceReport } from "../../../../../../lib/advice/services/get-report";

const FeedbackSchema = z.object({
  helpfulness: z.enum(["helpful", "partly_helpful", "not_helpful"]),
  reasons: z.array(
    z.enum([
      "too_generic",
      "not_fact_based",
      "not_actionable",
      "repetitive",
      "unsafe_or_uncomfortable",
      "other",
    ]),
  ).max(5),
});

function readAccessToken(request: NextRequest) {
  const headerToken = request.headers.get("x-advice-access-token");
  if (headerToken) {
    return headerToken.trim();
  }

  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  return null;
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await ctx.params;
  const accessToken = readAccessToken(request);

  if (!accessToken) {
    return NextResponse.json(
      createAdviceErrorResponse(createAdviceError("ACCESS_DENIED")),
      { status: 403 },
    );
  }

  const report = await getAdviceReport(reportId, accessToken);
  if (!report) {
    return NextResponse.json(
      createAdviceErrorResponse(createAdviceError("REPORT_NOT_FOUND")),
      { status: 404 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = FeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createAdviceErrorResponse(createAdviceError("INVALID_ADVICE_INPUT")),
      { status: 400 },
    );
  }

  await saveAdviceFeedback({
    reportId,
    helpfulness: parsed.data.helpfulness,
    reasons: parsed.data.reasons,
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true });
}
