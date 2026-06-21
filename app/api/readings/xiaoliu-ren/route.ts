import { NextResponse } from "next/server";

import { createErrorResponse, createSuccessResponse } from "../../../../lib/readings/api-response";
import { mapErrorToReadingError } from "../../../../lib/readings/errors";
import { createMethodMeta } from "../../../../lib/readings/meta";
import { XiaoliuRenRequestSchema } from "../../../../lib/readings/schemas/xiaoliu-ren";
import { createXiaoliuRenReading } from "../../../../lib/xiaoliu-ren";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  try {
    const input = XiaoliuRenRequestSchema.parse(body);
    const result = createXiaoliuRenReading(input);

    return NextResponse.json(
      createSuccessResponse(result, createMethodMeta("xiaoliu-ren")),
    );
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(mapErrorToReadingError(error)),
      { status: 400 },
    );
  }
}
