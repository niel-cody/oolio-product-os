import type { Metadata } from "next";
import os from "@/data/os.json";
import { SkillsBrowser, type SkillRow } from "@/components/skills-browser";

export const metadata: Metadata = {
  title: "Skills",
  description: "Every skill in the Oolio Product OS, grouped by where it sits in the lifecycle.",
};

export default function SkillsPage() {
  const nodeById = Object.fromEntries(os.map.nodes.map((n) => [n.id, n]));
  // typeColour gains an "unplaced" key only when something is unplaced, so index it loosely
  const colourOf = (t: string) => (os.map.typeColour as Record<string, string>)[t] ?? "#f87171";

  const rows: SkillRow[] = os.plugins.flatMap((p) =>
    p.skills.map((s) => {
      const n = nodeById[s.id];
      return {
        id: s.id,
        plugin: p.name,
        description: s.description,
        stage: n ? os.map.columns[n.col] : "⚠ Unplaced",
        type: n?.type ?? "unplaced",
        label: n?.label ?? s.id,
        note: n?.note ?? "",
        badge: n?.badge ?? "UNMAPPED",
        colour: colourOf(n?.type ?? "unplaced"),
      };
    }),
  );

  // Lifecycle order, not alphabetical: the point is where a skill sits in the work.
  const stages = os.map.columns.filter((c) => rows.some((r) => r.stage === c));

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-6 sm:py-20">
      <div className="eyebrow">
        {os.totals.skills} skills · {os.totals.plugins} plugin{os.totals.plugins === 1 ? "" : "s"}
      </div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Every skill</h1>
      <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[var(--muted-ink)]">
        Grouped by where it sits in the lifecycle rather than alphabetically, because the useful
        question is not what a skill is called but when you reach for it. Generated from the
        skills themselves, so this page cannot fall behind the plugin.
      </p>

      <SkillsBrowser skills={rows} stages={stages} />
    </main>
  );
}
