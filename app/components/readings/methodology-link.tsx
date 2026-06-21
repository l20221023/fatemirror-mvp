import Link from "next/link";

import type { Locale } from "../../../lib/i18n";

export function MethodologyLink({
  locale,
  hash,
}: {
  locale: Locale;
  hash?: string;
}) {
  return (
    <Link
      href={`/${locale}/methodology${hash ? `#${hash}` : ""}`}
      className="inline-flex text-sm text-[color:var(--color-accent)] transition hover:text-[color:var(--color-accent-soft)]"
    >
      {locale === "zh" ? "查看方法说明" : "View methodology"}
    </Link>
  );
}
