import { NextResponse } from "next/server";

import { createMarriageDirectionReading } from "../../../../lib/marriage-direction";
import { createErrorResponse, createSuccessResponse } from "../../../../lib/readings/api-response";
import { mapErrorToReadingError } from "../../../../lib/readings/errors";
import { createMethodMeta } from "../../../../lib/readings/meta";
import { MarriageDirectionRequestSchema } from "../../../../lib/readings/schemas/marriage-direction";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  try {
    const input = MarriageDirectionRequestSchema.parse(body);
    const result = createMarriageDirectionReading(input);

    return NextResponse.json(
      createSuccessResponse(result, createMethodMeta("marriage-direction")),
    );
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(mapErrorToReadingError(error)),
      { status: 400 },
    );
  }
}
