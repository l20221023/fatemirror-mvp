import { z } from "zod";

import { ErrorSchema, IsoDateTimeSchema, LunarOverrideSchema, MethodMetaSchema, TimezoneSchema } from "./common";

export const XiaoliuRenRequestSchema = z.object({
  occurredAt: IsoDateTimeSchema,
  timezone: TimezoneSchema,
  question: z.string().trim().optional(),
  lunarOverride: LunarOverrideSchema.optional(),
});

export const XiaoliuRenTraceSchema = z.object({
  formula: z.literal("mod(lunarMonth + lunarDay + hourIndex - 3, 6)"),
  lunarMonth: z.number().int(),
  lunarDay: z.number().int(),
  hourIndex: z.number().int(),
  resultIndex: z.number().int().min(0).max(5),
  trace: z.array(z.string()),
});

export const XiaoliuRenResultSchema = z.object({
  method: z.literal("xiaoliu-ren"),
  version: z.string(),
  input: z.object({
    occurredAt: z.string(),
    timezone: z.string(),
    lunarMonth: z.number().int(),
    lunarDay: z.number().int(),
    isLeapMonth: z.boolean(),
    lunarMonthLabel: z.string(),
    lunarDayLabel: z.string(),
    hourBranch: z.string(),
    hourIndex: z.number().int(),
    localDateTime: z.string(),
    questionIncludedInCalculation: z.literal(false),
  }),
  calculation: XiaoliuRenTraceSchema,
  result: z.object({
    key: z.string(),
    name: z.string(),
    keywords: z.array(z.string()),
    summary: z.string(),
    relationship: z.string(),
    work: z.string(),
    action: z.string(),
  }),
  disclaimer: z.string(),
});

export const XiaoliuRenApiResponseSchema = z.union([
  z.object({
    success: z.literal(true),
    data: XiaoliuRenResultSchema,
    meta: MethodMetaSchema,
  }),
  z.object({
    success: z.literal(false),
    error: ErrorSchema,
  }),
]);
