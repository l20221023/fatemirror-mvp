import { describe, expect, it } from "vitest";

import {
  calculateMingGua,
  calculateMingGuaNumber,
  getYearBaseNumber,
  normalizeGender,
} from "../../lib/ming-gong";

describe("ming-gua", () => {
  it("calculates sample palace numbers", () => {
    expect(calculateMingGuaNumber(1995, "male")).toBe(2);
    expect(calculateMingGuaNumber(2018, "female")).toBe(6);
    expect(calculateMingGuaNumber(1984, "male")).toBe(7);
    expect(calculateMingGuaNumber(1990, "female")).toBe(8);
  });

  it("applies five-palace conversion and never returns 5", () => {
    expect(calculateMingGuaNumber(1989, "male")).toBe(2);
    expect(calculateMingGuaNumber(1981, "female")).toBe(8);
    expect([1989, 1998, 2007, 1981].map((year) => calculateMingGuaNumber(year, year === 1981 ? "female" : "male"))).not.toContain(5);
  });

  it("returns a full result with trace", () => {
    const result = calculateMingGua({ birthYear: 1995, gender: normalizeGender("male") });
    expect(getYearBaseNumber(1995)).toBe(6);
    expect(result.result).toMatchObject({
      palaceNumber: 2,
      trigram: "坤",
      group: "west",
    });
    expect(result.calculation.trace.length).toBeGreaterThanOrEqual(6);
  });

  it("rejects invalid year and gender", () => {
    expect(() => calculateMingGua({ birthYear: 1899, gender: "male" })).toThrow(/INVALID_BIRTH_YEAR/);
    expect(() => normalizeGender("other")).toThrow(/INVALID_GENDER/);
  });
});
