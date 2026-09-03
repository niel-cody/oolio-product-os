"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Copy, CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INSTALL_COMMAND, MARKETPLACE_COMMAND, REPO_URL } from "@/lib/install";
import type { FlowRail, Showcase, Stage } from "@/lib/landing-sky";
import "./landing.css";

/**
 * The signed-out front door, printed.
 *
 * Its job has not changed: turn an Oolio teammate who has heard about this into someone with
 * the plugin installed. The argument and the copy are the ones that worked. What changed is
 * that the page is now a printed sheet rather than a dark SaaS landing page.
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
 * THE STAR FIELD IS GONE. A 1600×900 animated constellation canvas was the single most
 * generated-looking thing on the page, and it was also the thing that leaked every skill name
 * into the public payload as React keys. In its place the hero carries a halftone plate:
 * three ink drums at three screen angles, overprinting. It is drawn rather than data, it
 * ships nothing, and it is the aesthetic doing the work instead of decorating it.
 *
 * `sky` is no longer requested at all, which is a smaller public payload as well as a
 * smaller page. lib/landing-sky.ts keeps getSky() for nothing else; if it stays unused it
 * should go.
 *
 * This component may only ever receive curated data (lib/landing-sky.ts). Nothing here may
 * import os.json: that would bundle every skill name, trigger and system link into the
 * public payload this page exists to protect.
 *
 * MISREGISTRATION BUDGET: once per screen, display type only. The hero spends one and the
 * closing line spends the other, and they are five screens apart. A third would stop reading
 * as a press and start reading as a filter.
 */

/** How far apart, in ms, the stages of a flow light up as it traces. */
const TRACE_STEP_MS = 55;

/* ------------------------------------------------------------------ scroll reveal */

function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Read as external state rather than set from an effect, so a visitor who asked for less
 * motion never sees the first frame of it.
 */
function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => true,
  );
}

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

/* ------------------------------------------------------------------ press furniture */

/**
 * A section opens on a black keyline with its pass marker sitting on it, the way a proof
 * sheet is marked up. This replaces the heading-floating-in-space of the dark version, and
 * it is the structural device the whole page is built from.
 */
function SectionHead({ pass, note }: { pass: string; note?: string }) {
  return (
    <div className="sechead">
      <span className="eyebrow text-[var(--k)]">{pass}</span>
      {note && <span className="eyebrow">{note}</span>}
    </div>
  );
}

/**
 * The command, and the button that puts it on the clipboard.
 *
 * The whole point of this page is that the visitor leaves it and goes and types this, so the
 * command is a first-class element rather than a footnote.
 *
 * TEXTURE NEVER TOUCHES ANYTHING FUNCTIONAL. No grain, no halftone and no misregistration
 * inside a command block: it is there to be copied, and a shifted plate over a URL is a
 * command somebody mistypes. A hard pink shadow is as far as the press language goes here.
 */
function Command({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div>
      {label && <div className="eyebrow mb-2">{label}</div>}
      <div className="press-edge flex items-stretch bg-[var(--stock-2)]">
        {/* Wraps at the spaces rather than scrolling out of sight. In a narrow column the
            nowrap version cut the URL off mid-word, which asks somebody to paste a command
            into their shell that they were never shown the end of. */}
        <code className="mono flex-1 px-3.5 py-3 text-[12.5px] leading-relaxed break-words whitespace-pre-wrap text-[var(--k)] sm:text-[13px]">
          {value}
        </code>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(value).then(() => setCopied(true), () => {})}
          className="lx-press shrink-0 border-l-[1.5px] border-[var(--k)] px-3.5 text-[var(--muted-ink)] hover:bg-[var(--yellow)] hover:text-[var(--k)]"
          aria-label={copied ? "Copied" : `Copy: ${value}`}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-[var(--k)]" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

export function LandingExperience({
  stages,
  flows,
  showcase,
  signedIn,
  counts,
}: {
  stages: Stage[];
  flows: FlowRail[];
  showcase: Showcase[];
  signedIn: boolean;
  counts: { skills: number; stages: number; flows: number; changes: number };
}) {
  const reduced = useReducedMotion();

  return (
    <main className="flex-1">
      <Hero signedIn={signedIn} counts={counts} />
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
  signedIn,
  counts,
}: {
  signedIn: boolean;
  counts: { skills: number; stages: number; flows: number; changes: number };
}) {
  return (
    <section className="border-b-[1.5px] border-[var(--k)]">
      <div className="mx-auto w-full max-w-6xl px-5 pt-14 pb-16 sm:px-8 sm:pt-20 sm:pb-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
          <div>
            <Reveal>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="lx-tag lx-tag-pink">Product OS</span>
                <span className="lx-tag">for Claude Code and Cowork</span>
              </div>
            </Reveal>

            {/* The one misregistration on this screen. The ghosts are aria-hidden copies
                sitting behind the solid plate, so a screen reader hears the line once. */}
            <Reveal delay={60}>
              <h1 className="display misreg mt-7 text-[clamp(2.15rem,4.7vw,3.75rem)] leading-[0.95] text-[var(--k)]">
                <span className="ghost2" aria-hidden>
                  The product process, written down and running.
                </span>
                <span className="ghost" aria-hidden>
                  The product process, written down and running.
                </span>
                The product process, written down and running.
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <p className="mt-7 max-w-[54ch] text-[16px] leading-[1.6] text-[var(--soft-ink)] sm:text-[17px]">
                {counts.skills} skills that carry a product decision from the first signal to
                the measured outcome, running against the tools your team already uses. Not a
                diagram of how we intend to work.{" "}
                <b className="font-semibold text-[var(--k)]">The thing itself.</b>
              </p>
            </Reveal>

            <Reveal delay={180}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="h-11 px-6 text-[13px]">
                  <a href="#install">
                    Install it <ArrowRight className="ml-1.5 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-11 px-5 text-[13px]">
                  <Link href={signedIn ? "/app/today" : "/login"}>
                    {signedIn ? "Open Flightdeck" : "Sign in to Flightdeck"}
                  </Link>
                </Button>
              </div>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8 max-w-[520px]">
                <Command value={MARKETPLACE_COMMAND} label="Already have access? Paste this in" />
                <p className="mt-3 text-[12.5px] leading-relaxed text-[var(--muted-ink)]">
                  Private to Oolio. The repo is where the skills live, so ask Niel for access
                  before you run it.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={100} className="lg:pt-2">
            <Plate counts={counts} />
          </Reveal>
        </div>

        {/* The numbers, stated rather than performed. An earlier version counted them up on
            scroll, which is the single most recognisable tic of a generated landing page and
            made four true facts look like decoration. */}
        <Reveal delay={300}>
          <dl className="mono mt-12 flex flex-wrap items-center gap-x-5 gap-y-2 border-t-[1.5px] border-[var(--k)] pt-4 text-[0.7rem] uppercase tracking-[0.14em] text-[var(--muted-ink)]">
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
    </section>
  );
}

/**
 * The hero plate.
 *
 * Three ink drums screened at three angles and overprinted, which is the entire Riso process
 * in one image. The angles are 15°, 75° and 45° and they are not decorative: two drums at
 * the same angle produce moiré, so the separation is the reason the plate reads as printed
 * rather than as a pattern.
 *
 * Drawn, not data. Nothing here is derived from the skills, so unlike the star chart it
 * replaced there is nothing in it that can leak.
 */
function Plate({ counts }: { counts: { skills: number; stages: number } }) {
  return (
    <figure className="plate m-0 aspect-[4/3.4] w-full overflow-hidden border-[1.5px] border-[var(--k)] bg-[var(--stock-2)]">
      <i className="ink halftone halftone-pink lx-fade-a absolute -inset-y-[12%] -left-[14%] -right-[8%] bottom-[26%]" aria-hidden />
      <i className="ink halftone halftone-blue lx-fade-b absolute inset-y-[18%] -right-[14%] -bottom-[16%] left-[10%]" aria-hidden />
      <i className="ink halftone halftone-yellow lx-fade-c absolute inset-x-[14%] top-[36%] bottom-[12%] -left-[4%]" aria-hidden />
      <figcaption className="mono absolute bottom-2.5 left-3 z-[3] border border-[var(--k)] bg-[var(--stock-2)] px-1.5 py-0.5 text-[0.62rem] uppercase tracking-[0.12em] text-[var(--k)]">
        3 drums · 15° 75° 45° · {counts.skills} skills
      </figcaption>
    </figure>
  );
}

function Fact({ n, label }: { n: number; label: string }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <dt className="sr-only">{label}</dt>
      <dd className="text-[13px] font-medium tracking-normal tabular-nums text-[var(--k)]">{n}</dd>
      <span>{label}</span>
    </span>
  );
}

function Divider() {
  return (
    <span aria-hidden className="text-[var(--rule)]">
      /
    </span>
  );
}

/* ================================ 2 — THE PROBLEM ================================ */

function Problem() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <SectionHead pass="Finding" note="the sentence you already recognise" />
      <div className="max-w-[820px]">
        <Reveal>
          <p className="display max-w-[900px] text-[clamp(1.45rem,2.75vw,2.25rem)] leading-[1.08] text-[var(--k)]">
            Every product team has written down how it works. In forty Confluence pages, three
            stale Notion docs, and one person&rsquo;s head.
          </p>
        </Reveal>
        <Reveal delay={80}>
          <p className="mt-7 max-w-[56ch] text-[15px] leading-[1.65] text-[var(--soft-ink)] sm:text-[16.5px]">
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

   Printed rather than lit: a stage on the selected path is a filled plate, and a stage
   off it is the bare sheet. The gates are the third drum, which is the only warm ink on
   the page and the reason it exists.
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
  const accent = flow ? `var(${flow.accent})` : "var(--blue)";

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
    const delta =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? 1
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
          ? -1
          : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (flowIdx + delta + flows.length) % flows.length;
    pickFlow(next);
    tabRefs.current[next]?.focus();
  };

  const stage = stages[stageIdx];

  return (
    <section className="border-y-[1.5px] border-[var(--k)] bg-[var(--stock-2)]">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <SectionHead pass="Plate" note="the lifecycle, and six paths across it" />
        <Reveal>
          <h2 className="display max-w-[680px] text-[clamp(1.7rem,3.4vw,2.7rem)] leading-[1.06] text-[var(--k)]">
            {counts.stages} stages. {counts.flows} paths through them.
          </h2>
          <p className="mt-5 max-w-[56ch] text-[15px] leading-[1.65] text-[var(--soft-ink)] sm:text-[16px]">
            Left to right is the lifecycle, signal to shipped to learned. Pick a path and watch
            where it goes, including where it comes back — the returns are why this is a system
            and not a pipeline.
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
              className="flex flex-col self-start border-[1.5px] border-[var(--k)]"
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
                    className="mono ml-auto shrink-0 text-[0.62rem] tracking-[0.1em] text-[var(--muted-ink)]"
                  >
                    {f.stages.length}
                  </span>
                </button>
              ))}
            </div>

            {/* The lifecycle, printed by the selected path */}
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
                      data-gate={s.gate === true}
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
                    {i > 0 && <span className="mr-1.5 text-[var(--rule)]">→</span>}
                    <span style={i === 0 ? { color: accent } : undefined}>{stages[s]?.name}</span>
                  </span>
                ))}
                {flow?.loops && <span className="ml-1 text-[var(--loop)]">· returns upstream</span>}
              </div>

              {/* What the stage you tapped is for. */}
              <div className="mt-6 border-[1.5px] border-[var(--k)] bg-[var(--stock)] p-5" aria-live="polite">
                <div key={stageIdx} className="lx-purpose">
                  <div className="eyebrow text-[var(--k)]">{stage?.name}</div>
                  <p className="mt-2.5 text-[14px] leading-[1.6] text-[var(--soft-ink)] sm:text-[15px]">
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

function Skills({ showcase, counts }: { showcase: Showcase[]; counts: { skills: number } }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <SectionHead pass="Impression" note="five of them, by name" />
      <Reveal>
        <h2 className="display max-w-[680px] text-[clamp(1.7rem,3.4vw,2.7rem)] leading-[1.06] text-[var(--k)]">
          Five of the {counts.skills}.
        </h2>
        <p className="mt-5 max-w-[56ch] text-[15px] leading-[1.65] text-[var(--soft-ink)] sm:text-[16px]">
          Type the command, or describe the task in your own words and let the first one route
          you. The rest are behind the door, with what triggers them and what they touch.
        </p>
      </Reveal>

      {/* One keyline around the block and hairlines between, the way a table is ruled on a
          press sheet, rather than six separate floating cards. */}
      <ul className="mt-10 grid border-[1.5px] border-[var(--k)] sm:grid-cols-2 lg:grid-cols-3">
        {showcase.map((s, i) => (
          <Reveal as="li" key={s.id} delay={Math.min(i, 3) * 60} className="lx-cell">
            <div className="flex items-baseline justify-between gap-3">
              <span className="mono truncate text-[11.5px] text-[var(--blue)]">{s.command}</span>
              <span className="eyebrow shrink-0">{s.stage}</span>
            </div>
            <div className="mt-3 text-[16px] font-semibold leading-snug tracking-tight text-[var(--k)]">
              {s.title}
            </div>
            <p className="mt-2 text-[13.5px] leading-[1.6] text-[var(--soft-ink)]">{s.line}</p>
          </Reveal>
        ))}

        <Reveal as="li" delay={240} className="lx-cell lx-cell-last">
          <Link href="/skills" className="lx-press flex h-full flex-col justify-between">
            <div>
              <div className="text-[16px] font-semibold leading-snug tracking-tight text-[var(--k)]">
                And {counts.skills - showcase.length} more
              </div>
              <p className="mt-2 text-[13.5px] leading-[1.6] text-[var(--soft-ink)]">
                Intake, grooming, the council that argues with you, Jira hygiene, the GTM
                suite. The full catalogue is behind sign-in.
              </p>
            </div>
            <span className="mono mt-4 inline-flex items-center gap-1 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--k)]">
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
    body: "Those are the yellow gates on the map, and they do not move. Nothing reaches Jira or Confluence unreviewed.",
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
    <section className="border-y-[1.5px] border-[var(--k)] bg-[var(--stock-2)]">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <SectionHead pass="Registration" note="what stops it drifting" />
        <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-16">
          <Reveal>
            <h2 className="display text-[clamp(1.7rem,3.4vw,2.7rem)] leading-[1.06] text-[var(--k)]">
              What keeps it honest.
            </h2>
            <p className="mt-6 text-[15px] leading-[1.65] text-[var(--soft-ink)] sm:text-[16px]">
              None of this replaces a product manager. It removes the tax on being one: the
              blank page, the fourth rewrite, the research you know exists somewhere, the
              decision relitigated because nobody wrote it down.
            </p>
            <p className="mt-4 text-[15px] leading-[1.65] text-[var(--k)] sm:text-[16px]">
              What is left is the part that needed a human all along.
            </p>
          </Reveal>

          <ul className="grid border-[1.5px] border-[var(--k)] sm:grid-cols-2">
            {HONEST.map((h, i) => (
              <Reveal as="li" key={h.head} delay={Math.min(i, 3) * 60} className="lx-cell bg-[var(--stock)]">
                <div className="text-[15px] font-semibold leading-snug tracking-tight text-[var(--k)]">
                  {h.head}
                </div>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-[var(--soft-ink)]">{h.body}</p>
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
    <section id="install" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24">
      <SectionHead pass="Make ready" note="two lines, then ask" />
      <Reveal>
        <h2 className="display max-w-[680px] text-[clamp(1.7rem,3.4vw,2.7rem)] leading-[1.06] text-[var(--k)]">
          Two lines, then ask.
        </h2>
        <p className="mt-5 max-w-[56ch] text-[15px] leading-[1.65] text-[var(--soft-ink)] sm:text-[16px]">
          Once it is in, there is nothing to keep up to date. The plugin is versioned by
          commit, so whatever shipped today is in your next session.
        </p>
      </Reveal>

      <ol className="mt-10 grid gap-4 lg:grid-cols-3">
        <Reveal as="li">
          <Step n="01" title="Get access">
            <p className="text-[13.5px] leading-[1.6] text-[var(--soft-ink)]">
              The repo is private and lives in Niel&rsquo;s account, so being in the org grants
              nothing. Ask him to add you as a collaborator, then accept the emailed
              invitation. Every step below fails until you have.
            </p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="mono lx-press mt-4 inline-flex items-center gap-1 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--k)] hover:underline"
            >
              The repo <ArrowUpRight className="h-3 w-3" />
            </a>
          </Step>
        </Reveal>

        <Reveal as="li" delay={60}>
          <Step n="02" title="Add the marketplace">
            <p className="mb-4 text-[13.5px] leading-[1.6] text-[var(--soft-ink)]">
              In Claude Code. Use exactly this URL: the repo&rsquo;s old names still resolve,
              but each one registers as a separate marketplace that never updates.
            </p>
            <Command value={MARKETPLACE_COMMAND} />
          </Step>
        </Reveal>

        <Reveal as="li" delay={120}>
          <Step n="03" title="Install the plugin">
            <p className="mb-4 text-[13.5px] leading-[1.6] text-[var(--soft-ink)]">
              Then restart, and the skills appear in your skill list. In Cowork it is Customize
              → Plugins instead.
            </p>
            <Command value={INSTALL_COMMAND} />
          </Step>
        </Reveal>
      </ol>

      <Reveal delay={180}>
        <div className="mt-6 border-[1.5px] border-[var(--k)] bg-[var(--stock-2)] p-5 sm:p-6">
          <div className="eyebrow text-[var(--k)]">Then just ask</div>
          <div className="mono mt-3 flex items-start gap-2.5 text-[13px] leading-relaxed text-[var(--k)] sm:text-[14px]">
            <CornerDownRight className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>&ldquo;Groom this idea, then write the PRD and grill me on it.&rdquo;</span>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-[var(--soft-ink)]">
            You do not have to know which skill that is. Describe the task and the router names
            the one that fits, or the short chain of them, and starts it on your say-so.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col border-[1.5px] border-[var(--k)] bg-[var(--stock-2)] p-5 sm:p-6">
      <div className="mono text-[0.68rem] tracking-[0.14em] text-[var(--muted-ink)]">{n}</div>
      <div className="mt-2 text-[17px] font-semibold tracking-tight text-[var(--k)]">{title}</div>
      <div className="mt-3 flex flex-1 flex-col justify-between">{children}</div>
    </div>
  );
}

/* ================================= 7 — THE DOOR ================================= */

function Door({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="border-t-[1.5px] border-[var(--k)] bg-[var(--stock-2)]">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <Reveal>
          {/* The second and last misregistration on the site. */}
          <p className="display misreg text-[clamp(2.3rem,5.4vw,4.1rem)] leading-[0.95] text-[var(--k)]">
            <span className="ghost2" aria-hidden>
              Learn it once.
            </span>
            <span className="ghost" aria-hidden>
              Learn it once.
            </span>
            Learn it once.
          </p>
          <p className="mt-7 max-w-[52ch] text-[15px] leading-[1.65] text-[var(--soft-ink)] sm:text-[16.5px]">
            Product work is a small set of moves repeated forever. Written down, the standard
            stops depending on who is having a good week.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-11 px-6 text-[13px]">
              <a href="#install">
                Install it <ArrowRight className="ml-1.5 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 px-5 text-[13px]">
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
    <footer className="border-t-[1.5px] border-[var(--k)]">
      <div className="mono mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-6 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--muted-ink)] sm:px-8">
        <span className="text-[var(--k)]">Pixie Dust Industries</span>
        <Divider />
        <span>Product OS</span>
        <Divider />
        <span>{counts.skills} skills</span>
        <Divider />
        <span>{counts.changes} changes logged</span>
        <span className="ml-auto">
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="hover:text-[var(--k)]">
            GitHub
          </a>
        </span>
      </div>
    </footer>
  );
}
