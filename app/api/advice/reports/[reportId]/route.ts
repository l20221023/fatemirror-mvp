import { NextResponse, type NextRequest } from "next/server";

import {
  createAdviceError,
  createAdviceErrorResponse,
  createAdviceSuccessResponse,
} from "../../../../../lib/advice";
import { getAdviceReport } from "../../../../../lib/advice/services/get-report";
import { deleteAdviceReport } from "../../../../../lib/advice/services/delete-report";

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

export async function GET(request: NextRequest, ctx: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await ctx.params;
  const accessToken = readAccessToken(request);

  if (!accessToken) {
    return NextResponse.json(
      createAdviceErrorResponse(createAdviceError("ACCESS_DENIED")),
      { status: 403 },
    );
  }

  const record = await getAdviceReport(reportId, accessToken);
  if (!record) {
    return NextResponse.json(
      createAdviceErrorResponse(createAdviceError("REPORT_NOT_FOUND")),
      { status: 404 },
    );
  }

  return NextResponse.json(
    createAdviceSuccessResponse(record.reportPayload, {
      engine: "advice",
      engineVersion: record.reportPayload.version,
      generatedAt: record.createdAt.toISOString(),
      requestedMode: record.reportPayload.generation.requestedMode,
      generationMode: record.reportPayload.generation.mode,
      provider: record.reportPayload.generation.provider,
      model: record.reportPayload.generation.model,
      aiAvailable: record.reportPayload.generation.aiAvailable,
      safetyRouted: record.reportPayload.generation.mode === "high_risk_local",
    } as const),
  );
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await ctx.params;
  const accessToken = readAccessToken(request);

  if (!accessToken) {
    return NextResponse.json(
      createAdviceErrorResponse(createAdviceError("ACCESS_DENIED")),
      { status: 403 },
    );
  }

  const result = await deleteAdviceReport(reportId, accessToken);

  return NextResponse.json({ success: result.ok });
}
