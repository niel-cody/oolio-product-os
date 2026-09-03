import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CopyCommand } from "@/components/copy-command";
import {
  SKILLS,
  colourOf,
  skill,
  typeLabel,
  withSkillLinks,
  type Fragment,
  type SkillLink,
} from "@/lib/skills";

/**
 * One page per skill: what it does, when to reach for it, when to reach for something else,
 * and where its output goes.
 *
 * All of it is generated. The prose comes from the skill's own SKILL.md and frontmatter, and
 * the connections come from the same map data the /map page draws, so a skill that changes,
 * moves, or grows a new connection changes this page on the next build with nothing to update
 * by hand. See site/scripts/generate.mjs for how each field is derived.
 */

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return SKILLS.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const s = skill((await params).id);
  if (!s) return { title: "Skill not found" };
  return { title: `${s.command}`, description: s.blurb };
}

export default async function SkillPage({ params }: Params) {
  const s = skill((await params).id);
  if (!s) notFound();

  const colour = colourOf(s.type);
  const produces = s.feeds.filter((f) => f.kind === "artifact");
  // Direct wires and artifact-mediated ones are the same fact to a reader deciding what to run
  // next, so they sit in one row; the artifact rides along as the label on the wire.
  const handsTo = [...s.feeds.filter((f) => f.kind === "skill"), ...s.throughArtifact];
  const comesFrom = [...s.fedBy.filter((f) => f.kind === "skill"), ...s.fromArtifact];
  const prev = s.prev ? skill(s.prev) : null;
  const next = s.next ? skill(s.next) : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-6 sm:py-16">
      <Link
        href="/skills"
        className="mono inline-flex items-center gap-1.5 text-[10.5px] tracking-[0.1em] text-[var(--muted-ink)] transition-colors hover:text-[var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" />
        ALL SKILLS
      </Link>

      <header className="mt-7">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className="mono rounded border px-2 py-0.5 text-[9px] tracking-[0.1em]"
            style={{ color: colour, borderColor: `${colour}55` }}
          >
            {typeLabel(s.type)}
          </span>
          <Link
            href={`/skills#${slug(s.stage)}`}
            className="mono text-[9px] tracking-[0.14em] uppercase text-[var(--muted-ink)] hover:text-[var(--ink)]"
          >
            {s.stage}
          </Link>
          <span className="mono text-[9px] tracking-[0.14em] uppercase text-[#4b5a71]">{s.badge}</span>
        </div>

        <h1 className="display mt-4 text-[32px] leading-[1.14] tracking-[-0.018em] sm:text-[42px]">{s.title}</h1>
        <p className="mt-4 text-[17px] leading-relaxed text-[#b4c0d0]">{s.blurb}</p>
      </header>

      <div className="mt-8 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
        <div className="eyebrow mb-2.5">Run it</div>
        <CopyCommand
          command={s.command}
          hint={`Type this in Cowork or Claude Code with the ${s.plugin} plugin installed.`}
        />
      </div>

      <Section title="What it does">
        <p>
          <Linked fragments={withSkillLinks(s.lede, s.id)} />
        </p>
      </Section>

      {(s.when || s.phrases.length > 0) && (
        <Section title="When to reach for it">
          {s.when && (
            <p>
              <Linked fragments={withSkillLinks(s.when, s.id)} />
            </p>
          )}
          {s.phrases.length > 0 && (
            <>
              <p className="!mt-5 !mb-2.5 text-[13px] text-[#8593a8]">Phrases that route to it:</p>
              <ul className="flex flex-wrap gap-1.5">
                {s.phrases.map((p) => (
                  <li
                    key={p}
                    className="mono rounded border border-[var(--line)] bg-[#0e1521] px-2 py-1 text-[11px] text-[#b4c0d0]"
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
        <Section title="When to reach for something else">
          <ul className="space-y-2.5">
            {s.excludes.map((e, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-[1px] bg-[#fcbd30]" />
                <span>
                  <Linked fragments={withSkillLinks(e, s.id)} />
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {(comesFrom.length > 0 || handsTo.length > 0 || produces.length > 0 || s.loops.length > 0) && (
        <Section title="Where it fits">
          <p className="!mb-5">
            It sits in <strong className="font-semibold text-[var(--ink)]">{s.stage}</strong>. The{" "}
            <Link href="/map" className="text-[var(--orch)] hover:underline">
              map
            </Link>{" "}
            shows the same connections end to end.
          </p>
          <div className="space-y-4">
            <Chain label="Comes from" links={comesFrom} empty="Nothing upstream. This is a place to start." />
            <Chain label="Hands on to" links={handsTo} empty="Nothing downstream. This one ends where it ends." />
            {produces.length > 0 && <Chain label="Produces" links={produces} />}
            {s.loops.length > 0 && <Chain label="Loops back to" links={s.loops} />}
          </div>
        </Section>
      )}

      {s.systems.length > 0 && (
        <Section title="What it touches">
          <p className="!mb-4">
            The systems this skill reads from or writes to, derived from what it actually names.
            Anything it writes to needs you signed in to that tool.
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {s.systems.map((sys) => (
              <li
                key={sys.id}
                className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[#0e1521] px-2.5 py-1.5 text-[12.5px]"
              >
                <span className="text-[var(--ink)]">{sys.label}</span>
                {sys.access && (
                  <span className="mono text-[8.5px] tracking-[0.1em] uppercase text-[var(--muted-ink)]">
                    {sys.access}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <nav className="mt-14 grid gap-3 border-t border-[var(--line)] pt-7 sm:grid-cols-2">
        {prev ? <Neighbour skill={prev} dir="prev" /> : <span />}
        {next ? <Neighbour skill={next} dir="next" /> : <span />}
      </nav>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-11">
      <h2 className="eyebrow !text-[10px] border-b border-[var(--line)] pb-2.5">{title}</h2>
      <div className="mt-4 text-[15px] leading-relaxed text-[var(--muted-ink)] [&>p]:mb-3.5 [&>p:last-child]:mb-0">
        {children}
      </div>
    </section>
  );
}

/** One hop of the chain. Artifacts are not pages, so they render as plain labels. */
function Chain({ label, links, empty }: { label: string; links: SkillLink[]; empty?: string }) {
  if (links.length === 0 && !empty) return null;
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-4">
      <span className="mono w-28 shrink-0 text-[9px] tracking-[0.14em] uppercase text-[#4b5a71]">
        {label}
      </span>
      {links.length === 0 ? (
        <span className="text-[13.5px] text-[#5b6a81]">{empty}</span>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {links.map((l) => (
            <li key={l.id + l.via}>
              {l.kind !== "artifact" ? (
                <Link
                  href={`/skills/${l.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[#0e1521] px-2.5 py-1.5 text-[12.5px] text-[var(--ink)] transition-colors hover:border-[#37465d] hover:text-[var(--orch)]"
                >
                  {l.label}
                  {l.via && (
                    <span className="text-[10.5px] text-[var(--muted-ink)]">
                      {l.kind === "hop" ? `via the ${l.via}` : l.via}
                    </span>
                  )}
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#265937] bg-[#0e1521] px-2.5 py-1.5 text-[12.5px] text-[var(--output)]">
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

function Linked({ fragments }: { fragments: Fragment[] }) {
  return (
    <>
      {fragments.map((f, i) =>
        f.href ? (
          <Link key={i} href={f.href} className="mono text-[0.92em] text-[var(--orch)] hover:underline">
            {f.text}
          </Link>
        ) : f.code ? (
          <code key={i} className="mono text-[0.9em] text-[#b4c0d0]">
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

function Neighbour({ skill: s, dir }: { skill: { id: string; title: string; command: string }; dir: "prev" | "next" }) {
  return (
    <Link
      href={`/skills/${s.id}`}
      className={`group rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 transition-colors hover:border-[#37465d] ${
        dir === "next" ? "sm:text-right" : ""
      }`}
    >
      <div className="eyebrow flex items-center gap-1.5 sm:justify-start">
        {dir === "prev" && <ArrowLeft className="h-2.5 w-2.5" />}
        <span className={dir === "next" ? "ml-auto" : ""}>{dir === "prev" ? "Previous" : "Next"}</span>
        {dir === "next" && <ArrowRight className="h-2.5 w-2.5" />}
      </div>
      <div className="mt-1.5 text-[14px] font-semibold transition-colors group-hover:text-[var(--orch)]">
        {s.title}
      </div>
      <code className="mono mt-0.5 block text-[10.5px] text-[#8593a8]">{s.command}</code>
    </Link>
  );
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
