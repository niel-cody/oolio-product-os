import type { Metadata } from "next";
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
 * This layout adds only the `.fd` scope that flightdeck.css hangs its aliases off.
 */
export default function FlightdeckLayout({ children }: { children: React.ReactNode }) {
  return <div className="fd flex-1">{children}</div>;
}
