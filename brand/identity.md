# The mark

![The Gate](assets/mark.svg)

## The Gate

A ring with a break in it, and a bead of gate amber standing in the break.

The ring is the loop: signal, shaped idea, decision, ship, learn, back to signal. It is the
reason the OS is a system rather than a pipeline. The break is where the loop does not close on
its own. The bead is the person who closes it.

That is the entire idea, and it is the same sentence as the thesis in
[positioning.md](positioning.md): **the loop closes on a person.** The mark says it before a
word is read, at sixteen pixels, in one stroke and one dot.

It is also, unavoidably and usefully, an **O**.

## Construction

Drawn on a 32 unit grid. Every value here is exact; nothing is eyeballed.

| | |
|---|---|
| Centre | 16, 16 |
| Ring radius | 11 |
| Ring stroke | 3, round cap |
| Ring path | starts at −12°, sweeps 294° clockwise, ends at −78° |
| Break | 66° wide, centred on −45° |
| Bead | radius 3, centred at −45°, which is 23.778, 8.222 |

Angles are screen angles: 0° is east, and positive is clockwise, because that is what SVG does
and a brand book that disagrees with the renderer is a brand book that gets ignored.

The break sits at one o'clock, not twelve. On the vertical the mark reads as a broken circle and
the eye tries to close it. Off-axis it reads as deliberate.

The round caps eat about 8° of the break at each end, which is why the break is specified at 66°
and looks like about 50°. Squaring the caps to "fix" that makes the mark look like a pie chart.

**Clear space** is one bead diameter, 6 units on the 32 grid, on every side. Nothing enters it.

**Minimum size** is 16px on screen and 6mm in print. Below that the break closes up and the mark
becomes a dot in a circle, which means nothing.

## The files

| File | For |
|---|---|
| [`assets/mark.svg`](assets/mark.svg) | The mark on any dark surface. Paper ring, amber bead |
| [`assets/mark-mono.svg`](assets/mark-mono.svg) | One colour, inherited from `currentColor`. Single-ink print, embossing, a mask |
| [`assets/favicon.svg`](assets/favicon.svg) | The tile: ink ground, rounded square, mark drawn at r=9.5 so the break keeps its clear space |
| [`assets/lockup.svg`](assets/lockup.svg) | Horizontal lockup, ink |
| [`assets/lockup-paper.svg`](assets/lockup-paper.svg) | Horizontal lockup, paper |
| [`assets/mark-loop.svg`](assets/mark-loop.svg) | The bead runs the ring. Loading and long work only |

## The lockup

Mark, then a gap of one bead diameter, then **Oolio Product OS** in Instrument Serif at
`-0.012em` tracking. The wordmark's cap height sits on the mark's centre line.

Three sizes, and only three:

| | Mark | Wordmark | Where |
|---|---|---|---|
| Large | 34px | 30px | A title slide, the top of a one-pager |
| Standard | 20px | 18px | The site header, a document header |
| Small | 15px | 14px | A footer, a signature, a slide corner |

The mark stands alone wherever the name is already on the surface: a favicon, an avatar, a
slide corner on slide four, a loading state.

**Never set the wordmark bold.** Instrument Serif has one weight. A browser asked for 700 will
synthesise it by smearing the outline, and a smeared wordmark is the fastest way to look
counterfeit. The `.wordmark` class in the generated stylesheet sets
`font-synthesis-weight: none` so the mistake fails visibly rather than quietly.

## Outlining before it leaves Oolio

The lockup SVGs carry live text. That is right for the site, where the webfont is loaded, and
wrong for anything sent outside it, where it will silently fall back to Georgia.

1. Open the lockup in Figma.
2. Select the text layer, **Type → Outline stroke** (⌘⇧O).
3. Export as SVG with **Outline text** on.
4. Send that file, not the one in this folder.

## Misuse

Every one of these has been considered and rejected, so they do not need relitigating.

- **Do not close the ring.** A closed ring is a loop that runs without anybody in it, which is
  the opposite of what this team believes.
- **Do not recolour the bead.** It is gate amber because it is a person. Making it match a
  deck's accent colour deletes the meaning and leaves a dot.
- **Do not put the bead inside the ring.** It sits on the ring's path, in the break.
- **Do not add a gradient, a glow, a bevel, or an outer ring.**
- **Do not rotate it.** The break is at one o'clock. It is not a dial.
- **Do not stretch it.** Scale both axes together, always.
- **Do not stack the lockup vertically.** The horizontal lockup is the only lockup.
- **Do not set the mark on a mid-tone.** Ink, paper, or a photograph dark enough to read as ink.
- **Do not animate it as decoration.** The bead runs the ring when work is running, and at no
  other time. See [motion.md](motion.md).
