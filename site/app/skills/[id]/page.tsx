import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SkillDetail } from "@/components/skill-detail";
import { SKILLS, skill } from "@/lib/skills";

/**
 * One page per skill, for direct links and for "Open as a page" from the library's drawer.
 *
 * The view itself lives in components/skill-detail.tsx so the drawer and this page cannot drift
 * apart; the only thing decided here is that links to other skills go to their own pages.
 */

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return SKILLS.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const s = skill((await params).id);
  if (!s) return { title: "Skill not found" };
  return { title: `${s.command}`, description: s.blurb };
}

export default async function SkillPage({ params }: Params) {
  const s = skill((await params).id);
  if (!s) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-6 sm:py-16">
      <Link
        href="/skills"
        className="mono inline-flex items-center gap-1.5 text-[10.5px] tracking-[0.1em] text-[var(--muted-ink)] transition-colors duration-[var(--dur-state)] ease-[var(--ease-out)] hover:text-[var(--ink)] motion-reduce:transition-none"
      >
        <ArrowLeft className="h-3 w-3" />
        ALL SKILLS
      </Link>

      <div className="mt-7">
        <SkillDetail skill={s} variant="page" hrefFor={(id) => `/skills/${id}`} />
      </div>
    </main>
  );
}
