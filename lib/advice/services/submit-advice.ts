import { generateAdvice } from "../generate-advice";
import type { AdviceGenerateRequest } from "../types";
import { persistAdviceReport } from "./create-report";
import type { AdviceProvider } from "../providers/types";
import type { AdviceEntitlementType } from "../repository/types";

export type SubmitAdviceInput = {
  input: AdviceGenerateRequest;
  provider?: AdviceProvider;
  betaAccessGranted?: boolean;
  aiRequestAllowed?: boolean;
  entitlementType?: AdviceEntitlementType;
  cohortId?: string | null;
};

export async function submitAdvice({
  input,
  provider,
  betaAccessGranted,
  aiRequestAllowed,
  entitlementType,
  cohortId,
}: SubmitAdviceInput) {
  const result = await generateAdvice(input, provider, {
    betaAccessGranted,
    aiRequestAllowed,
  });

  const persisted = await persistAdviceReport({
    report: result.report,
    input,
    cohortId,
    diagnostics: result.diagnostics,
    entitlementType,
  });

  return {
    report: result.report,
    meta: result.meta,
    reportId: persisted.reportId,
    accessToken: persisted.accessToken,
    diagnostics: result.diagnostics,
  };
}

export type SubmittedAdviceResponse = Awaited<ReturnType<typeof submitAdvice>>;
