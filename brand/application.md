# Application

Where the brand shows up, and what is required of it on each surface.

## The site

`oolio-product-os.vercel.app`, and the brand's primary expression. It reads
[`site/app/brand.css`](../site/app/brand.css), which is generated from the tokens, so the site
cannot drift from this folder.

| Element | What it is |
|---|---|
| Header | Standard lockup, 20px mark, 18px wordmark, on `--panel` with a `--rule` underline |
| Landing hero | `t-display-xl` in Instrument Serif on `--void`, one `--gate` call to action |
| Body copy | `t-body`, `--soft`, never wider than about 70 characters |
| Furniture | `t-eyebrow` and `t-fine` in JetBrains Mono, `--mute` |
| The map | The six hues, one per node type, plus a badge so colour is never the only carrier |
| Favicon | [`assets/favicon.svg`](assets/favicon.svg) |

## Link previews

`site/app/opengraph-image.tsx`, generated at build time. The single most important surface the
brand has, because the way an internal tool spreads is somebody pasting the URL into Slack.

It carries the lockup, the line, and three generated numbers. Nothing else, ever: it is served
to any crawler that asks, so no skill names, no stages, no anything the landing page would not
already show a signed-out visitor.

## Confluence

The Product Operating System page is the human-readable front door. Confluence is light, so this
is paper mode:

- Headings in the page's own font. Confluence will not load Instrument Serif and fighting it
  produces a worse page than accepting it.
- Panel colours from paper mode: `#f2f5f8` for a callout, `#966e12` for anything gate-related.
- The lockup goes at the top as `lockup-paper.svg`, exported with outlined text.
- British English, sentence case, and no file paths or field ids. That page is written for a
  reader, not a maintainer.

## Decks

- Title slide: the large lockup on `--void`, one line of Instrument Serif, nothing else.
- Content slides: Inter throughout. Instrument Serif only for a section break or a pull quote.
- One accent per slide. If two things are shouting, one of them is wrong.
- The map is the argument. Screenshot it rather than redrawing it, so the deck cannot show a
  lifecycle the OS is not running.
- Slide numbers and dates in JetBrains Mono at `t-fine`.

## Terminal and plugin surfaces

Skill output is read in a terminal whose colours belong to the reader, not to us. So:

- Never emit raw colour codes. The reader's theme wins.
- Structure carries the brand: sentence case, British English, short declarative lines, the same
  vocabulary as the map.
- The plugin is `oolio-pm` in every id and namespace. The brand name appears in prose only.

## Alongside Oolio's own brand

This is the Product team's operating system, not the company. Where both appear, Oolio's brand
leads and this one sits beside it as a product signature: Oolio's logo first, a `--rule`
divider, then the standard lockup at the same optical weight.

Never combine the two marks into one. Never put the Gate on something that speaks for Oolio
rather than for Product.

## Before you ship a surface

- Does every number on it come from the thing it describes, or was one typed?
- Is the only warm thing on the page the thing that matters on it?
- Does it read at the smallest size it will actually be seen at?
- Would deleting the adjectives improve it?
- Is anything claimed that has not been measured?
