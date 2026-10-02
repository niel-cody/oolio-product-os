# Typography

Three faces, one job each. Mincho and Gothic: a quiet serif for the argument and a precise
grotesque for everything a person reads or clicks, which is the classic Japanese pairing and
the calmest one there is. Getting a word into the wrong face is the most common way this
brand goes wrong, so the division is strict, and it is the same on every page.

| | Face | Says |
|---|---|---|
| **Display** | Newsreader 400 | The argument. A page title, a section line, the wordmark |
| **Text** | Geist 400 to 600 | The interface. What a person reads and clicks |
| **System** | Geist Mono 400 to 500 | The machine. What was counted, stamped, or run |

## Newsreader

A text serif with an optical-size axis, so it sets a page title at 44px and a panel title at
22px without either going spindly or going heavy. **Regular weight, always.** A serif at 400
is a statement; at 700 it is a newspaper. Set with `font-variation-settings: "opsz" 72` at
display sizes and `24` at panel sizes, which the generated classes do.

- Tracking is slightly negative, −0.015em at the largest size, and never positive.
- Line height sits at 1.06 to 1.1. The lines lock together without the barricade effect of
  a bold face at 0.92.
- One display element per view carries the argument. Two serif lines competing in one
  viewport is the fastest way to make the page look like a magazine spread.
- Never uppercase. The eyebrow does that job in the mono.

## Geist

Everything a person reads or clicks. Precise, neutral, drawn for interfaces, doing nothing
interesting on purpose so the serif can.

- Body copy is 15.5px at 1.6, `--soft-ink` or `--ink`, never wider than about 60 characters.
- Interface text is 13.5px.
- Weight carries hierarchy: 400 for prose, 500 for a control or a nav item, 600 for a row
  title or a card title that must be found. Never 700.
- Tabular numbers (`font-variant-numeric: tabular-nums`) on anything in a column.

## Geist Mono

Every label, count, stamp, pass marker and slash command. If a person could have written it
in a sentence, it is not mono.

- The **eyebrow** is 0.68rem, `0.12em` tracking, uppercase, weight 500, `--muted-ink`. It is
  the one label style on the site and it does not vary. It sits above every page title and
  on the firm rule that opens every section.
- A command in running text is 0.86em so it does not tower over the prose around it.

## The scale

Eight steps. A ninth is always somebody avoiding a decision. Available as `.t-*` classes from
the generated stylesheet, plus `.page-title` and `.page-lede` for the block every page opens
with.

| Step | Size | Line | Track | Face |
|---|---|---|---|---|
| `t-display-xl` | `clamp(2.3rem, 4.6vw, 3.5rem)` | 1.06 | −0.015em | Newsreader 400 |
| `t-display-l` | `clamp(1.7rem, 3vw, 2.4rem)` | 1.1 | −0.012em | Newsreader 400 |
| `t-display-m` | 1.3rem | 1.25 | −0.008em | Newsreader 400 |
| `t-lede` | 1.08rem | 1.6 | 0 | Geist |
| `t-body` | 0.97rem | 1.62 | 0 | Geist |
| `t-ui` | 0.85rem | 1.45 | 0 | Geist |
| `t-spec` | 0.74rem | 1.5 | 0.01em | Geist Mono |
| `t-pass` | 0.68rem | 1.2 | 0.12em | Geist Mono, uppercase |

## What went, and why

**Syne and Archivo are retired** (2 October 2026). Syne was drawn for a French art centre and
it is a poster at any weight; a site that wants to be read calmly cannot open with a poster.
Archivo went with it because the pairing was the point. Space Grotesk and Instrument Serif
had gone earlier for the opposite reasons: one signalled "designed" without designing, the
other was tried for half a day and dropped because the brand was committed to a press it is
no longer committed to.

## Two things that will bite

**A serif at length is a magazine.** Newsreader set six lines deep is not a headline. A
display statement gets a `max-width` of about 14 characters and at most three lines.

**The link preview cannot screen.** The Open Graph card is rendered by Satori, which loads
Newsreader and Geist Mono by fetching them at build time. If Google refuses, the card falls
back to the renderer's default serif rather than failing the deploy.
