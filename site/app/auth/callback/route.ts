import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { memberFor } from "@/lib/members";
import { canReach, homeFor } from "@/lib/routes";

/**
 * Where the magic link lands. Exchanges the one-time code for a session, checks membership
 * a second time, and forwards to wherever the person was originally headed.
 *
 * Membership is checked here as well as in the middleware on purpose. This route is what
 * mints the session, so checking here means a non-member never holds a valid session even
 * momentarily, rather than holding one until their first gated request.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
  }

  const member = await memberFor(supabase);

  if (!member) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?denied=1`);
  }

  // Best effort: this is the one moment the app reliably knows somebody showed up, and it is
  // worth recording for the admin screen, but a write that fails must never cost them their
  // sign-in. Through an RPC rather than a plain update, because members is admin-write-only
  // and a direct update would be silently discarded by RLS for every viewer and user.
  await supabase.rpc("touch_member_seen").then(undefined, () => undefined);

  // Only ever redirect to a path on this origin. An open redirect here would let a crafted
  // magic link bounce a freshly authenticated person to someone else's site. And only to a
  // path this role can actually reach, or a viewer following a Flightdeck link would arrive
  // at the gate and be told no by the site that just let them in.
  const wanted = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
  const target = wanted && canReach(member.role, wanted) ? wanted : homeFor(member.role);

  return NextResponse.redirect(`${origin}${target}`);
}

export const dynamic = "force-dynamic";
