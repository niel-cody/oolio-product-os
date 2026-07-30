"use client";

import { useEffect, useState } from "react";
import "./starmap.css";

/**
 * The chart itself. Receives only what it draws.
 *
 * Every prop here is already curated by the server (see landing-map.tsx). In particular the
 * flow paths arrive as bare node ids: the source data carries a label and a prose
 * description per step, which between them would publish every skill name and what it does
 * to anyone opening devtools on the public page.
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
  accent: string; // a CSS custom property name, e.g. "--ai"
  ids: string[];
};

const W = 1000;
const H = 430;
const PAD_X = 48;
const PAD_Y = 46;

/** Deterministic 0..1 from a string. Same value on server and client, so no hydration drift. */
function hash01(s: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

const px = (x: number) => PAD_X + x * (W - PAD_X * 2);
const py = (y: number) => PAD_Y + y * (H - PAD_Y * 2);

export function Starmap({
  stars,
  constellations,
  typeColour,
  namedSkills,
  skillCount,
}: {
  stars: Star[];
  constellations: Constellation[];
  typeColour: Record<string, string>;
  namedSkills: string[];
  /** Real skills. Not the star count: seven of the points are artifacts, not skills. */
  skillCount: number;
}) {
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    // Reduced motion means no cycling at all: a chart that rewrites itself every few seconds
    // is exactly what that setting is asking us not to do.
    if (reduced || constellations.length < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % constellations.length), 4600);
    return () => clearInterval(t);
  }, [reduced, constellations.length]);

  const byId = new Map(stars.map((s) => [s.id, s]));
  const pointsFor = (c: Constellation) =>
    c.ids.map((id) => byId.get(id)).filter((s): s is Star => Boolean(s));

  const pathFor = (c: Constellation) => {
    const pts = pointsFor(c);
    if (pts.length < 2) return "";
    return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${px(p.x).toFixed(1)} ${py(p.y).toFixed(1)}`).join(" ");
  };

  const current = constellations[active];
  const lit = new Set(current ? current.ids : []);

  // The deep field. Deterministic, so it does not shimmer differently on every render.
  const dust = Array.from({ length: 110 }, (_, i) => ({
    x: hash01(`dust-x${i}`, 7) * W,
    y: hash01(`dust-y${i}`, 13) * H,
    r: 0.4 + hash01(`dust-r${i}`, 29) * 0.9,
    d: (hash01(`dust-d${i}`, 31) * 5.5).toFixed(2),
  }));

  return (
    <figure className="mt-10 mb-0">
      <div className="sm-wrap">
        <svg
          className="sm-svg"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`A star chart of the Oolio Product OS: ${skillCount} skills and the artifacts they produce, arranged left to right from signal to shipped, with ${constellations.length} end-to-end flows drawn between them.`}
        >
          <defs>
            <radialGradient id="sm-halo">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g aria-hidden>
            {dust.map((d, i) => (
              <circle
                key={i}
                className="sm-dust"
                cx={d.x}
                cy={d.y}
                r={d.r}
                fill="#8fa3c0"
                style={{ animationDelay: `${d.d}s` }}
              />
            ))}
          </g>

          {/* The constellations not currently lit, held faint. Without them the chart looks
              like it only has one path through it. */}
          <g aria-hidden>
            {constellations.map((c, i) =>
              i === active ? null : (
                <path key={c.name} className="sm-line-idle" d={pathFor(c)} stroke="#9fb0c9" strokeWidth={1} />
              ),
            )}
          </g>

          {/* Keyed by index so the draw animation restarts each time the flow changes. */}
          {current && (
            <g key={active} aria-hidden>
              <path
                className="sm-line"
                d={pathFor(current)}
                stroke={`var(${current.accent})`}
                strokeWidth={1.7}
                opacity={0.95}
              />
              {!reduced && (
                <circle className="sm-pulse" r={3.4} fill={`var(${current.accent})`}>
                  <animateMotion dur="2.6s" repeatCount="indefinite" path={pathFor(current)} />
                </circle>
              )}
            </g>
          )}

          <g>
            {stars.map((s) => {
              const on = lit.has(s.id);
              const colour = typeColour[s.type] ?? "#9fb0c9";
              return (
                <g key={s.id} className={on ? "sm-star-on" : undefined}>
                  <circle
                    className="sm-star-glow"
                    cx={px(s.x)}
                    cy={py(s.y)}
                    r={s.label ? 13 : 9}
                    fill="url(#sm-halo)"
                    style={{ animationDelay: `${(hash01(s.id, 3) * 6).toFixed(2)}s` }}
                  />
                  <circle
                    className="sm-star-core"
                    cx={px(s.x)}
                    cy={py(s.y)}
                    r={s.label ? 3.4 : on ? 3 : 2.2}
                    fill={colour}
                    opacity={s.label || on ? 1 : 0.62}
                  />
                  {s.label &&
                    (s.x > 0.78 ? (
                      // Far right: sit the label to the left of its star, or it runs off the
                      // chart and gets clipped mid-word.
                      <text
                        className="sm-label"
                        x={px(s.x) - 9}
                        y={py(s.y) + 4}
                        textAnchor="end"
                      >
                        {s.label}
                      </text>
                    ) : (
                      <text className="sm-label" x={px(s.x) + 9} y={py(s.y) + 4}>
                        {s.label}
                      </text>
                    ))}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Overlaid on a wide screen, stacked under the chart on a narrow one. At 375px the
            chart is only about 147px tall, and an overlay covers half of it. */}
        <div className="pointer-events-none relative flex flex-wrap items-end justify-between gap-2 border-t border-[var(--line)] p-3 sm:absolute sm:inset-x-0 sm:bottom-0 sm:border-t-0 sm:p-4">
          <div key={active} className="sm-flowname">
            <div className="mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted-ink)]">
              {reduced ? "End-to-end flows" : "Tracing"}
            </div>
            <div
              className="mt-1 text-[13px] font-semibold sm:text-[15px]"
              style={{ color: current ? `var(${current.accent})` : undefined }}
            >
              {reduced ? `${constellations.length} paths through the map` : current?.name}
            </div>
          </div>
          <div className="mono text-right text-[9px] uppercase tracking-[0.14em] text-[var(--muted-ink)]">
            {skillCount} skills · {constellations.length} flows
          </div>
        </div>
      </div>

      <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[12.5px] leading-relaxed text-[var(--muted-ink)]">
        <span className="sm:hidden">
          Named here: {namedSkills.join(", ")}.
        </span>
        <span>
          Every point is a real skill. Sign in to read them, and to trace any flow step by step.
        </span>
      </figcaption>
    </figure>
  );
}
