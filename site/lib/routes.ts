/**
 * What is public, and what is behind the gate.
 *
 * Public is the landing page and the sign-in page. Everything else requires an allow-listed
 * account. That is a deliberate tightening, made 2026-07-31, because the site is served to a
 * public URL from a private repo and was publishing more than it should:
 *
 *   - /systems mapped Oolio's entire internal tool estate (Granola, Slack, Microsoft 365,
 *     HubSpot, Apify, PostHog, Figma, Jira, Confluence, GitHub) and the data flows between
 *     them. That is a target list for anyone phishing Oolio.
 *   - /skills published all 32 internal playbooks in full, including their triggers.
 *   - /changelog published the engineering history, decisions and internal project keys.
 *   - /map published the whole lifecycle including every skill on it.
 *
 * None of that is catastrophic on its own; all of it is Oolio-internal by CLAUDE.md's own
 * description, and none of it needs to be readable by the open web.
 *
 * To put a route back on the public side, remove it from GATED. To let a teammate in, add
 * their address to FLIGHTDECK_ALLOWED_EMAILS in Vercel; no code change either way.
 */
export const GATED = ["/app", "/map", "/skills", "/systems", "/changelog"] as const;

// Note: middleware.ts repeats this list as string literals in its `config.matcher`, and has
// to. Next.js statically analyses that field at build time and silently drops the constraint
// if it is computed, which runs the middleware on every route. `isGated` below is the real
// enforcement; the matcher is only there to keep public requests off the auth path.

export function isGated(pathname: string): boolean {
  return GATED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
