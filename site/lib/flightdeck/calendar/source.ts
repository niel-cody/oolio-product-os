import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CalEvent, CalendarFetch, CalendarSource } from "./types";
import { graphConfigFromEnv, graphSource } from "./graph";

/**
 * Choosing where the calendar comes from.
 *
 * Graph when it is configured, and a local cache file when it is not. The cache exists so
 * the availability view is real and useful before the Entra registration lands, rather than
 * an empty shell waiting on IT. It is a bridge with a visible expiry date: every page that
 * renders from it says so, and says how old it is, because a stale diary that looks live is
 * worse than no diary.
 *
 * The cache file holds real meeting titles, colleagues and customers, so it is gitignored
 * and covered by the leak check. Same rule as snapshots, same reason: git history is
 * permanent and repository ownership can change.
 */

export const CACHE_PATH = path.join(process.cwd(), ".calendar", "events.json");

interface CacheFile {
  fetchedAtMs: number;
  events: CalEvent[];
}

function cacheSource(): CalendarSource {
  return {
    name: "cache",
    async fetchRange(fromMs, toMs): Promise<CalendarFetch> {
      try {
        const parsed = JSON.parse(await readFile(CACHE_PATH, "utf8")) as CacheFile;
        const events = (parsed.events ?? []).filter(
          (ev) => ev.startMs < toMs && ev.endMs > fromMs,
        );
        return {
          events,
          provenance: { source: "cache", fetchedAtMs: parsed.fetchedAtMs ?? 0 },
        };
      } catch (err) {
        return {
          events: [],
          provenance: {
            source: "cache",
            fetchedAtMs: 0,
            error:
              err instanceof Error && "code" in err && err.code === "ENOENT"
                ? "no calendar has been fetched yet"
                : err instanceof Error
                  ? err.message
                  : String(err),
          },
        };
      }
    },
  };
}

export function calendarSource(): CalendarSource {
  const cfg = graphConfigFromEnv();
  return cfg ? graphSource(cfg) : cacheSource();
}

export function isGraphConfigured(): boolean {
  return graphConfigFromEnv() !== null;
}
