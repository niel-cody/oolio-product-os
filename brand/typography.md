# Typography

Three typefaces, and each one is allowed to say a different kind of thing. Getting a word into
the wrong one is the most common way this brand goes wrong, so the division is strict.

| | Face | Says |
|---|---|---|
| **Display** | Instrument Serif, 400 | The argument. What a person believes |
| **Text** | Inter, 400–700 | The interface. What a person reads and clicks |
| **System** | JetBrains Mono, 400–600 | The machine. What was counted, stamped, or run |

That division is the positioning, set in type. The OS is a written argument that a machine
executes, so the argument is set in a serif and the execution is set in a mono, and the
interface between them is as neutral as it can be got.

## Instrument Serif

High contrast, tight fitting, one weight. It carries the wordmark, page titles and pull quotes.

- **Never bold.** One weight exists. A synthesised 700 smears the outline. The `.wordmark` class
  sets `font-synthesis-weight: none` so the mistake shows.
- **Never below 20px.** The thin strokes disappear and it reads as a broken font.
- Tracking is negative and gets more negative as it gets bigger: `-0.014em` at 28px,
  `-0.022em` at 76px.
- The italic is for a genuine aside or a quoted voice. It is not an emphasis tool.

It replaces Space Grotesk as the face that carries character. Space Grotesk is a fine typeface
and it is on a very large number of other product sites, which is the problem: it was doing the
job of looking distinctive without being distinctive.

## Inter

Everything a person reads or clicks. It is chosen for being unremarkable: with a serif carrying
the voice, a second opinionated sans is a fight, and Inter at 12 and 13px is more legible than
Space Grotesk was, which matters because most of this interface lives at that size.

- Body copy is 15px at 1.62, `--soft`, and never wider than about 70 characters.
- Interface text is 13px at 1.4.
- Weight carries hierarchy: 400 for prose, 500 for interface, 600 for a label that must be
  found, 700 only where 600 is genuinely not enough.
- Tabular numbers (`font-variant-numeric: tabular-nums`) on anything in a column.

## JetBrains Mono

Everything the machine wrote or counted: skill counts, dates and stamps, ids, commands, badges,
eyebrows, the map's furniture. If a person could have written it in a sentence, it is not mono.

- Eyebrows are 9.5px, `0.16em` tracking, uppercase, `--mute`. That combination is the brand's
  most repeated piece of furniture and it does not vary.
- A command in running text is 0.86em so it does not tower over the prose around it.

## The scale

Eight steps. A ninth is always somebody avoiding a decision. Available as `.t-*` classes from
the generated stylesheet.

| Step | Size | Line | Track | Face |
|---|---|---|---|---|
| `t-display-xl` | `clamp(44px, 6.4vw, 76px)` | 1.06 | −0.022em | Instrument Serif |
| `t-display-l` | `clamp(32px, 4vw, 46px)` | 1.12 | −0.018em | Instrument Serif |
| `t-display-m` | 28px | 1.20 | −0.014em | Instrument Serif |
| `t-lede` | 20px | 1.50 | −0.004em | Inter |
| `t-body` | 15px | 1.62 | 0 | Inter |
| `t-ui` | 13px | 1.40 | 0 | Inter |
| `t-fine` | 11.5px | 1.45 | 0.01em | JetBrains Mono |
| `t-eyebrow` | 9.5px | 1.20 | 0.16em | JetBrains Mono, uppercase |

## Two things that will bite

**The `tt` ligature in link previews.** The Open Graph card is rendered by Satori, not a
browser, and Satori mis-measures some ligatures, leaving the surplus as trailing advance. It hit
Space Grotesk's `tt` and left a visible hole in "written". The fix in
`site/app/opengraph-image.tsx` is a zero-width non-joiner between the two letters. If a headline
word ever looks wrongly spaced on a card, measure it before adding it to that list; disabling
ligatures that are working is worse than the bug.

**Fractional advances, or the wordmark comes apart.** `.display` and `.wordmark` both set
`text-rendering: geometricPrecision`, and it is load-bearing. Chrome rounds glyph advances to
whole pixels while hinting, and against this face's negative tracking the rounding accumulates
unevenly: "Oolio Product OS" rendered as "Prod uct OS", a hole mid-word and the word space
squeezed shut. Measured at 17, 18, 20, 22 and 24px; present at all five, gone at all five with
fractional advances. Removing the line brings it back, so do not tidy it away.

**Instrument Serif has no bold to fall back on.** Anywhere the webfont fails to load, the stack
falls to Iowan Old Style, then Palatino, then Georgia. All three are considerably wider. A
headline that only just fits in Instrument Serif will break the layout on the one machine where
the font did not arrive, so leave it room.
