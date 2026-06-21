import { NextResponse } from "next/server";

import { calculateMingGua } from "../../../../lib/ming-gong";
import { createErrorResponse, createSuccessResponse } from "../../../../lib/readings/api-response";
import { mapErrorToReadingError } from "../../../../lib/readings/errors";
import { createMethodMeta } from "../../../../lib/readings/meta";
import { MingGuaRequestSchema } from "../../../../lib/readings/schemas/ming-gua";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  try {
    const input = MingGuaRequestSchema.parse(body);
    const result = calculateMingGua(input);

    return NextResponse.json(
      createSuccessResponse(result, createMethodMeta("ming-gua")),
    );
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(mapErrorToReadingError(error)),
      { status: 400 },
    );
  }
}
