# Pixie Dust Industries

This folder is the brand. Not a description of one kept somewhere else: the ink set, the
typography, the mark and the words are defined here, and everything that carries the brand
reads from here.

The direction is **Risograph**. Three ink drums plus a black drum, printed on uncoated stock,
and its whole argument is physical constraint: a fixed number of drums, translucent ink, paper
showing through, registration that never quite lands. Constraints are the thing a generator
cannot fake, which is why this is the direction and not another dark palette.

The rule is the same one the OS itself runs on. **Written down is not the same as running.** A
brand book that lives in a PDF drifts from the product within a quarter. So the tokens in
[`tokens/brand.tokens.json`](tokens/brand.tokens.json) are the source, the site's stylesheet is
generated from them, and a build fails if the two disagree.

## The short version

|  |  |
|---|---|
| **House** | Pixie Dust Industries |
| **Product** | Product OS. The house is the name on the door; the Product OS is what it ships. |
| **Line** | The product process, written down and running. |
| **Thesis** | The loop closes on a person. |
| **Mark** | The Gate: a ring with a break in it, and a bead of Sun Yellow standing in the break. |
| **Stock** | Uncoated cool grey `#E4E2DB`. The site is light, and that is physics rather than preference. |
| **Drums** | Fluorescent Pink `#FF48B0`, Blue `#3D5588`, Sun Yellow `#FFE800`, Black `#231F20`. |
| **Type** | Syne for the argument, Archivo for the interface, DM Mono for the machine. |
| **Voice** | British English. Short declarative sentences. Concrete nouns. No buzzwords, no em dashes. |

## The four moves

Riso on the web is four techniques. Get these right and everything else is ordinary layout;
get them wrong and it is a filter over a SaaS site. All four are generated into
[`site/app/brand.css`](../site/app/brand.css) as classes.

| | What | Where |
|---|---|---|
| **01 Grain** | Fractal noise multiplied over the page in one fixed pass, at 19%. The sheet stays still while the ink moves. | `.sheet`, on `<body>`, once |
| **02 Overprint** | Translucent ink multiplies where two passes cross, so shapes darken instead of hiding each other. | `.ink` + `.plate` |
| **03 Halftone** | A Riso screens everything into dots. One angle per drum: 15°, 75°, 45°. | `.halftone-pink` / `-blue` / `-yellow` |
| **04 Misregistration** | The paper shifts between passes, so the plates never quite line up. | `.misreg`, **once per screen** |

## The documents

| File | What it settles |
|---|---|
| [positioning.md](positioning.md) | The house, the product, the promise, the five principles |
| [identity.md](identity.md) | The Gate, its construction, the lockups, and misuse |
| [colour.md](colour.md) | The stock, the drums, the overprints, and what may carry a word |
| [typography.md](typography.md) | The three faces and the scale |
| [voice.md](voice.md) | How it is written, with worked before-and-afters |
| [motion.md](motion.md) | Curves, durations, and the one signature animation |
| [application.md](application.md) | The site, link previews, Confluence, decks, terminal |

## Changing the brand

1. Edit [`tokens/brand.tokens.json`](tokens/brand.tokens.json), never the generated CSS.
2. Run `node brand/tokens/build.mjs` to regenerate `site/app/brand.css`.
3. Update whichever document above explains the decision, and say why in a sentence.
4. Add a CHANGELOG entry at the repo root, per [CLAUDE.md](../CLAUDE.md).

`node brand/tokens/build.mjs --check` fails if the generated stylesheet has drifted from the
tokens, **or if any retired colour is still sitting in the site**. It runs as part of
`npm --prefix site run check`, so neither can reach `main`.

## Where Riso stops

Committing to this has real costs, and they were decided rather than discovered.

- **The site is light, and cannot be otherwise.** Riso ink is translucent and needs a pale
  sheet to sit on; the process physically cannot print on dark stock. If dark ever becomes
  non-negotiable, the honest analogue is a xerox language — toner black, blown contrast,
  photocopy degradation — not Riso with the colours inverted.
- **Texture never touches anything functional.** No grain, no halftone and no misregistration
  inside a command block. A hard pink shadow is as far as it goes.
- **Fluorescent pink is not a text colour.** `#FF48B0` measures 2.38:1 on the stock. It is a
  fill, a rule, a ghost layer, or a button ground with black type on it.
- **Once per screen.** Misregistration is a signature, not a texture. Overdone it stops reading
  as a press and starts reading as a filter, which lands you back where you started.

## What is deliberately not here

**Outlined wordmark files.** The lockups in [`assets/`](assets) set live text in Syne, which
renders correctly anywhere the webfont is available and falls back to a grotesque anywhere it
is not. That is right for the site and wrong for anything leaving it. Before sending a lockup
to a printer or an agency, open it in Figma, convert the text to outlines, and export that
file. [identity.md](identity.md) has the steps.

**A real Riso print.** Everything here is the press simulated in a browser. A printed one-sheet
run on an actual machine is the obvious next artefact, and it is the only way to find out which
of these decisions survive contact with paper.
