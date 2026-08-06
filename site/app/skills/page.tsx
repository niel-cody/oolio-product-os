import type { Metadata } from "next";
import { SkillsBrowser } from "@/components/skills-browser";
import { SKILLS, STAGES, TOTALS } from "@/lib/skills";

export const metadata: Metadata = {
  title: "Skills",
  description: "Every skill in the Oolio Product OS, grouped by where it sits in the lifecycle.",
};

export default function SkillsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-6 sm:py-20">
      <div className="eyebrow">
        {TOTALS.skills} skills · {TOTALS.plugins} plugin{TOTALS.plugins === 1 ? "" : "s"}
      </div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Every skill</h1>
      <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[var(--muted-ink)]">
        A skill is one product habit, written down well enough that an assistant runs it the same
        way every time. Grouped below by where it sits in the lifecycle rather than
        alphabetically, because the useful question is not what a skill is called but when you
        reach for it.
      </p>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--muted-ink)]">
        Open one to see what it does, when to reach for it, when to reach for something else
        instead, and what it hands on to next. Everything on these pages is generated from the
        skills themselves, so they cannot fall behind the plugin.
      </p>

      <SkillsBrowser skills={SKILLS} stages={STAGES} />
    </main>
  );
}
