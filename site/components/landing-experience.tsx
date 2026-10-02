"use client";

import { useCallback, useMemo, useRef, useState, useSyncExternalStore, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FlowRail, Showcase, Stage } from "@/lib/landing-sky";
import "./landing.css";

/**
 * The public front door.
 *
 * Reprinted 2026-09-10, and the change is what the page is FOR. It used to be an install
 * sheet: a marketplace command in the hero, a three-step setup section, and a closing line
 * about asking Niel for repo access. That is a page for someone who has already decided.
 * This one is a pitch for someone who has not — it argues the value first, shows the work,
 * and only then opens a door.
 *
 * Three deletions were explicit and are worth writing down so they do not creep back:
 *   - The hero's "Already have access? Paste this in" command block. A command is the last
 *     thing a stranger needs and the first thing that makes a page look internal.
 *   - The whole setup section. Instructions for installing a thing nobody has been sold yet.
 *   - Every mention of the company this was first written for. The OS is the product here.
 *
 * The order is an argument, and each beat earns the next:
 *   1. Hero      — what it is, and a real piece of its output sitting beside the claim.
 *   2. Problem   — the week a product manager actually has.
 *   3. Proof     — the same week run twice, by hand and through the OS. The hours.
 *   4. Crew      — eight specialists, each owning one part of the lifecycle.
 *   5. Harness   — what any of them can reach for, with a printed proof under each claim.
 *   6. Plate     — fourteen named stages and its paths through them, from the real map.
 *   7. Memory    — why the second quarter costs less than the first.
 *   8. Make ready— three steps, none of which are a shell command.
 *   9. Honesty   — the four rules that stop this being a machine that writes documents.
 *  10. Press check — the questions asked before anyone signs up for anything.
 *  11. Door     — "Learn it once." and the way in.
 *
 * THE PUBLIC BOUNDARY. This component may only ever receive curated data
 * (lib/landing-sky.ts): fourteen stage names, the flow names, five named skills. It must
 * never import os.json, which carries every skill's name, trigger phrases and system links.
 * scripts/check-public-leaks.mjs greps the RENDERED HTML for all of it, because the last
 * leak was invisible in the source — skill ids travelling as React keys. Run it after any
 * change here, and mind the prose too: several gated skills have one-word titles.
 *
 * MISREGISTRATION BUDGET: once per screen, display type only. The hero spends one and the
 * closing line spends the other, and they are ten screens apart. A third would stop reading
 * as a press and start reading as a filter.
 *
 * EVERY MOCK IS DRAWN, NOTHING IS DATA. The findings card, the harness proofs and the brain
 * chips are illustrative copy written here. They say so on the page. Nothing in them is read
 * from the catalogue, so unlike the star chart this page used to carry, there is nothing in
 * them that can leak.
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
 * sheet is marked up. This is the structural device the whole page is built from.
 */
function SectionHead({ pass, note }: { pass: string; note?: string }) {
  return (
    <div className="sechead">
      <span className="eyebrow text-[var(--k)]">{pass}</span>
      {note && <span className="eyebrow">{note}</span>}
    </div>
  );
}

function Divider() {
  return (
    <span aria-hidden className="text-[var(--rule)]">
      /
    </span>
  );
}

/**
 * The two doors, in the same order everywhere on the page.
 *
 * There is exactly one thing to do here now, and it is not typing a command: get in. A
 * signed-in visitor is offered the room they came for instead.
 */
function Doors({ signedIn, secondary = true }: { signedIn: boolean; secondary?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button asChild size="lg" className="h-11 px-6 text-[13px]">
        <Link href={signedIn ? "/app/today" : "/login"}>
          {signedIn ? "Open Flightdeck" : "Get access"}
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Link>
      </Button>
      {secondary && (
        <Button asChild size="lg" variant="outline" className="h-11 px-5 text-[13px]">
          <a href="#crew">Meet the crew</a>
        </Button>
      )}
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
      <Proof />
      <Crew signedIn={signedIn} counts={counts} />
      <Harness reduced={reduced} />
      <Lifecycle stages={stages} flows={flows} reduced={reduced} counts={counts} />
      <Memory />
      <HowItWorks />
      <Showcased showcase={showcase} counts={counts} />
      <Honesty />
      <PressCheck />
      <Door signedIn={signedIn} />
      <Foot counts={counts} />
    </main>
  );
}

/* ================================ 1 — THE HERO ================================
   The claim on the left, a piece of the work on the right. The right-hand column used to
   be an abstract halftone plate: beautiful, and it said nothing. It is now a printed
   findings card with the ink washes behind it, so the aesthetic and the argument are the
   same object. Texture never crosses a word: the washes sit under the card, never on it.
   ============================================================================= */

function Hero({
  signedIn,
  counts,
}: {
  signedIn: boolean;
  counts: { skills: number; stages: number; flows: number; changes: number };
}) {
  return (
    <section className="border-b border-[var(--rule-2)]">
      <div className="mx-auto w-full max-w-6xl px-5 pt-14 pb-16 sm:px-8 sm:pt-20 sm:pb-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
          <div>
            <Reveal>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="lx-tag lx-tag-pink">Product OS</span>
                <span className="lx-tag">A crew of {counts.skills}</span>
              </div>
            </Reveal>

            {/* The one misregistration on this screen. The ghosts are aria-hidden copies
                sitting behind the solid plate, so a screen reader hears the line once. */}
            <Reveal delay={60}>
              <h1 className="display misreg mt-7 text-[clamp(2.3rem,5vw,4rem)] leading-[0.94] text-[var(--k)]">
                <span className="ghost2" aria-hidden>
                  Everything but the deciding.
                </span>
                <span className="ghost" aria-hidden>
                  Everything but the deciding.
                </span>
                Everything but the deciding.
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <p className="mt-7 max-w-[54ch] text-[16px] leading-[1.6] text-[var(--soft-ink)] sm:text-[17.5px]">
                {counts.skills} specialists that carry a product decision from the first
                signal to the honest look back six weeks later. The research, the spec, the
                review pack, the launch brief — drafted to your standard, every claim
                carrying a source, waiting on your call.{" "}
                <b className="font-semibold text-[var(--k)]">
                  You still decide. You stop typing.
                </b>
              </p>
            </Reveal>

            <Reveal delay={180}>
              <div className="mt-9">
                <Doors signedIn={signedIn} />
              </div>
            </Reveal>

            {/* The numbers, stated rather than performed. An earlier version counted them
                up on scroll, which is the single most recognisable tic of a generated
                landing page and made four true facts look like decoration. */}
            <Reveal delay={240}>
              <dl className="mono mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--rule-2)] pt-4 text-[0.7rem] uppercase tracking-[0.14em] text-[var(--muted-ink)]">
                <Fact n={counts.skills} label="specialists" />
                <Divider />
                <Fact n={counts.stages} label="lifecycle stages" />
                <Divider />
                <Fact n={counts.flows} label="end-to-end paths" />
                <Divider />
                <span>every claim cited</span>
              </dl>
            </Reveal>
          </div>

          <Reveal delay={100} className="lg:pt-2">
            <FindingsCard />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * A morning's output, printed.
 *
 * The single most persuasive thing this page can do is show what lands on your desk, so it
 * shows one. Illustrative and labelled as such — inventing a customer number and presenting
 * it as ours would be exactly the dishonesty the rest of the page argues against.
 *
 * Three ink washes sit behind it at the three fixed screen angles. They are the entire Riso
 * process in one image, and they are drawn rather than derived, so nothing here can leak.
 */
function FindingsCard() {
  return (
    <figure className="m-0">
      {/* The washes bleed off the card and are clipped by this wrapper's own edge, which is
          what a plate does: ink runs past the image and stops at the trim. Unclipped they
          ran over the caption underneath and up behind the header. */}
      <div className="plate relative overflow-hidden px-4 pb-5 pt-4 sm:px-6 sm:pb-7 sm:pt-5">
        <i
          className="ink halftone halftone-pink lx-fade-a absolute -left-[8%] -top-[10%] h-[62%] w-[70%]"
          aria-hidden
        />
        <i
          className="ink halftone halftone-blue lx-fade-b absolute -bottom-[10%] -right-[8%] h-[66%] w-[64%]"
          aria-hidden
        />
        <i
          className="ink halftone halftone-yellow lx-fade-c absolute bottom-[4%] left-[16%] h-[44%] w-[52%]"
          aria-hidden
        />

        <div className="lx-card">
        <div className="lx-card-head">
          <span className="mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--k)]">
            Scout &middot; market signal
          </span>
          <span className="mono ml-auto text-[0.6rem] uppercase tracking-[0.12em] text-[var(--muted-ink)]">
            Pass complete
          </span>
        </div>

        <div className="lx-row flex items-center gap-2.5">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" aria-hidden>
            <path
              className="lx-tick"
              d="M3 8.5 L6.5 12 L13 4"
              fill="none"
              stroke="var(--k)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[13px] font-semibold text-[var(--k)]">
            214 sources read since Monday
          </span>
        </div>

        {FINDINGS.map((f) => (
          <div key={f.head} className="lx-row">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[13.5px] font-semibold leading-snug text-[var(--k)]">
                {f.head}
              </span>
              <span className={`lx-chip ${f.gate ? "lx-chip-fill" : ""}`}>{f.tag}</span>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-[1.55] text-[var(--soft-ink)]">{f.body}</p>
          </div>
        ))}

          <div className="lx-row bg-[var(--stock-3)]">
            <p className="mono text-[0.66rem] leading-relaxed text-[var(--k)]">
              Filed as cited evidence against 6 ideas already on the backlog.
            </p>
          </div>
        </div>
      </div>

      <figcaption className="mono mt-3 text-[0.62rem] uppercase tracking-[0.12em] text-[var(--muted-ink)]">
        Illustrative &middot; in the real thing every line opens its source
      </figcaption>
    </figure>
  );
}

const FINDINGS = [
  {
    head: "A pricing gap opened in the mid-market",
    tag: "High confidence",
    body: "Two competitors moved on price since June. Our middle tier has not, and three lost deals said so out loud.",
    gate: false,
  },
  {
    head: "The same missing report cost nine deals",
    tag: "Evidence",
    body: "Nine losses this quarter name it. It is currently ranked eleventh on the backlog.",
    gate: false,
  },
  {
    head: "Needs your call before it moves",
    tag: "Your gate",
    body: "Reordering the next quarter is a decision, not a finding. It is waiting, written up, for you.",
    gate: true,
  },
];

function Fact({ n, label }: { n: number; label: string }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <dt className="sr-only">{label}</dt>
      <dd className="text-[13px] font-medium tracking-normal tabular-nums text-[var(--k)]">{n}</dd>
      <span>{label}</span>
    </span>
  );
}

/* ================================ 2 — THE PROBLEM ================================ */

function Problem() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <SectionHead pass="Finding" note="the week you actually have" />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16">
        <Reveal>
          <p className="display text-[clamp(1.55rem,3.1vw,2.5rem)] leading-[1.05] text-[var(--k)]">
            Nobody took this job to format documents.
          </p>
          <p className="mt-7 max-w-[56ch] text-[15px] leading-[1.65] text-[var(--soft-ink)] sm:text-[16.5px]">
            And yet the week fills with the tax. The blank page. The fourth rewrite. The
            research you are certain exists somewhere. The decision relitigated in a meeting
            because nobody wrote down why it was made. The launch that shipped and was never
            looked at again.
          </p>
          <p className="mt-4 max-w-[56ch] text-[15px] leading-[1.65] text-[var(--k)] sm:text-[16.5px]">
            The part of the job that needed a person — the judgement — gets
            whatever is left on Friday afternoon.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <ul className="border border-[var(--rule-2)] rounded-[var(--r-lg)] bg-[var(--stock-2)]">
            {TAX.map((t) => (
              <li
                key={t.k}
                className="flex items-baseline justify-between gap-4 border-b-[1px] border-[var(--rule)] px-4 py-3.5 last:border-b-0"
              >
                <span className="text-[13.5px] leading-snug text-[var(--soft-ink)]">{t.k}</span>
                <span className="mono shrink-0 text-[0.66rem] uppercase tracking-[0.12em] text-[var(--k)]">
                  {t.v}
                </span>
              </li>
            ))}
          </ul>
          <p className="mono mt-3 text-[0.62rem] uppercase tracking-[0.12em] text-[var(--muted-ink)]">
            The half of the job that is not judgement
          </p>
        </Reveal>
      </div>
    </section>
  );
}

const TAX = [
  { k: "Writing the thing up so somebody else can read it", v: "Every time" },
  { k: "Finding the research that already answered this", v: "Twice a month" },
  { k: "Chasing the same five people for the same five views", v: "Every decision" },
  { k: "Tidying a backlog nobody can rank without you", v: "Every fortnight" },
  { k: "Going back to check whether the launch did what it promised", v: "Almost never" },
];

/* ================================ 3 — THE PROOF ================================
   The hours. The most persuasive section on the page, so it is the plainest: a rate card,
   set as a rate card, with the last row carrying the real argument.
   ============================================================================== */

function Proof() {
  return (
    <section className="border-y border-[var(--rule-2)] bg-[var(--stock-2)]">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <SectionHead pass="Proof" note="the same week, run twice" />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <Reveal>
            <h2 className="display text-[clamp(1.7rem,3.4vw,2.7rem)] leading-[1.06] text-[var(--k)]">
              Most of a day back. The boring half.
            </h2>
            <p className="mt-6 text-[15px] leading-[1.65] text-[var(--soft-ink)] sm:text-[16px]">
              These are the five artefacts a product manager produces over and over. On the
              left is what each one costs by hand. On the right is what it costs when a
              specialist drafts it and you edit.
            </p>
            <p className="mt-4 text-[15px] leading-[1.65] text-[var(--k)] sm:text-[16px]">
              The last row is the one that matters. It was not slow before. It was not
              happening.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <div className="border border-[var(--rule-2)] rounded-[var(--r-lg)] bg-[var(--stock)] px-5 py-2 sm:px-6">
              <div className="mono flex items-baseline gap-[14px] border-b border-[var(--rule-2)] py-3 text-[0.62rem] uppercase tracking-[0.13em] text-[var(--muted-ink)]">
                <span className="flex-1">The job</span>
                <span className="w-[86px] shrink-0">By hand</span>
                <span className="w-[96px] shrink-0 text-[var(--k)]">With the crew</span>
              </div>
              {JOBS.map((j) => (
                <div key={j.job} className="lx-job">
                  <span className="text-[13.5px] leading-snug text-[var(--soft-ink)]">{j.job}</span>
                  <span className="mono text-[12px] text-[var(--muted-ink)] line-through decoration-[var(--pink)] decoration-2">
                    {j.before}
                  </span>
                  <span className="mono text-[13px] font-medium text-[var(--k)]">{j.after}</span>
                </div>
              ))}
            </div>
            <p className="mono mt-3 text-[0.62rem] leading-relaxed tracking-[0.1em] text-[var(--muted-ink)]">
              By-hand figures are our own team&rsquo;s, measured on real work. Yours will
              differ. Drafting is not deciding: every one of these still comes to you.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const JOBS = [
  { job: "A cited briefing on a problem space you have never worked in", before: "2 days", after: "20 min" },
  { job: "A spec in the house format, grounded in the personas", before: "1.5 days", after: "40 min" },
  { job: "A review pack for a slice of the backlog, ranked and annotated", before: "Half a day", after: "10 min" },
  { job: "A launch pack: the one-pager, the playbooks, the comms", before: "3 days", after: "1 hour" },
  { job: "The honest six-week look back at what you promised", before: "Never", after: "15 min" },
];

/* ================================ 4 — THE CREW ================================
   Eight specialists, each owning one part of the lifecycle. The roster is the page's most
   borrowed idea and the most useful: a named thing with a job is something a reader can
   picture, where "32 skills" is a number they cannot.
   ============================================================================= */

type Agent = {
  name: string;
  role: string;
  accent: string;
  line: string;
  watches: string;
  uses: string;
  delivers: string;
  finding: string;
  status?: string;
};

const CREW: Agent[] = [
  {
    name: "Scout",
    role: "Market signal",
    accent: "--signal",
    line: "Reads the market, the won and lost deals, and what your own customers are saying, before anybody in the building has formed an opinion about it.",
    watches: "Competitors, pricing moves, deal outcomes, support volume, the open web",
    uses: "Web research, your deal records, your ticket history",
    delivers: "Findings with a source on every line, filed against the ideas they support",
    finding: "Two competitors moved on price since June. Our middle tier has not.",
  },
  {
    name: "Archivist",
    role: "Institutional memory",
    accent: "--loop",
    line: "Keeps the Brain: everything the team has ever learned, filed so the next person can find it in one question instead of asking around.",
    watches: "Every research pass, every decision, every launch and what it did",
    uses: "The Brain, and a lint pass that catches its own contradictions",
    delivers: "An answer with citations, or an honest gap where one is missing",
    finding: "We answered this in March. Here is the page, and here is what changed since.",
  },
  {
    name: "Cartographer",
    role: "Discovery",
    accent: "--ai",
    line: "Turns a vague problem into a charted map of the work: what is known, what is assumed, and which unknown is worth paying to close first.",
    watches: "Raw customer feedback, half-formed ideas, the unmapped edge of the backlog",
    uses: "Multi-perspective research, your personas, your backlog",
    delivers: "A charted map of the labour, with the riskiest assumption named",
    finding: "Four of these five are known. The fifth is the whole risk, and it is untested.",
  },
  {
    name: "Compositor",
    role: "Definition",
    accent: "--orch",
    line: "Sets the spec. House format, grounded in the persona library, published where the team already reads it — and then argues with you about it until it holds.",
    watches: "Groomed ideas ready to be written up",
    uses: "The persona library, the house template, your documentation tool",
    delivers: "A spec, and a recorded interrogation of the decisions inside it",
    finding: "Three of your success metrics are activity. Only one is an outcome.",
  },
  {
    name: "The Council",
    role: "Review",
    accent: "--gate",
    line: "Four standing voices — the operator, the designer, the leadership seat and the behavioural read — that argue with a decision before your team has to.",
    watches: "Anything about to be committed to: a spec, a design, a price, a position",
    uses: "The persona library, the operator evidence, behavioural economics",
    delivers: "A recorded verdict per seat, and the objection you had not thought of",
    finding: "The operator seat says this adds a step to the busiest ten minutes of their day.",
  },
  {
    name: "Foreman",
    role: "Delivery and launch",
    accent: "--output",
    line: "Takes a decided thing and makes it real: the tickets shaped so engineering can start, and the launch pack so everyone else knows what changed.",
    watches: "The committed backlog, and everything downstream of a decision",
    uses: "Your issue tracker, your documentation tool, the house templates",
    delivers: "Groomed epics, a one-pager, the playbooks, and the launch comms",
    finding: "This epic has no acceptance criteria and two owners. Both are fixable now.",
  },
  {
    name: "Inspector",
    role: "Quality and the ship call",
    accent: "--orch",
    line: "Tests what was built against what was promised, before a customer does: every acceptance criterion, the design, the edge of a Friday night, and whether everyone can use it. Then tells marketing exactly what it is allowed to claim.",
    watches: "Every build heading for release, and the spec, the decisions and the designs behind it",
    uses: "A real browser, the code read only, your issue tracker, your personas",
    delivers: "A verdict you decide on, a story sent back when it missed its criteria, and the list of claims that were proven",
    finding: "Saving the weekend schedule deletes the weekday one. Back to the engineer, not into the backlog.",
  },
  {
    name: "Proofer",
    role: "The honest look back",
    accent: "--alarm",
    line: "Six weeks after a launch, holds it to the numbers its own spec promised, and says plainly when it missed.",
    watches: "Everything that shipped, and what it said it would do",
    uses: "Your analytics, the original spec, the Brain",
    delivers: "A scorecard against the promise, and the finding filed for next time",
    finding: "It promised a 12 per cent lift. It got 3. Here is where the assumption broke.",
  },
];

function Crew({ signedIn, counts }: { signedIn: boolean; counts: { skills: number } }) {
  const [i, setI] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const a = CREW[i];

  const onKey = useCallback(
    (e: React.KeyboardEvent) => {
      const delta =
        e.key === "ArrowDown" || e.key === "ArrowRight"
          ? 1
          : e.key === "ArrowUp" || e.key === "ArrowLeft"
            ? -1
            : 0;
      if (!delta) return;
      e.preventDefault();
      const next = (i + delta + CREW.length) % CREW.length;
      setI(next);
      tabRefs.current[next]?.focus();
    },
    [i],
  );

  return (
    <section id="crew" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-16 sm:px-8 sm:py-24">
      <SectionHead pass="The crew" note="eight specialists, one lifecycle" />
      <Reveal>
        <h2 className="display max-w-[720px] text-[clamp(1.7rem,3.4vw,2.7rem)] leading-[1.06] text-[var(--k)]">
          Specialists, not a chat window.
        </h2>
        <p className="mt-5 max-w-[58ch] text-[15px] leading-[1.65] text-[var(--soft-ink)] sm:text-[16px]">
          Each one owns a part of the lifecycle, knows what it is allowed to touch, and hands
          its work to the next. Between them they are {counts.skills} skills you never have to
          learn the names of.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-10 grid gap-7 lg:grid-cols-[250px_1fr] lg:gap-10">
          <div
            role="tablist"
            aria-label="The crew"
            aria-orientation="vertical"
            onKeyDown={onKey}
            className="flex flex-col self-start overflow-hidden rounded-[var(--r-lg)] border border-[var(--rule-2)]"
          >
            {CREW.map((c, idx) => (
              <button
                key={c.name}
                ref={(el) => {
                  tabRefs.current[idx] = el;
                }}
                role="tab"
                type="button"
                id={`lx-agent-${idx}`}
                aria-selected={idx === i}
                aria-controls="lx-agent-panel"
                tabIndex={idx === i ? 0 : -1}
                onClick={() => setI(idx)}
                className="lx-agent"
                style={{ ["--sc" as string]: `var(${c.accent})` }}
              >
                <span
                  className="lx-dot"
                  aria-hidden
                  style={{ ["--sc" as string]: `var(${c.accent})` }}
                />
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold leading-tight text-[var(--k)]">
                    {c.name}
                  </span>
                  <span className="mono block text-[0.62rem] uppercase tracking-[0.11em] text-[var(--muted-ink)]">
                    {c.role}
                  </span>
                </span>
              </button>
            ))}

            {/* Not on the roster, because it is not one of them: it is the thing you do when
                none of them fit. Kept in the same block so it reads as part of the crew. */}
            <div className="border-t border-[var(--rule-2)] bg-[var(--stock-2)] px-3 py-3">
              <div className="text-[12.5px] font-semibold leading-tight text-[var(--k)]">
                Commission your own
              </div>
              <p className="mt-1 text-[11.5px] leading-[1.5] text-[var(--soft-ink)]">
                A goal, the tools it may reach for, and the standard it works to. It joins the
                crew and everyone else can call it.
              </p>
            </div>
          </div>

          <div
            id="lx-agent-panel"
            role="tabpanel"
            aria-labelledby={`lx-agent-${i}`}
            className="border border-[var(--rule-2)] rounded-[var(--r-lg)] bg-[var(--stock-2)] p-6 sm:p-8"
          >
            <div key={i} className="lx-agent-panel">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="display text-[26px] leading-none text-[var(--k)] sm:text-[32px]">
                  {a.name}
                </span>
                <span className="eyebrow">{a.role}</span>
              </div>
              <p className="mt-4 max-w-[58ch] text-[14.5px] leading-[1.6] text-[var(--soft-ink)] sm:text-[15.5px]">
                {a.line}
              </p>

              <div className="mt-7">
                <Spec k="Watches" v={a.watches} />
                <Spec k="Uses" v={a.uses} />
                <Spec k="Delivers" v={a.delivers} />
              </div>

              <div
                className="mt-7 border-l-[3px] bg-[var(--stock)] p-4"
                style={{ borderColor: `var(${a.accent})` }}
              >
                <div className="eyebrow">Something it might say</div>
                <p className="mono mt-2 text-[12.5px] leading-relaxed text-[var(--k)] sm:text-[13px]">
                  &ldquo;{a.finding}&rdquo;
                </p>
              </div>

              <div className="mt-7">
                <Doors signedIn={signedIn} secondary={false} />
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="lx-spec">
      <span className="eyebrow">{k}</span>
      <span className="text-[13.5px] leading-[1.55] text-[var(--soft-ink)]">{v}</span>
    </div>
  );
}

/* ================================ 5 — THE HARNESS ================================
   What any specialist can reach for. Each claim carries a small printed proof, because a
   list of six capabilities with no picture under it is a slide, and this page is arguing
   against slides.
   =============================================================================== */

function Harness({ reduced }: { reduced: boolean }) {
  return (
    <section className="border-y border-[var(--rule-2)] bg-[var(--stock-2)]">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <SectionHead pass="The harness" note="what any of them can reach for" />
        <Reveal>
          <h2 className="display max-w-[680px] text-[clamp(1.7rem,3.4vw,2.7rem)] leading-[1.06] text-[var(--k)]">
            One harness. Every tool you already pay for.
          </h2>
          <p className="mt-5 max-w-[58ch] text-[15px] leading-[1.65] text-[var(--soft-ink)] sm:text-[16px]">
            No new place to work. The crew reaches into the tools your team is already in,
            reads what it needs, and puts the finished thing back where people will find it.
          </p>
        </Reveal>

        <ul className="mt-10 grid overflow-hidden rounded-[var(--r-lg)] border border-[var(--rule-2)] bg-[var(--stock)] sm:grid-cols-2 lg:grid-cols-3">
          <Cap
            i={0}
            head="Ask the backlog"
            body="One question, every idea, every piece of evidence hanging off it."
          >
            <Mock rows={[["Ideas citing the missing report", "9"], ["Ranked above it", "10"], ["Evidence attached", "31"]]} />
          </Cap>

          <Cap
            i={1}
            head="Run the research"
            body="An open question becomes a finished briefing, with a source on every claim."
          >
            <Mock rows={[["Sources read", "48"], ["Perspectives taken", "5"], ["Claims without a citation", "0"]]} />
          </Cap>

          <Cap
            i={2}
            head="Convene the review"
            body="Four standing seats argue with the decision before your team has to."
          >
            <Mock rows={[["Operator", "Objects"], ["Design", "Agrees"], ["Behavioural", "Reframes"]]} />
          </Cap>

          <Cap
            i={3}
            head="Attach the evidence"
            body="Findings land on the backlog as citations you can open, not as opinions."
          >
            <Mock rows={[["From lost deals", "6"], ["From support", "3"], ["From the open web", "4"]]} />
          </Cap>

          <Cap
            i={4}
            head="Publish where they read"
            body="The finished artefact lands in the tool the team already lives in, in the house format."
          >
            <Mock rows={[["Spec", "Published"], ["Epics", "Groomed"], ["Launch pack", "Drafted"]]} />
          </Cap>

          <Cap
            i={5}
            head="Measure the promise"
            body="Six weeks on, the spec is held to the numbers it set itself."
          >
            <Bars reduced={reduced} />
          </Cap>
        </ul>

        <p className="mono mt-4 text-[0.62rem] uppercase tracking-[0.12em] text-[var(--muted-ink)]">
          Illustrative figures &middot; read-only unless a person approves the write
        </p>
      </div>
    </section>
  );
}

function Cap({
  i,
  head,
  body,
  children,
}: {
  i: number;
  head: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal as="li" delay={Math.min(i, 3) * 60} className="lx-cell lx-cap">
      <div className="text-[16px] font-semibold leading-snug tracking-tight text-[var(--k)]">
        {head}
      </div>
      <p className="mt-2 text-[13.5px] leading-[1.6] text-[var(--soft-ink)]">{body}</p>
      {children}
    </Reveal>
  );
}

function Mock({ rows }: { rows: [string, string][] }) {
  return (
    <div className="lx-mock">
      {rows.map(([k, v]) => (
        <div key={k} className="lx-mock-row">
          <span>{k}</span>
          <span className="lx-mock-k tabular-nums">{v}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * The measure proof. Bars rather than numbers, because the point of this capability is the
 * gap between what was promised and what happened, and a gap is a shape.
 */
function Bars({ reduced }: { reduced: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.5);
  const rows: [string, number, string][] = [
    ["Promised", 1, "+12%"],
    ["Actual", 0.26, "+3%"],
  ];
  return (
    <div ref={ref} className="lx-mock">
      {rows.map(([k, v, n], idx) => (
        <div key={k} className="py-1.5">
          <div className="mono mb-1 flex items-baseline justify-between text-[0.68rem] text-[var(--soft-ink)]">
            <span>{k}</span>
            <span className="lx-mock-k tabular-nums">{n}</span>
          </div>
          <div
            className="lx-bar"
            style={{ ["--sc" as string]: idx === 0 ? "var(--blue)" : "var(--pink)" }}
          >
            <i
              style={{
                ["--v" as string]: inView || reduced ? v : 0,
                ["--d" as string]: reduced ? "0ms" : `${idx * 140}ms`,
              }}
            />
          </div>
        </div>
      ))}
      <div className="lx-mock-row mt-1.5 border-t border-dashed border-[var(--rule)] pt-2">
        <span>Filed for next time</span>
        <span className="lx-mock-k">Yes</span>
      </div>
    </div>
  );
}

/* ============================== 6 — THE LIFECYCLE ==============================
   The page's proof of specificity. Fourteen stages a product manager will recognise, six
   real paths through them, and a purpose for each one — all read from the same map the
   team uses. Specifics are the whole defence against sounding generated.

   Printed rather than lit: a stage on the selected path is a filled plate, and a stage off
   it is the bare sheet. The gates are the third drum, which is the only warm ink on the
   page and the reason it exists.
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
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <SectionHead pass="Plate" note="the lifecycle, and six paths across it" />
      <Reveal>
        <h2 className="display max-w-[680px] text-[clamp(1.7rem,3.4vw,2.7rem)] leading-[1.06] text-[var(--k)]">
          {counts.stages} stages. {counts.flows} paths through them.
        </h2>
        <p className="mt-5 max-w-[56ch] text-[15px] leading-[1.65] text-[var(--soft-ink)] sm:text-[16px]">
          Left to right is the lifecycle, signal to shipped to learned. Pick a path and watch
          where it goes, including where it comes back — the returns are why this is a
          system and not a pipeline.
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
            className="flex flex-col self-start overflow-hidden rounded-[var(--r-lg)] border border-[var(--rule-2)]"
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
                  {i > 0 && <span className="mr-1.5 text-[var(--rule)]">&rarr;</span>}
                  <span style={i === 0 ? { color: accent } : undefined}>{stages[s]?.name}</span>
                </span>
              ))}
              {flow?.loops && <span className="ml-1 text-[var(--loop)]">&middot; returns upstream</span>}
            </div>

            {/* What the stage you tapped is for. */}
            <div className="mt-6 border border-[var(--rule-2)] rounded-[var(--r-lg)] bg-[var(--stock-2)] p-5" aria-live="polite">
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
    </section>
  );
}

/* ================================ 7 — MEMORY ================================
   Why the second quarter costs less than the first, which is the argument that turns a
   useful tool into something worth committing to.
   ============================================================================ */

const KNOWLEDGE = [
  { k: "Your customers", v: "Who they are, what a shift actually looks like, and what they will never tolerate" },
  { k: "Your definitions", v: "What counts as activated here, and why it is not what the last company meant" },
  { k: "Your competitors", v: "Who moved, when, and what it cost the deals you lost that quarter" },
  { k: "Your decisions", v: "What was decided, by whom, and the objection that was overruled" },
  { k: "Your standard", v: "What a good spec looks like in this house, taken from the ones that worked" },
  { k: "Your history", v: "Every launch, what it promised, and what it actually did" },
];

function Memory() {
  return (
    <section className="border-y border-[var(--rule-2)] bg-[var(--stock-2)]">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <SectionHead pass="Memory" note="why the second quarter costs less" />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <Reveal>
            <h2 className="display text-[clamp(1.7rem,3.4vw,2.7rem)] leading-[1.06] text-[var(--k)]">
              It learns your product. Not the other way around.
            </h2>
            <p className="mt-6 text-[15px] leading-[1.65] text-[var(--soft-ink)] sm:text-[16px]">
              Every business speaks its own language, and a template does not. Everything the
              crew finds lands in the Brain: your definitions, your customers, your history,
              the reasoning behind calls that were already made.
            </p>
            <p className="mt-4 text-[15px] leading-[1.65] text-[var(--k)] sm:text-[16px]">
              Which means the work compounds. The next quarter starts where the last one
              finished, instead of at the beginning, with the same three arguments.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                "Born from your own material. It reads what you already wrote down.",
                "Fluent in your business, not in a template's idea of one.",
                "Never stops learning. Change course and it follows you.",
              ].map((l) => (
                <li key={l} className="flex gap-2.5 text-[14px] leading-[1.55] text-[var(--soft-ink)]">
                  <span aria-hidden className="mt-[7px] h-[7px] w-[7px] shrink-0 rounded-full bg-[var(--pink)]" />
                  {l}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={80}>
            <div className="lx-brain">
              {KNOWLEDGE.map((k) => (
                <div key={k.k} className="lx-know">
                  <div className="eyebrow text-[var(--k)]">{k.k}</div>
                  <p className="mt-2 text-[12.5px] leading-[1.55] text-[var(--soft-ink)]">{k.v}</p>
                </div>
              ))}
            </div>
            <p className="mono mt-3 text-[0.62rem] uppercase tracking-[0.12em] text-[var(--muted-ink)]">
              Illustrative &middot; the Brain holds whatever your team feeds it
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================== 8 — HOW IT WORKS ==============================
   This slot used to hold three shell commands. It now holds the thing those commands were
   in the way of: what actually happens when you use it.
   ============================================================================= */

const STEPS = [
  {
    n: "01",
    title: "Say it in your own words",
    body: "No command to remember and no menu to learn. Describe the task the way you would to a colleague, and the front door names the specialist that fits, or the short chain of them.",
  },
  {
    n: "02",
    title: "Watch the work, not a spinner",
    body: "You see which specialist is running, what it read, and what it found. Every claim it brings back carries the source it came from, so you can check rather than trust.",
  },
  {
    n: "03",
    title: "You approve. It lands.",
    body: "Nothing reaches your tracker, your documentation or your team unreviewed. You edit, you approve, and the finished thing goes where the team already reads.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-16 sm:px-8 sm:py-24">
      <SectionHead pass="Make ready" note="three steps, none of them a command" />
      <Reveal>
        <h2 className="display max-w-[680px] text-[clamp(1.7rem,3.4vw,2.7rem)] leading-[1.06] text-[var(--k)]">
          You lead. They do the digging.
        </h2>
        <p className="mt-5 max-w-[56ch] text-[15px] leading-[1.65] text-[var(--soft-ink)] sm:text-[16px]">
          There is nothing to configure and nothing to keep up to date. The crew changes when
          the work changes, and it is in your next session.
        </p>
      </Reveal>

      <ol className="mt-10 grid gap-4 lg:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal as="li" key={s.n} delay={i * 60}>
            <div className="flex h-full flex-col border border-[var(--rule-2)] rounded-[var(--r-lg)] bg-[var(--stock-2)] p-5 sm:p-6">
              <div className="mono text-[0.68rem] tracking-[0.14em] text-[var(--muted-ink)]">
                {s.n}
              </div>
              <div className="mt-2 text-[17px] font-semibold tracking-tight text-[var(--k)]">
                {s.title}
              </div>
              <p className="mt-3 text-[13.5px] leading-[1.6] text-[var(--soft-ink)]">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </ol>

      <Reveal delay={180}>
        <div className="mt-6 border border-[var(--rule-2)] rounded-[var(--r-lg)] bg-[var(--stock-2)] p-5 sm:p-6">
          <div className="eyebrow text-[var(--k)]">So it sounds like this</div>
          <div className="mono mt-3 flex items-start gap-2.5 text-[13px] leading-relaxed text-[var(--k)] sm:text-[14px]">
            <CornerDownRight className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>&ldquo;Groom this idea, then write the spec and grill me on it.&rdquo;</span>
          </div>
          <p className="mt-3 max-w-[62ch] text-[13px] leading-relaxed text-[var(--soft-ink)]">
            That is three specialists and a review gate. You did not have to know that, and
            nothing moves until you say so.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

/* ============================== 9 — FIVE BY NAME ==============================
   The catalogue, glimpsed. Kept because a reader who has got this far wants to know what
   the individual pieces are actually called, and five real ones settle it.
   ============================================================================= */

function Showcased({ showcase, counts }: { showcase: Showcase[]; counts: { skills: number } }) {
  return (
    <section className="border-y border-[var(--rule-2)] bg-[var(--stock-2)]">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <SectionHead pass="Impression" note="five of them, by name" />
        <Reveal>
          <h2 className="display max-w-[680px] text-[clamp(1.7rem,3.4vw,2.7rem)] leading-[1.06] text-[var(--k)]">
            Five of the {counts.skills}.
          </h2>
          <p className="mt-5 max-w-[56ch] text-[15px] leading-[1.65] text-[var(--soft-ink)] sm:text-[16px]">
            Underneath the crew are named skills, each doing one job properly. You never have
            to call one by name, but you can.
          </p>
        </Reveal>

        {/* One keyline around the block and hairlines between, the way a table is ruled on a
            press sheet, rather than six separate floating cards. */}
        <ul className="mt-10 grid overflow-hidden rounded-[var(--r-lg)] border border-[var(--rule-2)] bg-[var(--stock)] sm:grid-cols-2 lg:grid-cols-3">
          {showcase.map((s, i) => (
            <Reveal as="li" key={s.id} delay={Math.min(i, 3) * 60} className="lx-cell">
              <div className="flex items-baseline justify-between gap-3">
                <span className="mono truncate text-[11.5px] text-[var(--blue)]">{s.title}</span>
                <span className="eyebrow shrink-0">{s.stage}</span>
              </div>
              <p className="mt-3 text-[13.5px] leading-[1.6] text-[var(--soft-ink)]">{s.line}</p>
            </Reveal>
          ))}

          <Reveal as="li" delay={240} className="lx-cell lx-cell-last">
            <Link href="/skills" className="lx-press flex h-full flex-col justify-between">
              <div>
                <div className="text-[16px] font-semibold leading-snug tracking-tight text-[var(--k)]">
                  And {counts.skills - showcase.length} more
                </div>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-[var(--soft-ink)]">
                  Intake, grooming, the council that argues with you, tracker hygiene, the
                  whole launch suite. The full catalogue is behind the door.
                </p>
              </div>
              <span className="mono mt-4 inline-flex items-center gap-1 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--k)]">
                See the catalogue <ArrowUpRight className="h-3 w-3" />
              </span>
            </Link>
          </Reveal>
        </ul>
      </div>
    </section>
  );
}

/* ============================== 10 — WHAT KEEPS IT HONEST ============================== */

const HONEST = [
  {
    head: "A person signs off anything that counts.",
    body: "Those are the yellow gates on the map, and they do not move. Nothing reaches your tracker or your documentation unreviewed.",
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
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
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

        <ul className="grid border border-[var(--rule-2)] rounded-[var(--r-lg)] sm:grid-cols-2">
          {HONEST.map((h, i) => (
            <Reveal as="li" key={h.head} delay={Math.min(i, 3) * 60} className="lx-cell bg-[var(--stock-2)]">
              <div className="text-[15px] font-semibold leading-snug tracking-tight text-[var(--k)]">
                {h.head}
              </div>
              <p className="mt-2 text-[13.5px] leading-[1.6] text-[var(--soft-ink)]">{h.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ============================== 11 — THE PRESS CHECK ==============================
   The objections, answered before they have to be asked. Native <details>, because a
   hand-built accordion owes the keyboard and the screen reader things this element already
   does correctly.
   ============================================================================== */

const QUESTIONS: [string, string][] = [
  [
    "Does it write things and put them live without me?",
    "No. Every stage that commits to something sits behind a review gate — the yellow ones on the map above. The crew drafts, cites and proposes; a person approves before anything reaches a tracker, a document or a customer.",
  ],
  [
    "What do I actually get out of one of these?",
    "A finished artefact in your house format, with the reasoning and the sources attached: a briefing, a spec, a review pack, a set of groomed epics, a launch pack, or a scorecard against what you promised. Not a chat transcript.",
  ],
  [
    "Do I need to learn commands?",
    "No. Describe the task in your own words and the front door names the specialist that fits and starts it. The named commands exist for people who like them.",
  ],
  [
    "Is this just a prompt library?",
    "No. A prompt gives you words back. These reach into your real tools, read your real backlog and your real deal history, attach evidence you can open, and put the finished work back where your team reads it.",
  ],
  [
    "What happens to the research when someone leaves?",
    "It stays. Everything the crew finds is filed in the Brain rather than in a thread, which is the difference between a team that compounds and one that starts over every time somebody moves on.",
  ],
  [
    "How long until it is useful?",
    "The first session. The crew works from what you already have written down, so the first briefing or spec comes back the same day rather than after an onboarding project.",
  ],
  [
    "How do I know it is not making things up?",
    "Because a claim without a source does not ship as research. Every finding carries the link it came from, and you are meant to open them. Where it does not know, it says so rather than filling the gap.",
  ],
  [
    "Who can get in?",
    "Access is granted per person today while this is still being run in anger by one team. Sign in below and we will sort it out.",
  ],
];

function PressCheck() {
  return (
    <section className="border-y border-[var(--rule-2)] bg-[var(--stock-2)]">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <SectionHead pass="Press check" note="asked before signing anything" />
        <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-16">
          <Reveal>
            <h2 className="display text-[clamp(1.7rem,3.4vw,2.7rem)] leading-[1.06] text-[var(--k)]">
              The questions people ask first.
            </h2>
            <p className="mt-6 text-[15px] leading-[1.65] text-[var(--soft-ink)] sm:text-[16px]">
              Nearly always the same eight, and nearly always in this order. Anything else,
              ask a person — you will get an answer rather than a ticket number.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <div className="border border-[var(--rule-2)] rounded-[var(--r-lg)] bg-[var(--stock)] px-5 py-1 sm:px-6">
              {QUESTIONS.map(([q, a], i) => (
                <details key={q} className="lx-q">
                  <summary>
                    <span className="mono shrink-0 text-[0.66rem] tracking-[0.12em] text-[var(--muted-ink)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[14px] leading-snug sm:text-[15px]">{q}</span>
                  </summary>
                  <p className="lx-a max-w-[62ch] pb-5 pl-[34px] text-[13.5px] leading-[1.65] text-[var(--soft-ink)]">
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================ 12 — THE DOOR ================================ */

function Door({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
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
        <div className="mt-9">
          <Doors signedIn={signedIn} />
        </div>
        {!signedIn && (
          <p className="mt-5 text-[13px] text-[var(--muted-ink)]">
            Access is granted per person while this is still young. No card, nothing to
            configure.
          </p>
        )}
      </Reveal>
    </section>
  );
}

function Foot({ counts }: { counts: { skills: number; changes: number } }) {
  return (
    <footer className="border-t border-[var(--rule-2)] bg-[var(--stock-2)]">
      <div className="mono mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-6 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--muted-ink)] sm:px-8">
        <span className="text-[var(--k)]">Pixie Dust Industries</span>
        <Divider />
        <span>Product OS</span>
        <Divider />
        <span>{counts.skills} specialists</span>
        <Divider />
        <span>{counts.changes} changes logged</span>
        <span className="ml-auto">
          <Link href="/login" className="hover:text-[var(--k)]">
            Sign in
          </Link>
        </span>
      </div>
    </footer>
  );
}
