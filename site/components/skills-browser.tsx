"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export type SkillRow = {
  id: string;
  plugin: string;
  description: string;
  stage: string;
  type: string;
  label: string;
  note: string;
  badge: string;
  colour: string;
};

export function SkillsBrowser({ skills, stages }: { skills: SkillRow[]; stages: string[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return skills;
    return skills.filter((s) =>
      [s.id, s.label, s.note, s.stage, s.badge, s.description].join(" ").toLowerCase().includes(needle),
    );
  }, [q, skills]);

  const grouped = useMemo(
    () => stages.map((stage) => ({ stage, rows: filtered.filter((s) => s.stage === stage) })).filter((g) => g.rows.length),
    [filtered, stages],
  );

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search skills, stages, tools, triggers…"
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

      <div className="mt-10 space-y-12">
        {grouped.map(({ stage, rows }) => (
          <section key={stage}>
            <div className="flex items-baseline gap-3 border-b border-[var(--line)] pb-2.5">
              <h2 className="eyebrow !text-[10px]">{stage}</h2>
              <span className="mono text-[10px] text-[var(--muted-ink)]">{rows.length}</span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {rows.map((s) => (
                <article
                  key={s.id}
                  className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4"
                >
                  <span className="absolute left-0 top-0 h-full w-[3px]" style={{ background: s.colour }} />
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[14.5px] font-semibold leading-tight">{s.label}</h3>
                    <Badge
                      variant="outline"
                      className="mono shrink-0 border-[var(--line)] text-[8.5px] tracking-[0.08em]"
                      style={{ color: s.colour, borderColor: s.colour + "66" }}
                    >
                      {s.badge}
                    </Badge>
                  </div>
                  <p className="mono mt-1.5 text-[9.5px] text-[#8493aa]">{s.id}</p>
                  <p className="mt-3 text-[13px] leading-relaxed text-[var(--muted-ink)]">
                    {trigger(s.description)}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

/** A skill's description is a trigger spec written for the model, and runs long.
 *  Show the opening sentences, which are the part written for a human. */
function trigger(desc: string) {
  const cut = desc.split(/(?<=\.)\s+/).slice(0, 2).join(" ");
  return cut.length > 260 ? cut.slice(0, 257).trimEnd() + "…" : cut;
}
