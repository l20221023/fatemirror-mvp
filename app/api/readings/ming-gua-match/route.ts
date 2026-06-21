import { NextResponse } from "next/server";

import {
  calculateMingGua,
  calculateMingGuaMatch,
} from "../../../../lib/ming-gong";
import { createErrorResponse, createSuccessResponse } from "../../../../lib/readings/api-response";
import { mapErrorToReadingError } from "../../../../lib/readings/errors";
import { createMethodMeta } from "../../../../lib/readings/meta";
import { MingGuaMatchRequestSchema } from "../../../../lib/readings/schemas/ming-gua-match";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  try {
    const input = MingGuaMatchRequestSchema.parse(body);
    const result = calculateMingGuaMatch(
      calculateMingGua(input.personA),
      calculateMingGua(input.personB),
    );

    return NextResponse.json(
      createSuccessResponse(result, createMethodMeta("ming-gua-match")),
    );
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(mapErrorToReadingError(error)),
      { status: 400 },
    );
  }
}
