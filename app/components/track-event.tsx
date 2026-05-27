"use client";

import { useEffect } from "react";

type TrackEventProps = {
  eventName: string;
  page: string;
  relationshipStage?: string;
  metadata?: Record<string, unknown>;
};

export function TrackEvent({
  eventName,
  page,
  relationshipStage,
  metadata,
}: TrackEventProps) {
  useEffect(() => {
    void fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventName,
        page,
        relationshipStage,
        metadata,
      }),
      keepalive: true,
    }).catch(() => {
      // Quietly ignore analytics failures so the core reading flow stays smooth.
    });
  }, [eventName, metadata, page, relationshipStage]);

  return null;
}
