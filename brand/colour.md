# Colour

Values are in [`tokens/brand.tokens.json`](tokens/brand.tokens.json). This page is why they are
what they are. Do not copy a hex out of here; read the token.

## What was wrong with the old palette

Worth recording, because it is the reason the rebrand had a functional job and not just a
cosmetic one. Measured in OKLCH, the palette the site shipped until now was:

| Token | Hex | Hue | Problem |
|---|---|---|---|
| human | `#f59e0b` | 70° | |
| loop | `#f5b942` | 81° | **11° from human.** Two different meanings, one colour |
| output | `#34d399` | 163° | |
| orch | `#2dd4bf` | 182° | **19° from output.** Same again |

Six meanings, four distinguishable colours. On the map, an amber gate and an amber loop label
were telling a reader two different things in the same voice. Every value was also a Tailwind
default, which is the tell that a palette was picked rather than designed.

## The ground: Ink

One hue, **258°**, held from the deepest sky to the brightest type. Nine steps, each one a
deliberate lightness in OKLCH so the gaps are perceptually even rather than evenly spaced in
hex, which is not the same thing.

| Token | Hex | On ink | What it is for |
|---|---|---|---|
| `--void` | `#03070f` | | The sky behind the landing page. Nowhere else |
| `--ink` | `#070d17` | | The page |
| `--panel` | `#0e1521` | 1.1:1 | A surface on the page: a card, the header |
| `--raise` | `#151f2c` | 1.2:1 | A surface on a surface: a hover, an input, a selected row |
| `--rule` | `#1f2a3a` | 1.3:1 | Borders and dividers |
| `--edge` | `#37465d` | 2.0:1 | A border that has to be seen: a focus ring, a secondary button |
| `--mute` | `#808fa4` | **5.9:1** | Captions, the mono furniture, secondary text |
| `--soft` | `#b0bcce` | **10.1:1** | Body text set at length |
| `--paper` | `#ecf0f7` | **17.0:1** | Headings, and anything that must be read first |

Body text is `--soft`, not `--paper`. Pure white text on near-black at paragraph length is
uncomfortable to read, and holding `--paper` back for the things that matter is what lets the
hierarchy work without a second typeface.

## The six meanings

Six hues, spread around the wheel so that no two can be mistaken for each other, and matched in
perceived lightness so none of them shouts louder than its meaning deserves.

| Token | Hex | Hue | Means |
|---|---|---|---|
| `--gate` | `#fcbd30` | 82° | **A person decides here** |
| `--output` | `#5ddd89` | 152° | An artefact the OS produced |
| `--orch` | `#44d0de` | 205° | Orchestration: a skill driving a tool |
| `--signal` | `#95acc5` | 252° | Raw input, before anyone has shaped it |
| `--ai` | `#b296fd` | 295° | The assistant runs this step |
| `--loop` | `#f07eb3` | 352° | Learning returning to an earlier stage |

Smallest gap between any two: **43°**, ai to signal. Largest: 90°, from loop round to gate, and
that gap is deliberate. It holds `--alarm` (`#fd6560`, 25°) far enough from both that a failure
is never read as a gate and a gate is never read as a failure.

`--signal` is the one with almost no chroma, on purpose. Raw signal has not been interpreted
yet, and colouring it strongly would be a claim about it.

`--loop` moved from gold to rose. It is the largest visible change in the rebrand and the one
with the clearest reason: it is the only way to stop the learning loop and the human gate
looking like the same thing.

## Gate amber, and the rule about it

Gate amber is the signature. It means one thing, and it is spent on one thing:

1. A review gate on the map, and the skill nodes a person runs.
2. The primary call to action, because installing is the reader's own decision.

That is the whole list. Not headings, not hovers, not a chart series, not a border because a
card looked plain. **The amber is a person** is the second of the five principles in
[positioning.md](positioning.md), and it survives only if it is never spent anywhere else.

Warm on near-black is also the plainest way this brand is not another developer tool. Almost
every one of them is violet or teal on black. If the palette ever drifts back that way, this is
the paragraph that was ignored.

## Accessibility

Every accent clears **6.5:1** on `--ink` and **6.2:1** on `--panel`, which is AA for normal
text and AAA for large. Every text token clears AA on every ground it is used on. These are
recorded per token in [`tokens/brand.tokens.json`](tokens/brand.tokens.json) and were computed,
not estimated.

Two rules that contrast ratios do not cover:

- **Colour is never the only carrier.** The map's node types are a colour *and* a badge; the
  gates are amber *and* a labelled tick; the loops are rose *and* dashed. Roughly one man in
  twelve cannot separate the rose from the amber, and the map has to work for him.
- **Nothing on a mid-tone.** The accents are tuned for `--ink` and `--panel`. On `--edge` or
  above, use paper mode instead of hoping.

## Paper mode

The same identity on a document: Confluence, a printed one-pager, a light deck. Add `class="paper"`
to a container and every token flips.

The accents are darkened until each clears 4.5:1 on white, because on paper they carry text
rather than glow on black. Gate amber becomes `#966e12`, which is a dark gold and reads as
deliberate rather than as a lighter amber that failed.

Paper mode is a separate token set, not a `prefers-color-scheme` query. A light Confluence page
and a dark product surface are two audiences, not one reader's preference, and the site is dark
by design.
