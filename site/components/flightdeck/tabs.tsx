"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The view switch, as chips.
 *
 * A client component only because the selected state needs the current path, which a server
 * layout does not have. Nothing else here is interactive: the links are ordinary links, and
 * the chip that matches the path is marked with aria-current so the style and the
 * accessibility tree agree about which view you are on.
 */
export function FlightdeckTabs({
  tabs,
}: {
  tabs: { href: string; label: string; matches: string[] }[];
}) {
  const pathname = usePathname();
  return (
    <nav className="fd-tabs" aria-label="Flightdeck views">
      {tabs.map((t) => {
        const on = t.matches.some((m) => pathname === m || pathname.startsWith(`${m}/`));
        return (
          <Link key={t.href} href={t.href} className="chip" aria-current={on ? "page" : undefined}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
