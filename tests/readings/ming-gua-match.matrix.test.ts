import { describe, expect, it } from "vitest";

import { calculateMingGua, calculateMingGuaMatch } from "../../lib/ming-gong";

describe("ming-gua-match matrix", () => {
  it("covers all four traditional best pairs", () => {
    const pairCases = [
      [
        calculateMingGua({ birthYear: 1995, gender: "male" }),
        calculateMingGua({ birthYear: 2018, gender: "female" }),
      ],
      [
        calculateMingGua({ birthYear: 1988, gender: "female" }),
        calculateMingGua({ birthYear: 1987, gender: "male" }),
      ],
      [
        calculateMingGua({ birthYear: 1995, gender: "female" }),
        calculateMingGua({ birthYear: 2018, gender: "male" }),
      ],
      [
        calculateMingGua({ birthYear: 1984, gender: "male" }),
        calculateMingGua({ birthYear: 1990, gender: "female" }),
      ],
    ] as const;

    for (const [personA, personB] of pairCases) {
      expect(calculateMingGuaMatch(personA, personB).result.level).toBe("traditional-best-pair");
    }
  });

  it("covers same-group and cross-group matching", () => {
    const same = calculateMingGuaMatch(
      calculateMingGua({ birthYear: 1987, gender: "male" }),
      calculateMingGua({ birthYear: 1990, gender: "male" }),
    );
    const cross = calculateMingGuaMatch(
      calculateMingGua({ birthYear: 1995, gender: "male" }),
      calculateMingGua({ birthYear: 1987, gender: "male" }),
    );

    expect(same.result.level).toBe("same-group");
    expect(cross.result.level).toBe("cross-group");
  });
});
