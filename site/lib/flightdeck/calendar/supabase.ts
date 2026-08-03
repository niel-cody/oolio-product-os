import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Domain } from "@/lib/flightdeck/types";
import type { CalEvent, CalendarFetch, CalendarSource, ShowAs } from "./types";

/**
 * Supabase as a calendar source.
 *
 * The store the collector writes to and the site reads from. It is what makes the week view
 * work with no Entra registration and no Graph credentials: the diary is read on a Mac,
 * where a Claude session already has the Microsoft connector, and landed here.
 *
 * Row-level security does the access control. The query below carries no `owner_email`
 * filter because the policy already restricts every row to the signed-in person's own
 * address; adding a filter here would be a second, weaker copy of a rule that is enforced in
 * the database.
 */

interface Row {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  all_day: boolean;
  show_as: string;
  organiser: boolean;
  cancelled: boolean;
  domain: string | null;
  attendees: number;
  location: string | null;
  web_link: string | null;
}

const SHOW_AS: ReadonlySet<string> = new Set([
  "busy",
  "tentative",
  "free",
  "oof",
  "workingElsewhere",
  "unknown",
]);

function rowToEvent(r: Row): CalEvent {
  return {
    id: r.id,
    title: r.title,
    startMs: new Date(r.start_at).getTime(),
    endMs: new Date(r.end_at).getTime(),
    allDay: r.all_day,
    showAs: SHOW_AS.has(r.show_as) ? (r.show_as as ShowAs) : "unknown",
    organiser: r.organiser,
    cancelled: r.cancelled,
    domain: (r.domain as Domain | null) ?? null,
    attendees: r.attendees,
    location: r.location,
    webLink: r.web_link,
  };
}

export function supabaseSource(): CalendarSource {
  return {
    name: "supabase",
    async fetchRange(fromMs, toMs): Promise<CalendarFetch> {
      try {
        const supabase = await createClient();

        const [events, syncs] = await Promise.all([
          supabase
            .from("calendar_events")
            .select("*")
            .lt("start_at", new Date(toMs).toISOString())
            .gt("end_at", new Date(fromMs).toISOString())
            .order("start_at", { ascending: true }),
          supabase
            .from("calendar_syncs")
            .select("ran_at")
            .order("ran_at", { ascending: false })
            .limit(1),
        ]);

        if (events.error) throw new Error(events.error.message);

        // No run on record means the collector has never written for this person, which is
        // different from "this week happens to be empty". Reported as an error so the caller
        // falls through to the next source instead of rendering a confidently blank week.
        const lastRun = syncs.data?.[0]?.ran_at;
        if (!lastRun) {
          return {
            events: [],
            provenance: {
              source: "supabase",
              fetchedAtMs: 0,
              error: "the collector has not run yet",
            },
          };
        }

        return {
          events: (events.data as Row[]).map(rowToEvent),
          provenance: { source: "supabase", fetchedAtMs: new Date(lastRun).getTime() },
        };
      } catch (err) {
        return {
          events: [],
          provenance: {
            source: "supabase",
            fetchedAtMs: 0,
            error: err instanceof Error ? err.message : String(err),
          },
        };
      }
    },
  };
}
