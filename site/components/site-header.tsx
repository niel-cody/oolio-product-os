"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { GateMark } from "@/components/gate-mark";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { canReach } from "@/lib/routes";
import { ROLE_LABEL, type Role } from "@/lib/roles";

/**
 * Navigation is a function of whether you are signed in.
 *
 * Signed out there is nowhere to go but the landing page, because everything else is gated
 * (lib/routes.ts). Showing the full nav to a signed-out visitor would be five links that all
 * bounce to /login, which reads as a broken site rather than a private one. So signed out is
 * the wordmark and the two doors, and the nav appears once it can actually be used.
 *
 * Signed out, Install is the primary and Sign in the secondary, which is the reverse of what
 * this header used to do. Signing in gets a visitor the catalogue; installing gets them the
 * thing. An earlier version faded a lone Sign in button into the ribbon once the hero
 * scrolled away, because the hero was the only place a call to action existed; the rebuilt
 * landing page carries one in the hero, at the setup steps and at the foot, so the scroll
 * listener that drove it is gone.
 */
const NAV = [
  { href: "/app/today", label: "Flightdeck" },
  { href: "/map", label: "The Map" },
  { href: "/skills", label: "Skills" },
  { href: "/changelog", label: "Changelog" },
  { href: "/systems", label: "Systems" },
  { href: "/about", label: "About" },
  { href: "/admin", label: "Members" },
];

export function SiteHeader({
  stamp,
  skills,
  signedIn,
  role,
}: {
  stamp: string;
  skills: number;
  signedIn: boolean;
  role: Role | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Filtered by what this role can actually open, from the same table the gate reads
  // (lib/routes.ts). A link a viewer cannot follow is worse than a missing one: it looks
  // like the site is broken rather than like a door that is not theirs.
  const nav = NAV.filter((n) => canReach(role, n.href));

  // Flightdeck lives at /app/today but its dated pages are /app/d/…, so match the section
  // rather than the exact path or the tab goes dark as soon as you land on a real day.
  const active = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/app")) return pathname.startsWith("/app");
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-30 border-b-[1.5px] border-[var(--k)] bg-[var(--stock)]/92 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        {/* The house lockup: the Gate, then Pixie Dust Industries in Syne 800 uppercase.
            Not misregistered — the budget is one misregistration per screen and the hero
            spends it, so the header carries the clean plate. */}
        <Link href="/" className="flex items-center gap-[7px] shrink-0 lx-press" aria-label="Pixie Dust Industries">
          <GateMark size={19} className="text-[var(--k)]" />
          <span className="wordmark text-[14px] leading-none">Pixie Dust Industries</span>
        </Link>

        {signedIn && (
          <nav className="ml-4 hidden md:flex items-center gap-1">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-[13px] transition-colors",
                  active(n.href)
                    ? "bg-[var(--secondary)] text-[var(--ink)]"
                    : "text-[var(--muted-ink)] hover:text-[var(--ink)] hover:bg-[var(--secondary)]/60",
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-3">
          {signedIn ? (
            <>
              <span className="mono hidden lg:inline text-[9.5px] tracking-[0.14em] uppercase text-[var(--muted-ink)]">
                {role ? `${ROLE_LABEL[role]} · ` : ""}{skills} skills · {stamp}
              </span>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="hidden sm:inline-flex h-8 text-[12px]"
              >
                <a
                  href="https://github.com/niel-cody/oolio-product-os"
                  target="_blank"
                  rel="noreferrer"
                >
                  Install
                </a>
              </Button>
              {/* A POST, so a link prefetch or a preview crawler cannot end the session. */}
              <form action="/auth/signout" method="post" className="hidden sm:block">
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-[var(--muted-ink)] hover:text-[var(--ink)]"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <>
              {/* Not on the sign-in page itself, where it is a link to where you already
                  are. Install stays, because it is the thing to do next from here. */}
              {pathname !== "/login" && (
                <Button asChild size="sm" variant="ghost" className="h-8 text-[12px]">
                  <Link href="/login">Sign in</Link>
                </Button>
              )}
              <Button asChild size="sm" className="h-8 text-[12px]">
                <Link href="/#install">Install</Link>
              </Button>
            </>
          )}

          {signedIn && (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[16rem] bg-[var(--panel)] border-[var(--line)]">
                <SheetTitle className="wordmark px-4 pt-4 text-[15px]">Pixie Dust Industries</SheetTitle>
                <nav className="mt-4 flex flex-col gap-1 px-2">
                  {nav.map((n) => (
                    <Link
                      key={n.href}
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "rounded-md px-3 py-2.5 text-[14px] transition-colors",
                        active(n.href)
                          ? "bg-[var(--secondary)] text-[var(--ink)]"
                          : "text-[var(--muted-ink)] hover:text-[var(--ink)] hover:bg-[var(--secondary)]/60",
                      )}
                    >
                      {n.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-5 space-y-3 px-4">
                  <a
                    href="https://github.com/niel-cody/oolio-product-os"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-[14px] text-[var(--muted-ink)] hover:text-[var(--ink)]"
                  >
                    Install
                  </a>
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="text-[14px] text-[var(--muted-ink)] hover:text-[var(--ink)]"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
                <div className="mono mt-6 px-4 text-[9.5px] tracking-[0.14em] uppercase text-[var(--muted-ink)]">
                  {role ? `${ROLE_LABEL[role]} · ` : ""}{skills} skills · {stamp}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
