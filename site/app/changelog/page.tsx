import type { Metadata } from "next";
import { marked } from "marked";
import os from "@/data/os.json";

export const metadata: Metadata = {
  title: "Changelog",
  description: "What changed in the Oolio Product OS, newest first. Rendered from the repo, so shipping a skill updates this page.",
};

export default async function ChangelogPage() {
  const entries = await Promise.all(
    os.changelog.map(async (e) => ({ ...e, html: await marked.parse(e.body) })),
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-6 sm:py-20">
      <div className="eyebrow">Changelog</div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">What changed</h1>
      <p className="mt-5 text-[15px] leading-relaxed text-[var(--muted-ink)]">
        Newest first, rendered straight from the repo. The plugin is versioned by commit rather
        than by a number, so entries are dated. Shipping a skill updates this page.
      </p>

      <div className="mt-12 space-y-14">
        {entries.map((e, i) => (
          <article key={i} className="border-t border-[var(--line)] pt-8">
            {e.date && <div className="mono text-[10px] tracking-[0.14em] text-[var(--muted-ink)]">{e.date}</div>}
            <h2 className="mt-2 text-[19px] font-semibold leading-snug">{e.title}</h2>
            <div className="changelog-body mt-4" dangerouslySetInnerHTML={{ __html: e.html }} />
          </article>
        ))}
      </div>
    </main>
  );
}
