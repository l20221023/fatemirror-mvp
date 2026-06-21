import { describe, expect, it } from "vitest";

import { createErrorResponse, createSuccessResponse } from "../../lib/readings/api-response";
import { createReadingError, mapErrorToReadingError } from "../../lib/readings/errors";
import { createMethodMeta } from "../../lib/readings/meta";
import { validateInterpretationOutput } from "../../lib/readings/interpretation/output-validator";

describe("reading api contracts", () => {
  it("creates unified success and error responses", () => {
    const meta = createMethodMeta("ming-gua");
    expect(createSuccessResponse({ ok: true }, meta)).toMatchObject({
      success: true,
      data: { ok: true },
      meta,
    });

    expect(createErrorResponse(createReadingError("INVALID_INPUT"))).toMatchObject({
      success: false,
      error: { code: "INVALID_INPUT" },
    });
  });

  it("maps domain errors into reading errors", () => {
    expect(mapErrorToReadingError(new Error("INVALID_GREGORIAN_DATE")).code).toBe("INVALID_DATE");
    expect(mapErrorToReadingError(new Error("INVALID_TIMEZONE")).code).toBe("INVALID_TIMEZONE");
    expect(mapErrorToReadingError(new Error("INVALID_GENDER")).code).toBe("INVALID_INPUT");
    expect(mapErrorToReadingError(new Error("INVALID_BIRTH_YEAR")).code).toBe("UNSUPPORTED_GREGORIAN_YEAR");
  });

  it("validates interpretation output boundaries", () => {
    expect(
      validateInterpretationOutput("传统正配提示你们更适合先看现实互动。", {
        locale: "zh",
        expectedPhrases: ["传统正配"],
        maxLength: 50,
      }),
    ).toBe(true);

    expect(
      validateInterpretationOutput("你们命中注定会在一起。", {
        locale: "zh",
        expectedPhrases: ["命中注定"],
        maxLength: 50,
      }),
    ).toBe(false);
  });
});
