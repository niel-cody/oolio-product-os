# Colour

Values are in [`tokens/brand.tokens.json`](tokens/brand.tokens.json). This page is why they
are what they are. Do not copy a hex out of here; read the token.

## The stock

Riso ink is translucent. It has no opacity of its own, so it needs a pale sheet to sit under
it, and the process physically cannot print on dark stock. **The site is light because of the
process, not because somebody preferred light.** That is the single most consequential line in
this folder.

| Token | Hex | What it is |
|---|---|---|
| `--stock` | `#E4E2DB` | The sheet. Every page ground |
| `--stock-2` | `#EFEDE7` | A second sheet, lifted: plates, panels, cells |
| `--stock-3` | `#D6D3CA` | Recessed. A gutter, a well, a selected row |
| `--rule` | `#C4C0B7` | A hairline division inside a plate. Never a keyline |

A keyline is `1.5px solid #231F20` and it is the black drum, not a grey border. The difference
between a keyline and a rule is the difference between a printed sheet and a web page.

## The drums

One ink per pass, and the drum is reloaded between them. Three is the practical ceiling before
the paper starts to buckle, so three is the palette — not a restriction to work around, the
reason the look holds together.

| Pass | Ink | Hex | On stock | May set copy? |
|---|---|---|---|---|
| 01 | **Fluorescent Pink** 806U | `#FF48B0` | 2.38:1 | **No** |
| 02 | **Blue** | `#3D5588` | 5.68:1 | Yes |
| 03 | **Sun Yellow** | `#FFE800` | 1.04:1 | **No** |
| K | **Black drum** | `#231F20` | 12.57:1 | Yes |

**Pink is the dust.** Out of gamut, unmixable in CMYK, and the ink people recognise as Riso on
sight. It is the moment that matters on a page and never a whole surface: a fill, a rule, a
ghost layer, or a button ground with black type on it, which measures 5.28:1.

**Blue is the industry.** A dusty federal navy that carries structure, rules and diagrams. It
is the only drum besides black that may set a word.

**Yellow is the spark**, and it is the whole argument. Third drum, smallest budget, reserved
for the human sign-off gates. As the only warm thing on the sheet it makes "a person decides
here" the loudest mark on the map, which is what the page claims in words already. At 1.04:1
it can never be a line or a letter: a gate is a yellow ground with black type on it, and that
measures **13:1** — the highest contrast anywhere on the site.

**Black is never `#000`.** A Riso black drum lays down a soft warm neutral that sits on the
paper rather than punching a hole in it. All body copy runs here.

## The overprints are the palette

Translucent ink multiplies where two passes cross. You do not choose these; the press produces
them. That is why they are worth more than a fourth drum.

| | Hex | On stock | Text |
|---|---|---|---|
| Pink × Blue | `#3D185E` | 10.87:1 | Yes |
| Pink × Yellow | `#FF4100` | 2.70:1 | No |
| Blue × Yellow | `#3D4D00` | 7.17:1 | Yes |

## The six meanings

Seven inks exist once the overprints are counted, and the lifecycle map has seven things to
say, so nothing had to be invented.

| Token | Ink | Hex | Means |
|---|---|---|---|
| `--gate` | Sun Yellow | `#FFE800` | **A person decides here** |
| `--orch` | Blue | `#3D5588` | Orchestration: a skill driving a tool |
| `--ai` | Pink × Blue | `#3D185E` | The assistant runs this step |
| `--output` | Blue × Yellow | `#3D4D00` | An artefact the OS produced |
| `--loop` | Pink | `#FF48B0` | Learning returning upstream |
| `--signal` | Ink mid | `#65606A` | Raw input, before anyone has shaped it |
| `--alarm` | Pink × Yellow | `#FF4100` | Destructive, failed, or unplaced |

`--loop` gets the signature ink because the returns are the reason this is a system and not a
pipeline, which is the map's most-earned claim. `--signal` is nearly colourless on purpose:
raw signal has not been interpreted yet, and colouring it would be a claim about it.

## What may carry a word

This is the rule that gets broken first, so it is stated on its own.

**Every word on the site is set in the black drum**, at one of four steps, each measured on
the stock:

| Token | Hex | On stock | For |
|---|---|---|---|
| `--ink` | `#231F20` | 12.57:1 | Headings and body |
| `--soft-ink` | `#45414A` | 7.68:1 | A secondary paragraph |
| `--muted-ink` | `#65606A` | 4.72:1 | Captions, eyebrows, the mono furniture. The last step that clears AA |
| `--faint-ink` | `#7A757F` | 3.46:1 | **Decoration only.** Never a word a person has to read |

Blue at 5.68:1 may carry copy where a second voice is genuinely needed. Pink, yellow and the
pink × yellow overprint may not, at any size, ever.

## Accessibility

Two rules that contrast ratios do not cover:

- **Colour is never the only carrier.** The map's node types are an ink *and* a badge; the
  gates are yellow *and* a labelled tick; the loops are pink *and* dashed. Roughly one man in
  twelve cannot separate the pink from the orange overprint, and the map has to work for him.
- **Texture never touches anything functional.** A slash command is there to be copied, and a
  shifted plate over a URL is a command somebody mistypes.

## The Flightdeck's domains, and the one exception

The Flightdeck encodes eight product domains, and there are seven inks. Seven take an ink each
and the eighth takes `--muted-ink`. Sun Yellow appears in that set, which is the only place it
appears outside a gate: the Flightdeck has no gates, and the rule binds where gates exist. It
is a bounded exception, written down here so it stays bounded.
