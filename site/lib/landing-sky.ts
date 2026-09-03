import "server-only";
import os from "@/data/os.json";

/**
 * Curates what the public landing page is allowed to know.
 *
 * Server-only on purpose: importing this from a client component would bundle os.json —
 * every skill name, description, trigger phrase and system link — into the public payload,
 * which is exactly what this file exists to prevent.
 *
 * The public page may show (decided 2026-08-31, when the landing page was rebuilt to
 * convert rather than to look nice):
 *   - the 13 lifecycle stage names and their purposes. General product-management
 *     vocabulary; naming them is what stops the page reading as generic.
 *   - the 6 flow names and the stages each one crosses. Stage indices only, never the
 *     skill names or step descriptions on the path.
 *   - the 5 skills in SHOWCASE, with hand-written public copy rather than the catalogue's
 *     own text, so trigger phrases never reach the open web.
 *
 * Still gated, and not derivable from anything here: the other 27 skill names, every
 * skill's triggers and excludes, the systems map, and the changelog.
 *
 * Three live traps in the source data:
 *   - `node.label` is the skill's name. No star carries one at all now.
 *   - `node.id` is the skill's *slug*, which is the name with hyphens in it. It used to
 *     travel to the browser as a React key, which quietly published all 32 of them
 *     (`behavioural-alchemist`, `leadership-subcommittee-review`, and the rest) in the
 *     page source — the exact leak the rest of this file was written to prevent. Stars are
 *     keyed by an opaque index now, and no id crosses the boundary. Found by grepping the
 *     rendered HTML for every gated name on 2026-08-31; worth re-running after any change
 *     to what this file returns.
 *   - `flow.path` rows are [id, label, description]: the label is the skill name and the
 *     description says what that step does. All three are consumed here, and only a
 *     coordinate, a column index or an opaque star index comes back out.
 */

export type Star = {
  /** An opaque index, never the node id. See the note in getSky(). */
  id: number;
  x: number; // 0..1
  y: number; // 0..1
  type: string;
};

export type Constellation = {
  name: string;
  accent: string; // CSS custom property name, e.g. "--ai"
  ids: number[];
};

export type Sky = {
  stars: Star[];
  constellations: Constellation[];
  typeColour: Record<string, string>;
};

export type Stage = { name: string; purpose: string; gate: boolean };

/** A flow, reduced to the lifecycle stages it crosses. Consecutive repeats collapsed. */
export type FlowRail = {
  name: string;
  accent: string;
  /** Indices into Stage[], in order. May revisit an earlier index: that is the loop. */
  stages: number[];
  /** True when the flow returns to a stage it has already left. */
  loops: boolean;
};

export type Showcase = {
  id: string;
  command: string;
  title: string;
  stage: string;
  /** One line, written for a stranger. Never the catalogue blurb, which carries triggers. */
  line: string;
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

/** Deterministic 0..1 from a string. Stable across server and client renders. */
function hash01(s: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/**
 * The hero's star field. Texture, not the argument: the landing page used to hand the
 * whole first screen to this drawing, which looked expensive and said nothing. Labels are
 * gone from it entirely now, so there is nothing here to leak.
 */
export function getSky(): Sky {
  const { columns, nodes, flows, typeColour } = os.map;
  const maxRow = Math.max(...nodes.map((n) => n.row));
  const cols = columns.length;

  // Position in this array is the only identity a star gets on the public side.
  const indexOf = new Map(nodes.map((n, i) => [n.id, i]));

  // Column drives x so the lifecycle reads left to right and every constellation sweeps
  // signal-to-shipped. Jitter is hashed from the node id, never random: this renders on
  // both server and client, and Math.random() would hydrate differently. The id is only
  // ever the hash input; what ships is the number that comes out.
  const stars: Star[] = nodes.map((n, i) => ({
    id: i,
    x: Math.min(0.99, Math.max(0.01, (n.col + 0.5) / cols + (hash01(n.id, 11) - 0.5) * 0.05)),
    y: Math.min(0.94, Math.max(0.08, (n.row + 0.5) / (maxRow + 1) + (hash01(n.id, 17) - 0.5) * 0.14)),
    type: n.type,
  }));

  const constellations: Constellation[] = flows.map((f) => ({
    name: f.name,
    accent: f.accent,
    // step[0] is the node id, resolved to its index here and dropped. step[1] (the skill
    // name) and step[2] (what that step does) are deliberately never read.
    ids: f.path
      .map((step) => indexOf.get(step[0]))
      .filter((i): i is number => i !== undefined),
  }));

  return { stars, constellations, typeColour };
}

/**
 * The 13 lifecycle stages, in order, each with the one-paragraph purpose it carries, and
 * whether a review gate closes behind it.
 *
 * The gate flag is the one piece of the map's meaning the landing page cannot do without:
 * "a person signs off anything that counts" is the page's central claim in words, and the
 * third ink drum exists to say it in colour. Derived from map.config.json's gates rather
 * than listed here, so a gate that moves moves on this page too.
 *
 * It reveals nothing gated. The stage names are already public, and which of them a human
 * signs off is the argument the page is making out loud.
 */
export function getStages(): Stage[] {
  const byName = new Map(os.stages.map((s) => [s.name, s.purpose]));
  // `after` is the column index the gate closes behind, not the column's name: the
  // generator resolves the name in map.config.json to a position before it lands here.
  const gated = new Set(os.map.gates.map((g) => g.after));
  return os.map.columns.map((name, i) => ({
    name,
    purpose: byName.get(name) ?? "",
    gate: gated.has(i),
  }));
}

/**
 * Each flow as the sequence of stages it crosses. This is the concrete thing the landing
 * page can say out loud: not "six end-to-end flows" but "Signals, then Intake, then
 * Grooming, then Definition", which a reader can check against their own week.
 */
export function getFlowRails(): FlowRail[] {
  const col = new Map(os.map.nodes.map((n) => [n.id, n.col]));

  return os.map.flows.map((f) => {
    const stages: number[] = [];
    for (const step of f.path) {
      // step[0] only. The label and description on each row stay behind the gate.
      const c = col.get(step[0]);
      if (c === undefined || c === stages[stages.length - 1]) continue;
      stages.push(c);
    }
    // A revisit is a loop: the flow leaves a stage and later comes back to it. That is the
    // whole reason this is a system and not a pipeline, so it is worth saying.
    const loops = stages.some((c, i) => i > 0 && c < stages[i - 1]);
    return { name: f.name, accent: f.accent, stages, loops };
  });
}

/**
 * Five named skills, so the page can show rather than claim. The copy is written here, not
 * read from the catalogue: catalogue entries carry `phrases` and `when`, which are the
 * routing triggers and stay private.
 */
const SHOWCASE_COPY: Record<string, string> = {
  "pm-compass": "Describe the task in your own words. It names the one skill that fits and starts it.",
  "storm-research":
    "One topic in, a multi-perspective briefing out, every claim carrying a source you can open.",
  "write-prd":
    "A groomed idea becomes a PRD in the house format, grounded in the persona library, published where the team already reads.",
  "steering-pack":
    "A slice of the backlog becomes a review pack: one-liners, what is missing, council verdicts, and the order to discuss them in.",
  "metrics-review":
    "Six weeks later, the same PRD is measured against the numbers it promised, and told plainly when it missed.",
};

export function getShowcase(): Showcase[] {
  const order = ["pm-compass", "storm-research", "write-prd", "steering-pack", "metrics-review"];
  const byId = new Map(os.catalogue.map((c) => [c.id, c]));

  return order.flatMap((id) => {
    const c = byId.get(id);
    if (!c || !REVEALED.has(id)) return [];
    return [{ id, command: c.command, title: c.title, stage: c.stage, line: SHOWCASE_COPY[id] ?? "" }];
  });
}
