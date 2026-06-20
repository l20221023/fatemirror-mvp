import OpenAI from "openai";

import type { Locale } from "./i18n";
import type { MarriageDirectionResult } from "./marriage-direction";
import type { XiaoLiuRenResult } from "./xiaoliu-ren";

type LoveCompatibilityResult = {
  yourPalace: string;
  theirPalace: string;
  matchHeadline: string;
  matchNote: string;
};

type GenerateReadingParams =
  | {
      locale: Locale;
      layer: "free" | "paid";
      readingType: "love";
      userInput: {
        name?: string;
        birthDate: string;
        question?: string;
        relationshipStage?: string;
      };
      computedResults: {
        loveCompatibility: LoveCompatibilityResult;
      };
    }
  | {
      locale: Locale;
      layer: "free" | "paid";
      readingType: "moment";
      userInput: {
        name?: string;
        momentTime: string;
        question?: string;
      };
      computedResults: {
        xiaoLiuRen: XiaoLiuRenResult;
        marriageDirection?: MarriageDirectionResult;
      };
    };

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function buildSystemPrompt(locale: Locale, readingType: "love" | "moment") {
  if (locale === "zh") {
    if (readingType === "love") {
      return `你是一位沉稳、克制、判断清晰的关系解读者。

你的风格要求：
- 语气沉稳、有分寸、有权威感
- 不夸张，不讨好，不写成网络鸡汤
- 基于用户当前提供的匹配信息和问题，做趋势判断
- 不做绝对预言，只说“在当前条件下更可能如何”
- 免费层 90-160 字，付费层 180-300 字`;
    }

    return `你是一位沉稳、克制、判断清晰的命理师，擅长根据起念当下的时刻判断事情的走势。

你的风格要求：
- 语气沉稳、有分寸、有权威感
- 不故作玄虚，不空泛安慰
- 不做绝对预言，只说“在当前条件下的趋势”
- 建议必须能落到现实动作
- 免费层 120-180 字，付费层 260-360 字`;
  }

  if (readingType === "love") {
    return `You are a calm, discerning relationship reader.

Your style requirements:
- Sound composed, clear, and quietly authoritative
- Never flatter, exaggerate, or speak in vague wellness clichés
- Ground the reading in the user's current compatibility signal and question
- Never predict absolute outcomes; frame everything as a tendency under current conditions
- Free layer: 80-130 words
- Paid layer: 180-260 words`;
  }

  return `You are a calm, discerning metaphysical reader who interprets the movement around the exact moment a question is asked.

Your style requirements:
- Sound composed, clear, and quietly authoritative
- Do not become theatrical or vague
- Never predict absolute outcomes; frame everything as a tendency under current conditions
- End with grounded action, not only mood
- Free layer: 90-130 words
- Paid layer: 220-320 words`;
}

function buildUserPrompt(params: GenerateReadingParams) {
  if (params.readingType === "love") {
    const { locale, layer, userInput, computedResults } = params;

    if (locale === "zh") {
      return layer === "free"
        ? `用户信息：
- 称呼：${userInput.name || "未提供"}
- 当前关系阶段：${userInput.relationshipStage || "未提供"}
- 问题：${userInput.question || "未提供"}
- 你的命宫：${computedResults.loveCompatibility.yourPalace}
- 对方命宫：${computedResults.loveCompatibility.theirPalace}
- 匹配结论：${computedResults.loveCompatibility.matchHeadline}
- 说明：${computedResults.loveCompatibility.matchNote}

请写一段简洁的 Love Reading 免费层结果：
1. 先说这组关系的基本匹配氛围
2. 再结合用户问题点出现在最值得注意的地方
3. 语气沉稳，不要故作神秘，不要分点。`
        : `用户信息：
- 称呼：${userInput.name || "未提供"}
- 当前关系阶段：${userInput.relationshipStage || "未提供"}
- 问题：${userInput.question || "未提供"}
- 你的命宫：${computedResults.loveCompatibility.yourPalace}
- 对方命宫：${computedResults.loveCompatibility.theirPalace}
- 匹配结论：${computedResults.loveCompatibility.matchHeadline}
- 说明：${computedResults.loveCompatibility.matchNote}

请写一段更完整的 Love Reading 深层结果：
1. 说明这组关系的匹配性质
2. 点出它可能轻松的地方与费力的地方
3. 提一条现实中的关系提醒
不要分点，不要写成教程。`;
    }

    return layer === "free"
      ? `User details:
- Name: ${userInput.name || "Not provided"}
- Relationship stage: ${userInput.relationshipStage || "Not provided"}
- Question: ${userInput.question || "Not provided"}
- Your palace: ${computedResults.loveCompatibility.yourPalace}
- Their palace: ${computedResults.loveCompatibility.theirPalace}
- Match result: ${computedResults.loveCompatibility.matchHeadline}
- Note: ${computedResults.loveCompatibility.matchNote}

Write a concise free-layer Love Reading:
1. Explain the baseline compatibility tone
2. Point to what matters most in the user's current question
Do not use bullets.`
      : `User details:
- Name: ${userInput.name || "Not provided"}
- Relationship stage: ${userInput.relationshipStage || "Not provided"}
- Question: ${userInput.question || "Not provided"}
- Your palace: ${computedResults.loveCompatibility.yourPalace}
- Their palace: ${computedResults.loveCompatibility.theirPalace}
- Match result: ${computedResults.loveCompatibility.matchHeadline}
- Note: ${computedResults.loveCompatibility.matchNote}

Write a deeper Love Reading:
1. Explain the nature of the compatibility
2. Point out where this connection may feel easy versus effortful
3. Give one grounded relationship reminder
No bullets and no absolute prediction.`;
  }

  const { locale, layer, userInput, computedResults } = params;

  if (locale === "zh") {
    return layer === "free"
      ? `用户信息：
- 称呼：${userInput.name || "未提供"}
- 询问事项：${userInput.question || "未提供"}
- 起念时间：${userInput.momentTime}
- 小六壬结果：${computedResults.xiaoLiuRen.deity}
- 核心含义：${computedResults.xiaoLiuRen.meaning}
- 行动提醒：${computedResults.xiaoLiuRen.advice}

请输出一段免费层 Moment Reading：
1. 先解释当前局势
2. 再点出此刻最该注意的时机和动作
3. 结尾留一句自然的 deeper insight 引导
不要分点。`
      : `用户信息：
- 称呼：${userInput.name || "未提供"}
- 询问事项：${userInput.question || "未提供"}
- 起念时间：${userInput.momentTime}
- 小六壬结果：${computedResults.xiaoLiuRen.deity}（${computedResults.xiaoLiuRen.meaning}）
- 小六壬建议：${computedResults.xiaoLiuRen.advice}
- 婚配方位：${computedResults.marriageDirection?.primaryDirection || "未提供"} / ${computedResults.marriageDirection?.secondaryDirection || "未提供"}

请给出 Moment Reading 深层结果：
1. 当前局势判断
2. 最该注意的阻力或转机
3. 现实动作建议
不要分点，不要过度承诺。`;
  }

  return layer === "free"
    ? `User details:
- Name: ${userInput.name || "Not provided"}
- Question: ${userInput.question || "Not provided"}
- Moment of inquiry: ${userInput.momentTime}
- Xiao Liu Ren result: ${computedResults.xiaoLiuRen.deity}
- Meaning: ${computedResults.xiaoLiuRen.meaning}
- Advice: ${computedResults.xiaoLiuRen.advice}

Write a concise free-layer Moment Reading:
1. Explain the current situation
2. Point out the timing or action cue that matters most
3. End with a subtle invitation toward deeper insight
Do not use bullets.`
    : `User details:
- Name: ${userInput.name || "Not provided"}
- Question: ${userInput.question || "Not provided"}
- Moment of inquiry: ${userInput.momentTime}
- Xiao Liu Ren result: ${computedResults.xiaoLiuRen.deity} (${computedResults.xiaoLiuRen.meaning})
- Xiao Liu Ren advice: ${computedResults.xiaoLiuRen.advice}
- Direction note: ${computedResults.marriageDirection?.primaryDirection || "Not provided"} / ${computedResults.marriageDirection?.secondaryDirection || "Not provided"}

Write a deeper Moment Reading:
1. Explain the present situation
2. Identify the main friction or opening
3. Give grounded next-step advice
No bullets, no headings, no absolute prediction.`;
}

function buildFallbackText(params: GenerateReadingParams) {
  if (params.readingType === "love") {
    const { locale, userInput, computedResults } = params;
    const nameLead =
      userInput.name && locale === "zh"
        ? `${userInput.name}，`
        : userInput.name
          ? `${userInput.name}, `
          : "";

    if (locale === "zh") {
      return `${nameLead}从当前命宫匹配看，你是 ${computedResults.loveCompatibility.yourPalace}，对方是 ${computedResults.loveCompatibility.theirPalace}，这组关系目前更接近“${computedResults.loveCompatibility.matchHeadline}”。这不代表一切已经被决定，但它说明你们更可能以怎样的方式感到轻松，或在哪些地方更容易需要额外用力。先别急着把情绪波动当成结论，先把这段关系放回真实互动里去看。`;
    }

    return `${nameLead}the current palace match places you at ${computedResults.loveCompatibility.yourPalace} and the other person at ${computedResults.loveCompatibility.theirPalace}, which makes this connection read as ${computedResults.loveCompatibility.matchHeadline.toLowerCase()}. That does not decide the relationship for you, but it does suggest the kind of effort, ease, or friction this bond may naturally carry. Before turning one emotional moment into a verdict, place the connection back into the reality of how you actually meet one another.`;
  }

  const { locale, layer, userInput, computedResults } = params;
  const nameLead =
    userInput.name && locale === "zh"
      ? `${userInput.name}，`
      : userInput.name
        ? `${userInput.name}, `
        : "";

  if (locale === "zh") {
    if (layer === "free") {
      return `${nameLead}你这次起念时落在「${computedResults.xiaoLiuRen.deity}」，说明眼前这件事真正要看的，不只是表面进展，而是时机和节奏是否已经站稳。${computedResults.xiaoLiuRen.meaning} 这类信号往往提醒人别急着把一时波动当成最终答案。先看清当前势头，再决定是继续推进、稍作停顿，还是先收住动作。`;
    }

    return `${nameLead}从这次起念的卦象看，眼前这件事并不是没有动静，而是正在被一种更深的节奏牵引。${computedResults.xiaoLiuRen.deity} 提醒你，真正该判断的不是你此刻有多急，而是事情本身有没有到了可以顺势推进的时候。今天更合适的，不是强行逼结果，而是先做一件更稳、更实的动作，再看局势如何回应你。`;
  }

  if (layer === "free") {
    return `${nameLead}your question opens under ${computedResults.xiaoLiuRen.deity}, which suggests the matter should be read through timing and momentum rather than surface emotion alone. The signal here is ${computedResults.xiaoLiuRen.meaning.toLowerCase()}, so before forcing an answer, pay attention to the current pattern and the steadiness of the opening.`;
  }

  return `${nameLead}the present reading suggests that this matter is being shaped by timing, friction, and how steadily it can move in the real world. ${computedResults.xiaoLiuRen.deity} points to a pattern that becomes clearer when you stop forcing resolution and start reading the rhythm underneath the situation. Choose the next action that is steadier and more grounded, then watch what responds.`;
}

export async function generateReadingText(params: GenerateReadingParams) {
  const client = getClient();

  if (!client) {
    return buildFallbackText(params);
  }

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
    max_output_tokens: params.layer === "free" ? 300 : 800,
  });

  const text = response.output_text?.trim();

  return text || buildFallbackText(params);
}
