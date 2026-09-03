# Typography

Three faces, one job each. Getting a word into the wrong one is the most common way this
brand goes wrong, so the division is strict.

| | Face | Says |
|---|---|---|
| **Display** | Syne 700–800 | The argument. What a person believes |
| **Text** | Archivo 400–700 | The interface. What a person reads and clicks |
| **System** | DM Mono 400–500 | The machine. What was counted, stamped, or run |

## Syne

Drawn for a French art centre, not a startup. Wide, slightly wrong proportions, and an
ampersand with opinions. It reads as an art press rather than as a design system, which is the
point of the whole direction.

- **800 for the wordmark and headlines**, 700 where a heading is smaller than about 20px.
- Tracking is negative and gets more negative as it gets bigger: `-0.02em` at 30px,
  `-0.028em` at 60px and above.
- Line height goes **below 1** at display sizes. At 0.92 to 0.95 the lines lock together into
  a block, which is what a poster does and a web page usually does not.
- It is loud. One display element per screen carries the argument and everything around it
  stays quiet. Two competing Syne headlines in one viewport is the fastest way to make the
  page look shouty rather than printed.

## Archivo

Everything a person reads or clicks. A grotesque built for small sizes and dense text that
does nothing interesting on purpose, so Syne can.

- Body copy is 1rem at 1.6, `--soft-ink` or `--ink`, never wider than about 56 characters.
- Interface text is 0.9rem.
- Weight carries hierarchy: 400 for prose, 500 for interface, 600 for a label that must be
  found, 700 only where 600 is genuinely not enough.
- Tabular numbers (`font-variant-numeric: tabular-nums`) on anything in a column.

## DM Mono

Typewriter rather than terminal. Every label, ink code, screen angle, count, stamp, pass
marker and slash command. If a person could have written it in a sentence, it is not mono.

- The **pass marker** is 0.7rem, `0.14em` tracking, uppercase, `--muted-ink`. It is the
  brand's most repeated piece of furniture and it does not vary. It sits on the black keyline
  that opens every section, the way a proof sheet is marked up.
- A command in running text is 0.86em so it does not tower over the prose around it.

## What went, and why

**Space Grotesk is retired.** It is the face that signals "designed" without doing any
designing, and it was one of five unmodified defaults that made the old site read as
generated. Instrument Serif, which replaced it for half a day, went the same way: an editorial
serif is a fine answer to the same problem, but it is not a printed one, and this brand is
committed to the press.

## The scale

Eight steps. A ninth is always somebody avoiding a decision. Available as `.t-*` classes from
the generated stylesheet.

| Step | Size | Line | Track | Face |
|---|---|---|---|---|
| `t-display-xl` | `clamp(2.9rem, 7.4vw, 5.6rem)` | 0.92 | −0.028em | Syne 800 |
| `t-display-l` | `clamp(1.85rem, 3.6vw, 2.9rem)` | 1.02 | −0.02em | Syne 800 |
| `t-display-m` | 1.16rem | 1.24 | −0.01em | Syne 700 |
| `t-lede` | 1.12rem | 1.55 | 0 | Archivo |
| `t-body` | 1rem | 1.6 | 0 | Archivo |
| `t-ui` | 0.9rem | 1.45 | 0 | Archivo |
| `t-spec` | 0.76rem | 1.5 | 0.01em | DM Mono |
| `t-pass` | 0.7rem | 1.2 | 0.14em | DM Mono, uppercase |

## Two things that will bite

**Display type at length is a wall.** Syne 800 set six lines deep is not a headline, it is a
barricade, and the reader skips it. A display statement gets a `max-width` and about four
lines. This was caught on the reprinted landing page, where the opening statement ran the full
container and had to be brought back to a narrower measure.

**The link preview cannot screen.** The Open Graph card is rendered by Satori, which resolves
no CSS masks, blend modes or repeating background images, so the halftone the site draws in
three lines of CSS is laid out there as individual positioned dots on a fixed pitch. It is the
one part of the press language that renderer can reproduce honestly; do not try to fake the
rest of it there.
