"use client";

import { useEffect, useRef } from "react";
import { renderSystems } from "@/lib/systems-engine";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Maximize2 } from "lucide-react";

// The engine is plain JS, so the shape it expects is declared here.
type SystemsData = {
  intro: { kicker: string; lede: string[]; note: string };
  kinds: Record<string, { colour: string; label: string }>;
  systems: {
    id: string; label: string; note: string; band: string; row: number;
    cadence: string; driver: string; access: string; detail: string;
    reads: string[]; writes: string[]; skills: string[]; skillCount: number;
  }[];
  wires: { from: string; to: string; kind: string; label?: string }[];
  routes: { name: string; accent: string; path: string[][] }[];
};

export function SystemsMap({
  systems,
  stamp,
  skills,
}: {
  systems: SystemsData;
  stamp: string;
  skills: number;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current) return;
    const handle = renderSystems(root.current, systems, { stamp, skills });
    return () => handle.destroy();
  }, [systems, stamp, skills]);

  const intro = systems.intro;

  return (
    // Height is pinned rather than inherited, for the same reason as the lifecycle map:
    // this page must fill the viewport exactly, and a four-deep flex chain is a fragile
    // way to promise that. 3.5rem is the header.
    <div ref={root} className="sysroot flex min-h-0 flex-1 flex-col lg:flex-row">
      <div className="sysstage relative h-[58vh] min-w-0 flex-1 lg:h-full">
        <svg id="sysmap" preserveAspectRatio="xMidYMid meet" aria-label="How data moves between Oolio's systems" />
        <div id="syslegend" className="hidden sm:block" />

        <div className="absolute bottom-3 right-3 z-10 flex gap-1.5">
          <Button data-zoom="out" variant="outline" size="icon" className="h-8 w-8" aria-label="Zoom out">
            <Minus className="h-4 w-4" />
          </Button>
          <Button data-zoom="in" variant="outline" size="icon" className="h-8 w-8" aria-label="Zoom in">
            <Plus className="h-4 w-4" />
          </Button>
          <Button data-zoom="reset" variant="outline" size="icon" className="h-8 w-8" aria-label="Fit the whole map">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        <div id="sysfoot" className="absolute bottom-3 left-4 z-10 hidden md:flex" />
      </div>

      <aside className="flex w-full shrink-0 flex-col border-t border-[var(--line)] bg-[var(--panel)] lg:h-full lg:w-[310px] lg:border-l lg:border-t-0">
        <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 pb-2.5 pt-3.5">
          <div>
            <div className="eyebrow">Data routes</div>
            <h2 className="mt-1 text-[14px] font-semibold">Follow one end to end</h2>
          </div>
          <button
            data-overview
            className="mono ml-auto rounded-md border border-[var(--line)] px-2 py-1 text-[9px] tracking-[0.1em] text-[var(--muted-ink)] transition-colors hover:text-[var(--ink)]"
          >
            OVERVIEW
          </button>
        </div>

        <div id="sysroutes" className="border-b border-[var(--line)] px-3 py-2.5" />

        {/* The engine reads this markup once on mount and restores it when someone asks for
            the overview again, so the copy stays in the config rather than in the engine. */}
        <div id="sysdetail" className="min-h-0 flex-1 overflow-y-auto px-3.5 pb-6 pt-3.5">
          <div className="sd-intro-k">{intro.kicker}</div>
          {intro.lede.map((p) => (
            <p key={p} className="sd-intro-p">{p}</p>
          ))}
          <div className="sd-intro-n">{intro.note}</div>
        </div>
      </aside>
    </div>
  );
}
