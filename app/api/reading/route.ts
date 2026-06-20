import { NextResponse } from "next/server";

import { hasLocale } from "../../../lib/i18n";
import { generateReadingText } from "../../../lib/openai";
import type { MarriageDirectionResult } from "../../../lib/marriage-direction";
import type { XiaoLiuRenResult } from "../../../lib/xiaoliu-ren";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        locale?: string;
        layer?: "free" | "paid";
        readingType?: "love" | "moment";
        userInput?: {
          name?: string;
          birthDate?: string;
          relationshipStage?: string;
          momentTime?: string;
          question?: string;
        };
        computedResults?: {
          loveCompatibility?: {
            yourPalace: string;
            theirPalace: string;
            matchHeadline: string;
            matchNote: string;
          };
          xiaoLiuRen?: XiaoLiuRenResult;
          marriageDirection?: MarriageDirectionResult;
        };
      }
    | null;

  if (!body || !hasLocale(body.locale || "") || !body.layer || !body.readingType) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const locale = body.locale as "en" | "zh";
  const layer = body.layer as "free" | "paid";

  if (body.readingType === "love") {
    if (!body.userInput?.birthDate || !body.computedResults?.loveCompatibility) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const text = await generateReadingText({
      locale,
      layer,
      readingType: "love",
      userInput: {
        name: body.userInput.name,
        birthDate: body.userInput.birthDate,
        question: body.userInput.question,
        relationshipStage: body.userInput.relationshipStage,
      },
      computedResults: {
        loveCompatibility: body.computedResults.loveCompatibility,
      },
    });

    return NextResponse.json({ ok: true, text });
  }

  if (!body.userInput?.momentTime || !body.computedResults?.xiaoLiuRen) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const text = await generateReadingText({
    locale,
    layer,
    readingType: "moment",
    userInput: {
      name: body.userInput.name,
      momentTime: body.userInput.momentTime,
      question: body.userInput.question,
    },
    computedResults: {
      xiaoLiuRen: body.computedResults.xiaoLiuRen,
      marriageDirection: body.computedResults.marriageDirection,
    },
  });

  return NextResponse.json({ ok: true, text });
}
