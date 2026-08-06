"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Skill, Stage } from "@/lib/skills";

/**
 * The index.
 *
 * Grouped by lifecycle stage, and each group leads with what that stage is FOR, because a
 * heading with a count under it answers nothing for someone deciding where they are. Every
 * card carries the one thing you do next: the command you type. The detail is one click away
 * rather than crammed in, so this page stays scannable at thirty-two skills and at sixty.
 */
export function SkillsBrowser({ skills, stages }: { skills: Skill[]; stages: Stage[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return skills;
    // Search the trigger phrases too: "how do I say this" is the commonest way in.
    return skills.filter((s) =>
      [s.id, s.title, s.blurb, s.note, s.stage, s.badge, s.lede, s.excludes.join(" "), ...s.phrases]
        .join(" ").toLowerCase().includes(needle),
    );
  }, [q, skills]);

  const grouped = useMemo(
    () =>
      stages
        .map((stage) => ({ ...stage, rows: filtered.filter((s) => s.stage === stage.name) }))
        .filter((g) => g.rows.length),
    [filtered, stages],
  );

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search skills, stages, tools, or what you'd say…"
          className="h-10 max-w-md flex-1 border-[var(--line)] bg-[var(--panel)] text-[14px]"
          aria-label="Search skills"
        />
        <span className="mono text-[10px] tracking-[0.12em] text-[var(--muted-ink)]">
          {filtered.length} of {skills.length}
        </span>
      </div>

      {grouped.length === 0 && (
        <p className="mt-12 text-[15px] text-[var(--muted-ink)]">
          Nothing matches “{q}”. That may be a gap worth recording rather than a search that failed.
        </p>
      )}

      <div className="mt-12 space-y-14">
        {grouped.map((g, i) => {
          const start = g.start && g.rows.find((r) => r.id === g.start);
          return (
            <section key={g.name} id={slug(g.name)} className="scroll-mt-20">
              <div className="flex items-baseline gap-3">
                <span className="mono text-[10px] text-[#4d5a70]">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="text-[19px] font-semibold tracking-tight">{g.name}</h2>
                <span className="mono text-[10px] text-[var(--muted-ink)]">{g.rows.length}</span>
              </div>

              {g.purpose && (
                <p className="mt-2.5 max-w-2xl text-[14px] leading-relaxed text-[var(--muted-ink)]">
                  {g.purpose}
                </p>
              )}

              {start && (
                <Link
                  href={`/skills/${start.id}`}
                  className="mono mt-3 inline-flex items-center gap-1.5 text-[11px] text-[var(--orch)] hover:underline"
                >
                  Start with {start.command}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}

              <div className="mt-6 grid gap-3 border-t border-[var(--line)] pt-6 sm:grid-cols-2">
                {g.rows.map((s) => (
                  <SkillCard key={s.id} skill={s} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

function SkillCard({ skill: s }: { skill: Skill }) {
  return (
    <Link
      href={`/skills/${s.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 transition-colors hover:border-[#33415a] hover:bg-[#111926]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[14.5px] font-semibold leading-tight">{s.title}</h3>
        <span className="mono shrink-0 pt-0.5 text-[8.5px] tracking-[0.08em] text-[var(--muted-ink)]">
          {s.badge}
        </span>
      </div>

      {/* Clamped, so a row of cards is a row rather than a staircase. The whole opening
          clause is on the skill's own page. */}
      <p className="mt-2.5 line-clamp-3 flex-1 text-[13px] leading-relaxed text-[var(--muted-ink)]">
        {s.summary}
      </p>

      <div className="mt-3.5 flex items-center gap-2 border-t border-[var(--line)] pt-2.5">
        <code className="mono text-[10.5px] text-[#8493aa] transition-colors group-hover:text-[var(--orch)]">
          {s.command}
        </code>
        <ArrowRight className="ml-auto h-3 w-3 shrink-0 text-[#4d5a70] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--orch)]" />
      </div>
    </Link>
  );
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
