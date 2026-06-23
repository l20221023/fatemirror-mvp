import { describe, expect, it } from "vitest";

import {
  calculateMarriageDirection,
  calculateMarriageDirectionFromLunar,
  createMarriageDirectionReading,
} from "../../lib/marriage-direction";

describe("marriage-direction boundaries", () => {
  it("covers deterministic examples with table-driven lunar inputs", () => {
    const cases = [
      {
        input: [3, 3] as const,
        expected: { branch: "午", direction: "南", axis: "南—北" },
      },
      {
        input: [1, 1] as const,
        expected: { branch: "寅", direction: "东北", axis: "东北—西南" },
      },
      {
        input: [11, 30] as const,
        expected: { targetBranchIndex: 5 },
      },
    ] as const;

    for (const testCase of cases) {
      expect(calculateMarriageDirectionFromLunar(...testCase.input)).toMatchObject(testCase.expected);
    }
  });

  it("creates full readings from both solar dates and manual lunar overrides", () => {
    const fromSolar = createMarriageDirectionReading({
      birthDate: "2024-02-10",
      birthPlaceLabel: "Luoyang",
    });
    const fromOverride = createMarriageDirectionReading({
      birthDate: "2024-02-10",
      lunarOverride: {
        month: 2,
        day: 1,
        isLeapMonth: true,
      },
    });

    expect(fromSolar.method).toBe("marriage-direction");
    expect(fromSolar.input?.birthPlaceLabel).toBe("Luoyang");
    expect(fromSolar.calculation?.trace.length).toBeGreaterThanOrEqual(6);
    expect(fromOverride.input?.isLeapMonth).toBe(true);
    expect(fromOverride.input?.timezone).toBe("Asia/Shanghai");
  });

  it("supports Date inputs in the compatibility wrapper and rejects invalid dates", () => {
    const result = calculateMarriageDirection(new Date("2024-02-10T10:00:00+08:00"));

    expect(result.method).toBe("marriage-direction");
    expect(result.targetMonth).toBeGreaterThanOrEqual(1);
    expect(result.targetMonth).toBeLessThanOrEqual(12);
    expect(() => calculateMarriageDirection(new Date("invalid"))).toThrow(/INVALID_GREGORIAN_DATE/);
  });
});
