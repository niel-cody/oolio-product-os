/**
 * Fails if a real Flightdeck snapshot is anywhere it could be committed.
 *
 * Required by the V1 scope doc §2.2, which lists "a snapshot reaches the repo" as one of the
 * four things that could still go wrong. Git history is permanent and repository ownership
 * can change, as it did on 2026-07-30, so this has to hold before the first real snapshot
 * exists rather than after.
 *
 * Two rules:
 *   1. Nothing snapshot-shaped may live under data/ at all. That directory is committed and
 *      published to a public URL.
 *   2. Anything snapshot-shaped under fixtures/ must declare `_synthetic`. Fixtures are
 *      committed on purpose, so the question is not whether the file is there but whether
 *      its contents are invented.
 *
 * The test is structural rather than a filename rule, because the danger is a real snapshot
 * saved under an innocent name. Anything carrying the shape is checked, whatever it is
 * called. Rule 2 exists because the first fixture handed over was described as synthetic and
 * was not: it carried colleagues' names, the contents of private DMs, and customer venues.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const MARKERS = ["schema_version", "for_date", "panels", "generated_at"];

async function jsonFilesIn(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await jsonFilesIn(full)));
    else if (e.name.endsWith(".json")) out.push(full);
  }
  return out;
}

async function snapshotsIn(dir) {
  const found = [];
  for (const file of await jsonFilesIn(dir)) {
    let parsed;
    try {
      parsed = JSON.parse(await readFile(file, "utf8"));
    } catch {
      continue; // Malformed JSON is someone else's error to report.
    }
    if (parsed && typeof parsed === "object" && MARKERS.every((k) => k in parsed)) {
      found.push({ file: path.relative(process.cwd(), file), synthetic: "_synthetic" in parsed });
    }
  }
  return found;
}

const problems = [];

/**
 * A calendar read is the same class of secret as a snapshot: meeting subjects, the people in
 * the room, customer names, office locations. It arrives by a different route (the live
 * source writes `.calendar/events.json`, which is gitignored) so it needs its own shape
 * check, or a copy saved into a committed directory would sail past the rule above.
 */
async function calendarsIn(dir) {
  const found = [];
  for (const file of await jsonFilesIn(dir)) {
    let parsed;
    try {
      parsed = JSON.parse(await readFile(file, "utf8"));
    } catch {
      continue;
    }
    const events = parsed?.events;
    if (
      Array.isArray(events) &&
      events.length > 0 &&
      events.every((e) => e && typeof e === "object" && "startMs" in e && "title" in e)
    ) {
      found.push(path.relative(process.cwd(), file));
    }
  }
  return found;
}

for (const s of await snapshotsIn(path.join(process.cwd(), "data"))) {
  problems.push(`${s.file} — a snapshot must never live in data/, which is published`);
}

for (const s of await snapshotsIn(path.join(process.cwd(), "fixtures"))) {
  if (!s.synthetic) {
    problems.push(`${s.file} — snapshot-shaped but does not declare "_synthetic"`);
  }
}

for (const dir of ["data", "fixtures"]) {
  for (const file of await calendarsIn(path.join(process.cwd(), dir))) {
    problems.push(`${file} — calendar-shaped; a calendar read belongs in .calendar/ only`);
  }
}

if (problems.length > 0) {
  console.error("\n  Snapshot leak check failed:\n");
  for (const p of problems) console.error(`    ${p}`);
  console.error(
    "\n  Real snapshots and calendar reads carry names, email subjects, Slack messages,\n" +
      "  meeting titles and customer venues. Move the file out of the repo, or replace it\n" +
      '  with invented data carrying a "_synthetic" field. See the V1 scope doc, §2.2.\n',
  );
  process.exit(1);
}

console.log("  No real snapshots or calendar reads in data/ or fixtures/.");
