# The Oolio Product OS brand

This folder is the brand. Not a description of one kept somewhere else: the palette, the
typography, the mark and the words are defined here, and everything that carries the brand
reads from here.

The rule is the same one the OS itself runs on. **Written down is not the same as running.**
A brand book that lives in a PDF drifts from the product within a quarter. So the tokens in
[`tokens/brand.tokens.json`](tokens/brand.tokens.json) are the source, the site's stylesheet
is generated from them, and a build fails if the two disagree.

## The short version

|  |  |
|---|---|
| **Name** | Oolio Product OS. Never "the OS" in public copy, never "ProductOS", never an acronym. |
| **Line** | The product process, written down and running. |
| **Thesis** | The loop closes on a person. |
| **Mark** | The Gate: a ring with a break in it, and a bead of gate amber standing in the break. |
| **Ground** | Ink. A single cool blue-black held from the deepest sky to the brightest type. |
| **Signature** | Gate amber `#fcbd30`. The colour of a human decision, and the only warm thing on the page. |
| **Type** | Instrument Serif for the argument, Inter for the interface, JetBrains Mono for the machine. |
| **Voice** | British English. Short declarative sentences. Concrete nouns. No buzzwords, no em dashes. |

## The documents

| File | What it settles |
|---|---|
| [positioning.md](positioning.md) | What this is, who it is for, the promise, the five principles |
| [identity.md](identity.md) | The Gate mark, its construction, the lockups, and misuse |
| [colour.md](colour.md) | Ink and Paper modes, the six lifecycle hues, contrast evidence |
| [typography.md](typography.md) | The three voices, the scale, and what each one is allowed to say |
| [voice.md](voice.md) | How it is written, with worked before-and-afters |
| [motion.md](motion.md) | Curves, durations, and the one signature animation |
| [application.md](application.md) | The site, link previews, Confluence, decks, terminal, Figma |

## Changing the brand

1. Edit [`tokens/brand.tokens.json`](tokens/brand.tokens.json), never the generated CSS.
2. Run `node brand/tokens/build.mjs` to regenerate `site/app/brand.css`.
3. Update whichever document above explains the decision, and say why in a sentence.
4. Add a CHANGELOG entry at the repo root, per [CLAUDE.md](../CLAUDE.md).

`node brand/tokens/build.mjs --check` fails if the generated stylesheet has drifted from the
tokens. It runs as part of `npm --prefix site run check`, so the drift cannot reach `main`.

## What is deliberately not here

**Outlined wordmark files.** The lockups in [`assets/`](assets) set live text in Instrument
Serif, which renders correctly anywhere the webfont is available and falls back to a generic
serif anywhere it is not. That is right for the site and wrong for anything leaving it. Before
sending a lockup to a printer, an agency or a conference, open it in Figma, convert the text to
outlines, and export that file instead. [identity.md](identity.md) has the steps.

**A logo for Oolio the company.** This is the Product team's operating system, not the company
mark. Where the two appear together, Oolio's own brand leads and this one sits beside it as a
product signature. See [application.md](application.md).
