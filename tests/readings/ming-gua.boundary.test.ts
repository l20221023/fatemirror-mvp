import { describe, expect, it } from "vitest";

import {
  calculateMingGong,
  calculateMingGongMatch,
  calculateMingGua,
  calculateMingGuaNumber,
  digitalRoot,
  getYearBaseNumber,
  getYearDigitSum,
  normalizeGender,
  normalizePalace,
  pairKey,
  parseGender,
} from "../../lib/ming-gong";

describe("ming-gua boundaries", () => {
  it("maps gender aliases through the legacy parser", () => {
    expect(parseGender("male")).toBe("man");
    expect(parseGender("female")).toBe("woman");
    expect(parseGender("man")).toBe("man");
    expect(parseGender("woman")).toBe("woman");
    expect(parseGender("other")).toBeNull();
  });

  it("covers deterministic palace numbers including middle-palace conversion and year boundaries", () => {
    const cases = [
      { year: 1995, gender: "male", expected: 2 },
      { year: 2018, gender: "female", expected: 6 },
      { year: 1984, gender: "male", expected: 7 },
      { year: 1990, gender: "female", expected: 8 },
      { year: 1989, gender: "male", expected: 2 },
      { year: 1981, gender: "female", expected: 8 },
      { year: 1900, gender: "male", expected: 1 },
      { year: 2100, gender: "female", expected: 7 },
    ] as const;

    for (const testCase of cases) {
      expect(calculateMingGuaNumber(testCase.year, testCase.gender)).toBe(testCase.expected);
    }
  });

  it("covers numeric helpers and palace normalization", () => {
    expect(normalizeGender("man")).toBe("male");
    expect(normalizeGender("woman")).toBe("female");
    expect(digitalRoot(18)).toBe(9);
    expect(getYearDigitSum(1995)).toBe(24);
    expect(getYearBaseNumber(1995)).toBe(6);
    expect(normalizePalace(14)).toBe(5);
    expect(normalizePalace(-1)).toBe(8);
    expect(pairKey(9, 1)).toBe("1-9");
  });

  it("covers deprecated ming-gong compatibility matching levels", () => {
    const best = calculateMingGongMatch(
      calculateMingGong("1995-07-12", "male"),
      calculateMingGong("2018-05-08", "female"),
    );
    const sameGroup = calculateMingGongMatch(
      calculateMingGong("1987-03-03", "male"),
      calculateMingGong("1990-04-04", "male"),
    );
    const crossGroup = calculateMingGongMatch(
      calculateMingGong("1995-07-12", "male"),
      calculateMingGong("1987-03-03", "male"),
    );

    expect(best).toMatchObject({ matchLevel: "high", score: 92, deterministicLevel: "traditional-best-pair" });
    expect(sameGroup).toMatchObject({ matchLevel: "secondary", score: 76, deterministicLevel: "same-group" });
    expect(crossGroup).toMatchObject({ matchLevel: "low", score: 48, deterministicLevel: "cross-group" });
  });

  it("returns a full result and rejects invalid numeric helper input", () => {
    const result = calculateMingGua({ birthYear: 1995, gender: "male" });

    expect(result.result.favorableDirections.length).toBeGreaterThan(0);
    expect(calculateMingGua({ birthYear: 1900, gender: "male" }).result.palaceNumber).toBe(1);
    expect(calculateMingGua({ birthYear: 2100, gender: "female" }).result.palaceNumber).toBe(7);
    expect(() => calculateMingGua({ birthYear: 2101, gender: "male" })).toThrow(/INVALID_BIRTH_YEAR/);
    expect(() => digitalRoot(0)).toThrow(/INVALID_VALUE/);
  });
});
