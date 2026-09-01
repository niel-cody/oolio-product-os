import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { memberFor } from "@/lib/members";
import { meets } from "@/lib/roles";
import { isGated, requiredRole } from "@/lib/routes";

/**
 * The gate.
 *
 * Everything in ROUTE_ROLES (see lib/routes.ts, which explains why each route sits where it
 * does) requires a signed-in member holding at least that role. The landing page and the
 * sign-in page stay public, and they are the only two that are.
 *
 * Three distinct failures, deliberately handled differently, because collapsing them makes
 * two of the three unfixable by the person hitting them:
 *   - no session at all      -> /login, with ?next= so you land where you were headed
 *   - session, not a member  -> /login?denied=1, and the session is destroyed on the way out
 *   - member, role too low   -> /login?forbidden=<role>, session left alone
 *
 * The second must not silently redirect to a sign-in form, because the person IS signed in;
 * leaving the session alive would loop them straight back through the gate. The third must
 * NOT destroy the session: they are a legitimate member who opened a door that is not
 * theirs, and signing them out of the pages they can use is a punishment for a mistyped URL.
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

  const { pathname, search } = request.nextUrl;

  // getUser() inside, not getSession(): getSession trusts the cookie, getUser verifies it
  // with the auth server, and on a gate trusting the cookie is the whole vulnerability.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  const member = await memberFor(supabase);

  if (!member) {
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("denied", "1");
    return NextResponse.redirect(url);
  }

  const needed = requiredRole(pathname);
  if (needed && !meets(member.role, needed)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("forbidden", needed);
    url.searchParams.set("as", member.role);
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
  // Keep this list in step with ROUTE_ROLES in lib/routes.ts, which is the one that documents
  // why each route sits where it does. The isGated() guard above is the real boundary.
  matcher: [
    "/app",
    "/app/:path*",
    "/admin",
    "/admin/:path*",
    "/map",
    "/map/:path*",
    "/skills",
    "/skills/:path*",
    "/systems",
    "/systems/:path*",
    "/changelog",
    "/changelog/:path*",
    "/about",
    "/about/:path*",
  ],
};
