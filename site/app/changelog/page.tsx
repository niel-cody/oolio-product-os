import type { Metadata } from "next";
import { marked } from "marked";
import os from "@/data/os.json";

export const metadata: Metadata = {
  title: "Changelog",
  description: "What changed in the Oolio Product OS, newest first. Rendered from the repo, so shipping a skill updates this page.",
};

/**
 * Each entry is a folded sheet: a record of something that happened, which is exactly what
 * the fold is for. The date is the pass marker, the title the serif line, and the body the
 * markdown rendered from CHANGELOG.md.
 */
export default async function ChangelogPage() {
  const entries = await Promise.all(
    os.changelog.map(async (e) => ({ ...e, html: await marked.parse(e.body) })),
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="eyebrow">Changelog</div>
      <h1 className="page-title mt-3">What changed</h1>
      <p className="page-lede mt-5">
        Newest first, rendered straight from the repo. The plugin is versioned by commit rather
        than by a number, so entries are dated. Shipping a skill updates this page.
      </p>

      <div className="mt-10 space-y-6">
        {entries.map((e, i) => (
          <article key={i} className="surface folded p-6 sm:p-8">
            {e.date && <div className="eyebrow">{e.date}</div>}
            <h2 className="t-display-m mt-2">{e.title}</h2>
            <div className="changelog-body mt-4" dangerouslySetInnerHTML={{ __html: e.html }} />
          </article>
        ))}
      </div>
    </main>
  );
}
