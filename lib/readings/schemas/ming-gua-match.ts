import { z } from "zod";

import { ErrorSchema, MethodMetaSchema } from "./common";
import { MingGuaRequestSchema } from "./ming-gua";

export const MingGuaMatchRequestSchema = z.object({
  personA: MingGuaRequestSchema,
  personB: MingGuaRequestSchema,
});

export const MingGuaMatchTraceSchema = z.object({
  pairKey: z.string(),
  personAGroup: z.enum(["east", "west"]),
  personBGroup: z.enum(["east", "west"]),
  trace: z.array(z.string()),
});

export const MingGuaMatchResultSchema = z.object({
  method: z.literal("ming-gua-match"),
  version: z.string(),
  input: MingGuaMatchRequestSchema,
  calculation: MingGuaMatchTraceSchema,
  result: z.object({
    level: z.enum(["traditional-best-pair", "same-group", "cross-group"]),
    label: z.string(),
    summary: z.string(),
    realityChecklist: z.array(z.string()),
  }),
  disclaimer: z.string(),
});

export const MingGuaMatchApiResponseSchema = z.union([
  z.object({
    success: z.literal(true),
    data: MingGuaMatchResultSchema,
    meta: MethodMetaSchema,
  }),
  z.object({
    success: z.literal(false),
    error: ErrorSchema,
  }),
]);
