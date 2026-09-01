import { meets, type Role } from "@/lib/roles";

/**
 * What is public, what needs an account, and what needs a particular role.
 *
 * Public is the landing page and the sign-in page. Everything else requires membership.
 * That is a deliberate tightening, made 2026-07-31, because the site is served to a public
 * URL and was publishing more than it should:
 *
 *   - /systems mapped Oolio's entire internal tool estate and the data flows between them.
 *     That is a target list for anyone phishing Oolio.
 *   - /skills published all 32 internal playbooks in full, including their triggers.
 *   - /changelog published the engineering history, decisions and internal project keys.
 *   - /map published the whole lifecycle including every skill on it.
 *
 * Roles arrived 2026-09-01 (see lib/members.ts). The reference surfaces are what a viewer
 * is for, so they sit at "viewer". Flightdeck is somebody's actual diary and the integrations
 * that feed it, so it sits at "user". Managing the list itself is "admin".
 *
 * To change who can reach a route, change its role here. This is the only table of it; the
 * middleware, the navigation and the pages all read from this, so they cannot drift apart
 * and quietly show a link that bounces.
 */
export const ROUTE_ROLES: ReadonlyArray<readonly [string, Role]> = [
  ["/app", "user"],
  ["/admin", "admin"],
  ["/map", "viewer"],
  ["/skills", "viewer"],
  ["/systems", "viewer"],
  ["/changelog", "viewer"],
  ["/about", "viewer"],
] as const;

// Note: middleware.ts repeats these prefixes as string literals in its `config.matcher`, and
// has to. Next.js statically analyses that field at build time and silently drops the
// constraint if it is computed, which runs the middleware on every route. `requiredRole`
// below is the real enforcement; the matcher only keeps public requests off the auth path.

/** The role a path demands, or null if it is public. Longest prefix wins. */
export function requiredRole(pathname: string): Role | null {
  let best: readonly [string, Role] | null = null;
  for (const entry of ROUTE_ROLES) {
    const [prefix] = entry;
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      if (!best || prefix.length > best[0].length) best = entry;
    }
  }
  return best ? best[1] : null;
}

export function isGated(pathname: string): boolean {
  return requiredRole(pathname) !== null;
}

/**
 * Where a role lands when it has not asked for anywhere in particular.
 *
 * A viewer has no Flightdeck, so sending everyone to /app/today after sign-in would bounce
 * a viewer straight back to /login as forbidden — which reads as a broken sign-in rather
 * than as a role they do not hold.
 */
export function homeFor(role: Role): string {
  return meets(role, "user") ? "/app/today" : "/map";
}

/** Can this role reach this path? Used by the navigation so links never bounce. */
export function canReach(role: Role | null, pathname: string): boolean {
  const needed = requiredRole(pathname);
  return needed === null || meets(role, needed);
}
