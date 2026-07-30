import "server-only";
import os from "@/data/os.json";

/**
 * Curates what the public sky is allowed to know. Server-only on purpose: importing this
 * from a client component would bundle os.json — every skill name, description and flow
 * step — into the public page, which is exactly what this file exists to prevent.
 *
 * Two live traps in the source data:
 *   - `node.label` is the skill's name. Only the five in REVEALED keep theirs.
 *   - `flow.path` rows are [id, label, description]: the label is the skill name and the
 *     description says what that step does. Both are dropped here; only the id survives,
 *     and ids are only ever used to look up coordinates.
 */

export type Star = {
  id: string;
  x: number; // 0..1
  y: number; // 0..1
  type: string;
  label: string | null;
};

export type Constellation = {
  name: string;
  accent: string; // CSS custom property name, e.g. "--ai"
  ids: string[];
};

export type Sky = {
  stars: Star[];
  constellations: Constellation[];
  typeColour: Record<string, string>;
};

// Named on purpose: five ordinary product-management activities whose names give nothing
// away. Keyed by node id so a rename upstream cannot silently blank one out.
const REVEALED = new Set([
  "pm-compass",
  "storm-research",
  "write-prd",
  "steering-pack",
  "metrics-review",
]);

// The named stars take hand-placed vertical positions. Their source rows all sit near the
// top of the lifecycle grid, which clustered every label in the sky's first quarter and
// left the rest looking anonymous. Spreading them is editorial, not data.
// Chosen to keep every label out of the centre band, where the title card sits.
const REVEAL_Y: Record<string, number> = {
  "pm-compass": 0.55,
  "storm-research": 0.16,
  "write-prd": 0.82,
  "steering-pack": 0.72,
  "metrics-review": 0.24,
};

/** Deterministic 0..1 from a string. Stable across server and client renders. */
function hash01(s: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

export function getSky(): Sky {
  const { columns, nodes, flows, typeColour } = os.map;
  const maxRow = Math.max(...nodes.map((n) => n.row));
  const cols = columns.length;

  // Column drives x so the lifecycle reads left to right and every constellation sweeps
  // signal-to-shipped. Jitter is hashed from the id, never random: this renders on both
  // server and client, and Math.random() would hydrate differently.
  const stars: Star[] = nodes.map((n) => ({
    id: n.id,
    x: Math.min(0.99, Math.max(0.01, (n.col + 0.5) / cols + (hash01(n.id, 11) - 0.5) * 0.05)),
    y:
      REVEAL_Y[n.id] ??
      Math.min(0.94, Math.max(0.08, (n.row + 0.5) / (maxRow + 1) + (hash01(n.id, 17) - 0.5) * 0.14)),
    type: n.type,
    label: REVEALED.has(n.id) ? n.label : null,
  }));

  const known = new Set(stars.map((s) => s.id));
  const constellations: Constellation[] = flows.map((f) => ({
    name: f.name,
    accent: f.accent,
    // step[0] is the node id. step[1] (skill name) and step[2] (what it does) are
    // deliberately never read.
    ids: f.path.map((step) => step[0]).filter((id) => known.has(id)),
  }));

  return { stars, constellations, typeColour };
}
