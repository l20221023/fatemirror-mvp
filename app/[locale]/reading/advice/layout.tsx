import type { ReactNode } from "react";

import { AdviceFlowProvider } from "../../../components/advice/advice-flow-provider";

export default function AdviceFlowLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AdviceFlowProvider>{children}</AdviceFlowProvider>;
}
