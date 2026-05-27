import { NextResponse } from "next/server";

import { getOrCreateSessionId } from "../../../lib/session";
import { logReadingEvent } from "../../../lib/tracking";
import type { EventInsert } from "../../../lib/supabase";

const allowedEvents = new Set<EventInsert["event_name"]>(["landing_view"]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        eventName?: string;
        page?: string;
        relationshipStage?: string;
        metadata?: Record<string, unknown>;
      }
    | null;

  if (!body?.eventName || !allowedEvents.has(body.eventName as EventInsert["event_name"])) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const eventName = body.eventName as EventInsert["event_name"];

  const sessionId = await getOrCreateSessionId();

  await logReadingEvent({
    eventName,
    sessionId,
    page: body.page,
    relationshipStage: body.relationshipStage,
    metadata: body.metadata,
  });

  return NextResponse.json({ ok: true, sessionId });
}
