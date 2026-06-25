import { NextResponse, type NextRequest } from "next/server";

import { getOrCreateSessionId } from "../../../../lib/session";
import { createCommercialOrder } from "../../../../lib/commercial/order-service";
import { getCommercialPriceLabel } from "../../../../lib/commercial/pricing";
import { getCommercialProduct } from "../../../../lib/commercial/products";
import type { CommercialProductCode } from "../../../../lib/commercial/types";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    productCode?: CommercialProductCode;
    locale?: string;
  } | null;

  const productCode = body?.productCode;
  if (!productCode) {
    return NextResponse.json({ success: false, error: "INVALID_PRODUCT" }, { status: 400 });
  }

  const product = getCommercialProduct(productCode);
  if (!product) {
    return NextResponse.json({ success: false, error: "INVALID_PRODUCT" }, { status: 400 });
  }

  const sessionId = await getOrCreateSessionId();
  const locale = body?.locale === "zh" ? "zh" : "en";
  let order;
  try {
    order = await createCommercialOrder({
      subject: sessionId,
      productCode,
      returnUrl: `${request.nextUrl.origin}/${locale}/commercial/checkout`,
      metadata: {
        locale,
        intendedProduct: productCode,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    if (message === "COMMERCIAL_DISABLED") {
      return NextResponse.json({ success: false, error: "COMMERCIAL_DISABLED" }, { status: 403 });
    }

    return NextResponse.json({ success: false, error: "ORDER_CREATE_FAILED" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: {
      orderId: order.id,
      checkoutUrl: order.checkoutUrl,
      amountLabel: getCommercialPriceLabel(productCode),
      productCode,
    },
  });
}
