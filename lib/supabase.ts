import { createClient } from "@supabase/supabase-js";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export type EventInsert = {
  session_id: string | null;
  event_name:
    | "landing_view"
    | "start_reading_click"
    | "reading_submitted"
    | "unlock_deeper_insight_click"
    | "waitlist_joined";
  page: string | null;
  relationship_stage: string | null;
  metadata: Record<string, JsonValue>;
};

export type WaitlistInsert = {
  email: string;
  session_id: string | null;
  relationship_stage: string | null;
  heart_question: string | null;
  source: string;
  metadata: Record<string, JsonValue>;
};

export function isSupabaseConfigured() {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY,
  );
}

export function getSupabaseServerClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
