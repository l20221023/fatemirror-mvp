import { LUNAR_LIBRARY } from "../lunar-converter";
import { MARRIAGE_DIRECTION_ALGORITHM_VERSION } from "../marriage-direction";
import { MING_GUA_ALGORITHM_VERSION } from "../ming-gong";
import { XIAOLIU_REN_ALGORITHM_VERSION } from "../xiaoliu-ren";

export type MethodName =
  | "xiaoliu-ren"
  | "ming-gua"
  | "ming-gua-match"
  | "marriage-direction";

export type MethodMeta = {
  method: MethodName;
  methodVersion: string;
  lunarAdapter?: string;
  lunarAdapterVersion?: string;
  calculatedAt: string;
};

const METHOD_VERSIONS: Record<MethodName, string> = {
  "xiaoliu-ren": XIAOLIU_REN_ALGORITHM_VERSION,
  "ming-gua": MING_GUA_ALGORITHM_VERSION,
  "ming-gua-match": MING_GUA_ALGORITHM_VERSION,
  "marriage-direction": MARRIAGE_DIRECTION_ALGORITHM_VERSION,
};

export function createMethodMeta(method: MethodName): MethodMeta {
  const usesLunar = method === "xiaoliu-ren" || method === "marriage-direction";

  return {
    method,
    methodVersion: METHOD_VERSIONS[method],
    calculatedAt: new Date().toISOString(),
    lunarAdapter: usesLunar ? LUNAR_LIBRARY.name : undefined,
    lunarAdapterVersion: usesLunar ? LUNAR_LIBRARY.version : undefined,
  };
}
