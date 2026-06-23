import { redirect } from "next/navigation";

import { defaultLocale } from "../../../lib/i18n";

/**
 * @deprecated Legacy compatibility redirect. Keep this shim for old links only.
 * Route new code to `/[locale]/reading/love`.
 */
export default function LegacyLoveFormRedirect() {
  redirect(`/${defaultLocale}/reading/love`);
}
