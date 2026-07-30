import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
// dashboard.schema.json declares draft 2020-12. Ajv's default export only understands
// draft-07 and fails at compile time with "no schema with key or ref", so the 2020 build is
// the right entry point, not an optimisation.
import Ajv2020 from "ajv/dist/2020.js";
import type { ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import type { Snapshot } from "./types";

/**
 * Loading and validating a day's snapshot.
 *
 * M1 reads the committed synthetic fixture from disk. M2 swaps `readSnapshotBytes` for a
 * blob-storage fetch and nothing else here changes; validation and the renderer stay put.
 *
 * Validation is not ceremony. The collector is a Claude session rather than a deterministic
 * script (build spec §5), so a malformed or half-written snapshot is a realistic Tuesday.
 * Better a loud failure than a page that silently renders four of six panels.
 */

const FIXTURES_DIR = path.join(process.cwd(), "fixtures");

let validator: ValidateFunction<Snapshot> | null = null;

async function getValidator(): Promise<ValidateFunction<Snapshot>> {
  if (validator) return validator;
  const schemaRaw = await readFile(path.join(FIXTURES_DIR, "dashboard.schema.json"), "utf8");
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  validator = ajv.compile<Snapshot>(JSON.parse(schemaRaw));
  return validator;
}

export class SnapshotInvalid extends Error {
  constructor(public readonly problems: string[]) {
    super(`Snapshot failed validation:\n${problems.join("\n")}`);
    this.name = "SnapshotInvalid";
  }
}

async function readSnapshotBytes(date: string): Promise<string | null> {
  try {
    return await readFile(path.join(FIXTURES_DIR, `${date}.json`), "utf8");
  } catch {
    return null;
  }
}

/** Parse and validate. Returns null when there is no snapshot for that date. */
export async function loadSnapshot(date: string): Promise<Snapshot | null> {
  // Reject anything that is not a plain ISO date before it reaches the filesystem. The date
  // comes from the URL, so without this `/app/d/..%2f..%2fetc%2fpasswd` is a path traversal.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const raw = await readSnapshotBytes(date);
  if (raw === null) return null;

  const parsed: unknown = JSON.parse(raw);
  const validate = await getValidator();

  if (!validate(parsed)) {
    const problems = (validate.errors ?? []).map(
      (e) => `  ${e.instancePath || "/"} ${e.message ?? "is invalid"}`,
    );
    throw new SnapshotInvalid(problems);
  }

  return parsed;
}

/**
 * The most recent snapshot available.
 *
 * M1 has exactly one fixture, so "latest" is "the only one". Written as a scan rather than a
 * constant so that M2, which will have a directory of real snapshots, does not need to
 * change the calling pages.
 */
export async function latestSnapshotDate(): Promise<string | null> {
  const { readdir } = await import("node:fs/promises");
  try {
    const files = await readdir(FIXTURES_DIR);
    const dates = files
      .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .map((f) => f.replace(/\.json$/, ""))
      .sort();
    return dates.at(-1) ?? null;
  } catch {
    return null;
  }
}
