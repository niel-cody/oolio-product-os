#!/usr/bin/env node
/**
 * Generates site/app/brand.css from brand.tokens.json.
 *
 * The brand is a set of tokens, not a stylesheet, and the stylesheet is a view of them. That
 * is the same rule the site follows for the skills, and for the same reason: a brand book and
 * a codebase that are separately maintained agree for about a quarter.
 *
 *   node brand/tokens/build.mjs            write the stylesheet
 *   node brand/tokens/build.mjs --check    exit non-zero if it has drifted
 *
 * --check runs as part of `npm --prefix site run check`, so a hand-edit of the generated file,
 * or a token change that was never built, fails before it reaches main.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, relative } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const TOKENS = resolve(here, "brand.tokens.json");
const OUT = resolve(here, "../../site/app/brand.css");

const t = JSON.parse(readFileSync(TOKENS, "utf8"));
const lines = [];
const p = (s = "") => lines.push(s);

p("/* ============================================================================");
p("   THE OOLIO PRODUCT OS BRAND");
p("");
p("   GENERATED FILE. Do not edit.");
p("   Source: brand/tokens/brand.tokens.json. Rebuild: node brand/tokens/build.mjs");
p("   Why it is generated: brand/README.md");
p("");
p("   Ink mode is the screen. Paper mode is a document, and is exported as a separate");
p("   token set rather than a media query, because a light Confluence page and a dark");
p("   product surface are two audiences, not one preference.");
p("   ========================================================================== */");
p();

/** Ink mode: the app's ground truth, on :root so every surface inherits it. */
p(":root {");
p(`  /* ${t.mode.ink._} */`);
for (const [k, v] of Object.entries(t.mode.ink.ground)) {
  p(`  --${k}: ${v.hex}; /* ${v.use} */`);
}
p();
p("  /* The six lifecycle hues, plus alarm. Evenly spaced around the wheel so no two");
p("     can be confused, and every one clears 6.5:1 on ink. */");
for (const [k, v] of Object.entries(t.mode.ink.accent)) {
  p(`  --${k}: ${v.hex}; /* ${v.means} · ${v.contrastOnInk}:1 on ink */`);
}
p();
p("  /* Type. Loaded by next/font in app/layout.tsx, which sets these three variables. */");
p(`  --font-display-stack: var(--font-display), ${t.type.display.fallback};`);
p(`  --font-text-stack: var(--font-text), ${t.type.text.fallback};`);
p(`  --font-system-stack: var(--font-system), ${t.type.system.fallback};`);
p();
p("  /* Shape */");
for (const [k, v] of Object.entries(t.shape.radius)) p(`  --r-${k}: ${v};`);
p();
p("  /* Motion */");
for (const [k, v] of Object.entries(t.motion.ease)) {
  p(`  --ease-${k === "inOut" ? "in-out" : k}: ${v.value}; /* ${v.use} */`);
}
for (const [k, v] of Object.entries(t.motion.duration)) p(`  --dur-${k}: ${v};`);
p();
p("  /* Categorical, for the Flightdeck's product domains. A domain colour says which product");
p("     a piece of work belongs to; it never says what kind of step it is. */");
for (const [k, v] of Object.entries(t.mode.ink.domain)) {
  if (k === "_") continue;
  p(`  --domain-${k}: ${v.hex}; /* h=${v.hue} */`);
}
p();
p("  /* Kept alive so nothing had to be rewritten to be re-coloured. */");
for (const [from, to] of Object.entries(t.aliases)) {
  if (from === "_") continue;
  p(`  --${from}: var(--${to});`);
}
p("}");
p();

/** Paper mode: opt-in, by putting .paper on a container. */
p("/* Opt in with class=\"paper\" on any container that is a document rather than a screen:");
p("   a print stylesheet, an export, a light embed. Same tokens, different values, so a");
p("   component written against them works in both without knowing which it is in. */");
p(".paper {");
for (const [k, v] of Object.entries(t.mode.paper.ground)) {
  p(`  --${k}: ${v.hex}; /* ${v.use} */`);
}
for (const [k, v] of Object.entries(t.mode.paper.accent)) {
  p(`  --${k}: ${v.hex}; /* ${v.means} · ${v.contrastOnPaper}:1 on white */`);
}
for (const [from, to] of Object.entries(t.aliases)) {
  if (from === "_") continue;
  p(`  --${from}: var(--${to});`);
}
p("  color-scheme: light;");
p("}");
p();

/** The type scale, as utility classes, so a heading is never a pile of ad-hoc numbers. */
p("/* The scale. Eight steps and no more: a ninth is always somebody avoiding a decision. */");
const fam = { display: "--font-display-stack", text: "--font-text-stack", system: "--font-system-stack" };
for (const [k, s] of Object.entries(t.type.scale)) {
  const bits = [
    `font-family: var(${fam[s.family]})`,
    `font-size: ${s.size}`,
    `line-height: ${s.line}`,
    `letter-spacing: ${s.track}`,
  ];
  if (s.family === "display") bits.push("font-weight: 400");
  if (s.transform) bits.push(`text-transform: ${s.transform}`);
  p(`.t-${k} { ${bits.join("; ")}; }`);
}
p();
p("/* The wordmark. Never bold: Instrument Serif has one weight, and faux-bolding it is the");
p("   single fastest way to make the brand look counterfeit. */");
p("/* Display type: the argument, and only the argument. A heading that is really a label");
p("   belongs in Inter, whatever size it is set at.");
p("");
p("   text-rendering: geometricPrecision is load-bearing, not a flourish. Chrome rounds glyph");
p("   advances to whole pixels while hinting, and against this face's negative tracking the");
p("   rounding accumulates unevenly: \"Oolio Product OS\" rendered as \"Prod uct OS\", with a hole");
p("   mid-word and the word space squeezed shut. It was there at 17, 18, 20, 22 and 24px, and");
p("   it is gone at all five with fractional advances. Removing this line brings it back. */");
p(".display {");
p("  font-family: var(--font-display-stack);");
p("  font-weight: 400;");
p("  font-synthesis-weight: none;");
p("  text-rendering: geometricPrecision;");
p("}");
p();
p(".wordmark {");
p("  font-family: var(--font-display-stack);");
p("  font-weight: 400;");
p("  letter-spacing: -0.012em;");
p("  font-synthesis-weight: none;");
p("  text-rendering: geometricPrecision; /* see .display above; the wordmark is where it showed */");
p("}");
p();

const css = lines.join("\n") + "\n";

/**
 * The palette the rebrand retired, and what replaced each one.
 *
 * A stray old value does not look broken, which is exactly why it needs a test: it looks like
 * a slightly different grey, or an amber that is nearly the amber, and it survives for
 * quarters. Two of these are the reason the rebrand happened at all: --human and --loop were
 * 11 degrees apart in OKLCH, and --orch and --output were 19, so the map was telling a reader
 * two different things in one colour.
 */
const RETIRED = {
  "#0a0e14": "--bg #070d17", "#070b11": "--void #03070f", "#0d121b": "--panel #0e1521",
  "#141d2b": "--raise #151f2c", "#1c2534": "--line #1f2a3a", "#33415a": "--edge #37465d",
  "#7d8aa0": "--muted-ink #808fa4", "#e6ecf5": "--ink #ecf0f7",
  "#a78bfa": "--ai #b296fd", "#2dd4bf": "--orch #44d0de", "#34d399": "--output #5ddd89",
  "#f59e0b": "--gate #fcbd30", "#93a3bd": "--signal #95acc5", "#f5b942": "--loop #f07eb3",
  "#f87171": "--alarm #fd6560",
};
const SITE = resolve(here, "../../site");
const SKIP = new Set(["node_modules", ".next", ".git", "package-lock.json"]);

function* sourceFiles(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) { yield* sourceFiles(full); continue; }
    if (full === OUT) continue; // generated from these very tokens
    if (/\.(tsx?|jsx?|css|json|mjs)$/.test(name)) yield full;
  }
}

/** Every retired value still sitting in the site, with where it is and what it should be. */
function retiredStillPresent() {
  const hits = [];
  for (const file of sourceFiles(SITE)) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      for (const [old, replacement] of Object.entries(RETIRED)) {
        if (line.toLowerCase().includes(old)) {
          hits.push(`${relative(SITE, file)}:${i + 1}  ${old} is retired, use ${replacement}`);
        }
      }
    });
  }
  return hits;
}

if (process.argv.includes("--check")) {
  let current = "";
  try { current = readFileSync(OUT, "utf8"); } catch { /* missing counts as drift */ }
  if (current !== css) {
    console.error("\n  Brand tokens and site/app/brand.css disagree.");
    console.error("  Run: node brand/tokens/build.mjs\n");
    process.exit(1);
  }
  const stale = retiredStillPresent();
  if (stale.length) {
    console.error("\n  Retired palette values still in the site:\n");
    for (const h of stale) console.error("    " + h);
    console.error("");
    process.exit(1);
  }
  console.log("  Brand stylesheet is in sync with the tokens, and no retired colour remains.");
} else {
  writeFileSync(OUT, css);
  console.log(`  Wrote ${OUT} (${css.split("\n").length} lines) from brand.tokens.json`);
}
