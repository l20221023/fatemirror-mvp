import { describe, expect, it } from "vitest";

import {
  LUNAR_LIBRARY,
  assertValidTimezone,
  fromGregorian,
  fromGregorianParts,
  getDatePartsInTimezone,
  solarToLunar,
} from "../../lib/lunar-converter";

describe("lunar-converter", () => {
  it("covers spring festival boundaries with table-driven cases", () => {
    const cases = [
      { date: "2024-02-09", expected: { month: 12, day: 30, isLeapMonth: false } },
      { date: "2024-02-10", expected: { month: 1, day: 1, isLeapMonth: false } },
      { date: "2024-02-11", expected: { month: 1, day: 2, isLeapMonth: false } },
    ] as const;

    for (const testCase of cases) {
      expect(fromGregorian(testCase.date)).toMatchObject(testCase.expected);
    }
  });

  it("preserves leap month and source metadata", () => {
    const result = fromGregorian("2023-03-22");

    expect(result.month).toBe(2);
    expect(result.day).toBe(1);
    expect(result.isLeapMonth).toBe(true);
    expect(result.source).toEqual({
      library: LUNAR_LIBRARY.name,
      libraryVersion: LUNAR_LIBRARY.version,
      supportedYears: `${LUNAR_LIBRARY.supportedYearStart}-${LUNAR_LIBRARY.supportedYearEnd}`,
    });
  });

  it("supports the 1900-2100 boundary years", () => {
    expect(fromGregorian("1900-01-31")).toMatchObject({ month: expect.any(Number), day: expect.any(Number) });
    expect(fromGregorian("2100-12-31")).toMatchObject({ month: expect.any(Number), day: expect.any(Number) });
  });

  it("accepts leap day and rejects invalid dates, invalid parts, and unsupported years", () => {
    expect(fromGregorian("2024-02-29")).toMatchObject({ month: expect.any(Number), day: expect.any(Number) });
    expect(() => fromGregorian("2026-02-30")).toThrow(/INVALID_GREGORIAN_DATE/);
    expect(() => fromGregorian("not-a-date")).toThrow(/INVALID_GREGORIAN_DATE/);
    expect(() => fromGregorian("")).toThrow(/INVALID_GREGORIAN_DATE/);
    expect(() => fromGregorian("1899-12-31")).toThrow(/UNSUPPORTED_GREGORIAN_YEAR/);
    expect(() => fromGregorian("2101-01-01")).toThrow(/UNSUPPORTED_GREGORIAN_YEAR/);
    expect(() =>
      fromGregorianParts({ year: 2024, month: 0, day: 1, hour: 12, minute: 0, second: 0 }),
    ).toThrow(/INVALID_GREGORIAN_MONTH/);
    expect(() =>
      fromGregorianParts({ year: 2024, month: 1, day: 0, hour: 12, minute: 0, second: 0 }),
    ).toThrow(/INVALID_GREGORIAN_DAY/);
    expect(() =>
      fromGregorianParts({ year: 2026, month: 2, day: 30, hour: 12, minute: 0, second: 0 }),
    ).toThrow(/INVALID_GREGORIAN_DATE/);
  });

  it("converts by timezone from the same UTC instant", () => {
    const utcInstant = new Date("2024-02-09T16:30:00.000Z");
    const shanghai = getDatePartsInTimezone(utcInstant, "Asia/Shanghai");
    const losAngeles = getDatePartsInTimezone(utcInstant, "America/Los_Angeles");

    expect(shanghai).toMatchObject({ year: 2024, month: 2, day: 10, hour: 0 });
    expect(losAngeles).toMatchObject({ year: 2024, month: 2, day: 9, hour: 8 });
  });

  it("validates timezones and parts", () => {
    expect(() => assertValidTimezone("Bad/Timezone")).toThrow(/INVALID_TIMEZONE/);
    expect(() => assertValidTimezone("")).toThrow(/INVALID_TIMEZONE/);
    expect(() => fromGregorian("2024-02-10", "Bad/Timezone")).toThrow(/INVALID_TIMEZONE/);
    expect(fromGregorianParts({ year: 1900, month: 1, day: 31, hour: 12, minute: 0, second: 0 })).toMatchObject({
      month: expect.any(Number),
      day: expect.any(Number),
    });
  });

  it("supports both Date and string inputs in solarToLunar", () => {
    expect(solarToLunar("2024-02-10")).toMatchObject({ month: 1, day: 1, isLeapMonth: false });
    expect(solarToLunar(new Date("2024-02-10T12:00:00+08:00"))).toMatchObject({
      month: expect.any(Number),
      day: expect.any(Number),
    });
    expect(() => solarToLunar(new Date("invalid"))).toThrow(/INVALID_GREGORIAN_DATE/);
  });
});
