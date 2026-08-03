import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CalEvent, CalendarFetch, CalendarSource } from "./types";
import { graphConfigFromEnv, graphSource } from "./graph";
import { supabaseSource } from "./supabase";

/**
 * Choosing where the calendar comes from.
 *
 * Three sources, tried in order, each a strictly better answer than the next:
 *
 *   1. graph     — Outlook read live, per request. Needs the Entra registration.
 *   2. supabase  — what a collector last landed in the store. Needs a Mac to have run.
 *   3. cache     — a local JSON file. Development, and offline reproduction of a bad day.
 *
 * The order is the whole switching mechanism. Today nothing is configured for Graph, so the
 * site runs on the store; the day the four GRAPH_* variables are set it starts reading
 * Outlook directly, on the next request, with no code change and no redeploy of anything but
 * the environment. Nothing downstream knows or cares which one answered, except the page
 * footer, which says so.
 *
 * "Better" here means fresher, and freshness is the only axis that matters for availability.
 * A source that errors or has never been written to is skipped rather than allowed to render
 * a confidently empty week.
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

function availableSources(): CalendarSource[] {
  const cfg = graphConfigFromEnv();
  return [...(cfg ? [graphSource(cfg)] : []), supabaseSource(), cacheSource()];
}

/**
 * The first source that answers, or the last one's failure if none do.
 *
 * Returning the final error rather than a synthetic one keeps the page honest: it names the
 * source it fell all the way through to and why that failed, which is what tells you whether
 * the collector has stopped running or the store is unreachable.
 */
export async function fetchCalendar(fromMs: number, toMs: number): Promise<CalendarFetch> {
  let last: CalendarFetch | null = null;
  for (const source of availableSources()) {
    const result = await source.fetchRange(fromMs, toMs);
    if (!result.provenance.error) return result;
    last = result;
  }
  return (
    last ?? {
      events: [],
      provenance: { source: "cache", fetchedAtMs: 0, error: "no calendar source is configured" },
    }
  );
}

export function isGraphConfigured(): boolean {
  return graphConfigFromEnv() !== null;
}
