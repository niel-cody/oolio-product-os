# Pixie Dust Industries

This folder is the brand. Not a description of one kept somewhere else: the ink set, the
typography, the mark and the words are defined here, and everything that carries the brand
reads from here.

The direction is **paper**. Uncoated stock, muted inks from Sanzo Wada's *A Dictionary of
Color Combinations*, a quiet serif for the argument and a grotesque for everything else, one
radius scale, and the fold as the single signature. It began as a Risograph press and was
reprinted on 2 October 2026 as the thing under the press: the sheet itself, calm, with the
ink sitting on it once. The whole argument is restraint, which is the one thing a generator
cannot fake.

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
| **Mark** | The Gate: a ring with a break in it, and a bead of Cream Yellow standing in the break. |
| **Stock** | Uncoated cool grey `#E4E2DB`. The site is light, and that is physics rather than preference. |
| **Drums** | Eupatorium Purple `#BF5892` (tint Corinthian Pink `#F8B6BA`), Violet Blue `#40456A` (tint Salvia Blue `#97ACC8`), Cream Yellow `#FDBF68`, Black `#231F20`. Every chromatic ink is a named colour from Sanzo Wada's *A Dictionary of Color Combinations*. |
| **Type** | Newsreader 400 for the argument, Geist for the interface, Geist Mono for the machine. Mincho and Gothic. |
| **Voice** | British English. Short declarative sentences. Concrete nouns. No buzzwords, no em dashes. |

## One texture, one signature

Grain is the only texture: fractal noise at eight per cent, fixed, once, on the page. The
halftone screens, the overprint blend and the misregistration ghosts of the first press were
all retired on 2 October 2026 because they read as a filter over the page rather than as the
page. You cannot cut a sheet of paper twice.

The signature is **the fold**: a small dog-ear on the top right corner of any surface that
holds content, drawn in the stock and the pink tint, generated as `.folded`. One per surface,
never on a control, never bigger than the type beside it. It is the whole origami idea in
eighteen pixels, and it is the same on every page.

## One system

Every page reads from the same few decisions, and a page that invents its own is a page that
belongs to a different product:

- **Three radii, by role.** 6px for a tag or a code span, 10px for every button, input, chip
  and selectable row, 14px for every card, panel, tile and drawer. No pills. The build fails
  on a fourth value.
- **One button.** The black drum on the stock for the primary action, one per view; the
  lifted sheet with a firm edge for the secondary; nothing until hovered for the quiet ones.
- **One label.** The eyebrow, in the mono, above every title and on every section rule.
- **One surface.** The lifted sheet with a firm edge and the surface radius. It is folded
  when it holds something and plain when it only holds controls.
- **Flashes, not surfaces.** Colour is a dot, a bead, a rule, a tag, a fold. A tint may be a
  ground; a solid may not; the black keyline is gone from everything but the section rule.

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
- **Texture never touches anything functional.** The grain is the page's, not a control's,
  and a command block is a plain lifted sheet.
- **Pink is not a text colour.** The solid, `#BF5892`, measures 3.5:1 on the stock: a line, a
  dot, a ghost layer. Its tint, Corinthian Pink, is a ground with black type on it.
- **Flashes, not surfaces.** Since 2 October 2026 colour lives in dots, beads, rules and small
  pills. A tint may be a ground; a solid may not. The black keyline is emphasis only, and every
  card has a firm grey edge and a soft corner instead. [colour.md](colour.md) has the argument.
- **Display type is printed once.** No ghosts, no offsets, no second ink behind a headline.
  The magic is a sprinkling: a tag, a bead, a fold, never the headline itself.

## What is deliberately not here

**Outlined wordmark files.** The lockups in [`assets/`](assets) set live text in Newsreader, which
renders correctly anywhere the webfont is available and falls back to a grotesque anywhere it
is not. That is right for the site and wrong for anything leaving it. Before sending a lockup
to a printer or an agency, open it in Figma, convert the text to outlines, and export that
file. [identity.md](identity.md) has the steps.

**A real Riso print.** Everything here is the press simulated in a browser. A printed one-sheet
run on an actual machine is the obvious next artefact, and it is the only way to find out which
of these decisions survive contact with paper.
