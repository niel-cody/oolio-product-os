/**
 * Turning what the Outlook connector returns into Flightdeck's event shape.
 *
 * Shared by the sync script and, in spirit, by lib/flightdeck/calendar/graph.ts — the two
 * read the same fields from the same API and must agree, because a diary that means one
 * thing when collected on a Mac and another when read from Graph is worse than either.
 * Change one, change the other.
 */

const DOMAINS = new Set([
  "insights",
  "products-app",
  "inventory",
  "customer-engagement",
  "core-pos",
  "kiosk",
  "payments",
  "leadership",
]);

const SHOW_AS = new Set(["busy", "tentative", "free", "oof", "workingElsewhere", "unknown"]);

/**
 * The domain comes from the Outlook category, which is maintained by hand and looks like
 * "8. Domain – Insights". Note the en dash: the categories use both that and a plain hyphen,
 * so the separator class has to cover them or half the colour coding silently disappears.
 */
export function domainFrom(categories) {
  for (const raw of categories ?? []) {
    const match = /domain\s*[-–—:]\s*(.+)$/i.exec(String(raw).trim());
    if (!match) continue;
    const slug = match[1]
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (DOMAINS.has(slug)) return slug;
  }
  return null;
}

/**
 * The connector reports a wall time and names the zone beside it, and it uses UTC. Anything
 * without an offset therefore gets "Z". Drop this and every event silently shifts by the
 * mailbox offset, which is the kind of bug that looks like a scheduling mistake for weeks.
 */
function instant(part) {
  if (!part?.dateTime) return NaN;
  const raw = part.dateTime;
  const iso = /(Z|[+-]\d{2}:?\d{2})$/.test(raw) ? raw : `${raw}Z`;
  return new Date(iso).getTime();
}

/**
 * `attendees` may be the connector's full array or just a count.
 *
 * The collector is a Claude session transcribing tool output to disk, so every field it has
 * to copy costs tokens and is a chance to get something wrong. Only the number is ever used
 * downstream, so the compact form the collector emits sends the number, and the raw form
 * still works unchanged for a hand-run against pasted output.
 */
function attendeeCount(value) {
  if (Array.isArray(value)) return value.length;
  return Number.isFinite(value) ? Number(value) : 0;
}

export function toCalEvent(ev) {
  return {
    id: ev.id,
    title: (ev.subject ?? "").trim() || "(no subject)",
    startMs: instant(ev.start),
    endMs: instant(ev.end),
    allDay: Boolean(ev.isAllDay),
    showAs: SHOW_AS.has(ev.showAs) ? ev.showAs : "unknown",
    organiser: Boolean(ev.isOrganizer),
    cancelled: Boolean(ev.isCancelled),
    domain: domainFrom(ev.categories),
    attendees: attendeeCount(ev.attendees),
    location: (typeof ev.location === "string" ? ev.location : ev.location?.displayName) || null,
    webLink: ev.webLink ?? null,
  };
}

/** Accepts a JSON array or newline-delimited objects, which is how results arrive pasted. */
export function parseInput(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) return JSON.parse(trimmed);
  return trimmed
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

/**
 * Parse, convert, drop non-events, deduplicate, sort.
 *
 * The pagination markers ({moreResults, nextOffset}) travel with the results and are not
 * events. Recurring series arrive once per occurrence with distinct ids, but overlapping
 * queries return the same occurrence twice, and without the dedupe every standup renders as
 * two blocks stacked on each other.
 */
export function eventsFrom(text) {
  const raw = parseInput(text);
  const events = raw
    .filter((ev) => ev && ev.id && ev.start && ev.end)
    .map(toCalEvent)
    .filter((ev) => Number.isFinite(ev.startMs) && Number.isFinite(ev.endMs));

  const byId = new Map();
  for (const ev of events) byId.set(ev.id, ev);
  return [...byId.values()].sort((a, b) => a.startMs - b.startMs);
}
