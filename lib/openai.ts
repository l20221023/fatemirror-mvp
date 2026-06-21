import OpenAI from "openai";

import type { Locale } from "./i18n";
import {
  buildLoveLocalTemplate,
  buildMomentLocalTemplate,
  type LoveInterpretationFacts,
  type MomentInterpretationFacts,
} from "./readings/interpretation/local-templates";
import { validateInterpretationOutput } from "./readings/interpretation/output-validator";

type GenerateReadingParams =
  | {
      locale: Locale;
      layer: "free" | "paid";
      readingType: "love";
      facts: LoveInterpretationFacts;
    }
  | {
      locale: Locale;
      layer: "free" | "paid";
      readingType: "moment";
      facts: MomentInterpretationFacts;
    };

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function buildSystemPrompt(locale: Locale, readingType: "love" | "moment") {
  if (locale === "zh") {
    return readingType === "love"
      ? "你是一个克制、清楚、现实的关系解读助手。你只能根据给定事实做语言整理，不能重新计算、改写事实、制造评分、做绝对化命运判断，也不能输出疾病、灾祸、死亡、投资收益、付费化解等内容。"
      : "你是一个克制、清楚、现实的传统文化解读助手。你只能根据给定事实做语言整理，不能重新计算、改写事实、制造评分、做绝对化判断，也不能输出疾病、灾祸、死亡、投资收益、付费化解等内容。";
  }

  return readingType === "love"
    ? "You are a restrained and grounded relationship interpretation assistant. You may only rephrase the provided facts. Do not recalculate, invent scores, change facts, make destiny claims, or discuss disease, disaster, death, investment returns, or paid remedies."
    : "You are a restrained and grounded interpretation assistant for traditional cultural readings. You may only rephrase the provided facts. Do not recalculate, invent scores, change facts, or make absolute predictions.";
}

function buildUserPrompt(params: GenerateReadingParams) {
  return JSON.stringify(
    {
      locale: params.locale,
      layer: params.layer,
      readingType: params.readingType,
      facts: params.facts,
      requirements:
        params.locale === "zh"
          ? [
              "只输出一段自然语言，不要列表，不要标题。",
              "必须保留原始结果类别，不得虚构分数。",
              "强调现实观察与行动，不做绝对结论。",
            ]
          : [
              "Return one paragraph only, with no bullets or headings.",
              "Keep the original result type intact and do not invent a score.",
              "Stay grounded in reality and avoid absolute conclusions.",
            ],
    },
    null,
    2,
  );
}

function buildFallbackText(params: GenerateReadingParams) {
  return params.readingType === "love"
    ? buildLoveLocalTemplate(params.locale, params.layer, params.facts)
    : buildMomentLocalTemplate(params.locale, params.layer, params.facts);
}

function validateOutput(params: GenerateReadingParams, text: string) {
  const expectedPhrases =
    params.readingType === "love"
      ? [params.facts.matchLabel, params.facts.personA.trigram, params.facts.personB.trigram]
      : [params.facts.deityName];

  return validateInterpretationOutput(text, {
    locale: params.locale,
    expectedPhrases,
    maxLength: params.layer === "free" ? 220 : 420,
  });
}

export async function generateReadingText(params: GenerateReadingParams) {
  const fallback = buildFallbackText(params);
  const client = getClient();

  if (!client) {
    return fallback;
  }

  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: buildSystemPrompt(params.locale, params.readingType) }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: buildUserPrompt(params) }],
        },
      ],
      max_output_tokens: params.layer === "free" ? 220 : 420,
    });

    const text = response.output_text?.trim();
    if (!text || !validateOutput(params, text)) {
      return fallback;
    }

    return text;
  } catch {
    return fallback;
  }
}
