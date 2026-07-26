import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import os from "@/data/os.json";

// The map's typefaces, so the app and the map read as one design rather than two.
const sans = Space_Grotesk({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: { default: "Oolio Product OS", template: "%s · Oolio Product OS" },
  description:
    "The Oolio Product team's operating system, written down and made executable. " +
    "Every skill, how they connect, and what changed.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" className={`dark ${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteHeader stamp={os.stamp} skills={os.totals.skills} />
        <div className="flex-1 flex flex-col min-h-0">{children}</div>
      </body>
    </html>
  );
}
