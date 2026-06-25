import { NextResponse, type NextRequest } from "next/server";

import { getCommercialOrder } from "../../../../../lib/commercial/order-service";

export async function GET(_: NextRequest, ctx: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await ctx.params;
  const order = await getCommercialOrder(orderId);

  if (!order) {
    return NextResponse.json({ success: false, error: "ORDER_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: order });
}
