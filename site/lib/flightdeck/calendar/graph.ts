import "server-only";
import type { Domain } from "@/lib/flightdeck/types";
import type { CalEvent, CalendarFetch, CalendarSource, ShowAs } from "./types";

/**
 * Microsoft Graph as a calendar source.
 *
 * Delegated access, refreshed server-side. The site holds a long-lived refresh token for one
 * mailbox and exchanges it for an access token as needed; there is no per-request sign-in
 * dance, which means the collector and a cron job can use exactly this code path too.
 *
 * Four environment variables, none of which belong in the repo:
 *   GRAPH_TENANT_ID       the Oolio directory
 *   GRAPH_CLIENT_ID       the Entra app registration
 *   GRAPH_CLIENT_SECRET   its secret
 *   GRAPH_REFRESH_TOKEN   minted once, by hand, with the auth-code flow
 *
 * The registration needs delegated `Calendars.Read` and `offline_access`, and nothing else.
 * That is the same registration the V1 scope doc already asks IT for; the calendar scope is
 * an addition to an ask in flight rather than a second ask.
 */

const AUTH_HOST = "https://login.microsoftonline.com";
const GRAPH = "https://graph.microsoft.com/v1.0";

export interface GraphConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export function graphConfigFromEnv(): GraphConfig | null {
  const tenantId = process.env.GRAPH_TENANT_ID;
  const clientId = process.env.GRAPH_CLIENT_ID;
  const clientSecret = process.env.GRAPH_CLIENT_SECRET;
  const refreshToken = process.env.GRAPH_REFRESH_TOKEN;
  if (!tenantId || !clientId || !clientSecret || !refreshToken) return null;
  return { tenantId, clientId, clientSecret, refreshToken };
}

/**
 * Access tokens last an hour. Holding one in module scope means a page view usually costs a
 * single Graph call rather than two. The cache is per server instance and losing it is free.
 */
let cachedToken: { value: string; expiresAtMs: number } | null = null;

async function accessToken(cfg: GraphConfig): Promise<string> {
  if (cachedToken && cachedToken.expiresAtMs > Date.now() + 60_000) return cachedToken.value;

  const body = new URLSearchParams({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    grant_type: "refresh_token",
    refresh_token: cfg.refreshToken,
    scope: "offline_access Calendars.Read",
  });

  const res = await fetch(`${AUTH_HOST}/${cfg.tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    // The body carries Azure's error code (AADSTS…), which is the only thing that makes a
    // token failure diagnosable. Truncated because it can run to several hundred characters.
    const detail = (await res.text()).slice(0, 400);
    throw new Error(`token exchange failed (${res.status}): ${detail}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: json.access_token,
    expiresAtMs: Date.now() + json.expires_in * 1000,
  };
  return cachedToken.value;
}

const DOMAINS: ReadonlySet<string> = new Set<Domain>([
  "insights",
  "products-app",
  "inventory",
  "customer-engagement",
  "core-pos",
  "kiosk",
  "payments",
  "leadership",
]);

/**
 * Outlook categories already carry the domain, hand-maintained: "8. Domain – Insights".
 * Reading them beats inferring a domain from the meeting title, and it means the
 * classification stays under the diary owner's control rather than this code's.
 */
export function domainFromCategories(categories: string[] | null | undefined): Domain | null {
  for (const raw of categories ?? []) {
    const match = /domain\s*[-–—:]\s*(.+)$/i.exec(raw.trim());
    if (!match) continue;
    const slug = match[1]
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (DOMAINS.has(slug)) return slug as Domain;
  }
  return null;
}

interface GraphEvent {
  id: string;
  subject: string | null;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  isAllDay: boolean;
  isCancelled: boolean;
  isOrganizer: boolean;
  showAs: string | null;
  categories: string[] | null;
  location: { displayName?: string | null } | null;
  webLink: string | null;
  attendees: unknown[] | null;
}

const SHOW_AS: ReadonlySet<string> = new Set([
  "busy",
  "tentative",
  "free",
  "oof",
  "workingElsewhere",
  "unknown",
]);

/**
 * Graph returns `dateTime` without a zone suffix and names the zone alongside it. We ask for
 * UTC via the Prefer header, so appending "Z" is correct — but only because of that header.
 * Remove it and every event silently shifts by the mailbox offset.
 */
function instant(part: { dateTime: string; timeZone: string }): number {
  const raw = part.dateTime;
  const iso = /(Z|[+-]\d{2}:?\d{2})$/.test(raw) ? raw : `${raw}Z`;
  return new Date(iso).getTime();
}

export function toCalEvent(ev: GraphEvent): CalEvent {
  const showAs = ev.showAs && SHOW_AS.has(ev.showAs) ? (ev.showAs as ShowAs) : "unknown";
  return {
    id: ev.id,
    title: ev.subject?.trim() || "(no subject)",
    startMs: instant(ev.start),
    endMs: instant(ev.end),
    allDay: Boolean(ev.isAllDay),
    showAs,
    organiser: Boolean(ev.isOrganizer),
    cancelled: Boolean(ev.isCancelled),
    domain: domainFromCategories(ev.categories),
    attendees: ev.attendees?.length ?? 0,
    location: ev.location?.displayName?.trim() || null,
    webLink: ev.webLink ?? null,
  };
}

/**
 * `calendarView`, not `events`. The difference matters: `events` returns the recurrence
 * master and leaves you to expand the series yourself, so a weekly standup shows once a year
 * instead of every week. `calendarView` expands occurrences server-side over the window.
 */
export function graphSource(cfg: GraphConfig): CalendarSource {
  return {
    name: "graph",
    async fetchRange(fromMs, toMs): Promise<CalendarFetch> {
      const fetchedAtMs = Date.now();
      try {
        const token = await accessToken(cfg);
        const params = new URLSearchParams({
          startDateTime: new Date(fromMs).toISOString(),
          endDateTime: new Date(toMs).toISOString(),
          $select:
            "id,subject,start,end,isAllDay,isCancelled,isOrganizer,showAs,categories,location,webLink,attendees",
          $orderby: "start/dateTime",
          $top: "250",
        });

        const events: CalEvent[] = [];
        let url: string | null = `${GRAPH}/me/calendarView?${params}`;

        // Paginate. 250 is the practical ceiling per page and a fortnight can exceed it.
        while (url) {
          const res: Response = await fetch(url, {
            headers: {
              authorization: `Bearer ${token}`,
              // Without this, dateTime comes back in the mailbox zone and `instant()` is wrong.
              prefer: 'outlook.timezone="UTC"',
            },
            cache: "no-store",
          });
          if (!res.ok) {
            throw new Error(`calendarView failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
          }
          const page = (await res.json()) as {
            value: GraphEvent[];
            "@odata.nextLink"?: string;
          };
          events.push(...page.value.map(toCalEvent));
          url = page["@odata.nextLink"] ?? null;
        }

        return { events, provenance: { source: "graph", fetchedAtMs } };
      } catch (err) {
        return {
          events: [],
          provenance: {
            source: "graph",
            fetchedAtMs,
            error: err instanceof Error ? err.message : String(err),
          },
        };
      }
    },
  };
}
