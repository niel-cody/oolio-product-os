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
for (const entry of marketplace.plugins) {
  const base = join(ROOT, entry.source.replace(/^\.\//, ""));
  const skillsDir = join(base, "skills");
  if (!existsSync(skillsDir)) { fail(`plugin "${entry.name}" has no skills/ directory at ${entry.source}`); continue; }

  const skills = [];
  for (const dir of dirsIn(skillsDir).sort()) {
    const file = join(skillsDir, dir, "SKILL.md");
    if (!existsSync(file)) { warn(`${entry.name}/${dir}/ has no SKILL.md, skipped`); continue; }
    const fm = frontmatter(readFileSync(file, "utf8"));
    if (!fm.name) fail(`${dir}/SKILL.md has no name in its frontmatter`);
    else if (fm.name !== dir) fail(`${dir}/SKILL.md declares name "${fm.name}", which does not match its folder`);
    // The plugin versions by commit; a per-skill version pins nothing and misleads. See CLAUDE.md.
    if (fm.version) fail(`${dir}/SKILL.md carries a version field, which the skill standard forbids`);
    if (discovered[dir]) fail(`skill id "${dir}" is shipped by two plugins, which the map cannot disambiguate`);
    const skill = { id: dir, plugin: entry.name, description: fm.description || "" };
    skills.push(skill);
    discovered[dir] = skill;
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
  map: { title: cfg.title, subtitle: cfg.subtitle, columns, nodes, edges, gates, loops,
         flows: cfg.flows, typeColour, typeLabel },
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
