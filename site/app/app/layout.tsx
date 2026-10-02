import type { Metadata } from "next";
import { FlightdeckTabs } from "@/components/flightdeck/tabs";
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
 *
 * `matches` lists the path prefixes a tab is the home of, so the dashboard chip stays lit on
 * a dated snapshot and on the "no snapshot yet" page, not only on /app/today itself.
 */
const TABS = [
  { href: "/app/today", label: "Dashboard", matches: ["/app/today", "/app/d", "/app/none"] },
  { href: "/app/week", label: "Week", matches: ["/app/week"] },
];

export default function FlightdeckLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fd flex-1">
      <FlightdeckTabs tabs={TABS} />
      {children}
    </div>
  );
}
