"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Sky } from "@/lib/landing-sky";
import "./landing.css";

/**
 * The whole signed-out front door, as one scroll.
 *
 * Act 1 — the sky. A full-viewport star chart pinned while you scroll through it; the six
 *         flows draw themselves as constellations, one at a time, driven by scroll position
 *         rather than a timer, so the visitor assembles the system by moving through it.
 * Act 2 — three beats: Signal, Decide, Learn. One line each.
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

function hash01(s: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

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
      const t = clamp01((now - start) / dur);
      // Ease out, so the last few digits land gently instead of snapping.
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
  const wrapRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  // Scroll drives everything in Act 1. No rAF wrapper on purpose: browsers already fire
  // scroll at most once per frame, React batches the setState, and rAF callbacks stop
  // entirely in a hidden tab, which made the scrub untestable headless for zero gain.
  useEffect(() => {
    if (reduced) return;
    const onScroll = () => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      setP(total > 0 ? clamp01(-rect.top / total) : 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

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

  // Path lengths for the draw effect, measured from the idle (always-rendered) paths.
  const idleRefs = useRef<(SVGPathElement | null)[]>([]);
  const [lens, setLens] = useState<number[]>([]);
  useEffect(() => {
    setLens(idleRefs.current.map((el) => (el ? el.getTotalLength() : 0)));
  }, [paths]);

  // The scroll script. Title holds the first stretch, then each flow gets an equal slice.
  const TITLE_END = 0.14;
  const FLOWS_END = 0.97;
  const slice = (FLOWS_END - TITLE_END) / sky.constellations.length;

  const flowProgress = (i: number) =>
    reduced ? 1 : clamp01((p - TITLE_END - i * slice) / slice);

  const currentFlow = reduced
    ? -1
    : Math.min(sky.constellations.length - 1, Math.max(0, Math.floor((p - TITLE_END) / slice)));
  const inFlows = !reduced && p > TITLE_END;

  const lit = useMemo(() => {
    if (!inFlows) return new Set<string>();
    return new Set(sky.constellations[currentFlow]?.ids ?? []);
  }, [inFlows, currentFlow, sky.constellations]);

  const titleOpacity = reduced ? 1 : 1 - clamp01((p - 0.05) / 0.09);

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
      <div ref={wrapRef} className={reduced ? "relative" : "relative h-[340vh]"}>
        <div className={`${reduced ? "relative" : "sticky top-0"} h-[100svh] overflow-hidden`}>
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid slice"
            role="img"
            aria-label={`A star chart of the Oolio Product OS: ${counts.skills} skills and the artifacts they produce, arranged from signal to shipped, with ${counts.flows} end-to-end flows drawn between them as constellations.`}
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
                charted from the first frame. These are also what we measure lengths from. */}
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

            {/* The bright lines, drawn by scroll. Completed flows stay lit but recede. */}
            {!reduced && (
              <g aria-hidden>
                {sky.constellations.map((c, i) => {
                  const fp = flowProgress(i);
                  if (fp <= 0 || !lens[i]) return null;
                  return (
                    <path
                      key={c.name}
                      d={paths[i]}
                      fill="none"
                      stroke={`var(${c.accent})`}
                      strokeWidth={i === currentFlow ? 2.6 : 1.6}
                      opacity={i === currentFlow ? 0.95 : 0.35}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={lens[i]}
                      strokeDashoffset={lens[i] * (1 - fp)}
                    />
                  );
                })}
              </g>
            )}
            {reduced && (
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
            )}

            <g>
              {sky.stars.map((s) => {
                const on = lit.has(s.id);
                const colour = sky.typeColour[s.type] ?? "#9fb0c9";
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
                    <circle
                      cx={px(s.x)}
                      cy={py(s.y)}
                      r={s.label ? 5 : on ? 4.6 : 3.2}
                      fill={colour}
                      opacity={s.label || on ? 1 : 0.6}
                    />
                    {s.label &&
                      (s.x > 0.8 ? (
                        <text className="lx-label" x={px(s.x) - 13} y={py(s.y) + 6} textAnchor="end">
                          {s.label}
                        </text>
                      ) : (
                        <text className="lx-label" x={px(s.x) + 13} y={py(s.y) + 6}>
                          {s.label}
                        </text>
                      ))}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* The title card. Fades as the scrub begins so the sky gets the stage. */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center"
            style={{ opacity: titleOpacity, pointerEvents: titleOpacity < 0.15 ? "none" : undefined }}
          >
            <div className="eyebrow">Oolio Product OS</div>
            <h1 className="mt-4 max-w-[900px] text-[42px] font-bold leading-[1.06] tracking-tight sm:text-[72px]">
              Signal to shipped.
            </h1>
            <p className="mt-5 max-w-[560px] text-[15px] leading-relaxed text-[var(--muted-ink)] sm:text-[17px]">
              The product team, written down and running: {counts.skills} real skills against our
              real tools.
            </p>
            <Button asChild size="lg" className="mt-8 h-11 px-6 text-[14px]">
              <Link href={cta.href}>
                {cta.label} <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            {!reduced && (
              <div className="lx-hint absolute bottom-7 flex flex-col items-center gap-1 text-[var(--muted-ink)]">
                <span className="mono text-[9px] uppercase tracking-[0.16em]">Scroll to chart it</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            )}
          </div>

          {/* The name of the flow being traced. */}
          {inFlows && sky.constellations[currentFlow] && (
            <div key={currentFlow} className="lx-flowname absolute bottom-8 left-5 sm:bottom-10 sm:left-8">
              <div className="mono text-[9px] uppercase tracking-[0.16em] text-[var(--muted-ink)]">
                Tracing · {currentFlow + 1} of {sky.constellations.length}
              </div>
              <div
                className="mt-1 text-[16px] font-semibold sm:text-[20px]"
                style={{ color: `var(${sky.constellations[currentFlow].accent})` }}
              >
                {sky.constellations[currentFlow].name}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================== ACT 2 — THE BEATS ============================== */}
      <section className="mx-auto max-w-3xl px-5 py-10 sm:py-16">
        {BEATS.map((b) => {
          return <Beat key={b.word} {...b} />;
        })}
      </section>

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

function Beat({ word, colour, line }: (typeof BEATS)[number]) {
  const { ref, inView } = useInView<HTMLDivElement>(0.45);
  return (
    <div
      ref={ref}
      className={`lx-reveal ${inView ? "is-in" : ""} flex min-h-[38svh] flex-col justify-center py-10`}
    >
      <div className="text-[40px] font-bold leading-none tracking-tight sm:text-[64px]" style={{ color: colour }}>
        {word}
      </div>
      <p className="mt-4 max-w-[520px] text-[15px] leading-relaxed text-[var(--muted-ink)] sm:text-[17px]">
        {line}
      </p>
    </div>
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
