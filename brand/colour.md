# Colour

Values are in [`tokens/brand.tokens.json`](tokens/brand.tokens.json). This page is why they
are what they are. Do not copy a hex out of here; read the token.

## What changed on 2 October 2026, and why

The first press ran three fluorescent drums: Fluorescent Pink, a federal Blue and Sun Yellow,
every one of them at full strength, on every page, inside 1.5px black keylines. It was
recognisably Riso and it was also loud in every corner at once. At forty-five skills the map,
the library and the landing page had all become walls of bold ink, and the sheet read as
brutalist rather than printed.

The second press keeps the process and reloads the drums. Every chromatic ink is now a named
colour from Sanzo Wada's **A Dictionary of Color Combinations** (1933), chosen because the
book's whole argument is restraint: muted, papery inks that sit together because they were
printed together. The brief that chose it: papery, minimalist and classic, with small flashes
of colour that are vivid without being flashy. So the rule that governs everything below is
**flashes, not surfaces**. Colour lives in dots, beads, rules and small pills. The sheet
stays the sheet.

## The stock

Riso ink is translucent. It needs a pale sheet to sit under it, and the process physically
cannot print on dark stock. **The site is light because of the process, not because somebody
preferred light.** The stock did not change: it is the thing about the old sheet worth keeping.

| Token | Hex | What it is |
|---|---|---|
| `--stock` | `#E4E2DB` | The sheet. Every page ground |
| `--stock-2` | `#EFEDE7` | A second sheet, lifted: plates, panels, the drawer |
| `--stock-3` | `#D6D3CA` | Recessed. A gutter, a well, a selected row |
| `--rule` | `#C4C0B7` | A hairline division inside a plate |
| `--rule-2` | `#A8A39A` | A firm division: the edge of a card, a control, a panel |

The black keyline, `1px solid #231F20`, is now **emphasis only**: the rule under the header and
the rule that opens a section. Everything that used to carry a black border carries `--rule-2`
and a soft corner instead. That one change is most of the difference between the two presses.

## The drums

One ink per pass. Each drum now has two strengths, the way a plate prints at full and at a
tint: the **solid** draws lines, dots and dashes; the **tint** is the only one allowed to
be a surface, and always carries black type.

| Pass | Ink | Hex | On stock | May set copy? |
|---|---|---|---|---|
| 01 | **Eupatorium Purple** | `#BF5892` | 3.50:1 | **No** |
| 01 tint | Corinthian Pink | `#F8B6BA` | black on it 9.62:1 | ground only |
| 02 | **Violet Blue** | `#40456A` | 7.11:1 | Yes |
| 02 tint | Salvia Blue | `#97ACC8` | black on it 7.03:1 | ground only |
| 03 | **Cream Yellow** | `#FDBF68` | black on it 9.96:1 | **No** |
| K | **Black drum** | `#231F20` | 12.57:1 | Yes |

**Pink is the dust.** A dusty magenta for the loops and the smallest
marks on the page. Its tint, Corinthian Pink, is the one surface the brand allows itself: the
primary button, a tag, a wash under a command.

**Blue is the industry.** A muted indigo that carries structure, links, orchestration and the
diagrams. It is the only drum besides black that may set a word. Its tint, Salvia Blue, is the
cool ground under anything selected.

**Yellow is the spark**, and it is still the whole argument. Third drum, smallest budget,
reserved for the human sign-off gates. As the only warm thing on the sheet it makes "a person
decides here" the loudest mark on the map. It has no tint and no other job. A gate is a Cream
Yellow bead or ground with black on it, and nothing else on the site may be yellow.

**Black is never `#000`.** A Riso black lays down a soft warm neutral that sits on the paper
rather than punching a hole in it. All body copy runs here.

## Two more tints

| Token | Ink | Hex | For |
|---|---|---|---|
| `--glaucous` | Glaucous Green | `#B4CDC2` | A calm green ground: a passing check, an artefact chip |
| `--lavender` | Grayish Lavender | `#C0A9B3` | A dusty mauve ground, between the pink and the blue |

A tint is a surface with black type on it, never a line. Black on either measures above 7:1.

## Four deep inks

The map has seven things to say and three drums cannot say them all. Four deep inks, each a
named plate colour, carry the meanings that have to be a line or a word. They are dark on
purpose: the colour is in the small marks, so the pale stock stays pale.

| Token | Ink | Hex | On stock | Text |
|---|---|---|---|---|
| `--plum` | Cotinga Purple | `#501345` | 10.66:1 | Yes |
| `--olive` | Olive Green | `#6B7140` | 3.99:1 | No |
| `--plumbeous` | Plumbeous | `#70727C` | 3.69:1 | No |
| `--carmine` | Carmine Red | `#A62C37` | 5.33:1 | Yes |

Olive and Plumbeous clear the 3:1 that a line or an icon needs and not the 4.5:1 a word needs,
so they draw and never speak.

## The seven meanings

| Token | Ink | Hex | Means |
|---|---|---|---|
| `--gate` | Cream Yellow | `#FDBF68` | **A person decides here** |
| `--orch` | Violet Blue | `#40456A` | Orchestration: a skill driving a tool |
| `--ai` | Cotinga Purple | `#501345` | The assistant runs this step |
| `--output` | Olive Green | `#6B7140` | An artefact the OS produced |
| `--loop` | Eupatorium Purple | `#BF5892` | Learning returning upstream |
| `--signal` | Plumbeous | `#70727C` | Raw input, before anyone has shaped it |
| `--alarm` | Carmine Red | `#A62C37` | Destructive, failed, or unplaced |

`--loop` gets the signature ink because the returns are the reason this is a system and not a
pipeline. `--signal` is nearly colourless on purpose: raw signal has not been interpreted yet,
and colouring it would be a claim about it.

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

Violet Blue at 7.11:1 may carry copy where a second voice is genuinely needed, which in
practice means links. Cotinga Purple and Carmine Red clear AA and are allowed in a label. Solid
pink, Cream Yellow, Olive and Plumbeous may not set a word, at any size, ever. A coloured chip
is a tinted ground with black type on it, not coloured type on the stock.

## Flashes, not surfaces

- A tint may be a ground. A solid may not, except the gate bead.
- One flash per component. A row has its dot; a card has its chip; a command has its wash. Two
  flashes in one component is a poster.
- The halftone plates on the landing page are screened in the tints, so they read as a wash
  rather than a shout.
- Misregistration is retired. Display type is printed once, in the black drum, with nothing
  behind it. The pink and blue appear beside a headline, never under it.
- Grain is at eleven per cent. Nineteen, where it used to sit, was a dirty screen.

## Accessibility

Two rules that contrast ratios do not cover:

- **Colour is never the only carrier.** The map's node types are an ink *and* a badge; the
  gates are yellow *and* a labelled tick; the loops are pink *and* dashed. Roughly one man in
  twelve cannot separate the pink from the carmine, and the map has to work for him.
- **Texture never touches anything functional.** A slash command is there to be copied, and a
  shifted plate over a URL is a command somebody mistypes.

## The Flightdeck's domains, and the one exception

The Flightdeck encodes eight product domains. Seven take an ink or a tint each and the eighth
takes `--muted-ink`. Cream Yellow does not appear in that set, so the gate rule holds there
without an exception now.

## Where the colours come from

The transcription used is [mattdesl/dictionary-of-colour-combinations](https://github.com/mattdesl/dictionary-of-colour-combinations),
which carries all 159 of the book's colours with the plates each appears on. The inks above
were chosen from that list for three things in this order: the job (a line, a ground, a word),
the contrast figure on the stock, and whether they sit together in the book's own plates.
Corinthian Pink and Cream Yellow share a plate; Cream Yellow and Cotinga Purple share a plate;
Violet Blue sits beside a pale blue and a fawn on another. The set was not lifted from one page
of the book, and it does not pretend to have been.
