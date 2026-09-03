import type { Metadata } from "next";
import { Syne, Archivo, DM_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import os from "@/data/os.json";
import { getMember } from "@/lib/members";

/**
 * Three faces, one job each (brand/typography.md).
 *
 *   display  Syne. Drawn for a French art centre, not a startup: wide, slightly wrong
 *            proportions. Reads as an art press rather than a design system, which is
 *            the point of the whole direction.
 *   text     Archivo. A grotesque built for small sizes and dense text. Does nothing
 *            interesting on purpose, so Syne can.
 *   system   DM Mono. Typewriter rather than terminal. Carries every label, ink code,
 *            screen angle, count and slash command.
 *
 * Space Grotesk is gone. It is the face that signals "designed" without doing any designing,
 * and it was one of five unmodified defaults that made the old site read as generated.
 *
 * The variables are consumed by app/brand.css, which builds the fallback stacks around them.
 */
const display = Syne({ variable: "--font-display", subsets: ["latin"], weight: ["600", "700", "800"], display: "swap" });
const text = Archivo({ variable: "--font-text", subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const system = DM_Mono({ variable: "--font-system", subsets: ["latin"], weight: ["400", "500"], display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://oolio-product-os.vercel.app";

const DESCRIPTION =
  "The Oolio Product team's operating system, written down and made executable: " +
  `${os.totals.skills} skills that carry a product decision from the first signal to the ` +
  "measured outcome, running against the tools the team already uses.";

/**
 * Metadata, including the link preview.
 *
 * `metadataBase` matters more than it looks: without it Next emits the Open Graph image as a
 * relative path, and a relative og:image is silently dropped by every unfurler there is. The
 * card would look correct in the repo and be missing in Slack, which is the one place it has
 * to work — pasting the URL into a channel is how an internal tool actually spreads.
 *
 * The card itself is generated in app/opengraph-image.tsx.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Pixie Dust Industries — Product OS", template: "%s · Product OS" },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Pixie Dust Industries",
    title: "The product process, written down and running.",
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_AU",
  },
  icons: {
    // app/icon.svg is picked up by convention; naming it here as well means the tab icon is
    // the Gate rather than Next's default even on the routes that set their own metadata.
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The product process, written down and running.",
    description: DESCRIPTION,
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // The header renders on every page, including the public one, so this runs for signed-out
  // visitors too. Cached per request, so the landing page below reuses this same answer
  // rather than verifying again. The role comes with it, because the navigation is a
  // function of what you can reach.
  const member = await getMember();

  return (
    <html lang="en-AU" className={`${display.variable} ${text.variable} ${system.variable} h-full antialiased`}>
      {/* `sheet` carries the grain: one fixed pass over the whole page, so it never scrolls
          with the content. The sheet stays still while the ink moves. Applied here and
          nowhere else — two grain layers over one another read as dirt, not paper. */}
      <body className="sheet min-h-full flex flex-col bg-background text-foreground">
        <SiteHeader
          stamp={os.stamp}
          skills={os.totals.skills}
          signedIn={member !== null}
          role={member?.role ?? null}
        />
        <div className="flex-1 flex flex-col min-h-0">{children}</div>
      </body>
    </html>
  );
}
