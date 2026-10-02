# The site at forty-five skills: a UI and UX audit, and what was done about it

**Date:** 2 October 2026. **Scope:** the Product OS site at `oolio-product-os.vercel.app`
(soon `pixiedustindustries.com`): the landing page, the map, the skills index and skill
pages, the changelog and the systems map. **Method:** every page was opened at 1440, 1280,
1000 and 375 wide, the map data was measured rather than eyeballed, and each finding was
checked against the question a reader actually has on that page: where am I, what matters
here, what can I do next.

The short version: the site had outgrown two of its own ideas. The map's one-row layout and
the skills page's card grid were both designed at thirty skills and both stopped working at
forty-five. The brand's fluorescent press was loud everywhere at once. All three were fixed
on the same day as this audit, so the second half of this document is the record of what
changed and why.

## Findings

### 1. The map did not scale, and could not

The map laid fourteen stages in one row and stacked each stage's skills in a column. Two
numbers decided its fate:

| | Before | After |
|---|---|---|
| Canvas | 3,000 × 2,300 units | 2,300 × 1,050 units |
| Tallest stage | Quality, 12 tiles in one column | Quality, 3 lanes of 4 |
| Fitted scale on a 1440 screen | 0.33 | 0.55 |
| Tile label at fit | 4.5px | 8.5px |

A 13.5px label drawn at a third of its size is not a label. The structure around the labels
(column headings, gates, loops) was drawn at the same tiny size, so the fitted view told the
reader nothing, and the only way in was to zoom and pan blind.

Two layout facts caused it. Rows were global, so one twelve-skill stage made every stage
twelve rows tall. And one row of fourteen stages is four times wider than it is tall, while
the screen it is drawn on is about two to one, so half the stage was always empty.

**What changed.** The map is a snake: stages one to seven run left to right along the top,
the lifecycle turns, and eight to fourteen run back along the bottom. A crowded stage packs
its skills into lanes, so every plate in a band is the same height. The canvas is now roughly
the shape of the screen. The fitted view is designed to be read as structure: numbered stage
plates, gate beads, the pink loops through the channel between the bands, and a soft track
that shows the path of the work. Far away, tiles drop their small print and show their label
alone at a larger size. Close up, the note and the tool badge return.

Three ways in replace blind panning: a strip of fourteen stage chips across the top of the
stage, which zooms to a stage and is legible at any size; the plates themselves, which do the
same; and the tiles, which select a skill, glide the view to its neighbourhood, and fill the
panel with its summary, its connections, and a link that opens the skill in the library.

### 2. The map's panel answered one question and ignored two

The panel listed the seven paths and the steps of the one selected. It had no idea where the
reader was looking. A reader who hovered a tile got a browser tooltip and nothing else.

**What changed.** The panel has three states and always shows the right one: the selected
flow's steps, the selected stage's purpose and its skills, or the selected skill's card with
what it comes from and hands on to. Every item in the panel is a button that selects the thing
it names, so the panel is a second way to walk the map. With nothing selected it explains how
to read the map in two sentences. Escape clears, clicking the sheet clears, and the fit button
is always one click away.

### 3. The skills page jumped between pages

Forty-five cards in a two-column grid is a long scroll, and every card was a link to a
separate page, so comparing two skills meant opening both, reading both, and coming back twice.
The cards also tried to say everything at once: a title, a three-line summary, a badge and a
command each, which is why the page was long.

**What changed.** The page is a library. The left rail lists the fourteen folders with live
counts; the shelves list skills as compact rows (ink dot, title, one-line summary, tool badge,
command). A row opens the skill in a drawer from the right, with the whole detail view: the
command to copy, what it does, when to reach for it, when to reach for something else, where
it fits, what it touches, and previous and next. The open skill lives in the address as
`?skill=<id>`, so a deep link, the back button and a refresh all land on the same drawer. The
full page at `/skills/<id>` still exists for direct links and is reachable from the drawer.
Search covers trigger phrases and exclusions, and an empty result says so.

### 4. The colour was loud in every corner at once

The fluorescent press (Fluorescent Pink `#FF48B0`, a federal Blue, Sun Yellow `#FFE800`)
appeared at full strength on every page inside 1.5px black keylines. Each ink was defensible
on its own; together, across a whole site, the sheet read as brutalist rather than printed.
The pink in particular appeared as a button, a tag, a wire colour, a shadow and a
misregistration ghost on the same screen.

**What changed.** The Riso process stays. The drums were reloaded with named inks from Sanzo
Wada's *A Dictionary of Color Combinations*: Eupatorium Purple with Corinthian Pink as its
tint, Violet Blue with Salvia Blue as its tint, Cream Yellow for the gates, and four deep
inks (Cotinga Purple, Olive Green, Plumbeous, Carmine Red) for the map's meanings. The rule
that governs them is **flashes, not surfaces**: colour lives in dots, beads, rules, ghosts and
small pills, a tint may be a ground, a solid may not. The black keyline is emphasis only; every
card now has a firm grey edge and a soft corner. Grain came down from 19% to 11%. Syne came
down from 800 to 700. The stock, which was the thing worth keeping, did not change. Every
figure was recomputed and is recorded in the tokens; the four text steps and the links clear
WCAG AA on the stock, and the two inks that do not (Olive, Plumbeous) are barred from setting
a word. See [`brand/colour.md`](../brand/colour.md).

### 5. Smaller findings, fixed in passing

- The map had hard-coded hex colours in the engine, the config and three stylesheets, so a
  brand change could not reach it. Every colour on the site now resolves to a token, and the
  retired-colour guard knows the fluorescent set.
- The systems map drew the vault in Sun Yellow, which broke the rule that yellow means a gate.
  It is lavender now.
- Links were set in the old blue in some places and in black in others. Links are Violet Blue.
- The mobile map opened zoomed into the first stage with no way to move except panning. The
  stage chips now carry the reader along, and the stage keeps its height on a phone.
- The dev server's error overlay was being read as a design flaw during the audit. It was a
  stale compile error. Mentioned so the next person does not chase it.

### 6. Found, not fixed

- Two pre-existing lint errors (`app/app/week/page.tsx` calls `Date.now` during render;
  `components/landing-experience.tsx` sets state inside an effect). Neither is visible to a
  reader. Worth a separate change.
- The landing page is long. It argues well, but at eleven beats it asks a lot of a stranger.
  A shorter version that trusts the hero and the crew would be worth testing.
- The map's fitted view on a 1280 screen still shows labels at about 7px. That is the physics
  of fifty-three tiles on one screen, and the design now relies on the chips and the zoom for
  reading rather than on the fit. If the OS passes seventy skills, the next move is a third
  band or a collapsed-stage mode, not smaller type.
- The Open Graph image was re-inked but not redrawn. It still carries the old composition.

## How to judge it

The brief for the redesign, in the words it was given: papery, minimalist and classic, with
flashes of vivid but not flashy colour, and a feeling that the site is something you talk to,
behind which agents loop, think, connect and hand on. The tests for that are plain:

- Can a newcomer say where they are on the map within a few seconds of landing on it?
- Can they open five skills in a row without losing their place?
- Is there any screen with more than one flash of colour per component?
- Does anything move that does not explain a relationship?

The map's ambient beads, one at a time along one wire, are the one deliberate answer to the
last question, and they switch off for anyone who has asked for reduced motion.
