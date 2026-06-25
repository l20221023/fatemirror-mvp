import { NextResponse } from "next/server";

import { buildMockPaymentWebhook, getCommercialOrder, handleCommercialWebhook } from "../../../../../lib/commercial/order-service";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { orderId?: string } | null;
  if (!body?.orderId) {
    return NextResponse.json({ success: false, error: "INVALID_ORDER" }, { status: 400 });
  }

  const order = await getCommercialOrder(body.orderId);
  if (!order) {
    return NextResponse.json({ success: false, error: "ORDER_NOT_FOUND" }, { status: 404 });
  }

  const { rawBody, signature } = buildMockPaymentWebhook(order, "payment_succeeded");
  const result = await handleCommercialWebhook(rawBody, signature);
  return NextResponse.json(result);
}
