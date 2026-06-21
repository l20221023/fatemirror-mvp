import { describe, expect, it } from "vitest";

import { calculateMingGua, calculateMingGuaMatch } from "../../lib/ming-gong";

describe("ming-gua-match", () => {
  it("covers best pair, same-group, and cross-group", () => {
    const best = calculateMingGuaMatch(
      calculateMingGua({ birthYear: 1995, gender: "male" }),
      calculateMingGua({ birthYear: 2018, gender: "female" }),
    );
    expect(best.result.level).toBe("traditional-best-pair");

    const same = calculateMingGuaMatch(
      calculateMingGua({ birthYear: 1987, gender: "male" }),
      calculateMingGua({ birthYear: 1990, gender: "male" }),
    );
    expect(same.result.level).toBe("same-group");

    const cross = calculateMingGuaMatch(
      calculateMingGua({ birthYear: 1995, gender: "male" }),
      calculateMingGua({ birthYear: 1987, gender: "male" }),
    );
    expect(cross.result.level).toBe("cross-group");
  });

  it("is symmetric when swapping the two people", () => {
    const a = calculateMingGua({ birthYear: 1991, gender: "female" });
    const b = calculateMingGua({ birthYear: 1994, gender: "male" });
    expect(calculateMingGuaMatch(a, b).result.level).toBe(calculateMingGuaMatch(b, a).result.level);
  });
});
