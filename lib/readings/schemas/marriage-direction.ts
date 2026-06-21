import { z } from "zod";

import { ErrorSchema, IsoDateSchema, LunarOverrideSchema, MethodMetaSchema, TimezoneSchema } from "./common";

export const MarriageDirectionRequestSchema = z.object({
  birthDate: IsoDateSchema,
  timezone: TimezoneSchema.optional(),
  birthPlaceLabel: z.string().trim().optional(),
  lunarOverride: LunarOverrideSchema.optional(),
});

export const MarriageDirectionTraceSchema = z.object({
  formula: z.literal("mod(monthBranchIndex + lunarDay - 1, 12)"),
  monthBranchIndex: z.number().int(),
  monthBranch: z.string(),
  lunarDay: z.number().int(),
  targetBranchIndex: z.number().int(),
  branch: z.string(),
  direction: z.string(),
  axis: z.string(),
  trace: z.array(z.string()),
});

export const MarriageDirectionResultSchema = z.object({
  method: z.literal("marriage-direction"),
  version: z.string(),
  primaryDirection: z.string(),
  secondaryDirection: z.string(),
  description: z.string(),
  lunarBirthMonth: z.number().int(),
  lunarBirthDay: z.number().int(),
  targetMonth: z.number().int(),
  input: z.object({
    birthDate: z.string(),
    timezone: z.string(),
    birthPlaceLabel: z.string().optional(),
    lunarMonth: z.number().int(),
    lunarDay: z.number().int(),
    isLeapMonth: z.boolean(),
    lunarMonthLabel: z.string(),
    lunarDayLabel: z.string(),
  }),
  calculation: MarriageDirectionTraceSchema,
  result: z.object({
    branch: z.string(),
    direction: z.string(),
    axis: z.string(),
    placeReference: z.string(),
    summary: z.string(),
  }),
  disclaimer: z.string(),
});

export const MarriageDirectionApiResponseSchema = z.union([
  z.object({
    success: z.literal(true),
    data: MarriageDirectionResultSchema,
    meta: MethodMetaSchema,
  }),
  z.object({
    success: z.literal(false),
    error: ErrorSchema,
  }),
]);
