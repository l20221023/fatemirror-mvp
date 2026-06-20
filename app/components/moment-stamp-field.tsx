"use client";

import { useState } from "react";

export function MomentStampField() {
  const [stamp] = useState(() => {
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, "0");
    const momentLocal = [
      now.getFullYear(),
      pad(now.getMonth() + 1),
      pad(now.getDate()),
    ].join("-") + `T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    return {
      momentIso: now.toISOString(),
      momentLocal,
    };
  });

  return (
    <>
      <input type="hidden" name="momentIso" value={stamp.momentIso} readOnly />
      <input
        type="hidden"
        name="momentLocal"
        value={stamp.momentLocal}
        readOnly
      />
    </>
  );
}
