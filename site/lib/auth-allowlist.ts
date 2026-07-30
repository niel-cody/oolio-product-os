/**
 * Who is allowed past the /app/* gate.
 *
 * V1 is one user (see `Flightdeck - V1 Scope and Prerequisites.md` §1), but the rule is
 * config rather than a hard-coded address, so adding the second person is an env change
 * and not a code change. Two gates, both of which must pass:
 *
 *   1. the address ends in an allowed domain, and
 *   2. the address is on the explicit list.
 *
 * The domain check alone is not enough. Supabase will happily send a magic link to any
 * address someone types into the form, so without the explicit list every @oolio.com
 * mailbox in the company could sign themselves in to Niel's day.
 */

const DEFAULT_DOMAINS = ["oolio.com"];

function parseList(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(/[,\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function allowedDomains(): string[] {
  const configured = parseList(process.env.FLIGHTDECK_ALLOWED_DOMAINS);
  return configured.length ? configured : DEFAULT_DOMAINS;
}

export function allowedEmails(): string[] {
  return parseList(process.env.FLIGHTDECK_ALLOWED_EMAILS);
}

export function isAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  const addr = email.trim().toLowerCase();

  const domainOk = allowedDomains().some((d) => addr.endsWith(`@${d}`));
  if (!domainOk) return false;

  const list = allowedEmails();
  // An empty list is a closed door, not an open one. A missing env var must never be the
  // reason someone gets in; it should be the reason nobody does, loudly and early.
  if (list.length === 0) return false;

  return list.includes(addr);
}
