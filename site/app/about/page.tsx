import type { Metadata } from "next";
import Link from "next/link";
import os from "@/data/os.json";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description: "What the Oolio Product OS is, why it exists, and how to install it.",
};

const fill = (s: string) => s.replaceAll("{skills}", String(os.totals.skills));

/**
 * The essay. This copy fronted the public landing page until 2026-07-31, when the landing
 * became the cinematic star chart and the words moved here, behind the gate. Gated on
 * purpose: it names internal tools and carries the install instructions, including the
 * repo path, none of which belongs on the open web.
 *
 * Content comes from os.about, which the generator builds, so this page cannot drift from
 * the source the old landing page used. The kicker is the page title and the lede paragraphs
 * the lede, because an essay is still a page and opens like one.
 */
export default function AboutPage() {
  const a = os.about;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="eyebrow">What this is</div>
      {/* A statement, not a page name: capped at 30ch and sized below the page title so the
          serif never runs past three lines. */}
      <h1 className="display mt-3 max-w-[30ch] text-[clamp(1.7rem,3vw,2.4rem)] leading-[1.12]">
        {fill(a.kicker)}
      </h1>

      {a.lede.map((p: string, i: number) => (
        <p key={p} className={i === 0 ? "page-lede mt-5" : "page-lede mt-4"}>
          {fill(p)}
        </p>
      ))}

      <div className="mt-9 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/map">See the map</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/skills">Browse {os.totals.skills} skills</Link>
        </Button>
      </div>

      {a.sections.map((s: { label: string; paragraphs?: string[]; list?: string[] }) => (
        <section key={s.label} className="mt-12">
          <div className="sechead">
            <div className="eyebrow">{s.label}</div>
          </div>
          {s.paragraphs?.map((p, i) => (
            <p key={p} className={`t-body text-[var(--soft-ink)] ${i === 0 ? "" : "mt-4"}`}>
              {fill(p)}
            </p>
          ))}
          {s.list && (
            <ul className={`border-y border-[var(--rule)] ${s.paragraphs?.length ? "mt-5" : ""}`}>
              {s.list.map((li) => (
                <li
                  key={li}
                  className="t-body border-t border-[var(--rule)] py-3 text-[var(--soft-ink)] first:border-t-0"
                >
                  {fill(li)}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="mt-12 border-t border-[var(--rule-2)] pt-9">
        <p className="t-display-l text-[var(--ink)]">{a.line}</p>
        <p className="t-spec mt-3 text-[var(--muted-ink)]">{fill(a.footnote)}</p>
      </section>

      <section className="mt-12">
        <div className="sechead">
          <div className="eyebrow">Install it</div>
        </div>
        <p className="t-body text-[var(--soft-ink)]">
          In Claude Code, add the marketplace and install the plugin. You get updates automatically,
          because it is versioned by commit rather than by a number someone has to remember to bump.
        </p>
        <pre className="surface mono mt-4 overflow-x-auto p-4 text-[12.5px] leading-relaxed text-[var(--soft-ink)]">
{`/plugin marketplace add niel-cody/oolio-product-os
/plugin install oolio-pm@oolio-product-os`}
        </pre>
        <p className="t-body mt-4 text-[var(--soft-ink)]">
          The repo is private, so ask Niel for collaborator access first. In Cowork, try the same
          marketplace path under Customize, then Plugins; if it fails to sync, ask Niel for the current{" "}
          <code className="mono rounded-[var(--r-sm)] border border-[var(--rule)] bg-[var(--stock-2)] px-1.5 py-0.5 text-[12px] text-[var(--soft-ink)]">
            oolio-pm.zip
          </code>{" "}
          and upload that instead.
        </p>
      </section>
    </main>
  );
}
