import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAllowed } from "@/lib/auth-allowlist";
import { isGated } from "@/lib/routes";

/**
 * The gate.
 *
 * Everything in `GATED` (see lib/routes.ts, which explains why each route is on the list)
 * requires a signed-in, allow-listed account. The landing page and the sign-in page stay
 * public, and they are the only two that are.
 *
 * Two distinct failures, deliberately handled differently:
 *   - no session at all  -> /login, with ?next= so you land where you were headed
 *   - session, not allowed -> /login?denied=1, and the session is destroyed on the way out
 * The second case must not silently redirect to a sign-in form, because the person IS signed
 * in; leaving the session alive would loop them straight back through the gate.
 */
export async function middleware(request: NextRequest) {
  // Belt and braces. The matcher below should mean this never runs on a public path, but a
  // matcher that fails to constrain does not fail loudly: it runs the middleware everywhere,
  // and /login redirecting to /login is an infinite loop that takes the whole site down.
  // This check makes that outcome impossible regardless of what the matcher does.
  if (!isGated(request.nextUrl.pathname)) return NextResponse.next({ request });

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
  // These MUST be string literals. Next.js statically analyses `matcher` at build time, and
  // a computed value (an imported constant, a .map(), a template string) is not ignored with
  // a warning — the constraint is silently dropped and the middleware runs on every request,
  // including /login, which loops. Learned the hard way on 2026-07-31.
  //
  // Keep this list in step with GATED in lib/routes.ts, which is the one that documents why
  // each route is on it. The isGated() guard above is what actually enforces the boundary.
  matcher: [
    "/app",
    "/app/:path*",
    "/map",
    "/map/:path*",
    "/skills",
    "/skills/:path*",
    "/systems",
    "/systems/:path*",
    "/changelog",
    "/changelog/:path*",
  ],
};
