import { z } from "zod";

import { READING_ERROR_CODES } from "../errors";

export const IsoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const IsoDateTimeSchema = z.string().datetime({ offset: true });
export const TimezoneSchema = z.string().min(1);
export const LunarOverrideSchema = z.object({
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(30),
  isLeapMonth: z.boolean().optional(),
});

export const ErrorSchema = z.object({
  code: z.enum(READING_ERROR_CODES),
  message: z.string(),
  field: z.string().optional(),
});

export const MethodMetaSchema = z.object({
  method: z.string(),
  methodVersion: z.string(),
  lunarAdapter: z.string().optional(),
  lunarAdapterVersion: z.string().optional(),
  calculatedAt: z.string().datetime(),
});
