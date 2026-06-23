import { describe, expect, it } from "vitest";

import {
  calculateXiaoliuRen,
  createXiaoliuRenReading,
  getHourIndex,
} from "../../lib/xiaoliu-ren";

describe("xiaoliu-ren", () => {
  it("covers hour boundaries", () => {
    expect(getHourIndex(0)).toBe(1);
    expect(getHourIndex(1)).toBe(2);
    expect(getHourIndex(22)).toBe(12);
    expect(getHourIndex(23)).toBe(1);
  });

  it("returns stable deterministic examples", () => {
    expect(calculateXiaoliuRen(1, 1, 23)).toMatchObject({ result: "大安", resultIndex: 0, hourIndex: 1 });
    expect(calculateXiaoliuRen(4, 11, 15)).toMatchObject({ result: "赤口", resultIndex: 3, hourIndex: 9 });
  });

  it("creates a reading with trace and ignores question text in calculation", () => {
    const result = createXiaoliuRenReading({
      occurredAt: "2026-06-20T15:30:00+08:00",
      timezone: "Asia/Shanghai",
      question: "Will this move today?",
    });

    expect(result.input.questionIncludedInCalculation).toBe(false);
    expect(result.calculation.formula).toBe("mod(lunarMonth + lunarDay + hourIndex - 3, 6)");
    expect(result.calculation.trace.length).toBeGreaterThanOrEqual(5);
  });

  it("rejects invalid input", () => {
    expect(() => getHourIndex(24)).toThrow(/INVALID_HOUR/);
    expect(() =>
      createXiaoliuRenReading({ occurredAt: "2026-06-20T15:30:00+08:00", timezone: "Bad/Timezone" }),
    ).toThrow(/INVALID_TIMEZONE/);
  });
});
