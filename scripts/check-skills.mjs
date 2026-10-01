#!/usr/bin/env node
// Lints every skill in every plugin for the faults that ship silently.
//
//   node scripts/check-skills.mjs          exit 1 on any error
//
// Errors:
//   - a description over 950 characters. Cowork drops such skills from its list without a word
//     (CLAUDE.md, 2026-09-17: the real cutoff sits between 971 and 981, far under the documented 1024)
//   - frontmatter `name` that does not match the folder, or a per-skill `version` field
//   - a ${CLAUDE_PLUGIN_ROOT}/… path, or a relative markdown link, that does not resolve
//   - an em dash in a file under a path listed in STRICT (house style; older files are left alone)
// Warnings:
//   - a description over 900 characters (the target; first to break if Cowork tightens again)

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CEILING = 950;
const TARGET = 900;
// Paths held to the no-em-dash rule. Add a path here when it is written or rewritten to house style.
const STRICT = [
  "oolio-pm/references/qa",
  "oolio-pm/personas-library/quality-bench",
  "oolio-pm/personas-library/test-personas",
  ...["test-basis", "defect-writer", "functional-qa", "exploratory-qa", "code-qa", "design-conformance",
      "accessibility-audit", "persona-uat", "uat-session-kit", "resilience-qa", "qa-mission"]
    .map((s) => `oolio-pm/skills/${s}`),
];

const errors = [];
const warnings = [];
const rel = (p) => relative(ROOT, p);

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const marketplace = JSON.parse(readFileSync(join(ROOT, ".claude-plugin/marketplace.json"), "utf8"));
let skillCount = 0;

for (const plugin of marketplace.plugins) {
  const pluginRoot = resolve(ROOT, plugin.source);
  const skillsDir = join(pluginRoot, "skills");
  if (!existsSync(skillsDir)) continue;

  for (const id of readdirSync(skillsDir)) {
    const file = join(skillsDir, id, "SKILL.md");
    if (!existsSync(file)) continue;
    skillCount++;
    const text = readFileSync(file, "utf8");
    const fm = text.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) { errors.push(`${rel(file)}: no frontmatter`); continue; }

    const name = fm[1].match(/^name:\s*(.+)$/m)?.[1].trim();
    if (name !== id) errors.push(`${rel(file)}: name "${name}" does not match folder "${id}"`);
    if (/^version:/m.test(fm[1])) errors.push(`${rel(file)}: per-skill version field (forbidden)`);

    // Description: single line, or a folded/literal block (>- or |).
    let desc = "";
    const single = fm[1].match(/^description:\s*(?![>|])(.+)$/m);
    if (single) desc = single[1].trim();
    else {
      const block = fm[1].match(/^description:\s*[>|]-?\s*\n((?:[ \t]+.*\n?)+)/m);
      if (block) desc = block[1].split("\n").map((l) => l.trim()).filter(Boolean).join(" ");
    }
    if (!desc) errors.push(`${rel(file)}: no description`);
    else if (desc.length > CEILING) errors.push(`${rel(file)}: description ${desc.length} chars (ceiling ${CEILING})`);
    else if (desc.length > TARGET) warnings.push(`${rel(file)}: description ${desc.length} chars (target ${TARGET})`);
  }

  // Every markdown file in the plugin: plugin-root paths and relative links must resolve.
  // Templates carry placeholder links by design (persona-file.md, url), so they are skipped.
  const isTemplate = (f) => /template[^/]*\.md$/.test(f);
  for (const file of walk(pluginRoot).filter((f) => f.endsWith(".md") && !f.includes("/_archive/") && !isTemplate(f))) {
    const text = readFileSync(file, "utf8");
    for (const [, p] of text.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([^\s`'")\]]+)/g)) {
      const target = join(pluginRoot, p.replace(/[.,;:]+$/, ""));
      if (!existsSync(target)) errors.push(`${rel(file)}: \${CLAUDE_PLUGIN_ROOT}/${p} does not exist`);
    }
    for (const [, link] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^(https?:|mailto:|#)/.test(link) || link.includes("<")) continue;
      if (!/[./]/.test(link)) continue; // a bare placeholder such as (url) or (link) in an example
      const target = resolve(dirname(file), decodeURIComponent(link.split("#")[0]));
      if (!existsSync(target)) errors.push(`${rel(file)}: link ${link} does not resolve`);
    }
  }
}

for (const p of STRICT) {
  const dir = join(ROOT, p);
  if (!existsSync(dir)) continue;
  for (const file of walk(dir).filter((f) => f.endsWith(".md"))) {
    readFileSync(file, "utf8").split("\n").forEach((line, i) => {
      if (line.includes("—")) errors.push(`${rel(file)}:${i + 1}: em dash`);
    });
  }
}

warnings.forEach((w) => console.warn(`  warn  ${w}`));
errors.forEach((e) => console.error(`  FAIL  ${e}`));
console.log(`\n  ${skillCount} skills checked · ${errors.length} error(s) · ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
