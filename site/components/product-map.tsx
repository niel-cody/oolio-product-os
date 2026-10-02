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

type StageNote = { name: string; purpose: string; start: string | null };

/**
 * The map page: a stage (the drawing), a strip of stage chips across the top of it, and a
 * panel on the right that always answers the three questions a reader has: where am I,
 * what matters here, what can I do next. The engine fills the strip, the legend, the flows
 * list, the context area, the foot and the tooltip; this component only owns the frame.
 */
export function ProductMap({
  map,
  stages,
  stamp,
  skills,
  unplaced,
}: {
  map: MapData;
  stages: StageNote[];
  stamp: string;
  skills: number;
  unplaced: number;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current) return;
    const handle = renderMap(root.current, map, { stamp, skills, unplaced, stages });
    return () => handle.destroy();
  }, [map, stamp, skills, unplaced, stages]);

  return (
    // Height is pinned rather than inherited: the map is the one page that must fill the
    // viewport exactly, and a flex chain four levels deep is a fragile way to promise that.
    <div ref={root} className="maproot flex min-h-0 flex-1 flex-col lg:flex-row">
      {/* stage */}
      <div className="mapstage relative h-[62vh] min-w-0 flex-none lg:h-full lg:flex-1">
        {/* The stage chips: the one navigation that is legible at every zoom. */}
        <div id="stages" className="stagestrip" role="toolbar" aria-label="Stages" />

        <svg id="map" preserveAspectRatio="xMidYMid meet" aria-label="Oolio Product OS map" />
        <div id="legend" className="hidden sm:block" />
        <div id="tip" hidden />

        <div className="absolute bottom-3 right-3 z-10 flex gap-1.5">
          <Button data-zoom="out" variant="outline" size="icon" className="mapbtn" aria-label="Zoom out">
            <Minus className="h-4 w-4" />
          </Button>
          <Button data-zoom="in" variant="outline" size="icon" className="mapbtn" aria-label="Zoom in">
            <Plus className="h-4 w-4" />
          </Button>
          <Button data-zoom="reset" variant="outline" size="icon" className="mapbtn" aria-label="Fit the whole map">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        <div id="foot" className="absolute bottom-3 left-4 z-10 hidden md:flex" />
      </div>

      {/* panel */}
      <aside className="mappanel flex w-full shrink-0 flex-col lg:h-full lg:w-[316px]">
        <div className="px-4 pb-3 pt-4">
          <div className="eyebrow">Paths through the map</div>
        </div>
        <div id="flows" className="px-3 pb-3" />
        <div id="context" className="min-h-0 flex-1 overflow-y-auto border-t border-[var(--rule)] px-4 pb-6 pt-4" />
      </aside>
    </div>
  );
}
