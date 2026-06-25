import { NextResponse } from "next/server";

import { handleCommercialWebhook } from "../../../../lib/commercial/order-service";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-commercial-signature");
  const result = await handleCommercialWebhook(rawBody, signature);

  if (!result.success) {
    return NextResponse.json(result, { status: result.reason === "INVALID_SIGNATURE" ? 403 : 400 });
  }

  return NextResponse.json(result);
}
