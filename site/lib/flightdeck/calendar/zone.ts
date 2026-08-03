/**
 * Wall-clock arithmetic in a named timezone, without a date library.
 *
 * Everything downstream stores instants as milliseconds since the epoch and converts to
 * local wall time only at the edges. That is deliberate: a calendar spans a DST boundary
 * twice a year, and Melbourne shifts an hour on the first Sunday in April and October. Doing
 * the maths on "hours since midnight" instead of on instants gets those two days wrong, and
 * gets them wrong quietly, which is the worst way for a diary to be wrong.
 *
 * The offset is derived by formatting the instant in the target zone and reading the result
 * back as though it were UTC. The difference between the two is the offset at that instant,
 * which is the only way to ask Intl a question it does not otherwise answer.
 */

export interface WallParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const cache = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string): Intl.DateTimeFormat {
  let f = cache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    cache.set(timeZone, f);
  }
  return f;
}

/** The wall-clock reading a person in `timeZone` would see at instant `ms`. */
export function partsAt(ms: number, timeZone: string): WallParts {
  const out: Record<string, number> = {};
  for (const p of formatter(timeZone).formatToParts(new Date(ms))) {
    if (p.type !== "literal") out[p.type] = Number(p.value);
  }
  // hour12:false renders midnight as "24" in some ICU versions and "00" in others.
  if (out.hour === 24) out.hour = 0;
  return out as unknown as WallParts;
}

/** Zone offset in milliseconds at `ms`. Positive east of Greenwich, so +10h in Melbourne. */
export function offsetAt(ms: number, timeZone: string): number {
  const p = partsAt(ms, timeZone);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - ms;
}

/**
 * The instant at which the clock in `timeZone` reads the given wall time.
 *
 * Two passes, because the offset needed to answer the question depends on the answer. The
 * first pass uses the offset at the naive guess, the second re-reads it at the corrected
 * instant, which settles the hour either side of a DST transition. Times that do not exist
 * (02:30 on the spring-forward morning) resolve to the instant the clock jumps to, and times
 * that happen twice resolve to the first.
 */
export function wallToMs(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): number {
  const naive = Date.UTC(year, month - 1, day, hour, minute);
  const once = naive - offsetAt(naive, timeZone);
  return naive - offsetAt(once, timeZone);
}

/** "2026-08-03" as read in `timeZone`. */
export function dateKey(ms: number, timeZone: string): string {
  const p = partsAt(ms, timeZone);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** Midnight starting the local day that contains `ms`. */
export function startOfDay(ms: number, timeZone: string): number {
  const p = partsAt(ms, timeZone);
  return wallToMs(p.year, p.month, p.day, 0, 0, timeZone);
}

/** Minutes since local midnight. Can exceed 1440 only if callers pass a later day's instant. */
export function minutesIntoDay(ms: number, timeZone: string): number {
  const p = partsAt(ms, timeZone);
  return p.hour * 60 + p.minute;
}

/** Local wall time on a given local date, as an instant. */
export function atLocalTime(
  dateKeyStr: string,
  hour: number,
  minute: number,
  timeZone: string,
): number {
  const [y, m, d] = dateKeyStr.split("-").map(Number);
  return wallToMs(y, m, d, hour, minute, timeZone);
}

/** 0 = Sunday, matching Date.prototype.getDay, but read in `timeZone`. */
export function weekdayAt(ms: number, timeZone: string): number {
  const p = partsAt(ms, timeZone);
  // Date.UTC of the local wall date gives a UTC instant whose UTC weekday is the local one.
  return new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay();
}

/** "9am", "2:30pm". The diary reads in twelves, so the display does too. */
export function clock12(ms: number, timeZone: string): string {
  const p = partsAt(ms, timeZone);
  const suffix = p.hour >= 12 ? "pm" : "am";
  const h = p.hour % 12 === 0 ? 12 : p.hour % 12;
  return p.minute === 0 ? `${h}${suffix}` : `${h}:${String(p.minute).padStart(2, "0")}${suffix}`;
}

/** "2h", "45m", "1h30". Durations are read at a glance, so they stay short. */
export function duration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}
