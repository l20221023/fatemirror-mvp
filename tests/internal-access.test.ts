import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createInternalAccessCookieValue,
  validateInternalAccessCode,
} from "../lib/internal-access/server";
import { verifyInternalAccessToken } from "../lib/internal-access/tokens";

describe("internal access", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("signs and validates internal access tokens", async () => {
    vi.stubEnv("ADVICE_INTERNAL_ACCESS_SECRET", "unit-test-internal-secret");
    vi.stubEnv("ADVICE_INTERNAL_ACCESS_CODE", "manager-code");

    const token = createInternalAccessCookieValue();
    expect(token).toBeTruthy();
    expect(verifyInternalAccessToken(token)).toBe(true);
    expect(await validateInternalAccessCode("manager-code")).toBe(true);
    expect(await validateInternalAccessCode("wrong")).toBe(false);
  });
});
