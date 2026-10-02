import type { Metadata } from "next";
import { Suspense } from "react";
import { SkillsLibrary } from "@/components/skills-library";
import { SKILLS, STAGES, TOTALS } from "@/lib/skills";

export const metadata: Metadata = {
  title: "Skills",
  description: "Every skill in the Oolio Product OS, grouped by where it sits in the lifecycle.",
};

export default function SkillsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 sm:py-20">
      <div className="eyebrow">
        {TOTALS.skills} skills · {TOTALS.plugins} plugin{TOTALS.plugins === 1 ? "" : "s"}
      </div>
      <h1 className="page-title mt-3">Every skill</h1>
      <p className="page-lede mt-5">
        A skill is one product habit, written down well enough that an assistant runs it the same
        way every time. They are shelved by where they sit in the lifecycle rather than
        alphabetically, because the useful question is not what a skill is called but when you
        reach for it. Open one to see what it does, when to reach for something else, and what it
        hands on to next. Everything here is generated from the skills themselves.
      </p>

      {/* The library reads the open skill from the URL, which needs a Suspense boundary. */}
      <Suspense fallback={null}>
        <SkillsLibrary skills={SKILLS} stages={STAGES} />
      </Suspense>
    </main>
  );
}
