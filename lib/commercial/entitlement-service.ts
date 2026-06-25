import type { CommercialEntitlementType, CommercialProductCode } from "./types";
import { getCommercialSubjectHash } from "./order-service";
import { createDefaultCommercialRepository } from "./repository/default-commercial-repository";

const repository = createDefaultCommercialRepository();

export async function getCommercialEntitlements(subject: string) {
  return repository.findEntitlementsBySubject(getCommercialSubjectHash(subject));
}

export async function listCommercialEntitlements() {
  return repository.listEntitlements();
}

export async function getCommercialEntitlementForProduct(
  subject: string,
  productCode: CommercialProductCode,
  allowedTypes: CommercialEntitlementType[] = ["beta", "paid_basic", "paid_deep"],
) {
  const entitlements = await getCommercialEntitlements(subject);
  return (
    entitlements.find(
      (item) =>
        item.productCode === productCode &&
        allowedTypes.includes(item.entitlementType as CommercialEntitlementType) &&
        (item.status === "active" || item.status === "consumed"),
    ) ?? null
  );
}

export async function revokeCommercialEntitlement(entitlementId: string) {
  return repository.updateEntitlement(entitlementId, {
    status: "revoked",
    revokedAt: new Date().toISOString(),
  });
}

export async function restoreCommercialEntitlement(entitlementId: string) {
  return repository.updateEntitlement(entitlementId, {
    status: "active",
    revokedAt: null,
  });
}
