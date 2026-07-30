import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAllowed } from "@/lib/auth-allowlist";

/**
 * The gate.
 *
 * Everything under /app/* requires a signed-in, allow-listed account. Every public route
 * (the map, the skills browser, the changelog, the landing page) is untouched, which is a
 * V1 scope requirement, not a nicety: the public site is the front door for the whole team
 * and must keep working exactly as it did.
 *
 * Two distinct failures, deliberately handled differently:
 *   - no session at all  -> /login, with ?next= so you land where you were headed
 *   - session, not allowed -> /login?denied=1, and the session is destroyed on the way out
 * The second case must not silently redirect to a sign-in form, because the person IS signed
 * in; leaving the session alive would loop them straight back through the gate.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser(), not getSession(): getSession trusts the cookie, getUser verifies it with
  // the auth server. On a gate, trusting the cookie is the whole vulnerability.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (!isAllowed(user.email)) {
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("denied", "1");
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Only /app/*. Scoping the matcher this tightly is what keeps the public site out of the
  // auth path entirely: no Supabase call, no cookie work, no latency on the marketing pages.
  matcher: ["/app/:path*"],
};
