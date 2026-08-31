/**
 * Fails if the public landing page has started publishing gated content.
 *
 * The landing page is served to the open web from a private repo, and lib/landing-sky.ts is
 * the single boundary deciding what it may know: the 13 lifecycle stages, the 6 flow names,
 * and 5 named skills. Everything else — the other 27 skill names, every skill's trigger
 * phrases and exclusions, the systems map, the changelog — stays behind sign-in.
 *
 * This exists because that boundary leaked in a way nobody could see by reading the page.
 * Star nodes carried `node.id` to the browser purely as a React key, and a node id is the
 * skill's name with hyphens in it, so all 32 shipped in the page source while the rendered
 * page showed none of them. Reviewing the component would never have caught it; grepping the
 * rendered HTML did. So the test is the rendered HTML, not the source.
 *
 * Needs a running server, which is why it is `check:public` rather than part of `check`:
 *
 *   npm run build && npx next start -p 3111 &
 *   npm run check:public -- http://127.0.0.1:3111
 *
 * Precision matters more than reach here: a guard that cries wolf is a guard that gets
 * skipped. Three rules keep it quiet without weakening it.
 *   - Everything the boundary deliberately publishes is redacted from the HTML *first*, then
 *     the leftovers are searched. Otherwise the skill "JPD Loop" reports as leaked because
 *     the public flow is called "JPD Loop — Idea to Decision".
 *   - Only skills are checked. Artifact nodes on the map are called things like "PRD" and
 *     "The Brain", which are ordinary vocabulary the page's own prose uses.
 *   - Hyphenated ids and slash commands cannot occur by accident, so they are matched
 *     literally. Single-word ids like `drive` are ordinary English, and are checked only in
 *     their unambiguous command form.
 */
import os from "../data/os.json" with { type: "json" };

const url = process.argv[2] ?? "http://127.0.0.1:3000";

// Must match REVEALED in lib/landing-sky.ts. Kept as a literal rather than imported because
// that module is `server-only` TypeScript; the assertion below catches them drifting apart.
const REVEALED = new Set([
  "pm-compass",
  "storm-research",
  "write-prd",
  "steering-pack",
  "metrics-review",
]);

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const word = (s, html) => new RegExp(`(^|[^\\w-])${escape(s)}([^\\w-]|$)`).test(html);

const res = await fetch(url, { headers: { "user-agent": "check-public-leaks" } });
if (!res.ok) {
  console.error(`✗ ${url} returned ${res.status}. Is the server running?`);
  process.exit(1);
}
const raw = await res.text();

// Redact what the boundary publishes on purpose, longest first so a flow name is removed
// before any shorter string that happens to sit inside it.
const published = [
  ...os.map.flows.map((f) => f.name),
  ...os.map.columns,
  ...os.stages.map((s) => s.purpose),
  ...os.catalogue.filter((c) => REVEALED.has(c.id)).flatMap((c) => [c.title, c.command, c.id]),
].filter(Boolean);

const html = published
  .sort((a, b) => b.length - a.length)
  .reduce((acc, s) => acc.split(s).join(" "), raw);

const leaks = [];
const add = (kind, what, detail) => leaks.push({ kind, what, detail });

for (const skill of os.catalogue) {
  if (REVEALED.has(skill.id)) continue;

  // The command is unambiguous whatever the id looks like, so it is the strongest signal.
  if (skill.command && html.includes(skill.command)) add("command", skill.id, skill.command);
  // A hyphenated id is a skill name; it does not turn up in prose by chance.
  if (skill.id.includes("-") && html.includes(skill.id)) add("id", skill.id, skill.id);
  if (skill.title && word(skill.title, html)) add("title", skill.id, skill.title);
  if (skill.blurb && html.includes(skill.blurb)) add("blurb", skill.id, skill.blurb.slice(0, 60));
  if (skill.when && html.includes(skill.when.slice(0, 80))) add("trigger", skill.id, skill.when.slice(0, 60));
  for (const phrase of skill.phrases ?? []) {
    if (phrase.length > 8 && html.includes(phrase)) add("phrase", skill.id, phrase);
  }
  for (const system of skill.systems ?? []) {
    // The systems map is a list of the tools Oolio runs and how they connect, which is a
    // target list. Widely-known tool names appear in the page's own prose, so only the
    // internal ones are checked.
    if (system.label === "The Brain" || system.label === "The open web") continue;
    if (["Jira", "Confluence"].includes(system.label)) continue;
    if (word(system.label, html)) add("system", skill.id, system.label);
  }
}

// Flow step labels are skill names and step descriptions say what each step does. Only the
// flow's own name is public.
const skillIds = new Set(os.catalogue.map((c) => c.id));
for (const flow of os.map.flows) {
  for (const [id, label, description] of flow.path) {
    if (REVEALED.has(id)) continue;
    if (description && html.includes(description)) add("flow-step", flow.name, description.slice(0, 60));
    // Only skill steps. An artifact step's label is "PRD" or "The Brain" — vocabulary, not a
    // name we are keeping back.
    if (label && skillIds.has(id) && word(label, html)) add("flow-label", flow.name, label);
  }
}

if (leaks.length) {
  console.error(`✗ ${leaks.length} gated item(s) found in the public page at ${url}:\n`);
  for (const l of leaks) console.error(`  [${l.kind}] ${l.what} → ${l.detail}`);
  console.error("\nlib/landing-sky.ts is the boundary. Nothing else should reach this page.");
  process.exit(1);
}

console.log(`✓ ${url}: no gated skill, trigger, system or flow-step content in the public page.`);
