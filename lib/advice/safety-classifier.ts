import type { AdviceInput, SafetyClassification, SafetyFlagCode } from "./types";

type Rule = {
  code: SafetyFlagCode;
  severity: "high" | "medium";
  reason: string;
  patterns: RegExp[];
};

const SAFETY_RULES: Rule[] = [
  {
    code: "violence_or_threat",
    severity: "high",
    reason: "The input mentions violence, intimidation, or threats.",
    patterns: [/kill/i, /hurt\b/i, /beat\b/i, /threat/i, /violence/i, /打死|伤害|威胁|暴力|动手|砍/i],
  },
  {
    code: "self_harm",
    severity: "high",
    reason: "The input mentions self-harm or suicide risk.",
    patterns: [/suicid/i, /self[- ]harm/i, /kill myself/i, /die\b/i, /自杀|伤害自己|不想活|轻生/i],
  },
  {
    code: "stalking_or_surveillance",
    severity: "high",
    reason: "The input asks about tracking, surveillance, or invasive monitoring.",
    patterns: [/track\b/i, /monitor\b/i, /spy\b/i, /install.*camera/i, /定位|跟踪|监视|偷看手机|装摄像头/i],
  },
  {
    code: "coercion_or_control",
    severity: "high",
    reason: "The input asks for control, confinement, or coercive pressure.",
    patterns: [/control\b/i, /force\b/i, /trap\b/i, /make .* obey/i, /控制住|逼他|逼她|强迫|拿捏|关起来/i],
  },
  {
    code: "revenge_or_manipulation",
    severity: "high",
    reason: "The input asks for revenge, manipulation, or deliberate emotional harm.",
    patterns: [/revenge/i, /punish\b/i, /manipulat/i, /make .* jealous/i, /报复|操控|算计|让他后悔|让她后悔|刺激他|刺激她/i],
  },
  {
    code: "minor_related",
    severity: "high",
    reason: "The input mentions a minor or age-inappropriate relationship dynamics.",
    patterns: [/\bminor\b/i, /\bunderage\b/i, /\bchild\b/i, /\b14 years old\b/i, /未成年|初中生|高中生|小孩/i],
  },
  {
    code: "medical_or_pregnancy",
    severity: "medium",
    reason: "The input asks for medical or pregnancy judgment.",
    patterns: [/pregnan/i, /medical/i, /diagnos/i, /illness/i, /怀孕|流产|生病|诊断|治疗/i],
  },
  {
    code: "severe_delusion",
    severity: "high",
    reason: "The input suggests severe delusional or reality-detached claims.",
    patterns: [/chip in my brain/i, /government .*reading my thoughts/i, /voices told me/i, /脑控|读心术|有人在我脑子里|被外星人控制/i],
  },
];

function collectText(input: AdviceInput) {
  return [
    input.question,
    input.contextNotes ?? "",
    ...(input.knownDetails ?? []),
    ...(input.traditionalSignals?.map((item) => item.summary) ?? []),
  ]
    .join("\n")
    .trim();
}

export function classifySafety(input: AdviceInput): SafetyClassification[] {
  const text = collectText(input);
  const matches: SafetyClassification[] = [];

  for (const rule of SAFETY_RULES) {
    const matched = rule.patterns.find((pattern) => pattern.test(text));
    if (!matched) continue;

    matches.push({
      code: rule.code,
      severity: rule.severity,
      matchedText: matched.source,
      reason: rule.reason,
    });
  }

  return matches;
}

export function isHighRiskClassification(classification: SafetyClassification) {
  return classification.severity === "high";
}
