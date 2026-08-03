import type { Metadata } from "next";
import Link from "next/link";
import "./flightdeck.css";

export const metadata: Metadata = {
  title: { default: "Flightdeck", template: "%s · Flightdeck" },
  description: "Where the day goes, what only you can decide, and what is quietly slipping.",
  // Gated by middleware, but say so explicitly. A crawler that somehow reaches a URL under
  // /app should not index a person's day.
  robots: { index: false, follow: false },
};

/**
 * Flightdeck sits inside the site's root layout: same header, same fonts, same palette.
 * This layout adds only the `.fd` scope that flightdeck.css hangs its aliases off, and the
 * strip that switches between the two surfaces.
 *
 * There are two, and they are different in kind rather than in period. The dashboard is a
 * ranked snapshot built once a day; the week is a live calendar read on every request. They
 * are kept apart because merging them would force the slower one's freshness onto the faster
 * one, and availability that is five hours old is worse than none.
 */
const TABS = [
  { href: "/app/today", label: "Dashboard" },
  { href: "/app/week", label: "Week" },
];

export default function FlightdeckLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fd flex-1">
      <nav className="fd-tabs" aria-label="Flightdeck views">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href}>
            {t.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
