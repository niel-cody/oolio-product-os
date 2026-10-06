import type { Metadata } from "next";
import { Newsreader, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import os from "@/data/os.json";
import { getMember } from "@/lib/members";

/**
 * Three faces, one job each (brand/typography.md). Mincho and Gothic: a quiet serif for the
 * argument and a precise grotesque for everything a person reads or clicks, which is the
 * classic Japanese pairing and the calmest one there is.
 *
 *   display  Newsreader, regular weight, with its optical-size axis so it sets small
 *            without going spindly. Page titles, section lines, the wordmark.
 *   text     Geist. Built for interfaces, neutral on purpose, so the serif can speak.
 *   system   Geist Mono. Every label, count, stamp and slash command.
 *
 * Syne and Archivo went on 2026-10-02 with the rest of the first press: Syne at any weight
 * was a poster, and a site that wants to be read calmly cannot open with a poster.
 *
 * The variables are consumed by app/brand.css, which builds the fallback stacks around them.
 */
const display = Newsreader({ variable: "--font-display", subsets: ["latin"], weight: "variable", style: ["normal", "italic"], axes: ["opsz"], display: "swap" });
const text = Geist({ variable: "--font-text", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });
const system = Geist_Mono({ variable: "--font-system", subsets: ["latin"], weight: ["400", "500"], display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pixiedustindustries.com";

const DESCRIPTION =
  "The product process, written down and running: " +
  `${os.totals.skills} specialists that carry a product decision from the first signal to ` +
  "the honest look back six weeks later, against the tools your team already uses.";

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
    title: "Everything but the deciding.",
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
    title: "Everything but the deciding.",
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
