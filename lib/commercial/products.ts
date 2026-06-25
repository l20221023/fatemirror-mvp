import type { CommercialProduct, CommercialProductCode } from "./types";

export const COMMERCIAL_PRODUCTS: Record<CommercialProductCode, CommercialProduct> = {
  free_basic: {
    code: "free_basic",
    name: "Free Basic",
    description: "Foundational advice with factual boundaries and local reasoning.",
    priceCents: 0,
    currency: "USD",
    active: true,
    entitlementType: "beta",
  },
  deep_advice_single: {
    code: "deep_advice_single",
    name: "Deep Advice Single",
    description: "Expanded AI advice with more structure, examples, and action paths.",
    priceCents: 399,
    currency: "USD",
    active: false,
    entitlementType: "paid_basic",
  },
  deep_advice_reviewed: {
    code: "deep_advice_reviewed",
    name: "Deep Advice Reviewed",
    description: "Reserved for the future human-reviewed tier.",
    priceCents: 1299,
    currency: "USD",
    active: false,
    entitlementType: "paid_deep",
  },
};

export function listCommercialProducts() {
  return Object.values(COMMERCIAL_PRODUCTS);
}

export function getCommercialProduct(code: CommercialProductCode) {
  return COMMERCIAL_PRODUCTS[code];
}
