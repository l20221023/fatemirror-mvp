"use server";

import { redirect } from "next/navigation";

import { defaultLocale, hasLocale } from "../../../lib/i18n";
import { createReadingRecord, touchSession } from "../../../lib/reading-store";
import { getOrCreateSessionId } from "../../../lib/session";
import { logReadingEvent, saveWaitlistSignup } from "../../../lib/tracking";

const requiredFields = ["heartQuestion"] as const;

const optionalFields = ["name", "momentIso", "momentLocal"] as const;

/**
 * @deprecated Legacy server-action compatibility entrypoint.
 * Route new submissions through localized routes and API handlers instead.
 */
export async function submitMomentReading(formData: FormData) {
  const sessionId = await getOrCreateSessionId();
  const requestedLocale = formData.get("locale")?.toString().trim() ?? "";
  const locale = hasLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const params = new URLSearchParams();
  const eventMetadata: Record<string, string> = {};

  await touchSession(sessionId, locale);

  for (const field of requiredFields) {
    const value = formData.get(field)?.toString().trim() ?? "";
    if (!value) {
      redirect(`/${locale}/reading/moment?error=missing`);
    }
    params.set(field, value);
    eventMetadata[field] = value;
  }

  for (const field of optionalFields) {
    const value = formData.get(field)?.toString().trim() ?? "";
    if (value) {
      params.set(field, value);
      eventMetadata[field] = value;
    }
  }

  const readingId = await createReadingRecord({
    sessionId,
    locale,
    readingType: "moment",
    userInput: {
      name: eventMetadata.name ?? "",
      heartQuestion: eventMetadata.heartQuestion ?? "",
      momentIso: eventMetadata.momentIso ?? "",
      momentLocal: eventMetadata.momentLocal ?? "",
    },
  });

  if (readingId) {
    params.set("rid", readingId);
  }

  await logReadingEvent({
    eventName: "reading_submitted",
    sessionId,
    page: `/${locale}/reading/moment`,
    metadata: {
      locale,
      readingType: "moment",
      hasHeartQuestion: Boolean(eventMetadata.heartQuestion),
    },
  });

  redirect(`/${locale}/reading/moment/result?${params.toString()}`);
}

/**
 * @deprecated Legacy server-action compatibility entrypoint.
 * Route new unlock flows through localized routes only.
 */
export async function joinMomentWaitlist(formData: FormData) {
  const sessionId = await getOrCreateSessionId();
  const requestedLocale = formData.get("locale")?.toString().trim() ?? "";
  const locale = hasLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const email = formData.get("email")?.toString().trim() ?? "";
  const params = new URLSearchParams();
  const heartQuestion = formData.get("heartQuestion")?.toString().trim() ?? "";
  const readingId = formData.get("readingId")?.toString().trim() ?? "";

  await touchSession(sessionId, locale);

  for (const field of requiredFields) {
    const value = formData.get(field)?.toString().trim() ?? "";
    if (value) {
      params.set(field, value);
    }
  }

  for (const field of optionalFields) {
    const value = formData.get(field)?.toString().trim() ?? "";
    if (value) {
      params.set(field, value);
    }
  }

  if (readingId) {
    params.set("rid", readingId);
  }

  await logReadingEvent({
    eventName: "unlock_deeper_insight_click",
    sessionId,
    page: `/${locale}/reading/moment/result`,
    metadata: {
      hasEmail: Boolean(email),
      locale,
      readingType: "moment",
    },
  });

  if (email) {
    params.set("email", email);
    params.set("joined", "1");

    await saveWaitlistSignup({
      email,
      sessionId,
      heartQuestion: heartQuestion || null,
      source: "moment_result_unlock",
      metadata: {
        origin: "result_unlock",
      },
    });

    await logReadingEvent({
      eventName: "waitlist_joined",
      sessionId,
      page: `/${locale}/reading/moment/result`,
      metadata: {
        locale,
        source: "moment_result_unlock",
      },
    });
  } else {
    params.set("joinError", "missing");
  }

  redirect(`/${locale}/reading/moment/result?${params.toString()}`);
}
