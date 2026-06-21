import type { Locale } from "./i18n";
import { getSupabaseServerClient, type JsonValue } from "./supabase";

function isPersistenceEnabled() {
  return process.env.ENABLE_READING_PERSISTENCE === "true";
}

export type ReadingRecord = {
  id: string;
  session_id: string;
  locale: Locale;
  reading_type: string;
  user_input: JsonValue;
  computed: JsonValue | null;
  ai_free: string | null;
  ai_paid: string | null;
  is_paid: boolean | null;
  paid_at: string | null;
  created_at: string;
};

type CreateReadingInput = {
  sessionId: string;
  locale: Locale;
  readingType: "love" | "moment";
  userInput: Record<string, JsonValue>;
};

export async function touchSession(sessionId: string, locale: Locale) {
  if (!isPersistenceEnabled()) {
    return;
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return;
  }

  const { error } = await supabase.from("sessions").upsert(
    {
      id: sessionId,
      locale,
      last_seen: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("Failed to touch session", error);
  }
}

export async function createReadingRecord({
  sessionId,
  locale,
  readingType,
  userInput,
}: CreateReadingInput) {
  if (!isPersistenceEnabled()) {
    return null;
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("readings")
    .insert({
      session_id: sessionId,
      locale,
      reading_type: readingType,
      user_input: userInput,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create reading record", error);
    return null;
  }

  return (data?.id as string | undefined) ?? null;
}

export async function getReadingRecord(readingId?: string | null) {
  if (!readingId) {
    return null;
  }

  if (!isPersistenceEnabled()) {
    return null;
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("readings")
    .select("*")
    .eq("id", readingId)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch reading record", error);
    return null;
  }

  return (data as ReadingRecord | null) ?? null;
}

type SaveReadingAnalysisInput = {
  readingId: string;
  computed?: JsonValue;
  aiFree?: string;
  aiPaid?: string;
};

export async function saveReadingAnalysis({
  readingId,
  computed,
  aiFree,
  aiPaid,
}: SaveReadingAnalysisInput) {
  if (!isPersistenceEnabled()) {
    return;
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return;
  }

  const payload: Record<string, JsonValue | string> = {};

  if (computed !== undefined) {
    payload.computed = computed;
  }

  if (typeof aiFree === "string") {
    payload.ai_free = aiFree;
  }

  if (typeof aiPaid === "string") {
    payload.ai_paid = aiPaid;
  }

  const { error } = await supabase.from("readings").update(payload).eq("id", readingId);

  if (error) {
    console.error("Failed to save reading analysis", error);
  }
}
