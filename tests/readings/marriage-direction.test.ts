import { describe, expect, it } from "vitest";

import {
  calculateMarriageDirectionFromLunar,
  createMarriageDirectionReading,
} from "../../lib/marriage-direction";

describe("marriage-direction", () => {
  it("covers deterministic examples", () => {
    expect(calculateMarriageDirectionFromLunar(3, 3)).toMatchObject({
      branch: "午",
      direction: "南",
      axis: "南—北",
    });
    expect(calculateMarriageDirectionFromLunar(1, 1)).toMatchObject({
      branch: "寅",
      direction: "东北",
      axis: "东北—西南",
    });
  });

  it("creates a full reading with lunar input and trace", () => {
    const result = createMarriageDirectionReading({
      birthDate: "2024-02-10",
      birthPlaceLabel: "洛阳",
    });

    expect(result.method).toBe("marriage-direction");
    expect(result.input?.birthPlaceLabel).toBe("洛阳");
    expect(result.calculation?.trace.length).toBeGreaterThanOrEqual(6);
  });

  it("rejects invalid lunar values", () => {
    expect(() => calculateMarriageDirectionFromLunar(0, 1)).toThrow(/INVALID_LUNAR_MONTH/);
    expect(() => calculateMarriageDirectionFromLunar(1, 31)).toThrow(/INVALID_LUNAR_DAY/);
  });
});
