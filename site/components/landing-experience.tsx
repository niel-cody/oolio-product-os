"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Sky } from "@/lib/landing-sky";
import "./landing.css";

/**
 * The signed-out front door.
 *
 * Act 1 — the sky. Full-viewport, alive on its own: the six flows trace themselves as
 *         constellations on a loop, forever, with the flow's name as a sub-headline and
 *         stars lighting as the line reaches them. Scroll is not involved; an earlier
 *         version scrubbed the drawing with the wheel, and the page felt like it locked
 *         whenever the visitor stopped.
 * Act 2 — Signal · Decide · Learn, side by side, with the loop drawn under them, because
 *         a cycle is what they actually are.
 * Act 3 — the numbers, counted up. All real.
 * Act 4 — "Learn it once." and the door.
 *
 * This component only ever receives the curated sky (lib/landing-sky.ts). Nothing here may
 * import os.json: that would bundle every skill name and flow description into the public
 * payload this page exists to protect.
 */

const W = 1600;
const H = 900;
const PAD_X = 80;
const PAD_Y = 90;

const px = (x: number) => PAD_X + x * (W - PAD_X * 2);
const py = (y: number) => PAD_Y + y * (H - PAD_Y * 2);

// Constant SPEED, not constant duration: a fixed draw time made the seventeen-step flow
// race and the five-step one crawl. Duration is each path's measured length over this
// speed, clamped so no flow is a blink or an age. Hold the finished shape, then move on.
const SPEED_PX_PER_S = 620;
const HOLD_MS = 1700;
const MIN_DRAW_MS = 2400;
const MAX_DRAW_MS = 6500;

function hash01(s: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/** One-shot in-view flag for the reveal sections. */
function useInView<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** Counts up when scrolled into view. Reduced motion prints the final value directly. */
function Counter({ to, label, reduced }: { to: number; label: string; reduced: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.6);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setValue(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 1200;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, reduced]);

  return (
    <div ref={ref} className="text-center">
      <div className="mono text-[34px] font-semibold tabular-nums tracking-tight text-[var(--ink)] sm:text-[46px]">
        {value}
      </div>
      <div className="eyebrow mt-1.5">{label}</div>
    </div>
  );
}

const BEATS = [
  {
    word: "Signal",
    colour: "var(--signal)",
    line: "Everything the market says, caught, cited, and filed where it compounds.",
  },
  {
    word: "Decide",
    colour: "var(--human)",
    line: "Every call pressure-tested by a council, recorded, and signed by a person.",
  },
  {
    word: "Learn",
    colour: "var(--output)",
    line: "Every launch measured against the promise its PRD made.",
  },
];

export function LandingExperience({
  sky,
  signedIn,
  counts,
}: {
  sky: Sky;
  signedIn: boolean;
  counts: { skills: number; stages: number; flows: number; changes: number };
}) {
  const reduced = useReducedMotion();
  const [flowIdx, setFlowIdx] = useState(0);
  const n = sky.constellations.length;



  const byId = useMemo(() => new Map(sky.stars.map((s) => [s.id, s])), [sky.stars]);

  const paths = useMemo(
    () =>
      sky.constellations.map((c) => {
        const pts = c.ids.map((id) => byId.get(id)).filter((s): s is NonNullable<typeof s> => Boolean(s));
        return pts.length < 2
          ? ""
          : pts.map((pt, i) => `${i === 0 ? "M" : "L"} ${px(pt.x).toFixed(1)} ${py(pt.y).toFixed(1)}`).join(" ");
      }),
    [sky.constellations, byId],
  );

  // Path lengths for the draw animation, measured from the always-rendered idle paths.
  const idleRefs = useRef<(SVGPathElement | null)[]>([]);
  const [lens, setLens] = useState<number[]>([]);
  useEffect(() => {
    setLens(idleRefs.current.map((el) => (el ? el.getTotalLength() : 0)));
  }, [paths]);

  const drawMs = useMemo(
    () =>
      lens.map((l) =>
        Math.round(Math.min(MAX_DRAW_MS, Math.max(MIN_DRAW_MS, (l / SPEED_PX_PER_S) * 1000))),
      ),
    [lens],
  );

  // The heartbeat. A self-scheduling timeout rather than an interval, because each flow now
  // holds the stage for its own draw time plus the hold. Plain timers, deliberately not
  // rAF: rAF stops in hidden tabs, which pauses the loop and makes it untestable headless.
  useEffect(() => {
    if (reduced || n < 2 || drawMs.length < n) return;
    const t = setTimeout(() => setFlowIdx((i) => (i + 1) % n), (drawMs[flowIdx] ?? 3600) + HOLD_MS);
    return () => clearTimeout(t);
  }, [reduced, n, flowIdx, drawMs]);

  // When does the trace reach each star on the current flow? Distance along the polyline
  // as a fraction of its total, so a star's flare lands exactly as the line arrives.
  const hits = useMemo(() => {
    const c = sky.constellations[flowIdx];
    const map = new Map<string, number>();
    if (!c) return map;
    const pts = c.ids.map((id) => byId.get(id)).filter((s): s is NonNullable<typeof s> => Boolean(s));
    let total = 0;
    const cum = [0];
    for (let i = 1; i < pts.length; i++) {
      total += Math.hypot(px(pts[i].x) - px(pts[i - 1].x), py(pts[i].y) - py(pts[i - 1].y));
      cum.push(total);
    }
    pts.forEach((pt, i) => {
      if (!map.has(pt.id)) map.set(pt.id, total > 0 ? cum[i] / total : 0);
    });
    return map;
  }, [flowIdx, sky.constellations, byId]);

  const current = sky.constellations[flowIdx];
  const prevIdx = (flowIdx + n - 1) % n;

  const dust = useMemo(
    () =>
      Array.from({ length: 130 }, (_, i) => ({
        x: hash01(`dust-x${i}`, 7) * W,
        y: hash01(`dust-y${i}`, 13) * H,
        r: 0.5 + hash01(`dust-r${i}`, 29) * 1.1,
        d: (hash01(`dust-d${i}`, 31) * 5.5).toFixed(2),
      })),
    [],
  );

  const cta = signedIn
    ? { href: "/app/today", label: "Open Flightdeck" }
    : { href: "/login", label: "Sign in" };

  return (
    <main className="lx-sky flex-1">
      {/* ============================== ACT 1 — THE SKY ============================== */}
      <section className="relative h-[100svh] overflow-hidden">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={`A star chart of the Oolio Product OS: ${counts.skills} skills and the artifacts they produce, with ${counts.flows} end-to-end flows tracing themselves between the stars on a loop.`}
        >
          <defs>
            <radialGradient id="lx-halo">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g aria-hidden>
            {dust.map((d, i) => (
              <circle
                key={i}
                className="lx-dust"
                cx={d.x}
                cy={d.y}
                r={d.r}
                fill="#8fa3c0"
                style={{ animationDelay: `${d.d}s` }}
              />
            ))}
          </g>

          {/* Idle constellation lines: always present and faint, so the sky reads as
              charted from the first frame. Also what path lengths are measured from. */}
          <g aria-hidden>
            {paths.map((d, i) => (
              <path
                key={i}
                ref={(el) => {
                  idleRefs.current[i] = el;
                }}
                d={d}
                fill="none"
                stroke="#9fb0c9"
                strokeWidth={1.2}
                opacity={reduced ? 0.3 : 0.09}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>

          {reduced ? (
            // Reduced motion: every constellation drawn, nothing moving.
            <g aria-hidden>
              {sky.constellations.map((c, i) => (
                <path
                  key={c.name}
                  d={paths[i]}
                  fill="none"
                  stroke={`var(${c.accent})`}
                  strokeWidth={1.6}
                  opacity={0.55}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </g>
          ) : (
            current &&
            lens[flowIdx] > 0 && (
              <g aria-hidden>
                {/* The flow that just finished, letting go. */}
                <path
                  key={`prev-${flowIdx}`}
                  className="lx-trace-prev"
                  d={paths[prevIdx]}
                  fill="none"
                  stroke={`var(${sky.constellations[prevIdx].accent})`}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* The trace. Keyed so the draw restarts each cycle. */}
                <path
                  key={`trace-${flowIdx}`}
                  className="lx-trace"
                  d={paths[flowIdx]}
                  fill="none"
                  stroke={`var(${current.accent})`}
                  strokeWidth={2.4}
                  opacity={0.95}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ ["--len" as string]: lens[flowIdx], ["--dur" as string]: `${drawMs[flowIdx]}ms` }}
                />
                {/* The pulse riding the draw front. */}
                <circle
                  key={`pulse-${flowIdx}`}
                  className="lx-pulse"
                  r={4.5}
                  fill={`var(${current.accent})`}
                  style={{ ["--dur" as string]: `${drawMs[flowIdx]}ms` }}
                >
                  <animateMotion
                    dur={`${drawMs[flowIdx]}ms`}
                    repeatCount="1"
                    fill="freeze"
                    keyPoints="0;1"
                    keyTimes="0;1"
                    calcMode="spline"
                    keySplines="0.35 0.55 0.25 1"
                    path={paths[flowIdx]}
                  />
                </circle>
              </g>
            )
          )}

          <g>
            {sky.stars.map((s) => {
              const hit = hits.get(s.id);
              const onFlow = !reduced && hit !== undefined;
              const colour = sky.typeColour[s.type] ?? "#9fb0c9";
              const hitDelay = `${Math.round((hit ?? 0) * (drawMs[flowIdx] ?? 3600))}ms`;
              return (
                <g key={s.id}>
                  <circle
                    className="lx-star-glow"
                    cx={px(s.x)}
                    cy={py(s.y)}
                    r={s.label ? 20 : 14}
                    fill="url(#lx-halo)"
                    style={{ animationDelay: `${(hash01(s.id, 3) * 6).toFixed(2)}s` }}
                  />
                  {onFlow ? (
                    // On the flow being traced: flare exactly as the line arrives.
                    <circle
                      key={`hit-${flowIdx}`}
                      className="lx-starhit"
                      cx={px(s.x)}
                      cy={py(s.y)}
                      r={s.label ? 5 : 3.4}
                      fill={colour}
                      style={{ ["--hit" as string]: hitDelay }}
                    />
                  ) : (
                    <circle cx={px(s.x)} cy={py(s.y)} r={s.label ? 5 : 3.2} fill={colour} opacity={s.label ? 0.95 : 0.6} />
                  )}
                  {s.label &&
                    (onFlow ? (
                      <text
                        key={`lhit-${flowIdx}`}
                        className="lx-label lx-label-hit"
                        style={{ ["--hit" as string]: hitDelay }}
                        {...(s.x > 0.8
                          ? { x: px(s.x) - 13, y: py(s.y) + 6, textAnchor: "end" as const }
                          : { x: px(s.x) + 13, y: py(s.y) + 6 })}
                      >
                        {s.label}
                      </text>
                    ) : (
                      <text
                        className="lx-label"
                        {...(s.x > 0.8
                          ? { x: px(s.x) - 13, y: py(s.y) + 6, textAnchor: "end" as const }
                          : { x: px(s.x) + 13, y: py(s.y) + 6 })}
                      >
                        {s.label}
                      </text>
                    ))}
                </g>
              );
            })}
          </g>
        </svg>

        {/* A soft vignette behind the title, so the type stays legible while the traces
            pass behind it rather than through it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(46% 42% at 50% 47%, rgba(7,11,17,0.78), rgba(7,11,17,0.4) 58%, transparent 78%)",
          }}
        />

        {/* The title card. Persistent: the sky animates behind it, and scrolling simply
            carries the visitor onward. */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
          <div className="eyebrow">Oolio Product OS</div>
          <h1 className="mt-4 max-w-[900px] text-[42px] font-bold leading-[1.06] tracking-tight sm:text-[72px]">
            Signal to shipped.
          </h1>
          <p className="mt-5 max-w-[560px] text-[15px] leading-relaxed text-[var(--muted-ink)] sm:text-[17px]">
            The product team, written down and running: {counts.skills} real skills against our
            real tools.
          </p>

          {/* What the sky is tracing right now, as a headline element rather than a
              corner caption. */}
          <div className="mt-7 flex h-[52px] flex-col items-center justify-center" aria-live="off">
            <div className="mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted-ink)]">
              {reduced ? "End-to-end flows" : "Now tracing"}
            </div>
            <div
              key={flowIdx}
              className="lx-flowname mt-1 text-[17px] font-semibold sm:text-[21px]"
              style={{ color: current ? `var(${current.accent})` : undefined }}
            >
              {reduced ? `${counts.flows} paths through the map` : current?.name}
            </div>
          </div>

          <Button asChild size="lg" className="mt-6 h-11 px-6 text-[14px]">
            <Link href={cta.href}>
              {cta.label} <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>

          <div className="lx-hint absolute bottom-7 flex flex-col items-center gap-1 text-[var(--muted-ink)]">
            <span className="mono text-[9px] uppercase tracking-[0.16em]">Scroll</span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </section>

      {/* ==================== ACT 2 — THE LOOP: SIGNAL · DECIDE · LEARN ==================== */}
      <LoopBeats />

      {/* ============================== ACT 3 — THE NUMBERS ============================== */}
      <section className="border-y border-[var(--line)] bg-[var(--panel)]/60">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-y-10 px-5 py-14 sm:grid-cols-4 sm:py-16">
          <Counter to={counts.skills} label="Skills" reduced={reduced} />
          <Counter to={counts.stages} label="Lifecycle stages" reduced={reduced} />
          <Counter to={counts.flows} label="End-to-end flows" reduced={reduced} />
          <Counter to={counts.changes} label="Changes logged" reduced={reduced} />
        </div>
      </section>

      {/* ============================== ACT 4 — THE DOOR ============================== */}
      <FinalCta signedIn={signedIn} cta={cta} />
    </main>
  );
}

function LoopBeats() {
  const { ref, inView } = useInView<HTMLDivElement>(0.35);
  return (
    <section className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
      <div ref={ref} className={`lx-reveal ${inView ? "is-in" : ""}`}>
        <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          {BEATS.map((b) => (
            <div key={b.word}>
              <div className="text-[34px] font-bold leading-none tracking-tight sm:text-[44px]" style={{ color: b.colour }}>
                {b.word}
              </div>
              <p className="mt-3 max-w-[340px] text-[14px] leading-relaxed text-[var(--muted-ink)] sm:text-[15px]">
                {b.line}
              </p>
            </div>
          ))}
        </div>

        {/* The loop itself, drawn: out along the top, back along the bottom, forever.
            Marching dashes carry the direction; it is a cycle, not a pipeline. */}
        <svg
          className="mt-10 hidden w-full sm:block"
          viewBox="0 0 600 64"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path className="lx-loop" d="M 30 14 H 570 A 18 18 0 0 1 570 50 H 30 A 18 18 0 0 1 30 14 Z" />
        </svg>
        <p className="eyebrow mt-4 text-center sm:mt-3">
          A loop, not a pipeline · findings land in the Brain, so every pass starts ahead of the last
        </p>
      </div>
    </section>
  );
}

function FinalCta({ signedIn, cta }: { signedIn: boolean; cta: { href: string; label: string } }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 sm:py-28">
      <div ref={ref} className={`lx-reveal ${inView ? "is-in" : ""}`}>
        <p className="text-[36px] font-bold tracking-tight sm:text-[52px]">Learn it once.</p>
        <p className="mono mt-4 max-w-[540px] text-[10.5px] leading-relaxed text-[var(--muted-ink)]">
          Generated from the skills themselves, so it cannot drift from what we actually run.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button asChild size="lg" className="h-11 px-6 text-[14px]">
            <Link href={cta.href}>
              {cta.label} <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          {!signedIn && (
            <span className="text-[13px] text-[var(--muted-ink)]">
              Oolio teammates only. Access is granted per person.
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
