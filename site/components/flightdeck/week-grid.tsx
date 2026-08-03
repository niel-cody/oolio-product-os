import type { CalEvent, DayPlan } from "@/lib/flightdeck/calendar/types";
import { atLocalTime, clock12, dateKey, duration } from "@/lib/flightdeck/calendar/zone";
import { domainColour, domainLabel } from "./atoms";

/**
 * The week, drawn to scale.
 *
 * One column per day, positioned against a shared vertical time axis so a glance across the
 * row answers "when is everyone's Tuesday afternoon" without reading a single label. Free
 * windows are drawn as objects in their own right rather than as the absence of a meeting,
 * because the whole point of the view is to find them.
 */

const MINUTE = 60_000;
/** Vertical pixels per minute. 0.85 keeps a 12-hour day on one screen at laptop height. */
const SCALE = 0.85;

function minutesFrom(dayStartMs: number, ms: number): number {
  return Math.min(Math.max((ms - dayStartMs) / MINUTE, 0), 24 * 60);
}

function shortDay(date: string, timeZone: string): { dow: string; num: string } {
  const at = atLocalTime(date, 12, 0, timeZone);
  const dow = new Intl.DateTimeFormat("en-AU", { weekday: "short", timeZone }).format(at);
  const num = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", timeZone }).format(
    at,
  );
  return { dow, num };
}

function eventTitle(ev: CalEvent): string {
  // Outlook keeps a declined invitation on the calendar with the prefix intact. The prefix
  // is noise once showAs has already told us it takes no time.
  return ev.title.replace(/^(Declined|Accepted|Tentative):\s*/i, "");
}

function GradeLabel({ minutes }: { minutes: number }) {
  return <span className="fdw-free-label">{duration(minutes)}</span>;
}

interface Placed {
  ev: CalEvent;
  column: number;
  columns: number;
}

/**
 * Side-by-side placement for meetings that overlap.
 *
 * Double-booking is normal here, not an edge case: two standups start at noon most days.
 * Drawn full width they stack, and the one underneath vanishes, which turns a diary into a
 * diary that lies. Events are grouped into clusters of transitive overlap, then packed into
 * the fewest columns that keep them apart, the way a calendar app does it.
 */
function place(events: CalEvent[]): Placed[] {
  const out: Placed[] = [];
  let cluster: CalEvent[] = [];
  let clusterEnd = -Infinity;

  const flush = () => {
    if (cluster.length === 0) return;
    const lanes: number[] = []; // end time of the last event in each lane
    const assigned = cluster.map((ev) => {
      let lane = lanes.findIndex((end) => end <= ev.startMs);
      if (lane === -1) {
        lane = lanes.length;
        lanes.push(ev.endMs);
      } else {
        lanes[lane] = ev.endMs;
      }
      return { ev, column: lane };
    });
    for (const a of assigned) out.push({ ...a, columns: lanes.length });
    cluster = [];
    clusterEnd = -Infinity;
  };

  for (const ev of [...events].sort((a, b) => a.startMs - b.startMs || b.endMs - a.endMs)) {
    if (ev.startMs >= clusterEnd) flush();
    cluster.push(ev);
    clusterEnd = Math.max(clusterEnd, ev.endMs);
  }
  flush();
  return out;
}

export function WeekGrid({
  plans,
  timeZone,
  nowMs,
}: {
  plans: DayPlan[];
  timeZone: string;
  nowMs: number;
}) {
  // A single axis for every column, widened to hold whatever is actually scheduled. Clamped
  // to a sensible working range so one 6am flight does not squash the other four days.
  let top = 8 * 60;
  let bottom = 18 * 60;
  for (const plan of plans) {
    const dayStart = atLocalTime(plan.date, 0, 0, timeZone);
    for (const ev of plan.busy) {
      top = Math.min(top, minutesFrom(dayStart, ev.startMs));
      bottom = Math.max(bottom, minutesFrom(dayStart, ev.endMs));
    }
  }
  top = Math.floor(top / 60) * 60;
  bottom = Math.ceil(bottom / 60) * 60;
  const span = Math.max(bottom - top, 60);
  const height = span * SCALE;

  const ticks: number[] = [];
  for (let t = top; t <= bottom; t += 60) ticks.push(t);

  const pos = (dayStartMs: number, ms: number) => (minutesFrom(dayStartMs, ms) - top) * SCALE;

  return (
    <div className="fdw-grid" style={{ ["--fdw-h" as string]: `${height}px` }}>
      <div className="fdw-gutter">
        <div className="fdw-head" aria-hidden />
        <div className="fdw-axis">
          {ticks.map((t) => (
            <span key={t} className="fdw-tick" style={{ top: (t - top) * SCALE }}>
              {clock12(atLocalTime(plans[0].date, Math.floor(t / 60), t % 60, timeZone), timeZone)}
            </span>
          ))}
        </div>
      </div>

      {plans.map((plan) => {
        const dayStart = atLocalTime(plan.date, 0, 0, timeZone);
        const { dow, num } = shortDay(plan.date, timeZone);
        const isToday = plan.date === dateKey(nowMs, timeZone);
        // Only when it is both today and inside the drawn range. At 8pm the marker would
        // otherwise sit below the last hour drawn, pointing at nothing.
        const nowTop = pos(dayStart, nowMs);
        const showNow =
          nowMs >= dayStart && nowMs < dayStart + 24 * 60 * MINUTE && nowTop >= 0 && nowTop <= height;

        return (
          <div key={plan.date} className="fdw-col" data-off={!plan.isWorkday} data-today={isToday}>
            <div className="fdw-head">
              <div className="fdw-dow">{dow}</div>
              <div className="fdw-num">{num}</div>
              <div className="fdw-sum">
                {plan.busy.length === 0 ? (
                  <span className="fdw-clear">clear</span>
                ) : (
                  <>
                    {duration(plan.bookedMinutes)} booked
                    {plan.isWorkday && plan.freeMinutes > 0 && (
                      <> · {duration(plan.freeMinutes)} free</>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="fdw-lane">
              {ticks.map((t) => (
                <div key={t} className="fdw-rule" style={{ top: (t - top) * SCALE }} />
              ))}

              {/* Working hours as a lit region, so out-of-hours meetings read as out of hours. */}
              {plan.isWorkday && (
                <div
                  className="fdw-work"
                  style={{
                    top: pos(dayStart, plan.windowStartMs),
                    height: Math.max(
                      pos(dayStart, plan.windowEndMs) - pos(dayStart, plan.windowStartMs),
                      0,
                    ),
                  }}
                />
              )}

              {plan.free.map((w) => (
                <div
                  key={w.startMs}
                  className="fdw-free"
                  data-grade={w.grade}
                  style={{
                    top: pos(dayStart, w.startMs),
                    height: Math.max(pos(dayStart, w.endMs) - pos(dayStart, w.startMs), 0),
                  }}
                  title={`${clock12(w.startMs, timeZone)} to ${clock12(w.endMs, timeZone)} free, ${duration(w.minutes)}`}
                >
                  <GradeLabel minutes={w.minutes} />
                </div>
              ))}

              {place(plan.busy).map(({ ev, column, columns }) => {
                const t = pos(dayStart, ev.startMs);
                const h = Math.max(pos(dayStart, ev.endMs) - t, 9);
                const width = 100 / columns;
                return (
                  <div
                    key={ev.id}
                    className="fdw-ev"
                    data-tentative={ev.showAs === "tentative"}
                    data-compact={h < 30}
                    style={{
                      top: t,
                      height: h,
                      left: `calc(${column * width}% + 3px)`,
                      width: `calc(${width}% - 6px)`,
                      right: "auto",
                      borderLeftColor: domainColour(ev.domain),
                    }}
                    title={`${clock12(ev.startMs, timeZone)}–${clock12(ev.endMs, timeZone)} ${eventTitle(ev)}${
                      ev.domain ? ` · ${domainLabel(ev.domain)}` : ""
                    }${ev.showAs === "tentative" ? " · tentative" : ""}`}
                  >
                    <span className="fdw-ev-time">{clock12(ev.startMs, timeZone)}</span>{" "}
                    <span className="fdw-ev-title">{eventTitle(ev)}</span>
                  </div>
                );
              })}

              {showNow && (
                <div className="fdw-now" style={{ top: nowTop }} aria-label="now" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
