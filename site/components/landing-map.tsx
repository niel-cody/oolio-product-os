import os from "@/data/os.json";

/**
 * The teaser map on the public landing page.
 *
 * Deliberately NOT the real map component. That one ships the whole `map` object to the
 * browser to drive its SVG engine, which would put all 39 nodes, 66 edges and every skill
 * name into the public page's JavaScript payload and quietly undo the gate on /map. This is
 * a server component: it computes a small curated subset at render time and emits plain
 * HTML, so nothing beyond what you can see is in the page at all.
 *
 * What it shows: the real stage names and the real shape, a handful of named skills as
 * examples, and everything else as anonymous bars. Enough to understand what this is,
 * not enough to be the library.
 */

// Named on purpose. All five are ordinary product-management activities whose names give
// nothing away; the value in the library is the playbooks behind them, which stay behind
// the gate. Keyed by node id so a rename in the map cannot silently blank one out.
const REVEALED = new Set([
  "pm-compass",
  "storm-research",
  "write-prd",
  "steering-pack",
  "metrics-review",
]);

const TYPE_COLOUR: Record<string, string> = os.map.typeColour;

export function LandingMap() {
  const { columns, nodes } = os.map;

  const byColumn = columns.map((label, col) => ({
    label,
    nodes: nodes
      .filter((n) => n.col === col)
      .sort((a, b) => a.row - b.row)
      .map((n) => ({
        id: n.id,
        type: n.type,
        // The label is only included when revealed, so unrevealed names are absent from the
        // HTML rather than merely hidden by CSS.
        label: REVEALED.has(n.id) ? n.label : null,
      })),
  }));

  return (
    <figure className="mt-10 mb-0 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]">
      <div className="flex items-baseline justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
        <div className="eyebrow">The map, in outline</div>
        <div className="mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--muted-ink)]">
          {os.totals.skills} skills · {columns.length} stages
        </div>
      </div>

      {/* Thirteen columns will never fit a phone. It scrolls inside its own box so the page
          itself never scrolls sideways. */}
      <div className="overflow-x-auto">
        <div className="flex min-w-[1120px] gap-2 px-4 py-5">
          {byColumn.map((c) => (
            <div key={c.label} className="flex min-w-0 flex-1 flex-col gap-1.5">
              {/* Wide enough that every stage name fits. Truncated headings ("DEFINITI…")
                  made the outline look broken rather than deliberately partial. */}
              <div className="mono mb-1 whitespace-nowrap text-[8.5px] uppercase tracking-[0.1em] text-[var(--muted-ink)]">
                {c.label}
              </div>
              {c.nodes.map((n) =>
                n.label ? (
                  <div
                    key={n.id}
                    className="rounded-[4px] border px-1.5 py-1 text-[9.5px] font-medium leading-tight"
                    style={{
                      borderColor: TYPE_COLOUR[n.type] ?? "var(--line)",
                      color: "var(--ink)",
                      background: "var(--secondary)",
                    }}
                  >
                    {n.label}
                  </div>
                ) : (
                  // A withheld skill, not a gap. It has to read as a card whose label you
                  // cannot see, so it keeps the card's shape and border and carries a
                  // redacted-looking bar where the name would be.
                  <div
                    key={n.id}
                    aria-hidden
                    className="flex h-[26px] items-center rounded-[4px] border border-[var(--line)] bg-[var(--secondary)] px-1.5 opacity-70"
                    style={{ borderLeft: `2px solid ${TYPE_COLOUR[n.type] ?? "var(--line)"}` }}
                  >
                    <span className="h-[3px] w-full rounded-full bg-[var(--muted-ink)] opacity-30" />
                  </div>
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--line)] px-4 py-3 text-[11.5px] text-[var(--muted-ink)]">
        <span className="flex flex-wrap gap-x-3 gap-y-1.5">
          {Object.entries(os.map.typeLabel).map(([k, v]) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <i
                className="inline-block h-[7px] w-[7px] rounded-sm"
                style={{ background: TYPE_COLOUR[k] }}
              />
              {v}
            </span>
          ))}
        </span>
        <span className="ml-auto">Sign in for the live map, with every flow traceable.</span>
      </figcaption>
    </figure>
  );
}
