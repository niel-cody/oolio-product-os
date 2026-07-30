import type { Snapshot } from "@/lib/flightdeck/types";
import { domainColour, domainLabel } from "./atoms";
import { NowMarker } from "./now-marker";

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function label12h(mins: number): string {
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h24 >= 12 ? "pm" : "am";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, "0")}${suffix}`;
}

/**
 * The shape of the day.
 *
 * Positions are computed from the window and each event's real start and end. The prototype
 * hard-coded eleven percentages, which meant a snapshot with different meetings would have
 * drawn the wrong bar, silently. This is the same visual, driven by the data.
 */
export function DayBar({
  day,
  forDate,
  timeZone,
}: {
  day: Snapshot["day"];
  forDate: string;
  timeZone: string;
}) {
  const start = toMinutes(day.window.start);
  const end = toMinutes(day.window.end);
  const span = Math.max(end - start, 1);

  const pct = (mins: number) => ((mins - start) / span) * 100;

  // Ticks land on round hours, not on even fractions of the window. An 11.5-hour day split
  // six ways gives "10:55am" and "12:50pm", which are times nobody thinks in. Spacing is
  // chosen so a narrow screen gets fewer labels rather than overlapping ones.
  const everyHours = span > 8 * 60 ? 2 : 1;
  const firstTick = Math.ceil(start / (everyHours * 60)) * (everyHours * 60);
  const ticks: number[] = [];
  for (let t = firstTick; t <= end; t += everyHours * 60) ticks.push(t);

  return (
    <section className="mt-6">
      <div
        className="fd-track"
        role="img"
        aria-label={`Day load from ${label12h(start)} to ${label12h(end)}: ${day.events.length} blocks, ${day.booked_minutes} minutes booked`}
      >
        {day.events.map((ev) => {
          const s = toMinutes(ev.start);
          const e = toMinutes(ev.end);
          const free = ev.kind === "focus";
          return (
            <div
              key={ev.id}
              className="fd-blk"
              data-free={free}
              style={{
                left: `${pct(s)}%`,
                width: `${Math.max(((e - s) / span) * 100, 0.6)}%`,
                background: free ? undefined : domainColour(ev.domain),
                opacity: ev.attending === "tentative" ? 0.62 : 1,
              }}
              title={`${ev.start} ${ev.title}${ev.attending === "tentative" ? " (tentative)" : ""}${
                ev.domain ? ` · ${domainLabel(ev.domain)}` : ""
              }`}
            />
          );
        })}
        <NowMarker
          windowStart={day.window.start}
          windowEnd={day.window.end}
          forDate={forDate}
          timeZone={timeZone}
        />
      </div>

      {/* Positioned rather than space-between, so each label sits under the time it marks. */}
      <div className="fd-ticks relative h-4">
        {ticks.map((t) => (
          <span
            key={t}
            className="absolute -translate-x-1/2 whitespace-nowrap"
            style={{ left: `${Math.min(Math.max(pct(t), 2), 98)}%` }}
          >
            {label12h(t)}
          </span>
        ))}
      </div>

      <div className="mt-3.5 grid gap-0 sm:grid-cols-3">
        {day.acts.map((act, i) => (
          <div
            key={act.range}
            className={
              i === 0
                ? "sm:pr-4"
                : "mt-2.5 border-t border-[var(--fd-hair)] pt-2.5 sm:mt-0 sm:border-l sm:border-t-0 sm:px-4 sm:pt-0 last:sm:pr-0"
            }
          >
            <div className="text-[12px] font-semibold tracking-[0.03em]">{act.range}</div>
            <p className="mt-0.5 text-[13px] text-[var(--fd-ink-2)]">{act.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
