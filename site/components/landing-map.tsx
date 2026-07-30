import os from "@/data/os.json";
import { Starmap, type Constellation, type Star } from "./starmap";

/**
 * Curates what the public star chart is allowed to know, then hands it over.
 *
 * This boundary is the whole point of the file. The real map component takes `os.map`
 * wholesale and ships it to the browser to drive its SVG engine, which would put all 39
 * node labels, all 66 edges and every flow step's prose description into the public page's
 * payload — undoing the gate on /map from the page sitting next to it. Everything below
 * either drops a field or anonymises it.
 *
 * Two specific traps, both live in the source data:
 *   - `node.label` is the skill's name. Only the five in REVEALED keep theirs.
 *   - `flow.path` rows are [id, label, description]. The label is the skill name and the
 *     description says what that step does. Both are dropped; only the id survives, and ids
 *     are only ever used to look up coordinates.
 */

// Named on purpose. Five ordinary product-management activities whose names give nothing
// away — the value is in the playbooks behind them, and those stay behind the gate. Keyed by
// node id so a rename upstream cannot silently blank one out.
const REVEALED = new Set([
  "pm-compass",
  "storm-research",
  "write-prd",
  "steering-pack",
  "metrics-review",
]);

/** Deterministic 0..1 from a string, matching the client's. Keeps positions stable. */
function hash01(s: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

export function LandingMap() {
  const { columns, nodes, flows, typeColour } = os.map;

  const maxRow = Math.max(...nodes.map((n) => n.row));
  const cols = columns.length;

  // Column drives x, so the lifecycle still reads left to right and every constellation
  // sweeps signal-to-shipped. The jitter is what stops it looking like a spreadsheet; it is
  // hashed from the id rather than random so server and client agree.
  const stars: Star[] = nodes.map((n) => ({
    id: n.id,
    x: Math.min(0.995, Math.max(0.005, (n.col + 0.5) / cols + (hash01(n.id, 11) - 0.5) * 0.05)),
    y: Math.min(0.97, Math.max(0.03, (n.row + 0.5) / (maxRow + 1) + (hash01(n.id, 17) - 0.5) * 0.13)),
    type: n.type,
    label: REVEALED.has(n.id) ? n.label : null,
  }));

  const known = new Set(stars.map((s) => s.id));
  const constellations: Constellation[] = flows.map((f) => ({
    name: f.name,
    accent: f.accent,
    // `step[0]` is the node id. step[1] (the skill name) and step[2] (what it does) are
    // deliberately never read.
    ids: f.path.map((step) => step[0]).filter((id) => known.has(id)),
  }));

  const namedSkills = stars.filter((s) => s.label).map((s) => s.label as string);

  return (
    <Starmap
      stars={stars}
      constellations={constellations}
      typeColour={typeColour}
      namedSkills={namedSkills}
      skillCount={os.totals.skills}
    />
  );
}
