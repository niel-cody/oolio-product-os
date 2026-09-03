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
p("   PIXIE DUST INDUSTRIES — the press");
p("");
p("   GENERATED FILE. Do not edit.");
p("   Source: brand/tokens/brand.tokens.json. Rebuild: node brand/tokens/build.mjs");
p("   Why it is generated, and what each ink means: brand/README.md");
p("");
p("   Risograph: three ink drums plus a black drum, printed on uncoated stock. The whole");
p("   argument is physical constraint — a fixed number of drums, translucent ink, paper");
p("   showing through, registration that never quite lands. Constraints are the thing a");
p("   generator cannot fake, which is the point.");
p("");
p("   The site is LIGHT, and that is not a preference. Riso ink is translucent and needs a");
p("   pale sheet to sit on; the process physically cannot print on dark stock.");
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
p("  /* ---- THE DRUMS ---- one ink per pass, in order */");
for (const [k, v] of Object.entries(t.press.drums)) {
  if (k === "_") continue;
  p(`  --${k}: ${v.hex}; /* ${v.pass} · ${v.riso} · ${v.contrastOnStock}:1 on stock · ${v.text ? "may set copy" : "FILL ONLY, never a word"} */`);
}
p();
p(`  /* ---- OVERPRINTS ---- ${t.press.overprints._} */`);
for (const [k, v] of Object.entries(t.press.overprints)) {
  if (k === "_") continue;
  p(`  --${k}: ${v.hex}; /* ${v.from.join(" × ")} · ${v.contrastOnStock}:1 on stock */`);
}
p();
p("  /* ---- TYPE COLOUR ---- every figure measured on the stock */");
for (const [k, v] of Object.entries(t.press["type-colour"])) {
  if (k === "_") continue;
  p(`  --${k}: ${v.hex}; /* ${v.use} · ${v.contrastOnStock}:1 */`);
}
p();
p("  /* ---- THE SIX MEANINGS ---- drawn from the ink set, not from a colour wheel */");
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
p("  --edge: var(--k); /* a border that has to be seen is a keyline, and a keyline is black */");
p("  --void: var(--stock-3);");
p();
p("  /* Type. Loaded by next/font in app/layout.tsx, which sets these three variables. */");
p(`  --font-display-stack: var(--font-display), ${t.type.display.fallback};`);
p(`  --font-text-stack: var(--font-text), ${t.type.text.fallback};`);
p(`  --font-system-stack: var(--font-system), ${t.type.system.fallback};`);
p();
p("  /* Shape. Print has keylines, not rounded cards. */");
p(`  --keyline: ${t.shape.keyline};`);
p(`  --hairline: ${t.shape.hairline};`);
p(`  --press-shadow: ${t.shape.shadow.press};`);
for (const [k, v] of Object.entries(t.shape.radius)) p(`  --r-${k}: ${v};`);
p();
p("  /* Motion */");
for (const [k, v] of Object.entries(t.motion.ease)) {
  p(`  --ease-${k === "inOut" ? "in-out" : k}: ${v.value}; /* ${v.use} */`);
}
for (const [k, v] of Object.entries(t.motion.duration)) p(`  --dur-${k}: ${v};`);
p();
p("  /* Screen angles. Two drums at the same angle produce moiré, which is why these are");
p("     fixed rather than picked per component. */");
for (const [k, v] of Object.entries(t.moves.halftone.angles)) p(`  --angle-${k}: ${v}deg;`);
p("}");
p();

/* ---------------------------------------------------------------- the four moves */
p("/* ============================================================================");
p("   THE FOUR MOVES");
p("");
p("   Riso on the web is four techniques. Get these right and everything else is ordinary");
p("   layout; get them wrong and it is a filter over a SaaS site.");
p("   ========================================================================== */");
p();
p(`/* 01 GRAIN. ${t.moves.grain.why}`);
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
p(`/* 02 OVERPRINT. ${t.moves.overprint.why} */`);
p(".ink { mix-blend-mode: multiply; }");
p(".plate { isolation: isolate; position: relative; }");
p();
p(`/* 03 HALFTONE. ${t.moves.halftone.why}`);
p("   --dot sets the ink, --dot-size the screen ruling, --dot-angle the drum. */");
p(".halftone {");
p("  background-image: radial-gradient(var(--dot, var(--blue)) 44%, transparent 47%);");
p("  background-size: var(--dot-size, 8px) var(--dot-size, 8px);");
p("  transform: rotate(var(--dot-angle, var(--angle-blue)));");
p("  mix-blend-mode: multiply;");
p("}");
for (const [drum, angle] of Object.entries(t.moves.halftone.angles)) {
  p(`.halftone-${drum} { --dot: var(--${drum}); --dot-angle: ${angle}deg; --dot-size: ${t.moves.halftone.sizes[drum]}; }`);
}
p();
p(`/* 04 MISREGISTRATION. ${t.moves.misregistration.why}`);
p(`   Budget: ${t.moves.misregistration.budget}. The ghosts are aria-hidden duplicates of the`);
p("   text, sitting behind it; a screen reader hears the word once. */");
p(".misreg { position: relative; display: inline-block; isolation: isolate; }");
p(".misreg .ghost,");
p(".misreg .ghost2 {");
p("  position: absolute;");
p("  left: 0;");
p("  top: 0;");
p("  mix-blend-mode: multiply;");
p("  -webkit-user-select: none;");
p("  user-select: none;");
p("  pointer-events: none;");
p("}");
p(`.misreg .ghost { color: var(--pink); transform: ${t.moves.misregistration.offsets.pink}; z-index: -1; }`);
p(`.misreg .ghost2 { color: var(--blue); transform: ${t.moves.misregistration.offsets.blue}; z-index: -2; opacity: 0.85; }`);
p();
p("/* Texture never touches anything functional. A slash command is there to be copied, so");
p("   it gets no grain, no halftone and no misregistration — a hard pink shadow is as far as");
p("   it goes. */");
p(".press-edge { border: var(--keyline); box-shadow: var(--press-shadow); }");
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
p("/* Display type: the argument, and only the argument. A heading that is really a label");
p("   belongs in Archivo, whatever size it is set at. */");
p(".display {");
p(`  font-family: var(--font-display-stack);`);
p("  font-weight: 800;");
p("  letter-spacing: -0.028em;");
p("  text-wrap: balance;");
p("}");
p();
p("/* The wordmark. Syne 800, uppercase, tight. It is set in the black drum; the pink and");
p("   blue arrive as misregistration ghosts rather than as a colour choice. */");
p(".wordmark {");
p("  font-family: var(--font-display-stack);");
p("  font-weight: 800;");
p("  letter-spacing: -0.03em;");
p("  line-height: 0.94;");
p("  text-transform: uppercase;");
p("  color: var(--ink);");
p("}");
p();

const css = lines.join("\n") + "\n";

/**
 * Colours this brand has retired, and what replaced each one.
 *
 * A stray old value does not look broken, which is exactly why it needs a test: it looks like
 * a slightly different grey, or an amber that is nearly the amber, and it survives for
 * quarters. The first block is the dark palette the site carried before the press direction;
 * the second is the Tailwind defaults that were the reason for the rebrand in the first place.
 */
const RETIRED = {
  "#070d17": "--stock #E4E2DB", "#03070f": "--stock-3 #D6D3CA", "#0e1521": "--stock-2 #EFEDE7",
  "#151f2c": "--stock-3 #D6D3CA", "#1f2a3a": "--rule #C4C0B7", "#37465d": "--k #231F20",
  "#808fa4": "--muted-ink #65606A", "#b0bcce": "--soft-ink #45414A", "#ecf0f7": "--ink #231F20",
  "#fcbd30": "--gate #FFE800", "#5ddd89": "--output #3D4D00", "#44d0de": "--orch #3D5588",
  "#95acc5": "--signal #65606A", "#b296fd": "--ai #3D185E", "#f07eb3": "--loop #FF48B0",
  "#fd6560": "--alarm #FF4100",
  "#0a0e14": "--stock #E4E2DB", "#0d121b": "--stock-2 #EFEDE7", "#1c2534": "--rule #C4C0B7",
  "#e6ecf5": "--ink #231F20", "#7d8aa0": "--muted-ink #65606A", "#33415a": "--k #231F20",
  "#a78bfa": "--ai #3D185E", "#2dd4bf": "--orch #3D5588", "#34d399": "--output #3D4D00",
  "#f59e0b": "--gate #FFE800", "#93a3bd": "--signal #65606A", "#f5b942": "--loop #FF48B0",
  "#f87171": "--alarm #FF4100",
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
    console.error("\n  Retired colours still in the site:\n");
    for (const h of stale) console.error("    " + h);
    console.error("");
    process.exit(1);
  }
  console.log("  Brand stylesheet is in sync with the tokens, and no retired colour remains.");
} else {
  writeFileSync(OUT, css);
  console.log(`  Wrote ${OUT} (${css.split("\n").length} lines) from brand.tokens.json`);
}
