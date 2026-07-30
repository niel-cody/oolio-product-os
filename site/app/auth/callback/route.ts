import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAllowed } from "@/lib/auth-allowlist";

/**
 * Where the magic link lands. Exchanges the one-time code for a session, checks the
 * allowlist a second time, and forwards to wherever the person was originally headed.
 *
 * The allowlist is checked here as well as in the middleware on purpose. This route is what
 * mints the session, so checking here means a non-allowed address never holds a valid
 * session even momentarily, rather than holding one until its first gated request.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app/today";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
  }

  if (!isAllowed(data.user?.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?denied=1`);
  }

  // Only ever redirect to a path on this origin. An open redirect here would let a crafted
  // magic link bounce a freshly authenticated person to someone else's site.
  const target = next.startsWith("/") && !next.startsWith("//") ? next : "/app/today";
  return NextResponse.redirect(`${origin}${target}`);
}
