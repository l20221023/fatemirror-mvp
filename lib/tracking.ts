import {
  getSupabaseServerClient,
  type EventInsert,
  type JsonValue,
  type WaitlistInsert,
} from "./supabase";

type LogReadingEventInput = {
  eventName: EventInsert["event_name"];
  sessionId?: string | null;
  page?: string | null;
  relationshipStage?: string | null;
  metadata?: Record<string, unknown>;
};

type SaveWaitlistSignupInput = {
  email: string;
  sessionId?: string | null;
  relationshipStage?: string | null;
  heartQuestion?: string | null;
  source?: string;
  metadata?: Record<string, unknown>;
};

export async function logReadingEvent({
  eventName,
  sessionId = null,
  page = null,
  relationshipStage = null,
  metadata = {},
}: LogReadingEventInput) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return;
  }

  const payload: EventInsert = {
    session_id: sessionId,
    event_name: eventName,
    page,
    relationship_stage: relationshipStage,
    metadata: sanitizeMetadata(metadata),
  };

  const { error } = await supabase.from("fm_reading_events").insert(payload);

  if (error) {
    console.error("Failed to log reading event", error);
  }
}

export async function saveWaitlistSignup({
  email,
  sessionId = null,
  relationshipStage = null,
  heartQuestion = null,
  source = "love_result_unlock",
  metadata = {},
}: SaveWaitlistSignupInput) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return;
  }

  const payload: WaitlistInsert = {
    email: email.trim().toLowerCase(),
    session_id: sessionId,
    relationship_stage: relationshipStage,
    heart_question: heartQuestion,
    source,
    metadata: sanitizeMetadata(metadata),
  };

  const { error } = await supabase
    .from("fm_waitlist_signups")
    .upsert(payload, { onConflict: "email" });

  if (error) {
    console.error("Failed to save waitlist signup", error);
  }
}

function sanitizeMetadata(metadata: Record<string, unknown>): Record<string, JsonValue> {
  return Object.fromEntries(
    Object.entries(metadata).filter(([, value]) => isJsonValue(value)),
  ) as Record<string, JsonValue>;
}

function isJsonValue(value: unknown): value is
  | JsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every((item) => isJsonValue(item));
  }

  if (typeof value === "object") {
    return Object.values(value).every((item) => isJsonValue(item));
  }

  return false;
}
