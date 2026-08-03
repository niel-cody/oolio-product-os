import type { Domain } from "@/lib/flightdeck/types";

/**
 * The calendar contract.
 *
 * Deliberately separate from `Snapshot` in ../types.ts. The snapshot is a once-a-day
 * artefact produced by a ranking pass; the calendar is a live read that has to be right at
 * the moment you look at it. Availability computed from a five-hour-old snapshot is worse
 * than no availability at all, because it looks current. Two different freshness
 * requirements means two different pipelines, and this is the second one.
 */

/** Outlook's `showAs`, which is the field that decides whether time is really taken. */
export type ShowAs = "busy" | "tentative" | "free" | "oof" | "workingElsewhere" | "unknown";

export interface CalEvent {
  id: string;
  title: string;
  /** Instants, not wall clock. See ./zone.ts for why. */
  startMs: number;
  endMs: number;
  allDay: boolean;
  showAs: ShowAs;
  organiser: boolean;
  cancelled: boolean;
  /** Read from the Outlook category, which is already maintained by hand. */
  domain: Domain | null;
  attendees: number;
  location: string | null;
  webLink: string | null;
}

/**
 * Where a calendar read came from, and when. Shown on the page, never hidden.
 *
 * `fetchedAtMs` is when the data left Outlook, not when this process read it. For `graph`
 * those are the same instant; for `supabase` they are not, and the one that matters is the
 * collector's run. Reporting the read of a six-hour-old row as "just now" would be the exact
 * lie this field exists to prevent.
 */
export interface CalendarProvenance {
  source: "graph" | "supabase" | "cache";
  fetchedAtMs: number;
  /** Set when the source could not be reached, so the page can say so rather than show nothing. */
  error?: string;
}

export interface CalendarFetch {
  events: CalEvent[];
  provenance: CalendarProvenance;
}

/** A calendar backend. Two exist: live Graph, and a local cache used before Graph is wired. */
export interface CalendarSource {
  name: CalendarProvenance["source"];
  fetchRange(fromMs: number, toMs: number): Promise<CalendarFetch>;
}

/**
 * How long a gap has to be before it is worth anything.
 *
 * These are not arbitrary. A gap shorter than `short` cannot hold a task, only a coffee, and
 * offering it as availability is what turns a calendar into a machine for shredding the day.
 */
export type Grade = "deep" | "solid" | "short" | "scrap";

export interface FreeWindow {
  startMs: number;
  endMs: number;
  minutes: number;
  grade: Grade;
}

export interface DayPlan {
  /** Local date, "2026-08-03". */
  date: string;
  /** 0 = Sunday. */
  weekday: number;
  isWorkday: boolean;
  /** The working window for this day, as instants. */
  windowStartMs: number;
  windowEndMs: number;
  /** Widened to contain anything scheduled outside working hours. */
  spanStartMs: number;
  spanEndMs: number;
  events: CalEvent[];
  /** Events that take real time: not cancelled, not free, not all-day. */
  busy: CalEvent[];
  free: FreeWindow[];
  bookedMinutes: number;
  freeMinutes: number;
  longestFree: FreeWindow | null;
  /** Longest unbroken run of meetings with no usable gap between them. */
  longestRunMinutes: number;
  load: "CLEAR" | "LIGHT" | "MODERATE" | "HEAVY" | "PUNISHING";
}

export interface WorkingHours {
  /** Local wall time, "09:00". */
  start: string;
  end: string;
  /** Weekdays that count as working days. 0 = Sunday. */
  days: number[];
}

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  start: "09:00",
  end: "17:30",
  days: [1, 2, 3, 4, 5],
};

/** A gap shorter than this is noise, not availability. */
export const MIN_USABLE_MINUTES = 25;
