import { afterEach, describe, expect, it, vi } from "vitest";

import { isPreviewUnlockAllowed, readPreviewUnlockFlag } from "../../lib/preview-unlock";

describe("preview-unlock", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("only allows preview unlock outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(isPreviewUnlockAllowed()).toBe(true);
    expect(readPreviewUnlockFlag("1")).toBe(true);

    vi.stubEnv("NODE_ENV", "production");
    expect(isPreviewUnlockAllowed()).toBe(false);
    expect(readPreviewUnlockFlag("1")).toBe(false);
  });

  it("requires the explicit preview query value", () => {
    vi.stubEnv("NODE_ENV", "test");
    expect(readPreviewUnlockFlag("0")).toBe(false);
    expect(readPreviewUnlockFlag(undefined)).toBe(false);
    expect(readPreviewUnlockFlag(["1"])).toBe(false);
  });
});
