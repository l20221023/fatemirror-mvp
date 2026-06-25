import { getCommercialProduct } from "./products";
import type { CommercialProductCode } from "./types";

export function getCommercialPriceLabel(productCode: CommercialProductCode) {
  const product = getCommercialProduct(productCode);
  const dollars = (product.priceCents / 100).toFixed(product.priceCents % 100 === 0 ? 0 : 2);
  return `$${dollars}`;
}

export function getCommercialPriceCents(productCode: CommercialProductCode) {
  return getCommercialProduct(productCode).priceCents;
}
