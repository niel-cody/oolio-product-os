import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CopyCommand } from "@/components/copy-command";
import {
  colourOf,
  skill,
  typeLabel,
  withSkillLinks,
  type Fragment,
  type Skill,
  type SkillLink,
} from "@/lib/skills";

/**
 * The whole of one skill: what it does, when to reach for it, when to reach for something else,
 * and where its output goes.
 *
 * It renders in two places, the skill's own page and the drawer on the library, and the only
 * thing that differs between them is how a link to another skill is spelt. The page links to
 * `/skills/<id>`; the drawer stays on the library and changes `?skill=`. So the caller passes
 * `hrefFor` and this component never decides a URL of its own.
 *
 * All of it is generated. The prose comes from the skill's own SKILL.md and frontmatter, and
 * the connections come from the same map data the /map page draws, so a skill that changes,
 * moves, or grows a new connection changes this view on the next build with nothing to update
 * by hand. See site/scripts/generate.mjs for how each field is derived.
 */

type Variant = "page" | "drawer";

export function SkillDetail({
  skill: s,
  hrefFor,
  variant,
}: {
  skill: Skill;
  hrefFor: (id: string) => string;
  variant: Variant;
}) {
  const colour = colourOf(s.type);
  const produces = s.feeds.filter((f) => f.kind === "artifact");
  // Direct wires and artifact-mediated ones are the same fact to a reader deciding what to run
  // next, so they sit in one row; the artifact rides along as the label on the wire.
  const handsTo = [...s.feeds.filter((f) => f.kind === "skill"), ...s.throughArtifact];
  const comesFrom = [...s.fedBy.filter((f) => f.kind === "skill"), ...s.fromArtifact];
  const prev = s.prev ? skill(s.prev) : null;
  const next = s.next ? skill(s.next) : null;
  const drawer = variant === "drawer";
  // In the drawer the page is already where it should be; jumping to the top on every
  // prev/next would throw the reader's place in the library away.
  const scroll = !drawer;

  return (
    <article>
      <header>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="inline-flex items-center gap-1.5">
            {/* colourOf returns a CSS value from the map data, so it goes in as a style. */}
            <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: colour }} />
            <span className="mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted-ink)]">
              {typeLabel(s.type)}
            </span>
          </span>
          <Link
            href={`/skills#${slug(s.stage)}`}
            className="mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted-ink)] transition-colors duration-[var(--dur-state)] ease-[var(--ease-out)] hover:text-[var(--ink)] motion-reduce:transition-none"
          >
            {s.stage}
          </Link>
          <span className="mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted-ink)]">{s.badge}</span>
        </div>

        {drawer ? (
          // The drawer's heading is the Sheet's own title, rendered by the caller, so here it
          // is plain display type rather than a second h1 on the page.
          <p className="display mt-3 text-[26px] leading-[1.14] tracking-[-0.018em]">{s.title}</p>
        ) : (
          <h1 className="display mt-4 text-[32px] leading-[1.14] tracking-[-0.018em] sm:text-[42px]">{s.title}</h1>
        )}
        <p className={`mt-4 leading-relaxed text-[var(--soft-ink)] ${drawer ? "text-[15.5px]" : "text-[17px]"}`}>
          {s.blurb}
        </p>
      </header>

      {/* The one flash on the view: a wash of the pink tint under the thing you leave to go and
          type. A wash rather than the full tint, so it reads as a mark on the sheet. */}
      <div className="mt-7 rounded-[var(--r-lg)] border border-[var(--pink-tint)] bg-[color-mix(in_oklab,var(--pink-tint)_38%,var(--stock-2))] p-4">
        <div className="eyebrow mb-2.5 !text-[var(--ink)]">Run it</div>
        <CopyCommand
          command={s.command}
          hint={`Type this in Cowork or Claude Code with the ${s.plugin} plugin installed.`}
        />
      </div>

      <Section title="What it does" tight={drawer}>
        <p>
          <Linked fragments={withSkillLinks(s.lede, s.id)} hrefFor={hrefFor} scroll={scroll} />
        </p>
      </Section>

      {(s.when || s.phrases.length > 0) && (
        <Section title="When to reach for it" tight={drawer}>
          {s.when && (
            <p>
              <Linked fragments={withSkillLinks(s.when, s.id)} hrefFor={hrefFor} scroll={scroll} />
            </p>
          )}
          {s.phrases.length > 0 && (
            <>
              <p className="!mt-5 !mb-2.5 text-[13px] text-[var(--muted-ink)]">Phrases that route to it:</p>
              <ul className="flex flex-wrap gap-1.5">
                {s.phrases.map((p) => (
                  <li
                    key={p}
                    className="mono rounded-[var(--r-sm)] border border-[var(--rule)] px-2 py-1 text-[11px] text-[var(--soft-ink)]"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Section>
      )}

      {s.excludes.length > 0 && (
        <Section title="When to reach for something else" tight={drawer}>
          <ul className="space-y-2.5">
            {s.excludes.map((e, i) => (
              <li key={i} className="flex gap-2.5">
                {/* Yellow is the gate ink: a person decides here, which is exactly what this list asks of them. */}
                <span aria-hidden className="mt-[0.55em] h-1 w-1 shrink-0 rounded-[1px] bg-[var(--yellow)]" />
                <span>
                  <Linked fragments={withSkillLinks(e, s.id)} hrefFor={hrefFor} scroll={scroll} />
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {(comesFrom.length > 0 || handsTo.length > 0 || produces.length > 0 || s.loops.length > 0) && (
        <Section title="Where it fits" tight={drawer}>
          <p className="!mb-5">
            It sits in <strong className="font-semibold text-[var(--ink)]">{s.stage}</strong>. The{" "}
            <Link href="/map" className="text-[var(--blue)] hover:underline">
              map
            </Link>{" "}
            shows the same connections end to end.
          </p>
          <div className="space-y-4">
            <Chain label="Comes from" links={comesFrom} empty="Nothing upstream. This is a place to start." hrefFor={hrefFor} scroll={scroll} />
            <Chain label="Hands on to" links={handsTo} empty="Nothing downstream. This one ends where it ends." hrefFor={hrefFor} scroll={scroll} />
            {produces.length > 0 && <Chain label="Produces" links={produces} hrefFor={hrefFor} scroll={scroll} />}
            {s.loops.length > 0 && <Chain label="Loops back to" links={s.loops} hrefFor={hrefFor} scroll={scroll} />}
          </div>
        </Section>
      )}

      {s.systems.length > 0 && (
        <Section title="What it touches" tight={drawer}>
          <p className="!mb-4">
            The systems this skill reads from or writes to, derived from what it actually names.
            Anything it writes to needs you signed in to that tool.
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {s.systems.map((sys) => (
              <li
                key={sys.id}
                className="flex items-center gap-2 rounded-[var(--r-md)] border border-[var(--rule)] px-2.5 py-1.5 text-[12.5px]"
              >
                <span className="text-[var(--ink)]">{sys.label}</span>
                {sys.access && (
                  <span className="mono text-[8.5px] uppercase tracking-[0.1em] text-[var(--muted-ink)]">
                    {sys.access}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <nav
        aria-label="Neighbouring skills"
        className={`grid gap-3 border-t border-[var(--rule)] sm:grid-cols-2 ${drawer ? "mt-10 pt-5" : "mt-14 pt-7"}`}
      >
        {prev ? <Neighbour skill={prev} dir="prev" hrefFor={hrefFor} scroll={scroll} /> : <span />}
        {next ? <Neighbour skill={next} dir="next" hrefFor={hrefFor} scroll={scroll} /> : <span />}
      </nav>
    </article>
  );
}

function Section({ title, tight, children }: { title: string; tight: boolean; children: React.ReactNode }) {
  return (
    <section className={tight ? "mt-9" : "mt-11"}>
      <h2 className="eyebrow !text-[10px] border-b border-[var(--rule)] pb-2.5">{title}</h2>
      <div className="mt-4 text-[15px] leading-relaxed text-[var(--muted-ink)] [&>p]:mb-3.5 [&>p:last-child]:mb-0">
        {children}
      </div>
    </section>
  );
}

/** One hop of the chain. Artifacts are not pages, so they render as plain labels on the green ground. */
function Chain({
  label,
  links,
  empty,
  hrefFor,
  scroll,
}: {
  label: string;
  links: SkillLink[];
  empty?: string;
  hrefFor: (id: string) => string;
  scroll: boolean;
}) {
  if (links.length === 0 && !empty) return null;
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-4">
      <span className="mono w-28 shrink-0 text-[9px] uppercase tracking-[0.14em] text-[var(--muted-ink)]">
        {label}
      </span>
      {links.length === 0 ? (
        <span className="text-[13.5px] text-[var(--muted-ink)]">{empty}</span>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {links.map((l) => (
            <li key={l.id + l.via}>
              {l.kind !== "artifact" ? (
                <Link
                  href={hrefFor(l.id)}
                  scroll={scroll}
                  className="inline-flex items-center gap-1.5 rounded-[var(--r-md)] border border-[var(--rule)] px-2.5 py-1.5 text-[12.5px] text-[var(--ink)] transition-colors duration-[var(--dur-state)] ease-[var(--ease-out)] hover:border-[var(--rule-2)] hover:text-[var(--blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] motion-reduce:transition-none"
                >
                  {l.label}
                  {l.via && (
                    <span className="text-[10.5px] text-[var(--muted-ink)]">
                      {l.kind === "hop" ? `via the ${l.via}` : l.via}
                    </span>
                  )}
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-[var(--r-md)] bg-[var(--glaucous)] px-2.5 py-1.5 text-[12.5px] text-[var(--ink)]">
                  {l.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Prose with the skill names turned into links. withSkillLinks spells every cross-reference as
 * `/skills/<id>` because it does not know where it is being rendered; the id is taken back out
 * here and handed to hrefFor so the drawer can keep its own addressing.
 */
function Linked({
  fragments,
  hrefFor,
  scroll,
}: {
  fragments: Fragment[];
  hrefFor: (id: string) => string;
  scroll: boolean;
}) {
  return (
    <>
      {fragments.map((f, i) =>
        f.href ? (
          <Link
            key={i}
            href={hrefFor(f.href.replace(/^\/skills\//, ""))}
            scroll={scroll}
            className="mono text-[0.92em] text-[var(--blue)] hover:underline"
          >
            {f.text}
          </Link>
        ) : f.code ? (
          <code key={i} className="mono text-[0.9em] text-[var(--soft-ink)]">
            {f.text}
          </code>
        ) : f.bold ? (
          <strong key={i} className="font-semibold text-[var(--ink)]">
            {f.text}
          </strong>
        ) : (
          <span key={i}>{f.text}</span>
        ),
      )}
    </>
  );
}

function Neighbour({
  skill: s,
  dir,
  hrefFor,
  scroll,
}: {
  skill: { id: string; title: string; command: string };
  dir: "prev" | "next";
  hrefFor: (id: string) => string;
  scroll: boolean;
}) {
  return (
    <Link
      href={hrefFor(s.id)}
      scroll={scroll}
      className={`group rounded-[var(--r-lg)] border border-[var(--rule)] p-4 transition-colors duration-[var(--dur-state)] ease-[var(--ease-out)] hover:border-[var(--rule-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] motion-reduce:transition-none ${
        dir === "next" ? "sm:text-right" : ""
      }`}
    >
      <div className="eyebrow flex items-center gap-1.5 sm:justify-start">
        {dir === "prev" && <ArrowLeft className="h-2.5 w-2.5" />}
        <span className={dir === "next" ? "ml-auto" : ""}>{dir === "prev" ? "Previous" : "Next"}</span>
        {dir === "next" && <ArrowRight className="h-2.5 w-2.5" />}
      </div>
      <div className="mt-1.5 text-[14px] font-semibold transition-colors duration-[var(--dur-state)] ease-[var(--ease-out)] group-hover:text-[var(--blue)] motion-reduce:transition-none">
        {s.title}
      </div>
      <code className="mono mt-0.5 block text-[10.5px] text-[var(--muted-ink)]">{s.command}</code>
    </Link>
  );
}

/** The same slug the library gives each folder, so the stage link lands on its shelf. */
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
