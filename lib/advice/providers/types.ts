import type { AdviceInput, AdviceProviderName, LocalAdviceResult } from "../types";

export type AdvicePrompt = {
  system: string;
  user: string;
};

export type AdviceProviderRequest = {
  model: string;
  timeoutMs: number;
  maxOutputTokens: number;
  prompt: AdvicePrompt;
  input: AdviceInput;
  localAdvice: LocalAdviceResult;
};

export type AdviceProviderResult = {
  provider: AdviceProviderName;
  model: string;
  content: string;
};

export interface AdviceProvider {
  readonly name: AdviceProviderName;
  isAvailable(): boolean;
  generate(request: AdviceProviderRequest): Promise<AdviceProviderResult>;
}
