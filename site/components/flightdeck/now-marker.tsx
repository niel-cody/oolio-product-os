"use client";

import { useEffect, useState } from "react";

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/**
 * The "you are here" line on the day bar.
 *
 * Client-side and mounted-only on purpose. The current time is not in the snapshot, so
 * rendering it on the server would bake the build time into the page and, worse, produce a
 * hydration mismatch. It also correctly renders nothing when you open yesterday's snapshot
 * or look before the day starts.
 */
export function NowMarker({
  windowStart,
  windowEnd,
  forDate,
  timeZone,
}: {
  windowStart: string;
  windowEnd: string;
  forDate: string;
  timeZone: string;
}) {
  const [pct, setPct] = useState<number | null>(null);

  useEffect(() => {
    function update() {
      // Read the wall clock in the snapshot's timezone, not the viewer's. Opening this from
      // a hotel in London should still mark the Melbourne workday correctly.
      const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]));
      const today = `${parts.year}-${parts.month}-${parts.day}`;
      if (today !== forDate) return setPct(null);

      const start = toMinutes(windowStart);
      const end = toMinutes(windowEnd);
      const now = Number(parts.hour) * 60 + Number(parts.minute);
      if (now < start || now > end) return setPct(null);

      setPct(((now - start) / Math.max(end - start, 1)) * 100);
    }

    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [windowStart, windowEnd, forDate, timeZone]);

  if (pct === null) return null;
  return <div className="fd-now" style={{ left: `${pct}%` }} title="Now" />;
}
