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
 * the source the old landing page used.
 */
export default function AboutPage() {
  const a = os.about;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-6 sm:py-20">
      <div className="eyebrow">What this is</div>
      <h1 className="display mt-3 text-[29px] leading-[1.26] tracking-[-0.016em] sm:text-[38px] sm:leading-[1.22]">
        {fill(a.kicker)}
      </h1>

      {a.lede.map((p: string) => (
        <p key={p} className="mt-5 text-[15px] leading-relaxed text-[var(--muted-ink)] sm:text-[16px]">
          {fill(p)}
        </p>
      ))}

      <div className="mt-9 flex flex-wrap gap-3">
        <Button asChild size="lg" className="h-10">
          <Link href="/map">See the map</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-10">
          <Link href="/skills">Browse {os.totals.skills} skills</Link>
        </Button>
      </div>

      {a.sections.map((s: { label: string; paragraphs?: string[]; list?: string[] }) => (
        <section key={s.label} className="mt-14">
          <div className="eyebrow">{s.label}</div>
          {s.paragraphs?.map((p) => (
            <p key={p} className="mt-4 text-[15px] leading-relaxed text-[var(--muted-ink)] sm:text-[16px]">
              {fill(p)}
            </p>
          ))}
          {s.list && (
            <ul className="mt-4 space-y-2.5">
              {s.list.map((li) => (
                <li key={li} className="relative pl-4 text-[15px] leading-relaxed text-[var(--muted-ink)] sm:text-[16px]">
                  <span className="absolute left-0 top-[10px] h-[5px] w-[5px] rounded-sm bg-[var(--orch)]" />
                  {fill(li)}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="mt-16 border-t border-[var(--line)] pt-9">
        <p className="display text-[31px] tracking-[-0.016em] sm:text-[38px]">{a.line}</p>
        <p className="mono mt-3 text-[10px] leading-relaxed text-[var(--muted-ink)]">{fill(a.footnote)}</p>
      </section>

      <section className="mt-16">
        <div className="eyebrow">Install it</div>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted-ink)]">
          In Claude Code, add the marketplace and install the plugin. You get updates automatically,
          because it is versioned by commit rather than by a number someone has to remember to bump.
        </p>
        <pre className="mono mt-4 overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 text-[12px] leading-relaxed text-[#c3ccda]">
{`/plugin marketplace add niel-cody/oolio-product-os
/plugin install oolio-pm@oolio-product-os`}
        </pre>
        <p className="mt-4 text-[14px] leading-relaxed text-[var(--muted-ink)]">
          The repo is private, so ask Niel for collaborator access first. In Cowork, try the same
          marketplace path under Customize → Plugins; if it fails to sync, ask Niel for the current{" "}
          <span className="mono text-[12px] text-[#c3ccda]">oolio-pm.zip</span> and upload that
          instead.
        </p>
      </section>
    </main>
  );
}
