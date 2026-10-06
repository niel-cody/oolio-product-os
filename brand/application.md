# Application

Where the brand shows up, and what is required of it on each surface.

## The site

`pixiedustindustries.com`, and the brand's primary expression. It reads
[`site/app/brand.css`](../site/app/brand.css), which is generated from the tokens, so the site
cannot drift from this folder.

| Element | What it is |
|---|---|
| Header | The Gate and the wordmark in the serif, on the stock, over a hairline |
| Landing hero | Newsreader, printed once, beside a folded findings sheet. One black call to action |
| The idea beat | The brand story told once, beside the folded sheet (`assets/fold.svg`). The only paper-inspired illustration and the only paper-inspired movement on the site |
| Body copy | `t-body` in Geist, never wider than about 60 characters |
| Furniture | The eyebrow in Geist Mono, sitting on the firm rule that opens each section |
| The map | A snake of fourteen stage plates with soft corners, an ink dot per tile, Cream Yellow gate beads with black ticks, pink loops through the channel. The panel cards are folded |
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

- Headings in the page's own font. Confluence will not load Newsreader and fighting it
  produces a worse page than accepting it.
- Panel colours from the stock: `#EFEDE7` for a callout, `#FDBF68` behind black type for
  anything gate-related.
- The lockup goes at the top as `lockup-paper.svg`, exported with outlined text.
- British English, sentence case, and no file paths or field ids. That page is written for a
  reader, not a maintainer.

## Decks

- Title slide: the large lockup on the stock, one line of Newsreader, nothing else.
- Content slides: Geist throughout. Newsreader only for a section break or a pull quote.
- One ink per slide beyond the black. If two things are shouting, one of them is wrong.
- The map is the argument. Screenshot it rather than redrawing it, so the deck cannot show a
  lifecycle the OS is not running.
- Slide numbers and dates in Geist Mono at `t-spec`.

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
- Is Cream Yellow on this page? If so, is it a gate?
- Is every headline printed once, in one ink, with nothing behind it?
- Does any texture touch something a person has to copy or click?
- Does it read at the smallest size it will actually be seen at?
- Would deleting the adjectives improve it?
- Is anything claimed that has not been measured?
