/**
 * Land an Outlook read in the calendar store.
 *
 * This is the collector's write half. The read half is a Claude session, because until the
 * Entra registration exists a Claude session with the Microsoft connector is the only thing
 * that can see the diary at all. The session queries Outlook and pipes the result here:
 *
 *   node scripts/calendar-sync.mjs --from 2026-08-03 --to 2026-08-17 < events.json
 *
 * Two targets, both optional, and it reports which it wrote:
 *   - the local file .calendar/events.json, always, for development and offline work
 *   - Supabase, when credentials are present, which is what the deployed site reads
 *
 * Credentials come from ~/.flightdeck-collector.env, never from this repo. The service-role
 * key bypasses row-level security, so it is the one secret here that genuinely matters:
 * chmod 600, outside the working tree, same handling as the JPD Insights token.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { eventsFrom } from "./lib/outlook-events.mjs";

const OUT_DIR = path.join(process.cwd(), ".calendar");
const OUT_FILE = path.join(OUT_DIR, "events.json");
const ENV_FILE = path.join(homedir(), ".flightdeck-collector.env");

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

/** A deliberately small dotenv: KEY=value, # comments, no interpolation, no dependency. */
async function loadEnvFile() {
  let text;
  try {
    text = await readFile(ENV_FILE, "utf8");
  } catch {
    return {};
  }
  const out = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

function isoDay(value, endOfDay = false) {
  // Accepts "2026-08-03" or a full ISO instant. A bare date means local midnight, and for
  // --to it means the end of that day, so `--from X --to X` is one whole day rather than none.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = new Date(`${value}T00:00:00`);
    if (endOfDay) d.setDate(d.getDate() + 1);
    return d.toISOString();
  }
  return new Date(value).toISOString();
}

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const events = eventsFrom(Buffer.concat(chunks).toString("utf8"));

// --- local file -------------------------------------------------------------------------
await mkdir(OUT_DIR, { recursive: true });
await writeFile(
  OUT_FILE,
  `${JSON.stringify({ fetchedAtMs: Date.now(), events }, null, 2)}\n`,
  "utf8",
);
console.log(`  ${events.length} events written to .calendar/events.json`);

// --- Supabase ---------------------------------------------------------------------------
const env = { ...(await loadEnvFile()), ...process.env };
const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const owner = arg("owner", env.FLIGHTDECK_OWNER_EMAIL);

if (!url || !key) {
  console.log(`  Supabase skipped: no credentials in ${ENV_FILE}`);
  process.exit(0);
}
if (!owner) {
  console.error("  Supabase skipped: no --owner and no FLIGHTDECK_OWNER_EMAIL");
  process.exit(1);
}

// The queried window, not the window the results happen to span. The stale-row delete below
// is scoped to it, and scoping that to the returned events would make a week whose meetings
// were all cancelled delete nothing, leaving the cancelled ones on the page forever.
const rangeStart = isoDay(arg("from") ?? new Date().toISOString());
const rangeEnd = isoDay(arg("to") ?? new Date(Date.now() + 14 * 86_400_000).toISOString(), true);

const { createClient } = await import("@supabase/supabase-js");
const db = createClient(url, key, { auth: { persistSession: false } });

const ranAt = new Date().toISOString();
const rows = events.map((ev) => ({
  id: ev.id,
  owner_email: owner,
  title: ev.title,
  start_at: new Date(ev.startMs).toISOString(),
  end_at: new Date(ev.endMs).toISOString(),
  all_day: ev.allDay,
  show_as: ev.showAs,
  organiser: ev.organiser,
  cancelled: ev.cancelled,
  domain: ev.domain,
  attendees: ev.attendees,
  location: ev.location,
  web_link: ev.webLink,
  synced_at: ranAt,
}));

if (rows.length > 0) {
  const { error } = await db.from("calendar_events").upsert(rows, { onConflict: "id" });
  if (error) {
    console.error(`  Supabase upsert failed: ${error.message}`);
    process.exit(1);
  }
}

// Anything in the window this run did not see has been cancelled or moved. Upsert alone
// never removes, so without this a deleted meeting stays on the page indefinitely and the
// availability under it stays hidden. Done after the upsert, so there is no moment where the
// window is empty.
const { error: pruneError, count } = await db
  .from("calendar_events")
  .delete({ count: "exact" })
  .eq("owner_email", owner)
  .lt("start_at", rangeEnd)
  .gt("end_at", rangeStart)
  .lt("synced_at", ranAt);

if (pruneError) {
  console.error(`  Supabase prune failed: ${pruneError.message}`);
  process.exit(1);
}

const { error: runError } = await db.from("calendar_syncs").insert({
  owner_email: owner,
  range_start: rangeStart,
  range_end: rangeEnd,
  event_count: rows.length,
  source: "mcp-outlook",
});

if (runError) {
  console.error(`  Supabase run record failed: ${runError.message}`);
  process.exit(1);
}

console.log(
  `  Supabase: ${rows.length} upserted, ${count ?? 0} stale removed, ` +
    `window ${rangeStart.slice(0, 10)} to ${rangeEnd.slice(0, 10)}`,
);
