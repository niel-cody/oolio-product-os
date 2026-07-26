"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/map", label: "The Map" },
  { href: "/skills", label: "Skills" },
  { href: "/changelog", label: "Changelog" },
  { href: "/systems", label: "Systems" },
];

export function SiteHeader({ stamp, skills }: { stamp: string; skills: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--bg)]/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2 shrink-0">
          <span className="text-[15px] font-bold tracking-tight">Oolio Product OS</span>
        </Link>

        <nav className="ml-4 hidden md:flex items-center gap-1">
          {NAV.map((n) => (
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

        <div className="ml-auto flex items-center gap-3">
          <span className="mono hidden lg:inline text-[9.5px] tracking-[0.14em] uppercase text-[var(--muted-ink)]">
            {skills} skills · {stamp}
          </span>
          <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex h-8 text-[12px]">
            <a href="https://github.com/oolio-group/oolio-product-os" target="_blank" rel="noreferrer">
              Install
            </a>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[16rem] bg-[var(--panel)] border-[var(--line)]">
              <SheetTitle className="px-4 pt-4 text-[13px]">Oolio Product OS</SheetTitle>
              <nav className="mt-4 flex flex-col gap-1 px-2">
                {NAV.map((n) => (
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
              <div className="mono mt-6 px-5 text-[9.5px] tracking-[0.14em] uppercase text-[var(--muted-ink)]">
                {skills} skills · {stamp}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
