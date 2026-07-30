import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isAllowed } from "@/lib/auth-allowlist";

/**
 * Is the current request from an allow-listed, signed-in person?
 *
 * One place, so the header and the page it sits above can never disagree about whether you
 * are signed in — which they did briefly, showing the full nav over a "sign in" call to
 * action. Wrapped in React's `cache` so the layout and the page share a single verification
 * per request rather than each paying for their own round trip to the auth server.
 *
 * Note this is presentation only: it decides what to render, never what to permit. The gate
 * is middleware.ts, and it re-verifies independently. Nothing here is load-bearing for
 * access control.
 */
export const getSignedIn = cache(async (): Promise<boolean> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return isAllowed(user?.email);
});
