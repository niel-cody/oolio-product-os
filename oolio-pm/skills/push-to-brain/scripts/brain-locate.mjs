#!/usr/bin/env node
/**
 * brain-locate — the read-only helper behind push-to-brain.
 *
 * The skill's weakest step, if left to ad-hoc grep, is finding the note that already
 * holds a topic and proving a fact is not already recorded there. This makes both
 * deterministic, and it enforces the work/personal wall on every search so a session
 * can never be routed into a Personal page by accident.
 *
 * It never writes. The agent makes every change with ordinary edits.
 *
 * Usage:
 *   brain-locate.mjs find <term> [<term>...] [--limit 8] [--json]
 *       Rank the work-layer pages that already cover the terms. Prints path, type, status,
 *       last update, what matched, and the page's headings so a section can be chosen.
 *   brain-locate.mjs has <file> <phrase> [<phrase>...]
 *       Idempotency check: is each phrase already in the page? Case, whitespace and
 *       punctuation are ignored. Exit 0 when every phrase is present, 1 otherwise.
 *   brain-locate.mjs check <file>
 *       The birth gate for a page you created or changed: frontmatter present, `type` in the
 *       vocabulary, `class` matching it, `title`/`status`/`updated` present, `updated` not in
 *       the future, at least one inbound [[link]], and not behind the wall. Exit 1 on any fault.
 *   brain-locate.mjs wall <file>
 *       Exit 0 if the path is inside the work layers, 1 if it is NO-GO.
 *
 * Vault: ~/my_brain, or --vault PATH, or the MY_BRAIN environment variable.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, resolve, basename, sep } from 'path';
import { homedir } from 'os';

// ------------------------------------------------------------------ arguments
const argv = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--json') flags.json = true;
  else if (a === '--limit') flags.limit = Number(argv[++i]);
  else if (a === '--vault') flags.vault = argv[++i];
  else positional.push(a);
}
const [command, ...rest] = positional;
const VAULT = resolve(flags.vault || process.env.MY_BRAIN || join(homedir(), 'my_brain'));

if (!command || !['find', 'has', 'check', 'wall'].includes(command)) {
  console.error('usage: brain-locate.mjs find|has|check|wall ...  (see header comment)');
  process.exit(2);
}
if (!existsSync(VAULT)) {
  console.error(`vault not found at ${VAULT}. Pass --vault PATH or set MY_BRAIN.`);
  process.exit(2);
}

// ------------------------------------------------------------------ the wall and the graveyards
// NO-GO for every skill (STRUCTURE.md §4, operating-system.md §8). Personal layers and
// personal records are never read, never listed, never written.
const NO_GO = ['20 Areas/Personal', '10 Projects/Personal'];
// Not part of the live vault: generated views, graveyards, snapshots, tooling.
const SKIP = [
  '.git', '.obsidian', '.tmp_figma', '_system/snapshots', '_system/Audits', 'To Delete',
  '_to_delete', '_notes_cleanup', 'Claude outputs', '80 Archive', '41 Decisions/Registers',
  'node_modules',
];
const startsWithAny = (rel, list) => list.some((p) => rel === p || rel.startsWith(p + '/'));
const isNoGo = (rel) => startsWithAny(rel, NO_GO) || /\/Personal(\/|$)/.test('/' + rel);

// ------------------------------------------------------------------ vocabulary (Metadata Standard §2c)
const TYPE_TO_CLASS = {
  source: 'knowledge', entity: 'knowledge', concept: 'knowledge', synthesis: 'knowledge',
  overview: 'knowledge', reference: 'knowledge',
  area: 'system', runbook: 'system', template: 'system', manual: 'system', 'jira-project': 'system',
  asset: 'asset', output: 'asset',
  project: 'project', wayfinder: 'project',
  decision: 'decision',
  meeting: 'record', person: 'record', brief: 'record', log: 'record', index: 'record', action: 'record',
};
// `working` rolls up to the class of its branch.
function workingClass(rel) {
  if (rel.startsWith('10 Projects/')) return 'project';
  if (rel.startsWith('20 Areas/') || rel.startsWith('_system/')) return 'system';
  return 'record';
}

// ------------------------------------------------------------------ files and frontmatter
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = relative(VAULT, full).split(sep).join('/');
    if (startsWithAny(rel, SKIP) || name.startsWith('.')) continue;
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith('.md') && !isNoGo(rel)) out.push(rel);
  }
  return out;
}

function parseFrontmatter(text) {
  if (!text.startsWith('---')) return { fm: null, body: text };
  const end = text.indexOf('\n---', 3);
  if (end < 0) return { fm: null, body: text };
  const block = text.slice(3, end).trim();
  const fm = {};
  for (const line of block.split('\n')) {
    const m = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim().replace(/\s+#.*$/, '');
    if (/^\[.*\]$/.test(v)) {
      v = v.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else v = v.replace(/^["']|["']$/g, '');
    fm[m[1]] = v;
  }
  return { fm, body: text.slice(end + 4) };
}

function readPage(rel) {
  const text = readFileSync(join(VAULT, rel), 'utf8');
  const { fm, body } = parseFrontmatter(text);
  return { rel, text, fm, body, name: basename(rel, '.md') };
}

const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').replace(/\s+/g, ' ').trim();

// ------------------------------------------------------------------ find
function find(terms) {
  if (!terms.length) { console.error('find needs at least one term'); process.exit(2); }
  const want = terms.map(norm).filter(Boolean);
  const pages = walk(VAULT);
  const scored = [];
  for (const rel of pages) {
    let page;
    try { page = readPage(rel); } catch { continue; }
    const title = norm(page.fm?.title || page.name);
    const aliases = (Array.isArray(page.fm?.aliases) ? page.fm.aliases : []).map(norm);
    const headings = page.body.split('\n').filter((l) => /^#{1,4}\s/.test(l)).map((l) => l.replace(/^#+\s*/, ''));
    const bodyN = norm(page.body);
    let score = 0;
    const matched = [];
    let inTitle = 0;
    for (const t of want) {
      if (title.includes(t)) { score += 10; inTitle++; matched.push(`title:${t}`); }
      else if (aliases.some((a) => a.includes(t))) { score += 8; matched.push(`alias:${t}`); }
      const h = headings.filter((x) => norm(x).includes(t)).length;
      if (h) { score += Math.min(h, 3) * 3; matched.push(`heading:${t}`); }
      const hits = bodyN.split(t).length - 1;
      if (hits) { score += Math.min(hits, 5); if (!h) matched.push(`body:${t}×${hits}`); }
    }
    if (!score) continue;
    if (inTitle === want.length) score += 15;
    // Canonical layers outrank the ledger: a project or knowledge page is where a fact should
    // live; a meeting page or brief is where it was first heard.
    if (rel.startsWith('40 Meetings/') || rel.startsWith('02 Daily Briefs/') || rel.startsWith('00 Inbox/')) score *= 0.5;
    if (page.fm?.generated === 'true' || page.fm?.generated === true) score *= 0.3;
    scored.push({
      path: rel, score: Math.round(score), type: page.fm?.type || '(none)', status: page.fm?.status || '',
      updated: page.fm?.updated || '', generated: page.fm?.generated === 'true' || page.fm?.generated === true,
      matched, headings: headings.slice(0, 14),
    });
  }
  scored.sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));
  const top = scored.slice(0, flags.limit || 8);
  if (flags.json) { console.log(JSON.stringify(top, null, 2)); return; }
  if (!top.length) { console.log(`no work-layer page matches: ${terms.join(', ')}`); return; }
  for (const r of top) {
    console.log(`${String(r.score).padStart(3)}  ${r.path}`);
    console.log(`      type=${r.type} status=${r.status} updated=${r.updated}${r.generated ? '  GENERATED (read-only)' : ''}`);
    console.log(`      matched: ${r.matched.join(', ')}`);
    if (r.headings.length) console.log(`      sections: ${r.headings.join(' | ')}`);
  }
}

// ------------------------------------------------------------------ has
function has(file, phrases) {
  if (!file || !phrases.length) { console.error('has needs a file and at least one phrase'); process.exit(2); }
  const abs = resolve(file.startsWith('/') ? file : join(VAULT, file));
  const rel = relative(VAULT, abs).split(sep).join('/');
  if (isNoGo(rel)) { console.error(`NO-GO: ${rel} is behind the work/personal wall`); process.exit(1); }
  const text = readFileSync(abs, 'utf8');
  const lines = text.split('\n');
  const flat = norm(text);
  let allFound = true;
  for (const p of phrases) {
    const n = norm(p);
    if (n && flat.includes(n)) {
      const at = lines.findIndex((l) => norm(l).includes(n));
      console.log(`FOUND     ${JSON.stringify(p)}${at >= 0 ? `  (line ${at + 1})` : '  (spans lines)'}`);
    } else { allFound = false; console.log(`MISSING   ${JSON.stringify(p)}`); }
  }
  process.exit(allFound ? 0 : 1);
}

// ------------------------------------------------------------------ check
function check(file) {
  if (!file) { console.error('check needs a file'); process.exit(2); }
  const abs = resolve(file.startsWith('/') ? file : join(VAULT, file));
  const rel = relative(VAULT, abs).split(sep).join('/');
  const faults = [];
  const ok = [];
  if (isNoGo(rel)) faults.push(`path is NO-GO (${rel}): the work/personal wall`);
  if (!existsSync(abs)) { console.error(`not found: ${abs}`); process.exit(1); }
  const page = readPage(rel);
  if (!page.fm) faults.push('no frontmatter block: the page is invisible to retrieval');
  else {
    const t = page.fm.type;
    if (!t) faults.push('frontmatter has no `type`');
    else if (t === 'working') {
      const expect = workingClass(rel);
      if (page.fm.class !== expect) faults.push(`type working under this branch needs class ${expect}, has ${page.fm.class || '(none)'}`);
      else ok.push(`type working → class ${expect}`);
    } else if (!TYPE_TO_CLASS[t]) faults.push(`type "${t}" is outside Metadata Standard §2c`);
    else if (page.fm.class !== TYPE_TO_CLASS[t]) faults.push(`type ${t} rolls up to class ${TYPE_TO_CLASS[t]}, has ${page.fm.class || '(none)'}`);
    else ok.push(`type ${t} → class ${page.fm.class}`);
    for (const f of ['title', 'status', 'updated']) {
      if (!page.fm[f]) faults.push(`frontmatter missing \`${f}\``); else ok.push(`${f}: ${page.fm[f]}`);
    }
    if (page.fm.updated) {
      const today = new Date().toISOString().slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(page.fm.updated)) faults.push(`updated "${page.fm.updated}" is not YYYY-MM-DD`);
      else if (page.fm.updated > today) faults.push(`updated ${page.fm.updated} is in the future`);
    }
    if (page.fm.title && page.fm.title.toLowerCase() === 'readme') faults.push('title "README" is not unique; name the page');
  }
  // Inbound links: any other live page linking [[Title]], [[filename]] or [[alias]].
  const targets = new Set([page.name]);
  if (page.fm?.title) targets.add(String(page.fm.title));
  for (const a of Array.isArray(page.fm?.aliases) ? page.fm.aliases : []) targets.add(a);
  const patterns = [...targets].map((t) => `[[${t}`);
  let inbound = 0;
  const from = [];
  for (const other of walk(VAULT)) {
    if (other === rel) continue;
    let text;
    try { text = readFileSync(join(VAULT, other), 'utf8'); } catch { continue; }
    for (const p of patterns) {
      const i = text.indexOf(p);
      if (i >= 0 && /[\]|#]/.test(text[i + p.length] || '')) { inbound++; from.push(other); break; }
    }
    if (from.length >= 5) break;
  }
  if (!inbound && !rel.match(/(^|\/)README\.md$/) && rel !== 'Home.md') faults.push('no inbound [[link]]: list it on its folder README or link it from the page that caused it');
  else if (inbound) ok.push(`inbound links from: ${from.join(', ')}`);
  for (const o of ok) console.log(`ok     ${o}`);
  for (const f of faults) console.log(`FAULT  ${f}`);
  console.log(faults.length ? `\n${rel}: ${faults.length} fault(s)` : `\n${rel}: clean`);
  process.exit(faults.length ? 1 : 0);
}

// ------------------------------------------------------------------ wall
function wall(file) {
  if (!file) { console.error('wall needs a path'); process.exit(2); }
  const abs = resolve(file.startsWith('/') ? file : join(VAULT, file));
  const rel = relative(VAULT, abs).split(sep).join('/');
  if (rel.startsWith('..')) { console.log(`OUTSIDE  ${abs} is not inside the vault`); process.exit(1); }
  if (isNoGo(rel)) { console.log(`NO-GO    ${rel}`); process.exit(1); }
  console.log(`WORK     ${rel}`);
}

if (command === 'find') find(rest);
else if (command === 'has') has(rest[0], rest.slice(1));
else if (command === 'check') check(rest[0]);
else wall(rest[0]);
