import { z } from "zod";

import { ErrorSchema, MethodMetaSchema } from "./common";

export const MingGuaRequestSchema = z.object({
  birthYear: z.number().int(),
  gender: z.enum(["male", "female"]),
});

export const MingGuaTraceSchema = z.object({
  digitSum: z.number().int(),
  baseNumber: z.number().int(),
  rawPalace: z.number().int(),
  normalizedPalace: z.number().int(),
  usedFivePalaceRule: z.boolean(),
  trace: z.array(z.string()),
});

export const MingGuaResultSchema = z.object({
  method: z.literal("ming-gua"),
  version: z.string(),
  calculationMode: z.literal("gregorian-year-simple"),
  input: MingGuaRequestSchema,
  calculation: MingGuaTraceSchema,
  result: z.object({
    palaceNumber: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(6),
      z.literal(7),
      z.literal(8),
      z.literal(9),
    ]),
    trigram: z.string(),
    palaceName: z.string(),
    roleSymbol: z.string(),
    group: z.enum(["east", "west"]),
    groupLabel: z.enum(["东四命", "西四命"]),
    direction: z.string(),
    favorableDirections: z.array(z.string()),
  }),
  disclaimer: z.string(),
});

export const MingGuaApiResponseSchema = z.union([
  z.object({
    success: z.literal(true),
    data: MingGuaResultSchema,
    meta: MethodMetaSchema,
  }),
  z.object({
    success: z.literal(false),
    error: ErrorSchema,
  }),
]);
