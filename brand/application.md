# Application

Where the brand shows up, and what is required of it on each surface.

## The site

`oolio-product-os.vercel.app`, and the brand's primary expression. It reads
[`site/app/brand.css`](../site/app/brand.css), which is generated from the tokens, so the site
cannot drift from this folder.

| Element | What it is |
|---|---|
| Header | Standard lockup on the stock, under a black keyline |
| Landing hero | Syne 800, misregistered once, beside a three-drum halftone plate. One pink call to action |
| Body copy | `t-body` in Archivo, never wider than about 56 characters |
| Furniture | The pass marker in DM Mono, sitting on the keyline that opens each section |
| The map | Squared keylined plates, an ink spine per node type, Sun Yellow gates with black ticks |
| Favicon | [`assets/favicon.svg`](assets/favicon.svg) |

## Link previews

`site/app/opengraph-image.tsx`, generated at build time. The single most important surface the
brand has, because the way an internal tool spreads is somebody pasting the URL into Slack.

It carries the lockup, the line, and three generated numbers. Nothing else, ever: it is served
to any crawler that asks, so no skill names, no stages, no anything the landing page would not
already show a signed-out visitor.

## Confluence

The Product Operating System page is the human-readable front door. Confluence is already light, which for once
costs nothing:

- Headings in the page's own font. Confluence will not load Syne and fighting it produces a
  worse page than accepting it.
- Panel colours from the stock: `#EFEDE7` for a callout, `#FFE800` behind black type for
  anything gate-related.
- The lockup goes at the top as `lockup-paper.svg`, exported with outlined text.
- British English, sentence case, and no file paths or field ids. That page is written for a
  reader, not a maintainer.

## Decks

- Title slide: the large lockup on the stock, one line of Syne, nothing else. One
  misregistration, here and nowhere else in the deck.
- Content slides: Archivo throughout. Syne only for a section break or a pull quote.
- One ink per slide beyond the black. If two things are shouting, one of them is wrong.
- The map is the argument. Screenshot it rather than redrawing it, so the deck cannot show a
  lifecycle the OS is not running.
- Slide numbers and dates in DM Mono at `t-spec`.

## Terminal and plugin surfaces

Skill output is read in a terminal whose colours belong to the reader, not to us. So:

- Never emit raw colour codes. The reader's theme wins.
- Structure carries the brand: sentence case, British English, short declarative lines, the same
  vocabulary as the map.
- The plugin is `oolio-pm` in every id and namespace. The brand name appears in prose only.

## Alongside Oolio's own brand

Pixie Dust Industries is the house that makes the Product OS; it does not speak for Oolio.
Where both appear, Oolio's brand leads and this one sits beside it: Oolio's logo first, a
keyline divider, then the standard lockup at the same optical weight.

Never combine the two marks into one. Never put the Gate on something that speaks for Oolio
rather than for Product.

## Before you ship a surface

- Does every number on it come from the thing it describes, or was one typed?
- Is Sun Yellow on this page? If so, is it a gate?
- Is there exactly one misregistration on each screen?
- Does any texture touch something a person has to copy or click?
- Does it read at the smallest size it will actually be seen at?
- Would deleting the adjectives improve it?
- Is anything claimed that has not been measured?
