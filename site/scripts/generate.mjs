#!/usr/bin/env node
/**
 * Generates the site's data from the Product OS itself.
 *
 *   node site/scripts/generate.mjs            write site/data/os.json
 *   node site/scripts/generate.mjs --check    validate only, no write, non-zero exit on drift
 *
 * Two inputs. The marketplace manifest and the plugins it lists are the source of truth
 * for everything derivable: which plugins exist, which skills they ship, and what each
 * skill actually says. site/map.config.json is the editorial overlay, and holds only
 * judgement calls: lifecycle stages, connections, gates, loops, flows and the About copy.
 *
 * Runs as a prebuild step, so every page renders from generated data. The moment a page
 * hand-maintains a list of skills, we have rebuilt the problem this exists to fix.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = join(SITE, "..");
const CHECK = process.argv.includes("--check");

const problems = [];
const warnings = [];
const fail = (m) => problems.push(m);
const warn = (m) => warnings.push(m);

/* ---------------------------------------------------------------- frontmatter
   Deliberately minimal: SKILL.md files only ever use scalars and folded (>-) blocks.
   A YAML dependency would buy nothing here. */
function frontmatter(text) {
  const lines = text.split("\n");
  if (lines[0].trim() !== "---") return {};
  const out = {};
  let key = null, block = null, buf = [];
  const flush = () => {
    if (!key) return;
    out[key] = block === "|" ? buf.join("\n") : buf.join(" ").replace(/\s+/g, " ").trim();
    key = null; block = null; buf = [];
  };
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "---") { flush(); break; }
    if (block && (line.startsWith("  ") || line.trim() === "")) { buf.push(line.trim()); continue; }
    const m = line.match(/^([A-Za-z][\w-]*):\s?(.*)$/);
    if (!m) continue;
    flush();
    const [, k, v] = m;
    if (/^[|>][-+]?$/.test(v.trim())) { key = k; block = v.trim()[0]; buf = []; }
    else out[k] = v.trim().replace(/^["'](.*)["']$/, "$1");
  }
  flush();
  return out;
}

const dirsIn = (p) =>
  existsSync(p) ? readdirSync(p).filter((d) => statSync(join(p, d)).isDirectory()) : [];

/* ------------------------------------------------------------ human-facing copy
   A skill carries two pieces of prose, written for two different readers, and the site
   needs both. Neither is repeated in map.config.json: they ship with the skill, so they
   cannot fall behind it.

   The frontmatter `description` is a routing spec written for the model. It has a reliable
   shape — what the skill does, then "Trigger when…", then "Do NOT trigger for…" — and each
   part reads well to a human once separated. The opening clause is the one-line summary; the
   anti-trigger clause is the disambiguation ("not this, use that instead"), which is the most
   useful thing on the page and the part a naive truncation throws away first.

   The SKILL.md body's opening paragraph is written for a human already, and is the fuller
   answer to "what is this". A handful of skills open in the second person instead ("You are
   acting as the Product Council Chair"), which is instruction, not description; those declare
   a `lede` override in map.config.json. */

const TRIGGER = /(?:^|\s)(Trigger PROACTIVELY when(?:ever)?|Trigger when(?:ever)?|Trigger automatically when|Use when(?:ever)?|Use this when|Invoke manually)/;
const ANTI = /(?:^|\s)(Do NOT trigger|Do not trigger|Don't trigger|Never trigger)/;
const LEAD = /^(Trigger PROACTIVELY when(?:ever)?|Trigger when(?:ever)?|Trigger automatically when|Use when(?:ever)?|Use this when|Invoke manually(?:\s+with)?)\s*/i;
/* Double quotes only. An apostrophe is not a delimiter here: treating it as one splits
   "what's changed in the market" into two fragments and litters the page with "what" and "s". */
const PHRASE = /["“”]([^"“”]{3,70})["“”]/g;

/* The trigger clause is written in the third person about "the user". Converting it to the
   second person needs the verb to agree, and the set of verbs that follow is small and closed
   across the whole plugin, so a lookup is exact where a stem-stripping rule would guess. A verb
   that is not in the table leaves "the user" alone, which is still correct English. */
const VERB = {
  says: "say", asks: "ask", pastes: "paste", references: "reference", mentions: "mention",
  has: "have", hands: "hand", drops: "drop", wants: "want", gives: "give", is: "are", does: "do",
  describes: "describe", names: "name", complains: "complain", needs: "need", refers: "refer",
  uses: "use", runs: "run", takes: "take", pushes: "push", brings: "bring", shares: "share",
};
const MARK = "§Q§", LIST = "§L§", DOT = "§D§";
const SUBJECT = /\b(the user|someone)\b/i;

const tidy = (s) => s
  .replace(/\(\s*\)/g, "")
  .replace(/\s*[—–-]\s*(?=[.,;]|$)/g, "")
  .replace(/([—–])\s*\1/g, "$1")
  .replace(/\s+\b(?:to|at|for|about|like)\b\s*(?=[,;])/g, "")   // preposition stranded by its list
  .replace(/\s+([,.;])/g, "$1")
  .replace(/([,;])\s*([,;.])/g, "$2")
  .replace(/,\s*(?=\.)/g, "")
  .replace(/\s{2,}/g, " ")
  .trim();

/* The trigger clause minus its quoted phrases, which render separately as chips. What is left
   is the part of the trigger that is not a magic word, rewritten into the reader's own person. */
function whenProse(when) {
  let t = when.replace(LEAD, "");

  t = t.replace(PHRASE, MARK);
  // Separators between phrases are ", ", "/", " or ", and on the last item ", or ".
  t = t.replace(new RegExp(`${MARK}(?:\\s*[,/]?\\s*(?:or|and)?\\s*${MARK})*`, "g"), LIST);
  // The verb that introduced the list goes with it, and so does its object: "asks to <list>
  // the epic" would otherwise leave "the epic" hanging off the previous clause.
  t = t.replace(new RegExp(`\\b(?:and\\s+|then\\s+)?(?:says?|asks?)(?:\\s+(?:to|for|about|something\\s+like))?\\s*[:,]?\\s*${LIST}(?:\\s+(?:the|an?|this)\\s+\\w+)?`, "gi"), LIST);
  t = t.replace(new RegExp(`\\s*(?:,|;)?\\s*(?:or|and)?\\s*${LIST}`, "g"), "");

  // "e.g." and friends are not sentence ends. It is the trailing dot that has to be hidden,
  // because that is the one the splitter below would fire on.
  t = t.replace(/\b(?:e\.g|i\.e|etc|vs|approx|Dr|Mr|Ms)\./gi, (m) => m.slice(0, -1) + DOT);

  const sentences = t.split(/(?<=\.)\s+/).map((raw) => {
    let s = tidy(raw);
    // "the user says X, Y, or hands over Z" loses its verb with the list, leaving "the user, or
    // hands over Z". Rejoin the subject to whichever verb survived.
    s = s.replace(/\b(the user|someone)\s*[,;]\s*(?:or|and)\s+/i, "$1 ");

    const m = s.match(SUBJECT);
    const next = m ? s.slice(m.index + m[0].length).match(/^\s+(\w+)/) : null;
    if (m && next && VERB[next[1].toLowerCase()]) {
      s = s.replace(SUBJECT, "you");
      // Two passes rather than one alternation: a combined ",|or" pattern matches ", or" first
      // and consumes the conjunction, so the verb after it never gets examined. Repeat until
      // stable, because adjacent verbs cannot both be taken in a single pass.
      const fix = (all, lead, verb) =>
        VERB[verb.toLowerCase()] ? `${lead} ${VERB[verb.toLowerCase()]}` : all;
      for (let n = 0; n < 4; n++) {
        const before = s;
        s = s.replace(/\b(you|or|and|then)\s+(\w+)\b/gi, fix).replace(/([,;])\s+(\w+)\b/g, fix);
        if (s === before) break;
      }
      s = s.replace(/\btheir\b/gi, "your").replace(/\bthey\b/gi, "you");
    } else if (m && s.search(SUBJECT) === 0) {
      // Opens on a subject whose verb went with the phrase list, leaving "The user any
      // combination of the three": a fragment, not a sentence.
      return "";
    }
    return tidy(s);
  });

  t = sentences
    .filter((s) => s.replace(/[^a-z ]/gi, "").trim().split(/\s+/).filter(Boolean).length >= 5)
    .join(" ");
  t = tidy(t).replace(new RegExp(DOT, "g"), ".").replace(/^[,;\s]+/, "");
  // "Also" as the opening word is a dangling reference to a clause that has been removed.
  t = t.replace(/^Also\s+trigger\s+(?:when|for)\s+/i, "").replace(/^Also\s+/i, "");
  if (t.length < 25) return "";
  // If nothing addresses the reader, the trigger was entirely quoted phrases and what survived
  // describes the skill's behaviour instead ("Proposes fixes, changes only on approval"). True,
  // but not an answer to "when do I reach for this", so the chips carry the section alone.
  if (!/\byou\b/i.test(t)) return "";
  return t[0].toUpperCase() + t.slice(1).replace(/[.\s]*$/, ".");
}

/* The anti-trigger clause is one long sentence for a model ("Do NOT trigger for X (use `a`),
   for Y (use `b`), or for Z"). Split on its top-level commas so each exclusion is its own line,
   which is how a person scans it. Bracket depth is tracked because every clause contains a
   parenthesised "(use `x`)", and splitting inside one would strand the answer. */
function exclusions(notWhen) {
  const body = notWhen.replace(/^(Do NOT trigger|Do not trigger|Don't trigger|Never trigger)\s*/i, "");
  const parts = [];
  let depth = 0, buf = "";
  for (const ch of body) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) { parts.push(buf); buf = ""; continue; }
    buf += ch;
  }
  parts.push(buf);
  return parts
    .map((p) => p.trim().replace(/^(?:or|and)\s+/i, "").replace(/[.\s]+$/, ""))
    .filter((p) => p.length > 2)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1));
}

/* Abbreviations first, so "e.g." is not read as the end of the sentence. */
function firstSentence(text) {
  const t = (text || "").replace(/\b(?:e\.g|i\.e|etc|vs|approx)\./gi, (m) => m.slice(0, -1) + DOT);
  const cut = t.split(/(?<=\.)\s+/)[0] || t;
  return cut.replace(new RegExp(DOT, "g"), ".").trim();
}

function splitDescription(desc) {
  const t = (desc || "").trim();
  const anti = t.search(ANTI);
  const head = anti < 0 ? t : t.slice(0, anti).trim();
  const notWhen = anti < 0 ? "" : t.slice(anti).trim();

  const trig = head.search(TRIGGER);
  const blurb = (trig < 0 ? head : head.slice(0, trig)).trim();
  const rawWhen = trig < 0 ? "" : head.slice(trig).trim();

  // The trigger clause is largely a list of things a person can literally type. Pulled out as
  // chips it stops being noise and becomes the most practical line on the page.
  const phrases = [...rawWhen.matchAll(PHRASE)]
    .map((m) => m[1].trim())
    .filter((p) => /[a-z]/i.test(p))
    .filter((p, i, a) => a.indexOf(p) === i)
    .slice(0, 14);

  return { blurb, when: whenProse(rawWhen), phrases, excludes: notWhen ? exclusions(notWhen) : [] };
}

/* Title and opening paragraph from the body. A few skills put the paragraph under a first
   heading ("## What this is") rather than directly under the H1, so a heading encountered
   before any prose is skipped rather than treated as the end of the lede. */
function parseSkillDoc(text) {
  const parts = text.split(/^---\s*$/m);
  const body = parts.length > 2 ? parts.slice(2).join("---") : text;
  const lines = body.split("\n");

  let i = lines.findIndex((l) => l.startsWith("# "));
  const title = i < 0 ? "" : lines[i].slice(2).trim();

  const buf = [];
  for (i = i < 0 ? 0 : i + 1; i < lines.length; i++) {
    const l = lines[i].trim();
    if (l.startsWith("#")) { if (buf.length) break; else continue; }   // skip a heading only before prose
    if (!l) { if (buf.length) break; else continue; }
    if (l.startsWith("```") || l.startsWith("|") || l.startsWith("- ") || l.startsWith("* ")) break;
    buf.push(l);
  }
  return { title, lede: buf.join(" ").trim() };
}

/* Everything a skill says, SKILL.md plus its reference files, as one string. The systems map
   matches against this rather than the frontmatter alone: a skill's real connector list lives
   in its reference pages as often as in its description. */
function skillText(dir) {
  const out = [];
  const walk = (p) => {
    for (const name of readdirSync(p)) {
      const child = join(p, name);
      if (statSync(child).isDirectory()) walk(child);
      else if (/\.(md|json)$/.test(name)) out.push(readFileSync(child, "utf8"));
    }
  };
  walk(dir);
  return out.join("\n");
}

/* ------------------------------------------------- discover, marketplace-first
   oolio-pm is the first plugin, not the only one. A second team's plugin appears
   here automatically, and its skills show as unplaced until someone maps them. */
/* The repo may not be visible: on Vercel, a Root Directory of `site` hides everything above it.
   site/data/os.json is committed for exactly that case, so the build still has the OS to render.
   `--check` never accepts the snapshot, and it runs where the repo IS visible, so a stale file
   cannot survive a push. Build falls back; check tells the truth. */
if (!existsSync(join(ROOT, ".claude-plugin", "marketplace.json"))) {
  const snapshot = join(SITE, "data", "os.json");
  if (!CHECK && existsSync(snapshot)) {
    const age = JSON.parse(readFileSync(snapshot, "utf8"));
    console.warn(
      `\n  warn  Repo not visible from site/, so using the committed snapshot ` +
      `(${age.totals.skills} skills, generated at ${age.stamp}).\n` +
      `        This is expected on Vercel with Root Directory = site.\n`);
    process.exit(0);
  }
  console.error(
    "\n  Cannot see the repo from site/, and there is no committed site/data/os.json to fall\n" +
    "  back on. Run this from a full checkout, or restore the snapshot.\n");
  process.exit(1);
}
const marketplace = JSON.parse(readFileSync(join(ROOT, ".claude-plugin", "marketplace.json"), "utf8"));

const plugins = [];
const discovered = {};
const corpus = {};   // skill id -> everything that skill says, for the systems map to match against
for (const entry of marketplace.plugins) {
  const base = join(ROOT, entry.source.replace(/^\.\//, ""));
  const skillsDir = join(base, "skills");
  if (!existsSync(skillsDir)) { fail(`plugin "${entry.name}" has no skills/ directory at ${entry.source}`); continue; }

  const skills = [];
  for (const dir of dirsIn(skillsDir).sort()) {
    const file = join(skillsDir, dir, "SKILL.md");
    if (!existsSync(file)) { warn(`${entry.name}/${dir}/ has no SKILL.md, skipped`); continue; }
    const raw = readFileSync(file, "utf8");
    const fm = frontmatter(raw);
    if (!fm.name) fail(`${dir}/SKILL.md has no name in its frontmatter`);
    else if (fm.name !== dir) fail(`${dir}/SKILL.md declares name "${fm.name}", which does not match its folder`);
    // The plugin versions by commit; a per-skill version pins nothing and misleads. See CLAUDE.md.
    if (fm.version) fail(`${dir}/SKILL.md carries a version field, which the skill standard forbids`);
    if (discovered[dir]) fail(`skill id "${dir}" is shipped by two plugins, which the map cannot disambiguate`);
    const doc = parseSkillDoc(raw);
    const skill = {
      id: dir, plugin: entry.name, description: fm.description || "",
      title: doc.title, lede: doc.lede, ...splitDescription(fm.description || ""),
    };
    skills.push(skill);
    discovered[dir] = skill;
    corpus[dir] = skillText(join(skillsDir, dir));
  }

  plugins.push({
    name: entry.name,
    description: entry.description || "",
    skills,
    counts: {
      skills: skills.length,
      inProgress: dirsIn(join(base, "skills-in-progress")).filter((d) => existsSync(join(base, "skills-in-progress", d, "SKILL.md"))).length,
      archived: dirsIn(join(base, "_archive")).filter((d) => existsSync(join(base, "_archive", d, "SKILL.md"))).length,
    },
  });
}
const skillCount = Object.keys(discovered).length;

/* -------------------------------------------------------------------- overlay */
const cfg = JSON.parse(readFileSync(join(SITE, "map.config.json"), "utf8"));
const columns = [...cfg.columns];
const colIndex = (name) => columns.indexOf(name);

for (const id of Object.keys(cfg.skills)) {
  if (!discovered[id]) fail(`map.config.json places "${id}", but no plugin ships a skill by that name`);
}

/* A stage heading with nothing under it but a count tells a reader nothing about when they are
   in that stage. Each one carries a sentence of purpose and an entry point, and both are
   judgement calls, so both live in the overlay and both are checked. */
const stageNotes = cfg.stageNotes || {};
for (const c of cfg.columns) if (!stageNotes[c]) fail(`map.config.json has no stageNotes entry for the "${c}" column`);
for (const [c, n] of Object.entries(stageNotes)) {
  if (!cfg.columns.includes(c)) fail(`stageNotes names "${c}", which is not one of the columns`);
  if (n.start && cfg.skills[n.start]?.stage !== c)
    fail(`stageNotes["${c}"] starts with "${n.start}", which does not sit in that stage`);
}
const unplaced = Object.keys(discovered).filter((id) => !cfg.skills[id]);
if (unplaced.length) {
  // Never silently missing: they get their own red column until someone places them.
  columns.push("⚠ Unplaced");
  fail(`${unplaced.length} skill(s) have no map.config.json entry: ${unplaced.join(", ")}`);
}

/* ---------------------------------------------------------------------- nodes */
const nodes = [];
const push = (id, e, type) => {
  const col = e.stage === undefined ? columns.length - 1 : colIndex(e.stage);
  if (col < 0) fail(`"${id}" sits in stage "${e.stage}", which is not one of the columns`);
  nodes.push({
    id, label: e.label, note: e.note, badge: e.badge, type,
    col: Math.max(col, 0), row: e.row,
    ...(discovered[id]?.description ? { desc: discovered[id].description } : {}),
  });
};
for (const [id, e] of Object.entries(cfg.artifacts)) push(id, e, "output");
for (const [id, e] of Object.entries(cfg.skills)) if (discovered[id]) push(id, e, e.type);
unplaced.forEach((id, i) =>
  push(id, { label: id, note: "no map entry yet", badge: "UNMAPPED", row: i }, "unplaced"));

const known = new Set(nodes.map((n) => n.id));

/* ---------------------------------------------------------------------- edges */
const edges = [];
for (const [id, e] of Object.entries({ ...cfg.artifacts, ...cfg.skills })) {
  if (!known.has(id)) continue;
  for (const f of e.feeds || []) {
    const to = typeof f === "string" ? f : f.to;
    if (!known.has(to)) { fail(`"${id}" feeds "${to}", which is not a node on the map`); continue; }
    edges.push({ f: id, t: to, ...(typeof f === "object" && f.label ? { lbl: f.label } : {}) });
  }
}

/* ------------------------------------------------------- gates, loops, flows */
const gates = cfg.gates.map((g) => {
  const after = colIndex(g.after);
  if (after < 0) fail(`gate "${g.label}" sits after column "${g.after}", which does not exist`);
  return { after: Math.max(after, 0), label: g.label, who: g.who };
});
const loops = cfg.loops.filter((l) => {
  const ok = known.has(l.from) && known.has(l.to);
  if (!ok) fail(`loop "${l.label}" connects nodes that are not on the map`);
  return ok;
}).map((l) => ({ f: l.from, t: l.to, label: l.label }));

const wired = new Set([...edges.map((e) => e.f + ">" + e.t), ...loops.map((l) => l.f + ">" + l.t)]);
for (const fl of cfg.flows) {
  for (const [id] of fl.path)
    if (!known.has(id)) fail(`flow "${fl.name}" steps through "${id}", which is not a node on the map`);
  // The renderer skips flow steps with no matching link, drawing a flow with invisible gaps.
  // Catch that here rather than letting the page quietly lie about the path.
  for (let i = 0; i < fl.path.length - 1; i++) {
    const [a] = fl.path[i], [b] = fl.path[i + 1];
    if (!wired.has(a + ">" + b) && !wired.has(b + ">" + a))
      fail(`flow "${fl.name}" step ${i + 1}→${i + 2} ("${a}" to "${b}") has no connection to draw`);
  }
}

/* ------------------------------------------------------------------- systems
   The second map. Where map.config.json is about how the work moves, this is about what it
   moves through. Same split: the wires, the cadences and the routes are judgement calls and
   live in systems.config.json; which skills actually touch which system is derived by matching
   each system's patterns against everything its skills say, so the counts cannot go stale. */
const sys = JSON.parse(readFileSync(join(SITE, "systems.config.json"), "utf8"));
const systems = [];
{
  const bands = Object.keys(sys.kinds);
  for (const [id, s] of Object.entries(sys.systems)) {
    if (!bands.includes(s.band)) fail(`system "${id}" sits in band "${s.band}", which is not one of the kinds`);
    // A pattern that matches nothing is either a renamed tool or a typo, and both look identical
    // on the page: a system that quietly claims no skill uses it.
    const res = (s.match || []).map((m) => new RegExp(m));
    const touched = res.length
      ? Object.keys(corpus).filter((k) => res.some((re) => re.test(corpus[k]))).sort()
      : [];
    // Only worth warning about for skill-driven systems. Granola and GitHub are moved by the
    // nightly ingest and the vault's autosync, so no skill naming them is the fact, not drift.
    if (s.driver !== "ingest")
      for (const m of s.match || [])
        if (!Object.values(corpus).some((t) => new RegExp(m).test(t)))
          warn(`systems.config.json: "${id}" matches on /${m}/, which no skill mentions`);
    systems.push({ id, ...s, match: undefined, skills: touched, skillCount: touched.length });
  }
}
const knownSys = new Set(systems.map((s) => s.id));
const sysWires = sys.wires.filter((w) => {
  const ok = knownSys.has(w.from) && knownSys.has(w.to);
  if (!ok) fail(`systems wire "${w.from}" → "${w.to}" names a system that does not exist`);
  return ok;
});
{
  const wired = new Set(sysWires.map((w) => w.from + ">" + w.to));
  for (const r of sys.routes) {
    for (const [id] of r.path)
      if (!knownSys.has(id)) fail(`route "${r.name}" steps through "${id}", which is not a system`);
    // Same trap as the map's flows: a step with no wire draws an invisible gap, and the page
    // then shows a route that looks continuous and is not.
    for (let i = 0; i < r.path.length - 1; i++) {
      const [a] = r.path[i], [b] = r.path[i + 1];
      if (!wired.has(a + ">" + b) && !wired.has(b + ">" + a))
        fail(`route "${r.name}" step ${i + 1}→${i + 2} ("${a}" to "${b}") has no wire to draw`);
    }
  }
}

/* ------------------------------------------------------------- skill records
   One flat record per skill, carrying everything a page needs: the derived prose, where it
   sits, what it hands on to and what hands to it, and which systems it touches. The pages
   render this and join nothing themselves, because a join written in a page is a rule that
   only that page obeys.

   Lifecycle order, not alphabetical, so "previous / next skill" walks the actual work. */
const catalogue = [];
{
  const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));
  // A connection lands on either another skill or an artifact, and the page says different
  // things about the two: one is "hands on to", the other is "produces".
  const link = (id, via) => ({
    id, label: nodeById[id]?.label || id, via: via || "",
    kind: nodeById[id]?.type === "output" ? "artifact" : "skill",
  });
  const isArtifact = (id) => nodeById[id]?.type === "output";

  /* Skills two hops away, with an artifact in between. `near`/`far` name which end of the edge
     is this skill's side, so one function serves both directions. */
  const hop = (id, near, far) => {
    const out = [];
    for (const a of edges.filter((e) => e[near] === id && isArtifact(e[far]))) {
      for (const b of edges.filter((e) => e[near] === a[far] && !isArtifact(e[far]))) {
        if (b[far] === id || out.some((x) => x.id === b[far])) continue;
        // "hop", not "skill": the page says "via the PRD" rather than presenting the artifact
        // label as if it were the name of the wire.
        out.push({ ...link(b[far], nodeById[a[far]].label), kind: "hop" });
      }
    }
    return out;
  };
  const sysOf = Object.fromEntries(
    Object.keys(discovered).map((id) => [id, systems.filter((s) => s.skills.includes(id))]));

  for (const [id, over] of Object.entries(cfg.overrides || {})) {
    if (!discovered[id]) fail(`map.config.json overrides "${id}", but no plugin ships a skill by that name`);
    else for (const k of Object.keys(over))
      if (!["blurb", "lede"].includes(k)) fail(`overrides["${id}"] sets "${k}", which is not an overridable field`);
  }

  const ordered = Object.values(discovered).sort((a, a2) => {
    const [x, y] = [nodeById[a.id], nodeById[a2.id]];
    return (x?.col ?? 99) - (y?.col ?? 99) || (x?.row ?? 99) - (y?.row ?? 99) || a.id.localeCompare(a2.id);
  });

  ordered.forEach((s, i) => {
    const n = nodeById[s.id];
    const over = (cfg.overrides || {})[s.id] || {};
    // Derivation covers most of the set. An override exists only where the skill's own prose is
    // written at the model rather than about the skill, and the generator says so out loud, so
    // an override that has quietly become unnecessary is visible rather than permanent.
    if (over.lede && !/^You are /.test(s.lede) && s.lede)
      warn(`overrides["${s.id}"].lede replaces a lede that now reads fine on its own; consider dropping it`);
    if (!over.blurb && !s.blurb) fail(`"${s.id}" has no summary: its description opens with a trigger clause, so add an overrides["${s.id}"].blurb`);
    if (!over.lede && !s.lede) fail(`"${s.id}" has no opening paragraph in its SKILL.md, so add an overrides["${s.id}"].lede`);

    catalogue.push({
      id: s.id,
      plugin: s.plugin,
      command: `/${s.plugin}:${s.id}`,
      title: n?.label || s.title || s.id,
      blurb: over.blurb || s.blurb,
      // The index needs every card to say one comparable thing; the detail page can afford the
      // whole opening clause. Some descriptions open with three sentences and some with one
      // long one, so the card gets the first sentence and the CSS clamps what is still too long.
      summary: firstSentence(over.blurb || s.blurb),
      lede: over.lede || s.lede,
      when: s.when,
      phrases: s.phrases,
      excludes: s.excludes,
      note: n?.note || "",
      badge: n?.badge || "UNMAPPED",
      type: n?.type || "unplaced",
      stage: n ? columns[n.col] : "⚠ Unplaced",
      feeds: edges.filter((e) => e.f === s.id).map((e) => link(e.t, e.lbl)),
      fedBy: edges.filter((e) => e.t === s.id).map((e) => link(e.f, e.lbl)),
      // Most skills hand on through an artifact rather than straight to another skill: write-prd
      // feeds "PRD", and "PRD" feeds the grilling. Reading only the direct edges makes the most
      // connected skills on the map look like dead ends, so follow the artifact one hop and
      // label the wire with it.
      throughArtifact: hop(s.id, "f", "t"),
      fromArtifact: hop(s.id, "t", "f"),
      loops: loops.filter((l) => l.f === s.id || l.t === s.id)
        .map((l) => link(l.f === s.id ? l.t : l.f, l.label)),
      systems: (sysOf[s.id] || []).map((x) => ({ id: x.id, label: x.label || x.id, band: x.band, access: x.access || "" })),
      prev: i > 0 ? ordered[i - 1].id : null,
      next: i < ordered.length - 1 ? ordered[i + 1].id : null,
    });
  });
}

/* ----------------------------------------------------------------- changelog
   Parsed from CHANGELOG.md so shipping a skill updates the site, with no second copy. */
const changelog = [];
{
  const raw = readFileSync(join(ROOT, "CHANGELOG.md"), "utf8");
  for (const part of raw.split(/^## /m).slice(1)) {
    const nl = part.indexOf("\n");
    const heading = (nl < 0 ? part : part.slice(0, nl)).trim();
    const body = nl < 0 ? "" : part.slice(nl + 1).trim();
    const m = heading.match(/^(\d{4}-\d{2}-\d{2})\s*[—–-]\s*(.*)$/);
    changelog.push({ date: m ? m[1] : null, title: m ? m[2] : heading, heading, body });
  }
}

/* --------------------------------------------------- counts stated elsewhere
   The skill count is written by hand in several places. Catching that drift here is
   the point: the site staying current is worth little if the README still says 27. */
const WORDS = ["zero","one","two","three","four","five","six","seven","eight","nine","ten",
  "eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
const TENS = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
const inWords = (n) => n < 20 ? WORDS[n] : TENS[Math.floor(n / 10)] + (n % 10 ? "-" + WORDS[n % 10] : "");
const expected = new Set([String(skillCount), inWords(skillCount)]);
for (const rel of [".claude-plugin/marketplace.json", "oolio-pm/.claude-plugin/plugin.json",
                   "README.md", "oolio-pm/README.md", "docs/skills-catalogue.md",
                   "oolio-pm/skills/pm-compass/SKILL.md"]) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) continue;
  for (const [, stated] of readFileSync(p, "utf8").matchAll(/([A-Za-z]+(?:-[A-Za-z]+)*|\d+)[\s*]+skills\b/gi))
    if (/^\d+$/.test(stated) || WORDS.includes(stated.toLowerCase().split("-")[0]) ||
        TENS.includes(stated.toLowerCase().split("-")[0]))
      if (!expected.has(stated.toLowerCase()))
        fail(`${rel} says "${stated} skills", but there are ${skillCount}`);
}

/* --------------------------------------------------------------------- report */
warnings.forEach((w) => console.warn(`  warn  ${w}`));
problems.forEach((p) => console.error(`  DRIFT ${p}`));
console.log(
  `\n  ${plugins.length} plugin(s) · ${skillCount} skills · ${nodes.length} nodes · ` +
  `${edges.length} connections · ${gates.length} gates · ${loops.length} loops · ` +
  `${systems.length} systems · ${sysWires.length} wires · ${sys.routes.length} routes · ` +
  `${changelog.length} changelog entries`);

/* ---------------------------------------------------------------------- emit */
const typeColour = Object.fromEntries(Object.entries(cfg.types).map(([k, v]) => [k, v.colour]));
const typeLabel = Object.fromEntries(Object.entries(cfg.types).map(([k, v]) => [k, v.label]));
if (unplaced.length) { typeColour.unplaced = "#f87171"; typeLabel.unplaced = "Unplaced"; }

const sha = process.env.VERCEL_GIT_COMMIT_SHA
  || (() => { try { return execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim(); }
              catch { return "local"; } })();

const out = {
  stamp: sha.slice(0, 7),
  marketplace: { name: marketplace.name, description: marketplace.metadata?.description || "" },
  plugins,
  totals: {
    skills: skillCount,
    plugins: plugins.length,
    inProgress: plugins.reduce((n, p) => n + p.counts.inProgress, 0),
    archived: plugins.reduce((n, p) => n + p.counts.archived, 0),
    unplaced: unplaced.length,
  },
  about: cfg.about || {},
  catalogue,
  stages: columns.map((name) => ({
    name,
    purpose: stageNotes[name]?.purpose || "",
    start: stageNotes[name]?.start || null,
  })),
  map: { title: cfg.title, subtitle: cfg.subtitle, columns, nodes, edges, gates, loops,
         flows: cfg.flows, typeColour, typeLabel },
  systems: { title: sys.title, subtitle: sys.subtitle, intro: sys.intro, kinds: sys.kinds,
             systems, wires: sysWires, routes: sys.routes },
  changelog,
};

const target = join(SITE, "data", "os.json");
const body = JSON.stringify(out, null, 2);

if (CHECK) {
  // The committed snapshot is what Vercel serves when it cannot see the repo, so a stale one
  // is a silent lie. Compare everything but the build stamp, which changes every commit.
  const strip = (s) => s.replace(/"stamp": "[^"]*"/, '"stamp": ""');
  if (!existsSync(target)) fail("site/data/os.json is missing; run `npm run build` and commit it");
  else if (strip(readFileSync(target, "utf8")) !== strip(body))
    fail("site/data/os.json is out of date; run `npm run build` and commit it");

  problems.slice(-2).forEach((p) => console.error(`  DRIFT ${p}`));
  console.log(problems.length ? `\n  ${problems.length} problem(s). Fix, or update site/map.config.json.\n`
                              : "\n  Site is in sync with the Product OS.\n");
  process.exit(problems.length ? 1 : 0);
}
if (problems.length) console.error("\n  Building anyway; unplaced skills render in the red column.\n");

mkdirSync(join(SITE, "data"), { recursive: true });
writeFileSync(target, body);
console.log(`  → site/data/os.json (${(body.length / 1024).toFixed(1)} KB)\n`);
