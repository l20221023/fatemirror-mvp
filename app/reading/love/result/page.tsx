import { redirect } from "next/navigation";

import { defaultLocale } from "../../../../lib/i18n";

export default function LegacyLoveResultRedirect() {
  redirect(`/${defaultLocale}/reading/love/result`);
}
