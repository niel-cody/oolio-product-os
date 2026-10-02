#!/usr/bin/env node
/**
 * Generates site/app/brand.css from brand.tokens.json.
 *
 * The brand is a set of tokens, not a stylesheet, and the stylesheet is a view of them. Same
 * rule the site follows for the skills, and for the same reason: a brand book and a codebase
 * that are separately maintained agree for about a quarter.
 *
 *   node brand/tokens/build.mjs            write the stylesheet
 *   node brand/tokens/build.mjs --check    exit non-zero if it has drifted
 *
 * --check runs as part of `npm --prefix site run check`, so a hand-edit of the generated file,
 * a token change that was never built, or a retired colour left in the site all fail before
 * they reach main.
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
p("   PIXIE DUST INDUSTRIES. The sheet.");
p("");
p("   GENERATED FILE. Do not edit.");
p("   Source: brand/tokens/brand.tokens.json. Rebuild: node brand/tokens/build.mjs");
p("   Why it is generated, and what each ink means: brand/README.md");
p("");
p("   Paper: uncoated stock, muted inks from Sanzo Wada's A Dictionary of Color Combinations,");
p("   a quiet serif for the argument and a grotesque for everything else, one radius scale,");
p("   and the fold as the single signature. One system from end to end.");
p("");
p("   The site is LIGHT, and that is not a preference. Ink sits on a pale sheet.");
p("   ========================================================================== */");
p();

p(":root {");
p("  color-scheme: light;");
p();
p(`  /* ---- STOCK ---- ${t.press.stock._} */`);
for (const [k, v] of Object.entries(t.press.stock)) {
  if (k === "_") continue;
  p(`  --${k}: ${v.hex}; /* ${v.use} */`);
}
p();
p("  /* ---- THE DRUMS ---- one ink per pass, in order. Solid draws; tint may be a ground. */");
for (const [k, v] of Object.entries(t.press.drums)) {
  if (k === "_") continue;
  p(`  --${k}: ${v.hex}; /* ${v.pass} · ${v.name} · ${v.contrastOnStock}:1 on stock · ${v.text ? "may set copy" : "LINE OR MARK ONLY, never a word"} */`);
  if (v.tint) p(`  --${k}-tint: ${v.tint.hex}; /* ${v.tint.name} · a ground with black type on it, ${v.tint.contrastOfBlackOnIt}:1 */`);
}
p();
p(`  /* ---- TINTS ---- ${t.press.tints._} */`);
for (const [k, v] of Object.entries(t.press.tints)) {
  if (k === "_") continue;
  p(`  --${k}: ${v.hex}; /* ${v.name} · black on it ${v.contrastOfBlackOnIt}:1 · ${v.use} */`);
}
p();
p(`  /* ---- DEEP INKS ---- ${t.press.deep._} */`);
for (const [k, v] of Object.entries(t.press.deep)) {
  if (k === "_") continue;
  p(`  --${k}: ${v.hex}; /* ${v.name} · ${v.contrastOnStock}:1 on stock · ${v.text ? "may set copy" : "never a word on the stock"} */`);
}
p();
p("  /* ---- TYPE COLOUR ---- every figure measured on the stock */");
for (const [k, v] of Object.entries(t.press["type-colour"])) {
  if (k === "_") continue;
  p(`  --${k}: ${v.hex}; /* ${v.use} · ${v.contrastOnStock}:1 */`);
}
p();
p("  /* ---- THE SEVEN MEANINGS ---- drawn from the ink set, not from a colour wheel */");
for (const [k, v] of Object.entries(t.semantic)) {
  if (k === "_") continue;
  p(`  --${k}: ${v.hex}; /* ${v.ink} · ${v.means} */`);
}
p();
p("  /* Kept alive so nothing had to be rewritten to be reprinted. */");
for (const [from, to] of Object.entries(t.aliases)) {
  if (from === "_") continue;
  p(`  --${from}: var(--${to});`);
}
p();
p("  /* The names the site spoke when it was dark, now pointing at stock and ink. A");
p("     component written against them prints without being touched. */");
p("  --bg: var(--stock);");
p("  --panel: var(--stock-2);");
p("  --raise: var(--stock-3);");
p("  --line: var(--rule);");
p("  --edge: var(--rule-2); /* a border that has to be seen is a firm grey, not a black keyline */");
p("  --void: var(--stock-3);");
p();
p("  /* Type. Loaded by next/font in app/layout.tsx, which sets these three variables. */");
p(`  --font-display-stack: var(--font-display), ${t.type.display.fallback};`);
p(`  --font-text-stack: var(--font-text), ${t.type.text.fallback};`);
p(`  --font-system-stack: var(--font-system), ${t.type.system.fallback};`);
p();
p(`  /* Shape. ${t.shape._} */`);
p(`  --keyline: ${t.shape.keyline}; /* emphasis only */`);
p(`  --edge-line: ${t.shape.edge}; /* the ordinary edge of a card, control or panel */`);
p(`  --hairline: ${t.shape.hairline};`);
p(`  --lift-shadow: ${t.shape.shadow.lift}; /* the drawer and anything that floats over the sheet */`);
for (const [k, v] of Object.entries(t.shape.radius)) p(`  --r-${k}: ${v};`);
p(`  --fold: ${t.shape.fold.size};`);
p();
p("  /* Motion */");
for (const [k, v] of Object.entries(t.motion.ease)) {
  p(`  --ease-${k === "inOut" ? "in-out" : k}: ${v.value}; /* ${v.use} */`);
}
for (const [k, v] of Object.entries(t.motion.duration)) p(`  --dur-${k}: ${v};`);
p("}");
p();

/* ---------------------------------------------------------------- the texture */
p("/* ============================================================================");
p("   THE TEXTURE");
p("");
p(`   ${t.moves._}`);
p("   ========================================================================== */");
p();
p(`/* GRAIN. ${t.moves.grain.why}`);
p("   Applied once, on the page, by <body class=\"sheet\">. Never per component: two grain");
p("   layers over one another read as dirt rather than paper. */");
p(".sheet::after {");
p("  content: \"\";");
p("  position: fixed;");
p("  inset: 0;");
p("  z-index: 9999;");
p("  pointer-events: none;");
p("  background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E\");");
p("  mix-blend-mode: multiply;");
p(`  opacity: ${t.moves.grain.opacity};`);
p("}");
p();
for (const [k, why] of Object.entries(t.moves.retired)) p(`/* ${k}: retired ${why} */`);
p();

/* ---------------------------------------------------------------- the fold */
p("/* ============================================================================");
p("   THE FOLD");
p("");
p(`   ${t.shape.fold.why}`);
p("   .folded goes on a surface that holds content: a card, a panel, a drawer. The dog-ear is");
p("   the stock showing through where the corner lifts, and the pink tint for the underside.");
p("   ========================================================================== */");
p(".folded { position: relative; overflow: hidden; }");
p(".folded::after {");
p("  content: \"\";");
p("  position: absolute;");
p("  top: 0;");
p("  right: 0;");
p("  width: var(--fold);");
p("  height: var(--fold);");
p("  background: linear-gradient(to bottom left, var(--fold-sheet, var(--stock)) 50%, var(--pink-tint) 50%);");
p("  border-bottom-left-radius: 3px;");
p("  box-shadow: -1px 1px 2px rgba(35, 31, 32, 0.08);");
p("  pointer-events: none;");
p("}");
p();

/* ---------------------------------------------------------------- type */
p("/* The scale. Eight steps and no more: a ninth is always somebody avoiding a decision. */");
const fam = { display: "--font-display-stack", text: "--font-text-stack", system: "--font-system-stack" };
for (const [k, s] of Object.entries(t.type.scale)) {
  const bits = [
    `font-family: var(${fam[s.family]})`,
    `font-size: ${s.size}`,
    `line-height: ${s.line}`,
    `letter-spacing: ${s.track}`,
  ];
  if (s.weight) bits.push(`font-weight: ${s.weight}`);
  if (s.transform) bits.push(`text-transform: ${s.transform}`);
  p(`.t-${k} { ${bits.join("; ")}; }`);
}
p();
p("/* Display type: the argument, and only the argument. Regular weight, never bold: a serif");
p("   at 400 is a statement, at 700 it is a headline in a newspaper. A heading that is really");
p("   a label belongs in the grotesque, whatever size it is set at. */");
p(".display {");
p(`  font-family: var(--font-display-stack);`);
p("  font-weight: 400;");
p("  letter-spacing: -0.015em;");
p("  text-wrap: balance;");
p("  font-variation-settings: \"opsz\" 72;");
p("}");
p();
p("/* The wordmark. The serif, regular, sentence case, a little tracked. Quiet on purpose. */");
p(".wordmark {");
p("  font-family: var(--font-display-stack);");
p("  font-weight: 500;");
p("  letter-spacing: 0.005em;");
p("  line-height: 1;");
p("  color: var(--ink);");
p("  font-variation-settings: \"opsz\" 24;");
p("}");
p();

const css = lines.join("\n") + "\n";

/**
 * Colours this brand has retired, and what replaced each one.
 *
 * A stray old value does not look broken, which is exactly why it needs a test: it looks like
 * a slightly different grey, or an amber that is nearly the amber, and it survives for
 * quarters. The first block is the fluorescent press; the second the dark palette before it;
 * the third the Tailwind defaults that were the reason for the rebrand in the first place.
 */
const RETIRED = {
  "#ff48b0": "--pink #BF5892 (or --pink-tint #F8B6BA for a ground)", "#3d5588": "--blue #40456A",
  "#ffe800": "--yellow #FDBF68", "#3d185e": "--plum #501345", "#3d4d00": "--olive #6B7140",
  "#ff4100": "--alarm #A62C37",
  "#070d17": "--stock #E4E2DB", "#03070f": "--stock-3 #D6D3CA", "#0e1521": "--stock-2 #EFEDE7",
  "#151f2c": "--stock-3 #D6D3CA", "#1f2a3a": "--rule #C4C0B7", "#37465d": "--k #231F20",
  "#808fa4": "--muted-ink #65606A", "#b0bcce": "--soft-ink #45414A", "#ecf0f7": "--ink #231F20",
  "#fcbd30": "--gate", "#5ddd89": "--output", "#44d0de": "--orch",
  "#95acc5": "--signal", "#b296fd": "--ai", "#f07eb3": "--loop",
  "#fd6560": "--alarm",
  "#0a0e14": "--stock #E4E2DB", "#0d121b": "--stock-2 #EFEDE7", "#1c2534": "--rule #C4C0B7",
  "#e6ecf5": "--ink #231F20", "#7d8aa0": "--muted-ink #65606A", "#33415a": "--k #231F20",
  "#a78bfa": "--ai", "#2dd4bf": "--orch", "#34d399": "--output",
  "#f59e0b": "--gate", "#93a3bd": "--signal", "#f5b942": "--loop",
  "#f87171": "--alarm",
};
const SITE = resolve(here, "../../site");
// _archive is the record of what was true then, and data/os.json is generated and carries the
// changelog's prose, which names retired inks on purpose. Neither is a place a stray colour
// could reach a page from.
const SKIP = new Set(["node_modules", ".next", ".git", "package-lock.json", "_archive", "data"]);

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

/**
 * Radii the system does not have. One scale, three steps, and a fourth value anywhere in
 * the site is a page drifting away from the others. Tailwind's own rounded-* utilities and
 * raw pixel radii are both caught; the three tokens, `rounded-full` on a dot, and
 * `rounded-none` on a thing that must be square are the only allowed spellings.
 */
const RADIUS_RE = /rounded-(?!full\b|none\b|\[var\(--r-(?:sm|ctl|card)\)\]|\[inherit\]|t-\[var|b-\[var|l-\[var|r-\[var|tl-\[var|tr-\[var|bl-\[var|br-\[var)[a-z0-9\[\]()%.,-]+|border-radius:(?!\s*(?:var\(--r-(?:sm|ctl|card)\)|999px|50%|0\b|inherit|3px))[^;]+/g;
function offScaleRadii() {
  const hits = [];
  for (const file of sourceFiles(SITE)) {
    if (!/\.(tsx|css)$/.test(file)) continue;
    if (file.includes(`${SITE}/components/ui/`)) continue; // shadcn primitives map --radius themselves
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      for (const m of line.matchAll(RADIUS_RE)) hits.push(`${relative(SITE, file)}:${i + 1}  ${m[0]}`);
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
    console.error("\n  Retired colours still in the site:\n");
    for (const h of stale) console.error("    " + h);
    console.error("");
    process.exit(1);
  }
  const radii = offScaleRadii();
  if (radii.length) {
    console.error("\n  Radii off the scale (use --r-sm, --r-ctl or --r-card):\n");
    for (const h of radii) console.error("    " + h);
    console.error("");
    process.exit(1);
  }
  console.log("  Brand stylesheet is in sync with the tokens, no retired colour remains, and every radius is on the scale.");
} else {
  writeFileSync(OUT, css);
  console.log(`  Wrote ${OUT} (${css.split("\n").length} lines) from brand.tokens.json`);
}
