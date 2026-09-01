import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import os from "@/data/os.json";
import { getSignedIn } from "@/lib/session";

// The map's typefaces, so the app and the map read as one design rather than two.
const sans = Space_Grotesk({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500", "600"] });

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
  twitter: {
    card: "summary_large_image",
    title: "The product process, written down and running.",
    description: DESCRIPTION,
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // The header renders on every page, including the public one, so this runs for signed-out
  // visitors too. Cached per request, so the landing page below reuses this same answer
  // rather than verifying again.
  const signedIn = await getSignedIn();

  return (
    <html lang="en-AU" className={`dark ${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteHeader stamp={os.stamp} skills={os.totals.skills} signedIn={signedIn} />
        <div className="flex-1 flex flex-col min-h-0">{children}</div>
      </body>
    </html>
  );
}
