import os from "@/data/os.json";

/**
 * The skills catalogue, as the pages see it.
 *
 * Everything here is generated (see site/scripts/generate.mjs); this module only types it and
 * adds the two lookups both skill pages need. Deriving anything new from the raw data belongs
 * in the generator, not here, so the map, the index and the detail pages cannot disagree.
 */

/** "hop" is a skill reached through an artifact; `via` names the artifact in between. */
export type SkillLink = { id: string; label: string; via: string; kind: "skill" | "artifact" | "hop" };
export type SkillSystem = { id: string; label: string; band: string; access: string };

export type Skill = {
  id: string;
  plugin: string;
  /** How you actually run it, e.g. "/oolio-pm:grill-me". */
  command: string;
  title: string;
  /** The whole opening clause of the description, for the skill's own page. */
  blurb: string;
  /** Its first sentence, for the index, where every card should say one comparable thing. */
  summary: string;
  /** The fuller "what is this", from the skill's own opening paragraph. */
  lede: string;
  /** When it fires, minus the quoted phrases, in the reader's own person. May be empty. */
  when: string;
  /** Things a person can literally type to reach it. */
  phrases: string[];
  /** What this is not for, one exclusion per entry, each naming what to use instead. */
  excludes: string[];
  note: string;
  badge: string;
  type: string;
  stage: string;
  feeds: SkillLink[];
  fedBy: SkillLink[];
  /** Skills two hops downstream, with the artifact between them as the wire's label. */
  throughArtifact: SkillLink[];
  /** The same upstream: whoever produced the artifact this skill consumes. */
  fromArtifact: SkillLink[];
  loops: SkillLink[];
  systems: SkillSystem[];
  prev: string | null;
  next: string | null;
};

export type Stage = { name: string; purpose: string; start: string | null };

export const SKILLS = os.catalogue as Skill[];
export const STAGES = (os.stages as Stage[]).filter((s) => SKILLS.some((k) => k.stage === s.name));
export const TOTALS = os.totals;

const BY_ID = new Map(SKILLS.map((s) => [s.id, s]));
export const skill = (id: string) => BY_ID.get(id);

const colour = os.map.typeColour as Record<string, string>;
/** Unplaced skills have no type of their own and get the alarm colour, same as on the map. */
export const colourOf = (type: string) => colour[type] ?? "#fd6560";
export const typeLabel = (type: string) =>
  (os.map.typeLabel as Record<string, string>)[type] ?? "Unplaced";

/**
 * Split prose on the skill names inside it, so a reader can follow "use `signal-radar` instead"
 * to signal-radar rather than scrolling back to the index to find it. The anti-trigger clauses
 * are the most useful sentences on the site and they are almost entirely cross-references.
 *
 * Longest id first: `grill-me` is a prefix of nothing, but `wiki-new` and `jpd-loop` sit beside
 * ids that share their stem, and a short match would cut a longer name in half.
 */
const IDS = [...BY_ID.keys()].sort((a, b) => b.length - a.length);
const MENTION = new RegExp(`\`?\\b(${IDS.join("|")})\\b\`?`, "g");
const INLINE = /\*\*([^*]+)\*\*|`([^`]+)`/g;

export type Fragment = { text: string; href?: string; code?: boolean; bold?: boolean };

/**
 * The markup left after the skill names have been taken out. SKILL.md is Markdown, so its
 * opening paragraph carries `pack_content.json` and **emphasis** that must be rendered rather
 * than printed: a reader should never see the asterisks.
 */
function inlineSpans(text: string): Fragment[] {
  const out: Fragment[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    out.push(m[1] !== undefined ? { text: m[1], bold: true } : { text: m[2], code: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

export function withSkillLinks(text: string, exclude?: string): Fragment[] {
  const out: Fragment[] = [];
  let last = 0;
  for (const m of text.matchAll(MENTION)) {
    const id = m[1];
    if (m.index > last) out.push(...inlineSpans(text.slice(last, m.index)));
    // A skill linking to itself is a dead end, not a cross-reference, but its backticks still
    // have to go: the reader should never see the source markup.
    out.push(id === exclude ? { text: id, code: true } : { text: id, href: `/skills/${id}` });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(...inlineSpans(text.slice(last)));
  return out;
}

