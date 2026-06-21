import { NextResponse } from "next/server";
import { z } from "zod";

import { hasLocale } from "../../../lib/i18n";
import { generateReadingText } from "../../../lib/openai";
import type { LoveInterpretationFacts, MomentInterpretationFacts } from "../../../lib/readings/interpretation/local-templates";

const LoveFactsSchema = z.object({
  method: z.literal("ming-gua-match"),
  personA: z.object({
    palaceNumber: z.number().int(),
    trigram: z.string(),
    groupLabel: z.string(),
  }),
  personB: z.object({
    palaceNumber: z.number().int(),
    trigram: z.string(),
    groupLabel: z.string(),
  }),
  matchType: z.enum(["traditional-best-pair", "same-group", "cross-group"]),
  matchLabel: z.string(),
  matchSummary: z.string(),
  relationshipStage: z.string().optional(),
  question: z.string().optional(),
});

const MomentFactsSchema = z.object({
  method: z.literal("xiaoliu-ren"),
  deityKey: z.enum(["da-an", "liu-lian", "su-xi", "chi-kou", "xiao-ji", "kong-wang"]),
  deityName: z.string(),
  summary: z.string(),
  action: z.string(),
  occurredAtLabel: z.string(),
  question: z.string().optional(),
});

const RequestSchema = z.discriminatedUnion("readingType", [
  z.object({
    locale: z.enum(["zh", "en"]),
    layer: z.enum(["free", "paid"]),
    readingType: z.literal("love"),
    facts: LoveFactsSchema,
  }),
  z.object({
    locale: z.enum(["zh", "en"]),
    layer: z.enum(["free", "paid"]),
    readingType: z.literal("moment"),
    facts: MomentFactsSchema,
  }),
]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);

  if (!parsed.success || !hasLocale(parsed.data.locale)) {
    return NextResponse.json(
      { success: false, message: "Invalid interpretation request." },
      { status: 400 },
    );
  }

  if (parsed.data.readingType === "love") {
    const text = await generateReadingText({
      locale: parsed.data.locale,
      layer: parsed.data.layer,
      readingType: "love",
      facts: parsed.data.facts as LoveInterpretationFacts,
    });

    return NextResponse.json({ success: true, text });
  }

  const text = await generateReadingText({
    locale: parsed.data.locale,
    layer: parsed.data.layer,
    readingType: "moment",
    facts: parsed.data.facts as MomentInterpretationFacts,
  });

  return NextResponse.json({ success: true, text });
}
