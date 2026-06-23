import { NextResponse } from "next/server";

import {
  AdviceGenerateRequestSchema,
  createAdviceError,
  createAdviceErrorResponse,
  createAdviceSuccessResponse,
  generateAdvice,
} from "../../../../lib/advice";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = AdviceGenerateRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      createAdviceErrorResponse(createAdviceError("INVALID_ADVICE_INPUT")),
      { status: 400 },
    );
  }

  const { report, meta } = await generateAdvice(parsed.data);

  return NextResponse.json(createAdviceSuccessResponse(report, meta));
}
