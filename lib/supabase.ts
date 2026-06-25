import { createClient } from "@supabase/supabase-js";

import { isProductionLikeEnvironment } from "./runtime/environment";

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
    process.env.SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY),
  );
}

export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url) {
    return null;
  }

  if (serviceRoleKey) {
    return createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  if (!isProductionLikeEnvironment() && anonKey) {
    return createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return null;
}

export function getSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
