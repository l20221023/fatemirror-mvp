import type { ExtendedAdviceResult } from "../types";

const PROHIBITED_PATTERNS = [
  /guaranteed/iu,
  /destined/iu,
  /soulmate/iu,
  /100%/u,
  /pregnan/iu,
  /medical/iu,
  /diagnos/iu,
  /disaster/iu,
  /death/iu,
  /investment return/iu,
  /pay to resolve/iu,
  /track their phone/iu,
  /force .* obey/iu,
  /revenge/iu,
  /definitely loves you/iu,
  /必然结婚/u,
  /必然分手/u,
  /正缘/u,
  /灾祸/u,
  /怀孕/u,
  /疾病/u,
  /付费化解/u,
  /去跟踪/u,
  /去控制/u,
  /去报复/u,
  /你已经知道对方真实心理/u,
] as const;

export function validateProhibitedAdviceContent(result: ExtendedAdviceResult) {
  const content = JSON.stringify(result);
  const violations = PROHIBITED_PATTERNS.filter((pattern) => pattern.test(content)).map(
    (pattern) => pattern.source,
  );

  return {
    valid: violations.length === 0,
    violations,
  };
}
