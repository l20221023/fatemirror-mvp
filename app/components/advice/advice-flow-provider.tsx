"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { AdviceFormDraft } from "../../../lib/advice/frontend";
import type { AdviceMeta, AdviceReport } from "../../../lib/advice/types";

type AdviceFlowResult = {
  report: AdviceReport;
  meta: AdviceMeta;
  notice?: string | null;
};

type AdviceFlowContextValue = {
  draft: AdviceFormDraft | null;
  result: AdviceFlowResult | null;
  setDraft: (draft: AdviceFormDraft) => void;
  setResult: (report: AdviceReport, meta: AdviceMeta, notice?: string | null) => void;
  clearReport: () => void;
  reset: () => void;
};

const AdviceFlowContext = createContext<AdviceFlowContextValue | null>(null);

export function AdviceFlowProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<AdviceFormDraft | null>(null);
  const [result, setResultState] = useState<AdviceFlowResult | null>(null);

  const value = useMemo<AdviceFlowContextValue>(
    () => ({
      draft,
      result,
      setDraft,
      setResult(report, meta, notice) {
        setResultState({ report, meta, notice });
      },
      clearReport() {
        setResultState(null);
      },
      reset() {
        setDraft(null);
        setResultState(null);
      },
    }),
    [draft, result],
  );

  return (
    <AdviceFlowContext.Provider value={value}>
      {children}
    </AdviceFlowContext.Provider>
  );
}

export function useAdviceFlow() {
  const context = useContext(AdviceFlowContext);

  if (!context) {
    throw new Error("AdviceFlowProvider is missing");
  }

  return context;
}
