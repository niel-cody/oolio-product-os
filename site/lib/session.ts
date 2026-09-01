import "server-only";
import { getMember } from "@/lib/members";

/**
 * Is the current request from a signed-in member?
 *
 * One place, so the header and the page it sits above can never disagree about whether you
 * are signed in — which they did briefly, showing the full nav over a "sign in" call to
 * action. `getMember` is cached per request, so the layout and the page share a single
 * verification rather than each paying for their own round trip.
 *
 * Note this is presentation only: it decides what to render, never what to permit. The gate
 * is middleware.ts, and it re-verifies independently. Nothing here is load-bearing for
 * access control. Prefer getMember() directly where the role matters.
 */
export async function getSignedIn(): Promise<boolean> {
  return (await getMember()) !== null;
}
