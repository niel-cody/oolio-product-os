import {
  DEFAULT_WORKING_HOURS,
  MIN_USABLE_MINUTES,
  type CalEvent,
  type DayPlan,
  type FreeWindow,
  type Grade,
  type WorkingHours,
} from "./types";
import { atLocalTime, dateKey, weekdayAt } from "./zone";

/**
 * Turning a list of meetings into an answer to "when am I actually free".
 *
 * Pure functions over instants. No fetching, no clock reads except where a caller passes one
 * in, so the whole thing is reproducible: same events in, same plan out, which is what makes
 * a wrong answer diagnosable rather than a mystery.
 *
 * The judgement calls are all in one place on purpose:
 *   - what counts as busy (below)
 *   - what counts as a usable gap (MIN_USABLE_MINUTES)
 *   - what counts as a heavy day (loadOf)
 * Those are the three things likely to need tuning after a fortnight of real use.
 */

const MINUTE = 60_000;

/**
 * Does this event actually take the time?
 *
 * `showAs` is the honest field, not attendance status. Outlook sets a declined invitation to
 * `free` while leaving it on the calendar, so filtering on `showAs` handles declines without
 * a separate rule. All-day events are excluded from time arithmetic because they are almost
 * always markers, not commitments: a birthday should not consume the working day. They stay
 * in `events` so the day still shows them.
 */
export function takesTime(ev: CalEvent): boolean {
  if (ev.cancelled) return false;
  if (ev.allDay) return false;
  if (ev.showAs === "free") return false;
  if (ev.endMs <= ev.startMs) return false;
  return true;
}

function gradeOf(minutes: number): Grade {
  if (minutes >= 90) return "deep";
  if (minutes >= 50) return "solid";
  if (minutes >= MIN_USABLE_MINUTES) return "short";
  return "scrap";
}

interface Span {
  startMs: number;
  endMs: number;
}

/** Overlapping and touching meetings become one block of taken time. */
export function mergeSpans(spans: Span[]): Span[] {
  const sorted = [...spans].sort((a, b) => a.startMs - b.startMs);
  const out: Span[] = [];
  for (const s of sorted) {
    const last = out[out.length - 1];
    if (last && s.startMs <= last.endMs) {
      if (s.endMs > last.endMs) last.endMs = s.endMs;
    } else {
      out.push({ startMs: s.startMs, endMs: s.endMs });
    }
  }
  return out;
}

/** What is left of `[fromMs, toMs)` once `busy` is taken out of it. */
export function gapsBetween(fromMs: number, toMs: number, busy: Span[]): FreeWindow[] {
  const clipped = mergeSpans(
    busy
      .map((b) => ({ startMs: Math.max(b.startMs, fromMs), endMs: Math.min(b.endMs, toMs) }))
      .filter((b) => b.endMs > b.startMs),
  );

  const out: FreeWindow[] = [];
  let cursor = fromMs;
  for (const b of clipped) {
    if (b.startMs > cursor) out.push(windowOf(cursor, b.startMs));
    cursor = Math.max(cursor, b.endMs);
  }
  if (cursor < toMs) out.push(windowOf(cursor, toMs));
  return out;
}

function windowOf(startMs: number, endMs: number): FreeWindow {
  const minutes = Math.round((endMs - startMs) / MINUTE);
  return { startMs, endMs, minutes, grade: gradeOf(minutes) };
}

/**
 * The longest stretch of meetings with nothing usable between them.
 *
 * This is the number that predicts how a day feels, more than the total booked does. Four
 * hours of meetings with a break in the middle is a normal day; four hours without one is
 * the day you come out of unable to think.
 */
function longestRun(busy: Span[]): number {
  let best = 0;
  let runStart: number | null = null;
  let runEnd = 0;
  for (const b of busy) {
    if (runStart !== null && b.startMs - runEnd < MIN_USABLE_MINUTES * MINUTE) {
      runEnd = Math.max(runEnd, b.endMs);
    } else {
      if (runStart !== null) best = Math.max(best, runEnd - runStart);
      runStart = b.startMs;
      runEnd = b.endMs;
    }
  }
  if (runStart !== null) best = Math.max(best, runEnd - runStart);
  return Math.round(best / MINUTE);
}

function loadOf(bookedMinutes: number, windowMinutes: number, isWorkday: boolean): DayPlan["load"] {
  if (!isWorkday && bookedMinutes === 0) return "CLEAR";
  if (bookedMinutes === 0) return "CLEAR";
  const share = windowMinutes > 0 ? bookedMinutes / windowMinutes : 0;
  if (share >= 0.85) return "PUNISHING";
  if (share >= 0.6) return "HEAVY";
  if (share >= 0.35) return "MODERATE";
  return "LIGHT";
}

function hhmm(value: string): [number, number] {
  const [h, m] = value.split(":").map(Number);
  return [h, m];
}

/** One day, planned. `events` may cover any range; anything outside the day is ignored. */
export function planDay(
  date: string,
  events: CalEvent[],
  timeZone: string,
  hours: WorkingHours = DEFAULT_WORKING_HOURS,
): DayPlan {
  const [sh, sm] = hhmm(hours.start);
  const [eh, em] = hhmm(hours.end);
  const windowStartMs = atLocalTime(date, sh, sm, timeZone);
  const windowEndMs = atLocalTime(date, eh, em, timeZone);
  const dayStartMs = atLocalTime(date, 0, 0, timeZone);
  const dayEndMs = dayStartMs + 24 * 60 * MINUTE;

  const onDay = events
    .filter((ev) => ev.startMs < dayEndMs && ev.endMs > dayStartMs)
    .sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs);

  const busy = onDay.filter(takesTime);
  const busySpans = mergeSpans(busy.map((ev) => ({ startMs: ev.startMs, endMs: ev.endMs })));

  const weekday = weekdayAt(dayStartMs, timeZone);
  const isWorkday = hours.days.includes(weekday);

  // Meetings scheduled outside working hours are still real. The window governs where
  // availability is offered; the span governs what gets drawn, so a 7pm flight still appears.
  const spanStartMs = Math.min(windowStartMs, ...busySpans.map((b) => b.startMs), windowStartMs);
  const spanEndMs = Math.max(windowEndMs, ...busySpans.map((b) => b.endMs), windowEndMs);

  const bookedMinutes = Math.round(
    busySpans.reduce((sum, b) => sum + (b.endMs - b.startMs), 0) / MINUTE,
  );

  // Availability is only offered inside working hours, and only on working days. Reporting
  // 10pm as free is technically true and useless; reporting the whole of Saturday as eight
  // free hours is technically true and actively misleading, because it reads as an invitation.
  const free = isWorkday
    ? gapsBetween(windowStartMs, windowEndMs, busySpans).filter((w) => w.grade !== "scrap")
    : [];
  const freeMinutes = free.reduce((sum, w) => sum + w.minutes, 0);
  const longestFree = free.reduce<FreeWindow | null>(
    (best, w) => (best === null || w.minutes > best.minutes ? w : best),
    null,
  );

  const windowMinutes = Math.round((windowEndMs - windowStartMs) / MINUTE);

  return {
    date,
    weekday,
    isWorkday,
    windowStartMs,
    windowEndMs,
    spanStartMs,
    spanEndMs,
    events: onDay,
    busy,
    free,
    bookedMinutes,
    freeMinutes,
    longestFree,
    longestRunMinutes: longestRun(busySpans),
    load: loadOf(bookedMinutes, windowMinutes, isWorkday),
  };
}

/** Consecutive local dates from `fromMs`, inclusive, `count` of them. */
export function dateRange(fromMs: number, count: number, timeZone: string): string[] {
  const out: string[] = [];
  let cursor = fromMs;
  for (let i = 0; i < count; i++) {
    const key = dateKey(cursor, timeZone);
    out.push(key);
    // Step by 26 hours from local midnight, then re-derive: crossing a DST edge changes the
    // real length of a day, so adding exactly 24h lands on the wrong date twice a year.
    cursor = atLocalTime(key, 0, 0, timeZone) + 26 * 60 * MINUTE;
  }
  return out;
}

export function planRange(
  dates: string[],
  events: CalEvent[],
  timeZone: string,
  hours: WorkingHours = DEFAULT_WORKING_HOURS,
): DayPlan[] {
  return dates.map((d) => planDay(d, events, timeZone, hours));
}

/**
 * The next usable gap from `nowMs` onward, across the planned days.
 *
 * A window already under way counts, trimmed to what is left of it, because "you have 40
 * minutes right now" is the single most useful thing this page can say.
 */
export function nextFree(
  plans: DayPlan[],
  nowMs: number,
): { window: FreeWindow; date: string } | null {
  for (const plan of plans) {
    if (!plan.isWorkday) continue;
    for (const w of plan.free) {
      if (w.endMs <= nowMs) continue;
      if (w.startMs >= nowMs) return { window: w, date: plan.date };
      const remaining = Math.round((w.endMs - nowMs) / MINUTE);
      if (remaining >= MIN_USABLE_MINUTES) {
        return { window: windowOf(nowMs, w.endMs), date: plan.date };
      }
    }
  }
  return null;
}

/** What is happening at `nowMs`, if anything. */
export function currentEvent(plans: DayPlan[], nowMs: number): CalEvent | null {
  for (const plan of plans) {
    for (const ev of plan.busy) {
      if (ev.startMs <= nowMs && ev.endMs > nowMs) return ev;
    }
  }
  return null;
}
