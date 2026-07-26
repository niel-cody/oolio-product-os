"use client";

import { useEffect, useRef } from "react";
import { renderMap } from "@/lib/map-engine";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Maximize2 } from "lucide-react";

// The engine is plain JS on purpose, so the shape it expects is declared here.
type MapData = {
  columns: string[];
  nodes: { id: string; label: string; note: string; badge: string; type: string; col: number; row: number; desc?: string }[];
  edges: { f: string; t: string; lbl?: string }[];
  gates: { after: number; label: string; who: string }[];
  loops: { f: string; t: string; label: string }[];
  // path rows are [nodeId, label, description]; typed loosely because they come from JSON
  flows: { name: string; accent: string; path: string[][] }[];
  typeColour: Record<string, string>;
  typeLabel: Record<string, string>;
};

export function ProductMap({
  map,
  stamp,
  skills,
  unplaced,
}: {
  map: MapData;
  stamp: string;
  skills: number;
  unplaced: number;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current) return;
    const handle = renderMap(root.current, map, { stamp, skills, unplaced });
    return () => handle.destroy();
  }, [map, stamp, skills, unplaced]);

  return (
    // Height is pinned rather than inherited: the map is the one page that must fill the
    // viewport exactly, and a flex chain four levels deep is a fragile way to promise that.
    // 3.5rem is the header.
    <div ref={root} className="maproot flex min-h-0 flex-1 flex-col lg:flex-row">
      {/* stage */}
      <div className="mapstage relative h-[58vh] min-w-0 flex-1 lg:h-full">
        <svg id="map" preserveAspectRatio="xMidYMid meet" aria-label="Oolio Product OS map" />
        <div id="legend" className="hidden sm:block" />

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

        <div id="foot" className="absolute bottom-3 left-4 z-10 hidden md:flex" />
      </div>

      {/* flows */}
      <aside className="flex w-full shrink-0 flex-col border-t border-[var(--line)] bg-[var(--panel)] lg:h-full lg:w-[288px] lg:border-l lg:border-t-0">
        <div className="border-b border-[var(--line)] px-4 pb-2.5 pt-3.5">
          <div className="eyebrow">End-to-end flows</div>
          <h2 className="mt-1 text-[14px] font-semibold">Paths through the map</h2>
        </div>
        <div id="flows" className="border-b border-[var(--line)] px-3 py-2.5" />
        <div id="steps" className="min-h-0 flex-1 overflow-y-auto px-3.5 pb-5 pt-3" />
      </aside>
    </div>
  );
}
