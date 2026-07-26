#!/usr/bin/env node
/**
 * Generates the skills map from the skills themselves.
 *
 *   node site/build.mjs            build site/dist/index.html
 *   node site/build.mjs --check    validate only, no write, non-zero exit on drift
 *
 * Two inputs: oolio-pm/skills/ (the source of truth for which skills exist and what they
 * say) and site/map.config.json (the editorial overlay: stages, connections, flows).
 * Zero dependencies, on purpose. This stays a markdown repo with a build script in it,
 * not a web project.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const SITE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SITE, "..");
const SKILLS_DIR = join(ROOT, "oolio-pm", "skills");
const ARCHIVE_DIR = join(ROOT, "oolio-pm", "_archive");
const WIP_DIR = join(ROOT, "oolio-pm", "skills-in-progress");
const CHECK = process.argv.includes("--check");

const problems = [];
const warnings = [];
const fail = (m) => problems.push(m);
const warn = (m) => warnings.push(m);

/* ---------------------------------------------------------------- frontmatter
   Deliberately minimal: these files only ever use scalars and folded (>-) blocks.
   A YAML dependency would buy nothing and cost the zero-dependency property. */
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

/* ------------------------------------------------------------------- discover */
const discovered = {};
for (const dir of dirsIn(SKILLS_DIR).sort()) {
  const file = join(SKILLS_DIR, dir, "SKILL.md");
  if (!existsSync(file)) { warn(`${dir}/ has no SKILL.md, skipped`); continue; }
  const fm = frontmatter(readFileSync(file, "utf8"));
  if (!fm.name) fail(`${dir}/SKILL.md has no name in its frontmatter`);
  else if (fm.name !== dir) fail(`${dir}/SKILL.md declares name "${fm.name}", which does not match its folder`);
  // The plugin versions by commit; a per-skill version pins nothing and misleads. See CLAUDE.md.
  if (fm.version) fail(`${dir}/SKILL.md carries a version field, which the skill standard forbids`);
  discovered[dir] = { id: dir, desc: fm.description || "" };
}
const skillCount = Object.keys(discovered).length;
const wipCount = dirsIn(WIP_DIR).filter((d) => existsSync(join(WIP_DIR, d, "SKILL.md"))).length;
const archivedCount = dirsIn(ARCHIVE_DIR).filter((d) => existsSync(join(ARCHIVE_DIR, d, "SKILL.md"))).length;

/* -------------------------------------------------------------------- overlay */
const cfg = JSON.parse(readFileSync(join(SITE, "map.config.json"), "utf8"));
const columns = [...cfg.columns];
const colIndex = (name) => columns.indexOf(name);

for (const id of Object.keys(cfg.skills)) {
  if (!discovered[id]) fail(`map.config.json places "${id}", but oolio-pm/skills/${id}/ does not exist`);
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
    ...(discovered[id]?.desc ? { desc: discovered[id].desc } : {}),
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
  // The renderer skips flow steps with no matching edge, drawing a flow with invisible gaps.
  // Catch that here rather than letting the page quietly lie about the path.
  for (let i = 0; i < fl.path.length - 1; i++) {
    const [a] = fl.path[i], [b] = fl.path[i + 1];
    if (!wired.has(a + ">" + b) && !wired.has(b + ">" + a))
      fail(`flow "${fl.name}" step ${i + 1}→${i + 2} ("${a}" to "${b}") has no connection to draw`);
  }
}

/* --------------------------------------------------- counts stated elsewhere
   The skill count is written by hand in several places. Catching that drift here is
   the point: the map staying current is worth little if the README still says 27. */
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
  `\n  ${skillCount} skills · ${nodes.length} nodes · ${edges.length} connections · ` +
  `${gates.length} gates · ${loops.length} loops` +
  (wipCount ? ` · ${wipCount} in progress` : "") +
  (archivedCount ? ` · ${archivedCount} archived` : ""));

if (CHECK) {
  console.log(problems.length ? `\n  ${problems.length} problem(s). Fix, or update site/map.config.json.\n`
                              : "\n  Map is in sync with the skills.\n");
  process.exit(problems.length ? 1 : 0);
}
if (problems.length) console.error("\n  Building anyway; unplaced skills render in the red column.\n");

/* ---------------------------------------------------------------------- emit */
const typeColour = Object.fromEntries(Object.entries(cfg.types).map(([k, v]) => [k, v.colour]));
const typeLabel = Object.fromEntries(Object.entries(cfg.types).map(([k, v]) => [k, v.label]));
if (unplaced.length) { typeColour.unplaced = "#f87171"; typeLabel.unplaced = "Unplaced"; }

const sha = process.env.VERCEL_GIT_COMMIT_SHA
  || (() => { try { return execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim(); }
              catch { return "local"; } })();

const data =
  `const COLUMNS=${JSON.stringify(columns)};\n` +
  `const NODES=${JSON.stringify(nodes)};\n` +
  `const EDGES=${JSON.stringify(edges)};\n` +
  `const GATES=${JSON.stringify(gates)};\n` +
  `const LOOPS=${JSON.stringify(loops)};\n` +
  `const FLOWS=${JSON.stringify(cfg.flows)};\n` +
  `const TYPE_COLOR=${JSON.stringify(typeColour)};\n` +
  `const TYPE_LABEL=${JSON.stringify(typeLabel)};\n` +
  `const ABOUT=${JSON.stringify(cfg.about || {})};\n` +
  `const BUILD=${JSON.stringify({ skills: skillCount, unplaced: unplaced.length, stamp: sha.slice(0, 7) })};\n`;

const html = readFileSync(join(SITE, "template", "index.html"), "utf8")
  .replace("/*__MAP_DATA__*/", data.replace(/<\//g, "<\\/"))
  .replaceAll("__TITLE__", cfg.title)
  .replaceAll("__SUBTITLE__", cfg.subtitle);

const outDir = join(SITE, "dist");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "index.html"), html);
console.log(`  → site/dist/index.html (${(html.length / 1024).toFixed(1)} KB)\n`);
