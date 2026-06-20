"use server";

import { redirect } from "next/navigation";

import { hasLocale, type Locale } from "../lib/i18n";
import { getOrCreateSessionId } from "../lib/session";
import { logReadingEvent } from "../lib/tracking";

export async function startReading(
  locale: Locale,
  source: string,
  pagePath: string,
  destinationPath: string,
) {
  const sessionId = await getOrCreateSessionId();
  const safeLocale = hasLocale(locale) ? locale : "en";

  await logReadingEvent({
    eventName: "start_reading_click",
    sessionId,
    page: pagePath,
    metadata: {
      locale: safeLocale,
      source,
    },
  });

  redirect(`/${safeLocale}${destinationPath}`);
}
