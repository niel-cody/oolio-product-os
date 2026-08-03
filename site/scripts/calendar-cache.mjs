/**
 * Write the local calendar cache from an Outlook read.
 *
 * The bridge between "a Claude session can see the calendar" and "the website can". It
 * exists because the Entra app registration is still an open IT request (V1 scope §2.1,
 * prerequisite 2) and the availability view should not sit empty until that lands. Once
 * GRAPH_* is configured the site reads Graph directly on every request and this script stops
 * being on the critical path; keep it, because it is also how you reproduce a bad day's
 * layout offline without hammering Graph.
 *
 * Usage, from a session that has the Microsoft connector authorised:
 *
 *   node scripts/calendar-cache.mjs < events.json
 *
 * Input is either a JSON array or newline-delimited JSON objects, each in the shape the
 * Outlook connector returns. Output is site/.calendar/events.json, which is gitignored and
 * covered by `npm run check` — it holds real meeting titles and real colleagues, so it must
 * never be committed.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), ".calendar");
const OUT_FILE = path.join(OUT_DIR, "events.json");

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

/** Mirrors domainFromCategories in lib/flightdeck/calendar/graph.ts. Keep the two in step. */
function domainFrom(categories) {
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

const SHOW_AS = new Set(["busy", "tentative", "free", "oof", "workingElsewhere", "unknown"]);

function instant(part) {
  if (!part?.dateTime) return NaN;
  const raw = part.dateTime;
  // The connector reports the zone alongside the wall time. Anything not already carrying an
  // offset is in the named zone, and the connector uses UTC, so "Z" is the right suffix.
  const iso = /(Z|[+-]\d{2}:?\d{2})$/.test(raw) ? raw : `${raw}Z`;
  return new Date(iso).getTime();
}

function toCalEvent(ev) {
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
    attendees: Array.isArray(ev.attendees) ? ev.attendees.length : 0,
    location: (typeof ev.location === "string" ? ev.location : ev.location?.displayName) || null,
    webLink: ev.webLink ?? null,
  };
}

function parseInput(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) return JSON.parse(trimmed);
  // Newline-delimited, which is how the connector's results arrive when pasted verbatim.
  return trimmed
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const raw = parseInput(Buffer.concat(chunks).toString("utf8"));

// Pagination markers ({moreResults, nextOffset}) travel with the results and are not events.
const events = raw
  .filter((ev) => ev && ev.id && ev.start && ev.end)
  .map(toCalEvent)
  .filter((ev) => Number.isFinite(ev.startMs) && Number.isFinite(ev.endMs));

// Recurring series arrive once per occurrence with distinct ids, but overlapping queries
// return the same occurrence twice. Deduplicate, or every standup renders as two blocks.
const byId = new Map();
for (const ev of events) byId.set(ev.id, ev);
const unique = [...byId.values()].sort((a, b) => a.startMs - b.startMs);

await mkdir(OUT_DIR, { recursive: true });
await writeFile(
  OUT_FILE,
  `${JSON.stringify({ fetchedAtMs: Date.now(), events: unique }, null, 2)}\n`,
  "utf8",
);

const span =
  unique.length > 0
    ? `${new Date(unique[0].startMs).toISOString().slice(0, 10)} to ${new Date(
        unique[unique.length - 1].endMs,
      )
        .toISOString()
        .slice(0, 10)}`
    : "empty";
console.log(`  Wrote ${unique.length} events (${span}) to .calendar/events.json`);
