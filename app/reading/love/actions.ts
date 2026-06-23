"use server";

import { defaultLocale, hasLocale } from "../../../lib/i18n";
import { createReadingRecord, touchSession } from "../../../lib/reading-store";
import { getOrCreateSessionId } from "../../../lib/session";
import { logReadingEvent, saveWaitlistSignup } from "../../../lib/tracking";
import { redirect } from "next/navigation";

const requiredFields = [
  "gender",
  "birthDate",
  "theirGender",
  "theirBirthDate",
  "relationshipStage",
  "heartQuestion",
] as const;

const optionalFields = [
  "name",
] as const;

/**
 * @deprecated Legacy server-action compatibility entrypoint.
 * Route new submissions through localized routes and API handlers instead.
 */
export async function submitLoveReading(formData: FormData) {
  const sessionId = await getOrCreateSessionId();
  const requestedLocale = formData.get("locale")?.toString().trim() ?? "";
  const locale = hasLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const params = new URLSearchParams();
  const eventMetadata: Record<string, string> = {};

  await touchSession(sessionId, locale);

  for (const field of requiredFields) {
    const value = formData.get(field)?.toString().trim() ?? "";
    if (!value) {
      redirect(`/${locale}/reading/love?error=missing`);
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
    readingType: "love",
    userInput: {
      name: eventMetadata.name ?? "",
      gender: eventMetadata.gender ?? "",
      birthDate: eventMetadata.birthDate ?? "",
      theirGender: eventMetadata.theirGender ?? "",
      theirBirthDate: eventMetadata.theirBirthDate ?? "",
      relationshipStage: eventMetadata.relationshipStage ?? "",
      heartQuestion: eventMetadata.heartQuestion ?? "",
    },
  });

  if (readingId) {
    params.set("rid", readingId);
  }

  await logReadingEvent({
    eventName: "reading_submitted",
    sessionId,
    page: `/${locale}/reading/love`,
    relationshipStage: eventMetadata.relationshipStage ?? null,
    metadata: {
      hasHeartQuestion: Boolean(eventMetadata.heartQuestion),
      birthDateProvided: Boolean(eventMetadata.birthDate),
      theirBirthDateProvided: Boolean(eventMetadata.theirBirthDate),
      locale,
    },
  });

  redirect(`/${locale}/reading/love/result?${params.toString()}`);
}

/**
 * @deprecated Legacy server-action compatibility entrypoint.
 * Route new unlock flows through localized routes only.
 */
export async function joinWaitlist(formData: FormData) {
  const sessionId = await getOrCreateSessionId();
  const requestedLocale = formData.get("locale")?.toString().trim() ?? "";
  const locale = hasLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const email = formData.get("email")?.toString().trim() ?? "";
  const params = new URLSearchParams();
  const relationshipStage =
    formData.get("relationshipStage")?.toString().trim() ?? "";
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
    page: `/${locale}/reading/love/result`,
    relationshipStage: relationshipStage || null,
    metadata: {
      hasEmail: Boolean(email),
      locale,
    },
  });

  if (email) {
    params.set("email", email);
    params.set("joined", "1");

    await saveWaitlistSignup({
      email,
      sessionId,
      relationshipStage: relationshipStage || null,
      heartQuestion: heartQuestion || null,
      metadata: {
        origin: "result_unlock",
      },
    });

    await logReadingEvent({
      eventName: "waitlist_joined",
      sessionId,
      page: `/${locale}/reading/love/result`,
      relationshipStage: relationshipStage || null,
      metadata: {
        locale,
        source: "love_result_unlock",
      },
    });
  } else {
    params.set("joinError", "missing");
  }

  redirect(`/${locale}/reading/love/result?${params.toString()}`);
}
