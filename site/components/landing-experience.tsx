"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Copy, CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INSTALL_COMMAND, MARKETPLACE_COMMAND, REPO_URL } from "@/lib/install";
import type { FlowRail, Showcase, Sky, Stage } from "@/lib/landing-sky";
import "./landing.css";

/**
 * The signed-out front door.
 *
 * Rebuilt 2026-08-31 with one job: turn an Oolio teammate who has heard about this into
 * someone with the plugin installed. The previous version was a full-screen animated star
 * chart, four counted-up numbers and four abstractions, and it never once said what the
 * thing does or how to get it. It looked expensive and converted nobody.
 *
 * The order is an argument, and each beat earns the next:
 *   1. Hero      — what it is, and the two lines that install it.
 *   2. Problem   — the sentence a reader recognises from their own team.
 *   3. Lifecycle — thirteen named stages and six paths through them, from the real map.
 *                  This is the page's proof: specifics a reader can check.
 *   4. Skills    — five of them by name, with the command you actually type.
 *   5. Honesty   — the four rules that stop this being a machine that writes documents.
 *   6. Set up    — access, two commands, first prompt. The conversion.
 *   7. Door      — "Learn it once." and the way in.
 *
 * The star field survives as atmosphere behind the hero and nothing more. It carries no
 * labels now, so unlike the old version there is nothing in it to leak.
 *
 * This component may only ever receive curated data (lib/landing-sky.ts). Nothing here may
 * import os.json: that would bundle every skill name, trigger and system link into the
 * public payload this page exists to protect.
 */

const W = 1600;
const H = 900;
const PAD_X = 80;
const PAD_Y = 90;

const px = (x: number) => PAD_X + x * (W - PAD_X * 2);
const py = (y: number) => PAD_Y + y * (H - PAD_Y * 2);

// Constant SPEED, not constant duration: a fixed draw time made the seventeen-step flow
// race and the five-step one crawl. Slower than the old hero on purpose — this trace is
// behind a headline now, and anything quick enough to notice competes with the sentence.
const SPEED_PX_PER_S = 340;
const HOLD_MS = 2600;
const MIN_DRAW_MS = 4200;
const MAX_DRAW_MS = 11000;

/** How far apart the stages of a flow light up. Long enough to read as a path, short
 *  enough that the last stage is not a wait. */
const TRACE_STEP_MS = 55;

function hash01(s: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/** One-shot in-view flag for the reveal sections. */
function useInView<T extends HTMLElement>(threshold = 0.2) {
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
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/**
 * Whether the visitor has asked for less motion.
 *
 * Read through useSyncExternalStore rather than an effect: the media query is external
 * state, and setting it from an effect meant the first client render always assumed motion
 * was welcome and then corrected itself a frame later — which is one frame of exactly the
 * animation the preference exists to prevent. Every animation on this page also has a CSS
 * reduced-motion path, so this only governs the JavaScript side: the trace loop and the
 * stagger delays.
 */
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_QUERY).matches,
    // Server render: assume motion is fine. The CSS path covers the first paint regardless,
    // and guessing "reduced" would ship a still page to everyone who never asked for one.
    () => false,
  );
}

/**
 * A block that reveals itself once, on the way in. `delay` staggers a group.
 *
 * `as` exists because several of these are list items, and a <div> wrapper inside a <ul>
 * would break the list semantics for a screen reader purely to hang an animation on.
 */
function Reveal({
  children,
  delay = 0,
  className,
  as: As = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: React.ElementType;
}) {
  const { ref, inView } = useInView<HTMLElement>();
  return (
    <As
      ref={ref}
      className={`lx-reveal ${inView ? "is-in" : ""} ${className ?? ""}`}
      style={{ ["--d" as string]: `${delay}ms` }}
    >
      {children}
    </As>
  );
}

/* ============================================================================
   The command, and the button that puts it on the clipboard.

   The whole point of this page is that the visitor leaves it and goes and types this, so
   the command is a first-class element rather than a footnote. Copy state is a checkmark
   for 1.6s: long enough to register, short enough that a second copy still feels live.
   ========================================================================== */
function Command({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div>
      {label && <div className="eyebrow mb-1.5">{label}</div>}
      <div className="flex items-stretch overflow-hidden rounded-lg border border-[var(--line)] bg-[#0b1017]">
        {/* Wraps at the spaces rather than scrolling out of sight. In a narrow column the
            nowrap version cut the URL off mid-word, which asks someone to paste a command
            into their shell that they were never shown the end of. */}
        <code className="mono flex-1 px-3.5 py-3 text-[12.5px] leading-relaxed break-words whitespace-pre-wrap text-[var(--ink)] sm:text-[13px]">
          {value}
        </code>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(value).then(() => setCopied(true), () => {})}
          className="lx-press shrink-0 border-l border-[var(--line)] px-3.5 text-[var(--muted-ink)] hover:bg-[var(--secondary)] hover:text-[var(--ink)]"
          aria-label={copied ? "Copied" : `Copy: ${value}`}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-[var(--orch)]" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

export function LandingExperience({
  sky,
  stages,
  flows,
  showcase,
  signedIn,
  counts,
}: {
  sky: Sky;
  stages: Stage[];
  flows: FlowRail[];
  showcase: Showcase[];
  signedIn: boolean;
  counts: { skills: number; stages: number; flows: number; changes: number };
}) {
  const reduced = useReducedMotion();

  return (
    <main className="flex-1">
      <Hero sky={sky} reduced={reduced} signedIn={signedIn} counts={counts} />
      <Problem />
      <Lifecycle stages={stages} flows={flows} reduced={reduced} counts={counts} />
      <Skills showcase={showcase} counts={counts} />
      <Honesty />
      <SetUp />
      <Door signedIn={signedIn} />
      <Foot counts={counts} />
    </main>
  );
}

/* ================================ 1 — THE HERO ================================ */

function Hero({
  sky,
  reduced,
  signedIn,
  counts,
}: {
  sky: Sky;
  reduced: boolean;
  signedIn: boolean;
  counts: { skills: number; stages: number; flows: number; changes: number };
}) {
  return (
    <section className="lx-sky relative overflow-hidden border-b border-[var(--line)]">
      <StarField sky={sky} reduced={reduced} counts={counts} />

      {/* A soft vignette behind the type, so the trace passes behind the sentence rather
          than through it. The headline is the point; the drawing is the room it is in. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 52% at 42% 46%, rgba(7,11,17,0.86), rgba(7,11,17,0.55) 62%, rgba(7,11,17,0.2) 82%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 pt-20 pb-16 sm:px-8 sm:pt-28 sm:pb-24">
        <div className="max-w-[720px]">
          <Reveal>
            <div className="eyebrow">Oolio Product OS · for Claude Code and Cowork</div>
          </Reveal>

          <Reveal delay={60}>
            <h1 className="mt-5 text-[40px] font-bold leading-[1.03] tracking-[-0.02em] text-[var(--ink)] sm:text-[68px]">
              The product process,{" "}
              <br className="hidden sm:inline" />
              written down and running.
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="mt-6 max-w-[560px] text-[16px] leading-[1.6] text-[var(--muted-ink)] sm:text-[18px]">
              {counts.skills} skills that carry a product decision from the first signal to
              the measured outcome, running against the tools your team already uses. Not a
              diagram of how we intend to work.{" "}
              <span className="text-[var(--ink)]">The thing itself.</span>
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-11 px-6 text-[14px]">
                <a href="#install">
                  Install it <ArrowRight className="ml-1.5 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 px-5 text-[14px]">
                <Link href={signedIn ? "/app/today" : "/login"}>
                  {signedIn ? "Open Flightdeck" : "Sign in to Flightdeck"}
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-7 max-w-[520px]">
              <Command value={MARKETPLACE_COMMAND} label="Already have access? Paste this in" />
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-[var(--muted-ink)]">
                Private to Oolio. The repo is where the skills live, so ask Niel for access
                before you run it.
              </p>
            </div>
          </Reveal>

          {/* The numbers, stated rather than performed. An earlier version counted them up
              on scroll, which is the single most recognisable tic of a generated landing
              page and made four true facts look like decoration. */}
          <Reveal delay={300}>
            <dl className="mono mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] uppercase tracking-[0.14em] text-[var(--muted-ink)]">
              <Fact n={counts.skills} label="skills" />
              <Divider />
              <Fact n={counts.stages} label="lifecycle stages" />
              <Divider />
              <Fact n={counts.flows} label="end-to-end flows" />
              <Divider />
              <span>versioned by commit</span>
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Fact({ n, label }: { n: number; label: string }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <dt className="sr-only">{label}</dt>
      <dd className="text-[13px] font-semibold tracking-normal tabular-nums text-[var(--ink)]">
        {n}
      </dd>
      <span>{label}</span>
    </span>
  );
}

function Divider() {
  return <span aria-hidden className="text-[var(--line)]">/</span>;
}

/** The deep field behind the hero. Atmosphere: no labels, no ticker, nothing to read. */
function StarField({
  sky,
  reduced,
  counts,
}: {
  sky: Sky;
  reduced: boolean;
  counts: { skills: number; flows: number };
}) {
  const [flowIdx, setFlowIdx] = useState(0);
  const n = sky.constellations.length;

  const byId = useMemo(() => new Map(sky.stars.map((s) => [s.id, s])), [sky.stars]);

  const paths = useMemo(
    () =>
      sky.constellations.map((c) => {
        const pts = c.ids
          .map((id) => byId.get(id))
          .filter((s): s is NonNullable<typeof s> => Boolean(s));
        return pts.length < 2
          ? ""
          : pts
              .map((pt, i) => `${i === 0 ? "M" : "L"} ${px(pt.x).toFixed(1)} ${py(pt.y).toFixed(1)}`)
              .join(" ");
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

  // Plain timers, deliberately not rAF: rAF stops in hidden tabs, which pauses the loop
  // and makes it untestable headless.
  useEffect(() => {
    if (reduced || n < 2 || drawMs.length < n) return;
    const t = setTimeout(
      () => setFlowIdx((i) => (i + 1) % n),
      (drawMs[flowIdx] ?? 6000) + HOLD_MS,
    );
    return () => clearTimeout(t);
  }, [reduced, n, flowIdx, drawMs]);

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

  const current = sky.constellations[flowIdx];
  const prevIdx = (flowIdx + n - 1) % n;

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`A star chart of the Oolio Product OS: ${counts.skills} skills and the artifacts they produce, with ${counts.flows} end-to-end flows drawn between them.`}
    >
      <defs>
        <radialGradient id="lx-halo">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
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

      {/* Idle constellation lines: always present and faint, so the sky reads as charted
          from the first frame. Also what the path lengths are measured from. */}
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
            strokeWidth={1.1}
            opacity={reduced ? 0.22 : 0.07}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </g>

      {!reduced && current && lens[flowIdx] > 0 && (
        <g aria-hidden>
          <path
            key={`prev-${flowIdx}`}
            className="lx-trace-prev"
            d={paths[prevIdx]}
            fill="none"
            stroke={`var(${sky.constellations[prevIdx].accent})`}
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            key={`trace-${flowIdx}`}
            className="lx-trace"
            d={paths[flowIdx]}
            fill="none"
            stroke={`var(${current.accent})`}
            strokeWidth={1.6}
            opacity={0.42}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              ["--len" as string]: lens[flowIdx],
              ["--dur" as string]: `${drawMs[flowIdx]}ms`,
            }}
          />
        </g>
      )}

      <g aria-hidden>
        {sky.stars.map((s) => (
          <g key={s.id}>
            <circle
              className="lx-star-glow"
              cx={px(s.x)}
              cy={py(s.y)}
              r={11}
              fill="url(#lx-halo)"
              style={{ animationDelay: `${(hash01(`s${s.id}`, 3) * 6).toFixed(2)}s` }}
            />
            <circle
              cx={px(s.x)}
              cy={py(s.y)}
              r={3}
              fill={sky.typeColour[s.type] ?? "#9fb0c9"}
              opacity={0.55}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* =============================== 2 — THE PROBLEM =============================== */

function Problem() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="max-w-[820px]">
        <Reveal>
          <p className="text-[26px] font-semibold leading-[1.25] tracking-[-0.015em] text-[var(--ink)] sm:text-[38px]">
            Every product team has written down how it works. In forty Confluence pages,
            three stale Notion docs, and one person&rsquo;s head.
          </p>
        </Reveal>
        <Reveal delay={80}>
          <p className="mt-6 max-w-[520px] text-[15px] leading-[1.65] text-[var(--muted-ink)] sm:text-[17px]">
            Written down is not the same as readable. Readable is not the same as running.
            This one runs: every stage below is a skill an assistant executes, not a slide
            describing one.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================== 3 — THE LIFECYCLE ==============================
   The page's proof. Thirteen stages a product manager will recognise, six real paths
   through them, and a purpose for each one — all read from the same map the team uses.
   Specifics are the whole defence against sounding generated.
   ============================================================================= */

function Lifecycle({
  stages,
  flows,
  reduced,
  counts,
}: {
  stages: Stage[];
  flows: FlowRail[];
  reduced: boolean;
  counts: { stages: number; flows: number };
}) {
  const [flowIdx, setFlowIdx] = useState(0);
  const [stageIdx, setStageIdx] = useState(flows[0]?.stages[0] ?? 0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const flow = flows[flowIdx];
  const accent = flow ? `var(${flow.accent})` : "var(--orch)";

  // First visit only: a flow that returns to a stage lights it once, at the point it first
  // arrives. The ordered line underneath is where the return is actually visible.
  const order = useMemo(() => {
    const m = new Map<number, number>();
    flow?.stages.forEach((s, i) => {
      if (!m.has(s)) m.set(s, i);
    });
    return m;
  }, [flow]);

  const pickFlow = useCallback(
    (i: number) => {
      setFlowIdx(i);
      const first = flows[i]?.stages[0];
      if (first !== undefined) setStageIdx(first);
    },
    [flows],
  );

  // Arrow keys move between tabs, which is what a tablist owes anyone not using a mouse.
  const onTabKey = (e: React.KeyboardEvent) => {
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (flowIdx + delta + flows.length) % flows.length;
    pickFlow(next);
    tabRefs.current[next]?.focus();
  };

  const stage = stages[stageIdx];

  return (
    <section className="border-y border-[var(--line)] bg-[var(--panel)]/50">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
          <h2 className="max-w-[640px] text-[28px] font-bold leading-[1.15] tracking-[-0.015em] text-[var(--ink)] sm:text-[40px]">
            {counts.stages} stages. {counts.flows} paths through them.
          </h2>
          <p className="mt-4 max-w-[560px] text-[15px] leading-[1.65] text-[var(--muted-ink)] sm:text-[16px]">
            Left to right is the lifecycle, signal to shipped to learned. Pick a path and
            watch where it goes, including where it comes back — the returns are why this is
            a system and not a pipeline.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-10 grid gap-7 lg:grid-cols-[248px_1fr] lg:gap-10">
            {/* The paths */}
            <div
              role="tablist"
              aria-label="End-to-end flows"
              aria-orientation="vertical"
              onKeyDown={onTabKey}
              className="flex flex-col gap-1.5"
            >
              {flows.map((f, i) => (
                <button
                  key={f.name}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  role="tab"
                  type="button"
                  id={`lx-flow-${i}`}
                  aria-selected={i === flowIdx}
                  aria-controls="lx-lifecycle-panel"
                  tabIndex={i === flowIdx ? 0 : -1}
                  onClick={() => pickFlow(i)}
                  className="lx-flow"
                  aria-label={`${f.name}: ${f.stages.length} lifecycle stages`}
                  style={{ ["--sc" as string]: `var(${f.accent})` }}
                >
                  <span className="lx-dot" aria-hidden />
                  <span className="text-[12.5px] font-medium leading-tight">{f.name}</span>
                  <span
                    aria-hidden
                    className="mono ml-auto shrink-0 text-[9px] tracking-[0.1em] text-[var(--muted-ink)]"
                  >
                    {f.stages.length}
                  </span>
                </button>
              ))}
            </div>

            {/* The lifecycle, lit by the selected path */}
            <div id="lx-lifecycle-panel" role="tabpanel" aria-labelledby={`lx-flow-${flowIdx}`}>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-4">
                {stages.map((s, i) => {
                  const ord = order.get(i);
                  const on = ord !== undefined;
                  return (
                    <button
                      key={s.name}
                      type="button"
                      className="lx-stage"
                      data-on={on}
                      data-selected={i === stageIdx}
                      onClick={() => setStageIdx(i)}
                      aria-label={`${s.name}. Read what this stage is for.`}
                      style={{
                        ["--sc" as string]: accent,
                        ["--d" as string]: reduced ? "0ms" : `${(ord ?? 0) * TRACE_STEP_MS}ms`,
                      }}
                    >
                      <span className="lx-ord" aria-hidden>
                        {on ? String(ord + 1).padStart(2, "0") : ""}
                      </span>
                      <span>{s.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* The order, including the returns a grid cannot show. */}
              <div
                key={flowIdx}
                className="mono mt-5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10.5px] leading-relaxed text-[var(--muted-ink)]"
              >
                {flow?.stages.map((s, i) => (
                  <span
                    key={`${s}-${i}`}
                    className="lx-step"
                    style={{ ["--d" as string]: reduced ? "0ms" : `${i * TRACE_STEP_MS}ms` }}
                  >
                    {i > 0 && <span className="mr-1.5 text-[var(--line)]">→</span>}
                    <span style={i === 0 ? { color: accent } : undefined}>{stages[s]?.name}</span>
                  </span>
                ))}
                {flow?.loops && (
                  <span className="ml-1 text-[var(--loop)]">· returns upstream</span>
                )}
              </div>

              {/* What the stage you tapped is for. */}
              <div
                className="mt-6 rounded-xl border border-[var(--line)] bg-[#0b1017] p-5"
                aria-live="polite"
              >
                <div key={stageIdx} className="lx-purpose">
                  <div className="eyebrow" style={{ color: accent }}>
                    {stage?.name}
                  </div>
                  <p className="mt-2 text-[14px] leading-[1.6] text-[var(--muted-ink)] sm:text-[15px]">
                    {stage?.purpose}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* =============================== 4 — THE SKILLS =============================== */

function Skills({
  showcase,
  counts,
}: {
  showcase: Showcase[];
  counts: { skills: number };
}) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <Reveal>
        <h2 className="max-w-[640px] text-[28px] font-bold leading-[1.15] tracking-[-0.015em] text-[var(--ink)] sm:text-[40px]">
          Five of the {counts.skills}.
        </h2>
        <p className="mt-4 max-w-[560px] text-[15px] leading-[1.65] text-[var(--muted-ink)] sm:text-[16px]">
          Type the command, or describe the task in your own words and let the first one
          route you. The rest are behind the door, with what triggers them and what they
          touch.
        </p>
      </Reveal>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {showcase.map((s, i) => (
          <Reveal as="li" key={s.id} delay={Math.min(i, 3) * 60}>
            <div className="lx-card h-full rounded-xl border border-[var(--line)] bg-[#0b1017] p-5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="mono truncate text-[11.5px] text-[var(--orch)]">{s.command}</span>
                <span className="eyebrow shrink-0">{s.stage}</span>
              </div>
              <div className="mt-3 text-[16px] font-semibold tracking-tight text-[var(--ink)]">
                {s.title}
              </div>
              <p className="mt-2 text-[13.5px] leading-[1.6] text-[var(--muted-ink)]">{s.line}</p>
            </div>
          </Reveal>
        ))}

        <Reveal as="li" delay={240}>
          <Link
            href="/skills"
            className="lx-card lx-press flex h-full flex-col justify-between rounded-xl border border-dashed border-[var(--line)] bg-transparent p-5"
          >
            <div>
              <div className="text-[16px] font-semibold tracking-tight text-[var(--ink)]">
                And {counts.skills - showcase.length} more
              </div>
              <p className="mt-2 text-[13.5px] leading-[1.6] text-[var(--muted-ink)]">
                Intake, grooming, the council that argues with you, Jira hygiene, the GTM
                suite. The full catalogue is behind sign-in.
              </p>
            </div>
            <span className="mono mt-4 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-[var(--orch)]">
              See the catalogue <ArrowUpRight className="h-3 w-3" />
            </span>
          </Link>
        </Reveal>
      </ul>
    </section>
  );
}

/* ============================== 5 — WHAT KEEPS IT HONEST ============================== */

const HONEST = [
  {
    head: "A person signs off anything that counts.",
    body: "Those are the amber gates on the map, and they do not move. Nothing reaches Jira or Confluence unreviewed.",
  },
  {
    head: "Every claim carries a citation.",
    body: "Research that cannot be traced to a source does not ship as research. You can open the link and check it.",
  },
  {
    head: "Findings compound.",
    body: "What the team learns lands in the Brain, so the next quarter starts ahead of the last one instead of at the beginning.",
  },
  {
    head: "It cannot drift.",
    body: "This site, the map and the catalogue are generated from the skills themselves. If it says we do it, we do it.",
  },
];

function Honesty() {
  return (
    <section className="border-y border-[var(--line)] bg-[var(--panel)]/50">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-16">
          <Reveal>
            <h2 className="text-[28px] font-bold leading-[1.15] tracking-[-0.015em] text-[var(--ink)] sm:text-[40px]">
              What keeps it honest.
            </h2>
            <p className="mt-5 text-[15px] leading-[1.65] text-[var(--muted-ink)] sm:text-[16px]">
              None of this replaces a product manager. It removes the tax on being one: the
              blank page, the fourth rewrite, the research you know exists somewhere, the
              decision relitigated because nobody wrote it down.
            </p>
            <p className="mt-4 text-[15px] leading-[1.65] text-[var(--ink)] sm:text-[16px]">
              What is left is the part that needed a human all along.
            </p>
          </Reveal>

          <ul className="grid gap-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2">
            {HONEST.map((h, i) => (
              <Reveal as="li" key={h.head} delay={Math.min(i, 3) * 60} className="bg-[#0b1017] p-5">
                <div className="text-[15px] font-semibold leading-snug tracking-tight text-[var(--ink)]">
                  {h.head}
                </div>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-[var(--muted-ink)]">{h.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ================================ 6 — GET SET UP ================================
   The conversion. Three steps, in the order a new person actually hits them, with the
   first one being the one that silently breaks every install: the repo is private.
   ============================================================================== */

function SetUp() {
  return (
    <section id="install" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28">
      <Reveal>
        <div className="eyebrow">Get set up</div>
        <h2 className="mt-4 max-w-[640px] text-[28px] font-bold leading-[1.15] tracking-[-0.015em] text-[var(--ink)] sm:text-[40px]">
          Two lines, then ask.
        </h2>
        <p className="mt-4 max-w-[560px] text-[15px] leading-[1.65] text-[var(--muted-ink)] sm:text-[16px]">
          Once it is in, there is nothing to keep up to date. The plugin is versioned by
          commit, so whatever shipped today is in your next session.
        </p>
      </Reveal>

      <ol className="mt-10 grid gap-4 lg:grid-cols-3">
        <Reveal as="li">
          <Step n="01" title="Get access">
            <p className="text-[13.5px] leading-[1.6] text-[var(--muted-ink)]">
              The repo is private and lives in Niel&rsquo;s account, so being in the org
              grants nothing. Ask him to add you as a collaborator, then accept the emailed
              invitation. Every step below fails until you have.
            </p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="mono lx-press mt-4 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-[var(--orch)] hover:underline"
            >
              The repo <ArrowUpRight className="h-3 w-3" />
            </a>
          </Step>
        </Reveal>

        <Reveal as="li" delay={60}>
          <Step n="02" title="Add the marketplace">
            <p className="mb-4 text-[13.5px] leading-[1.6] text-[var(--muted-ink)]">
              In Claude Code. Use exactly this URL: the repo&rsquo;s old names still resolve,
              but each one registers as a separate marketplace that never updates.
            </p>
            <Command value={MARKETPLACE_COMMAND} />
          </Step>
        </Reveal>

        <Reveal as="li" delay={120}>
          <Step n="03" title="Install the plugin">
            <p className="mb-4 text-[13.5px] leading-[1.6] text-[var(--muted-ink)]">
              Then restart, and the skills appear in your skill list. In Cowork it is
              Customize → Plugins instead.
            </p>
            <Command value={INSTALL_COMMAND} />
          </Step>
        </Reveal>
      </ol>

      <Reveal delay={180}>
        <div className="mt-6 rounded-xl border border-[var(--line)] bg-[#0b1017] p-5 sm:p-6">
          <div className="eyebrow">Then just ask</div>
          <div className="mono mt-3 flex items-start gap-2.5 text-[13px] leading-relaxed text-[var(--ink)] sm:text-[14px]">
            <CornerDownRight className="mt-1 h-3.5 w-3.5 shrink-0 text-[var(--orch)]" aria-hidden />
            <span>
              &ldquo;Groom this idea, then write the PRD and grill me on it.&rdquo;
            </span>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-[var(--muted-ink)]">
            You do not have to know which skill that is. Describe the task and the router
            names the one that fits, or the short chain of them, and starts it on your say-so.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-[var(--line)] bg-[var(--panel)]/60 p-5 sm:p-6">
      <div className="mono text-[10px] tracking-[0.14em] text-[var(--muted-ink)]">{n}</div>
      <div className="mt-2 text-[17px] font-semibold tracking-tight text-[var(--ink)]">{title}</div>
      <div className="mt-3 flex flex-1 flex-col justify-between">{children}</div>
    </div>
  );
}

/* ================================= 7 — THE DOOR ================================= */

function Door({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="border-t border-[var(--line)] bg-[var(--panel)]/50">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <p className="text-[40px] font-bold leading-[1.05] tracking-[-0.02em] text-[var(--ink)] sm:text-[64px]">
            Learn it once.
          </p>
          <p className="mt-6 max-w-[520px] text-[15px] leading-[1.65] text-[var(--muted-ink)] sm:text-[17px]">
            Product work is a small set of moves repeated forever. Written down, the standard
            stops depending on who is having a good week.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-11 px-6 text-[14px]">
              <a href="#install">
                Install it <ArrowRight className="ml-1.5 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 px-5 text-[14px]">
              <Link href={signedIn ? "/app/today" : "/login"}>
                {signedIn ? "Open Flightdeck" : "Sign in to Flightdeck"}
              </Link>
            </Button>
          </div>
          {!signedIn && (
            <p className="mt-5 text-[13px] text-[var(--muted-ink)]">
              Oolio teammates only. Access is granted per person.
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}

function Foot({ counts }: { counts: { skills: number; changes: number } }) {
  return (
    <footer className="border-t border-[var(--line)]">
      <div className="mono mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-6 text-[9.5px] uppercase tracking-[0.14em] text-[var(--muted-ink)] sm:px-8">
        <span>Oolio Product OS</span>
        <Divider />
        <span>{counts.skills} skills</span>
        <Divider />
        <span>{counts.changes} changes logged</span>
        <span className="ml-auto">
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="hover:text-[var(--ink)]">
            GitHub
          </a>
        </span>
      </div>
    </footer>
  );
}
