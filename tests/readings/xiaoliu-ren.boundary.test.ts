import { describe, expect, it } from "vitest";

import {
  calculateXiaoLiuRen,
  calculateXiaoliuRen,
  createXiaoliuRenReading,
  getHourIndex,
  mod,
} from "../../lib/xiaoliu-ren";

describe("xiaoliu-ren boundaries", () => {
  it("covers mod behavior and twelve hour boundaries", () => {
    expect(mod(-1, 6)).toBe(5);
    expect(mod(7, 6)).toBe(1);

    const cases = [
      { hour: 0, expected: 1 },
      { hour: 1, expected: 2 },
      { hour: 2, expected: 2 },
      { hour: 11, expected: 7 },
      { hour: 22, expected: 12 },
      { hour: 23, expected: 1 },
    ] as const;

    for (const testCase of cases) {
      expect(getHourIndex(testCase.hour)).toBe(testCase.expected);
    }
  });

  it("creates readings with timezone conversion and manual lunar overrides", () => {
    const byTimezone = createXiaoliuRenReading({
      occurredAt: "2024-02-09T16:30:00.000Z",
      timezone: "Asia/Shanghai",
      question: "Will this move today?",
    });

    expect(byTimezone.input.localDateTime).toBe("2024-02-10T00:30:00");
    expect(byTimezone.input.hourIndex).toBe(1);
    expect(byTimezone.input.questionIncludedInCalculation).toBe(false);

    const overridden = createXiaoliuRenReading({
      occurredAt: "2026-06-20T15:30:00+08:00",
      timezone: "Asia/Shanghai",
      lunarOverride: {
        month: 2,
        day: 1,
        isLeapMonth: true,
      },
    });

    expect(overridden.input.isLeapMonth).toBe(true);
    expect(overridden.input.lunarMonth).toBe(2);
    expect(overridden.input.lunarDay).toBe(1);
  });

  it("supports legacy calculateXiaoLiuRen compatibility paths", () => {
    const fromLocalMoment = calculateXiaoLiuRen(
      new Date("2024-02-09T16:30:00.000Z"),
      "2024-02-10T00:30",
    );
    const fromDateOnly = calculateXiaoLiuRen(new Date("2024-02-09T16:30:00.000Z"));
    const deterministic = calculateXiaoliuRen(1, 1, 23);

    expect(fromLocalMoment.shichen).toBe(1);
    expect(fromLocalMoment.trace.resultIndex).toBe(fromLocalMoment.deityIndex);
    expect(fromDateOnly.deityKey).toBeDefined();
    expect(deterministic.resultIndex).toBe(0);
  });

  it("rejects invalid input", () => {
    expect(() => createXiaoliuRenReading({ occurredAt: "", timezone: "Asia/Shanghai" })).toThrow(/INVALID_OCCURRED_AT/);
    expect(() =>
      createXiaoliuRenReading({
        occurredAt: "2026-06-20T15:30:00+08:00",
        timezone: "Asia/Shanghai",
        lunarOverride: { month: 13, day: 1 },
      }),
    ).toThrow(/INVALID_LUNAR_MONTH/);
    expect(() =>
      calculateXiaoLiuRen(new Date("2024-02-09T16:30:00.000Z"), "invalid-local"),
    ).toThrow(/INVALID_OCCURRED_AT/);
  });
});
