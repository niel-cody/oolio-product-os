"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SkillDetail, slug } from "@/components/skill-detail";
import { colourOf, skill as skillById, type Skill, type Stage } from "@/lib/skills";

/**
 * The library.
 *
 * Folders are lifecycle stages and rows are skills, because the useful question is never what a
 * skill is called but when you reach for it. A row opens the skill in a drawer rather than on a
 * separate page, so a reader can walk the shelf, open five skills in a row and never lose their
 * place in the list. The open skill lives in the URL (`?skill=<id>`), so a deep link, the back
 * button and a refresh all land on the same drawer, and every row is an ordinary link.
 *
 * Addresses are built from the current pathname rather than a hard-coded `/skills`, so the
 * component behaves the same on the ungated preview mirror as on the real route.
 */
export function SkillsLibrary({ skills, stages }: { skills: Skill[]; stages: Stage[] }) {
  const base = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const openId = params.get("skill");
  const open = openId ? skillById(openId) : undefined;

  const [q, setQ] = useState("");
  // null is "All skills". A folder chosen in the rail shows that shelf on its own.
  const [folder, setFolder] = useState<string | null>(null);

  // A stage link from a skill's own page arrives as `/skills#<slug>`; honour it by opening
  // that folder rather than hoping the shelf is on screen. pushState does not fire hashchange,
  // so this only reads the hash on arrival and on back/forward, which is where it matters.
  useEffect(() => {
    const pick = () => {
      const h = window.location.hash.slice(1);
      if (!h) return;
      const hit = stages.find((s) => slug(s.name) === h);
      if (hit) setFolder(hit.name);
    };
    pick();
    window.addEventListener("popstate", pick);
    return () => window.removeEventListener("popstate", pick);
  }, [stages]);

  const searched = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return skills;
    // The trigger phrases and the exclusions are searched too: "how do I say this" and "which
    // one is NOT this" are the two commonest ways in.
    return skills.filter((s) =>
      [s.id, s.title, s.summary, s.blurb, s.note, s.stage, s.badge, ...s.phrases, ...s.excludes]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [q, skills]);

  // Counts in the rail follow the search, so a rail entry tells you where the matches are.
  const shelves = useMemo(
    () => stages.map((stage) => ({ ...stage, rows: searched.filter((s) => s.stage === stage.name) })),
    [searched, stages],
  );
  const visible = shelves.filter((g) => g.rows.length && (folder === null || g.name === folder));

  const hrefFor = (id: string) => `${base}?skill=${id}`;
  const close = () => router.push(base, { scroll: false });

  return (
    <div className="mt-10 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
      {/* The rail: folders on lg+, a chip strip above the list below that. */}
      <nav aria-label="Folders" className="lg:sticky lg:top-20 lg:self-start">
        <ul className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
          <RailItem label="All skills" count={searched.length} on={folder === null} onClick={() => setFolder(null)} />
          {shelves.map((g) => (
            <RailItem
              key={g.name}
              label={g.name}
              count={g.rows.length}
              on={folder === g.name}
              dim={g.rows.length === 0}
              onClick={() => setFolder(g.name)}
            />
          ))}
        </ul>
      </nav>

      <div className="mt-6 min-w-0 lg:mt-0">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search skills, stages, tools, or what you'd say…"
            className="h-10 max-w-md flex-1 border-[var(--rule-2)] bg-[var(--stock-2)] text-[14px]"
            aria-label="Search skills"
          />
          <span className="mono text-[10px] tracking-[0.12em] text-[var(--muted-ink)]" aria-live="polite">
            {searched.length} of {skills.length}
          </span>
        </div>

        {visible.length === 0 && (
          <p className="mt-12 text-[15px] text-[var(--muted-ink)]">
            {q.trim()
              ? `Nothing matches “${q}”. That may be a gap worth recording rather than a search that failed.`
              : "Nothing on this shelf."}
          </p>
        )}

        <div className="mt-8 space-y-12">
          {visible.map((g) => {
            const start = g.start ? skillById(g.start) : undefined;
            const n = stages.findIndex((s) => s.name === g.name) + 1;
            return (
              <section key={g.name} id={slug(g.name)} className="scroll-mt-20">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="mono text-[10px] text-[var(--muted-ink)]">{String(n).padStart(2, "0")}</span>
                  <h2 className="t-display-m">{g.name}</h2>
                  <span className="mono text-[10px] text-[var(--muted-ink)]">{g.rows.length}</span>
                  {start && (
                    <Link
                      href={hrefFor(start.id)}
                      scroll={false}
                      className="mono ml-auto inline-flex items-center gap-1 text-[11px] text-[var(--blue)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)]"
                    >
                      Start with {start.command}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
                {g.purpose && (
                  <p className="mt-1.5 truncate text-[13.5px] text-[var(--muted-ink)]" title={g.purpose}>
                    {g.purpose}
                  </p>
                )}

                <ul className="mt-3 border-t border-[var(--rule)]">
                  {g.rows.map((s) => (
                    <Row key={s.id} skill={s} href={hrefFor(s.id)} open={s.id === openId} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>

      <Sheet open={!!open} onOpenChange={(o) => !o && close()}>
        <SheetContent
          side="right"
          className="w-[min(600px,100vw)] gap-0 overflow-y-auto bg-[var(--stock-2)] p-0 duration-[var(--dur-drawer)] ease-[var(--ease-out)] data-[side=right]:w-[min(600px,100vw)] data-[side=right]:sm:max-w-none sm:rounded-l-[var(--r-card)] motion-reduce:transition-none motion-reduce:animate-none"
          style={{ borderLeft: "var(--edge-line)", boxShadow: "var(--lift-shadow)" }}
        >
          {open && (
            <>
              {/* Radix wants a title for the dialog; the visible one is set by SkillDetail. */}
              <SheetTitle className="sr-only">{open.title}</SheetTitle>
              <div className="px-6 pt-4 pr-14 sm:px-8 sm:pr-16">
                <Link
                  href={`${base}/${open.id}`}
                  className="mono inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-[var(--muted-ink)] transition-colors duration-[var(--dur-state)] ease-[var(--ease-out)] hover:text-[var(--ink)] motion-reduce:transition-none"
                >
                  Open as a page
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="px-6 pb-10 pt-5 sm:px-8">
                <SkillDetail skill={open} variant="drawer" hrefFor={hrefFor} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function RailItem({
  label,
  count,
  on,
  dim,
  onClick,
}: {
  label: string;
  count: number;
  on: boolean;
  dim?: boolean;
  onClick: () => void;
}) {
  return (
    <li className="shrink-0">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={on}
        className={`flex w-full items-center gap-2 whitespace-nowrap rounded-[var(--r-ctl)] px-2.5 py-1.5 text-left text-[13.5px] transition-colors duration-[var(--dur-state)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] motion-reduce:transition-none ${
          on
            ? "bg-[var(--stock-3)] text-[var(--ink)]"
            : "text-[var(--muted-ink)] hover:bg-[var(--stock-2)] hover:text-[var(--ink)]"
        } ${dim && !on ? "opacity-60" : ""}`}
      >
        <span className="truncate">{label}</span>
        <span className="mono ml-auto text-[10px] text-[var(--muted-ink)]">{count}</span>
      </button>
    </li>
  );
}

/** One shelf row. A link, so a deep link and a middle-click both work, and it reads as a row. */
function Row({ skill: s, href, open }: { skill: Skill; href: string; open: boolean }) {
  return (
    <li className="border-b border-[var(--rule)]">
      <Link
        href={href}
        scroll={false}
        aria-current={open ? "true" : undefined}
        className="flex h-12 items-center gap-3 rounded-[var(--r-ctl)] px-2.5 transition-colors duration-[var(--dur-state)] ease-[var(--ease-out)] hover:bg-[var(--stock-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] motion-reduce:transition-none aria-[current=true]:bg-[color-mix(in_oklab,var(--blue-tint)_35%,transparent)]"
      >
        {/* colourOf is already a CSS value from the map data, so it goes in as a style. */}
        <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: colourOf(s.type) }} />
        <span className="shrink-0 text-[14px] font-semibold leading-none">{s.title}</span>
        <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--muted-ink)]">{s.summary}</span>
        <span className="mono hidden shrink-0 text-[9px] uppercase tracking-[0.1em] text-[var(--muted-ink)] sm:block">
          {s.badge}
        </span>
        <code className="mono hidden shrink-0 text-[10.5px] text-[var(--soft-ink)] md:block">{s.command}</code>
      </Link>
    </li>
  );
}
