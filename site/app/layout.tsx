import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import os from "@/data/os.json";
import { getMember } from "@/lib/members";

/**
 * The brand's three voices, and each says a different kind of thing (brand/typography.md).
 *
 *   display  the argument. What a person believes
 *   text     the interface. What a person reads and clicks
 *   system   the machine. What was counted, stamped or run
 *
 * That split is the positioning set in type: the OS is a written argument a machine executes,
 * so the argument is a serif and the execution is a mono. Instrument Serif has one weight and
 * no bold to fall back on, which is deliberate; `.wordmark` blocks synthesis so a stray
 * font-weight fails visibly rather than smearing the outline.
 *
 * The variables are consumed by app/brand.css, which builds the fallback stacks around them.
 */
const display = Instrument_Serif({ variable: "--font-display", subsets: ["latin"], weight: ["400"], style: ["normal", "italic"], display: "swap" });
const text = Inter({ variable: "--font-text", subsets: ["latin"], display: "swap" });
const system = JetBrains_Mono({ variable: "--font-system", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

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
  title: { default: "Oolio Product OS", template: "%s · Oolio Product OS" },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Oolio Product OS",
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
    <html lang="en-AU" className={`dark ${display.variable} ${text.variable} ${system.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
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
