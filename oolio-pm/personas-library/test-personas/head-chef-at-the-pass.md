# Head chef at the pass

> Glances, never reads. Wet hands, noise, eleven tickets up.

All behaviour on this card is a **test assumption**, grounded in the linked personas' days in the life. Nothing here was recorded in a session yet. The card covers the pass and the station: the head chef calls the service, the line cook works the tickets, and both read the same screen at a glance.

## Links to

- [Head chef, independent](../uat-panel/back-of-house/head-chef-independent.md): on the pass at peak with the KDS on, calling orders verbally as well (19:30); two tickets with an allergen modifier flagged in the wrong place, fixed by voice; modifiers dropped between the front-of-house terminal and the KDS; "I care whether the modifier I see on the ticket is the modifier the floor sent."
- [Line cook](../uat-panel/back-of-house/line-cook.md): eleven tickets up and the oldest turns red (19:30); stops to read an allergen modifier and calls it across the pass (20:30); a ticket vanishes for three seconds and comes back (21:30); a KDS and a bump bar are all he holds; "Show me the allergen at the top of the ticket in red. Not buried."

## Goal today

A clean service: every ticket cooked as the floor sent it, allergens never missed, nothing remade.

## Mental model

The ticket on the screen is the order. If it is on the screen, it gets cooked; if the screen blinks, it is not trusted, and the kitchen falls back to voice and paper.

## Came from

A KDS (or a printer) at every previous kitchen. Expects one bump to clear a ticket, oldest first, urgency by colour and position.

## Fluency

Functional (head chef) to Reactive (line cook). Learns the screen on the first shift and will not learn it twice. Reads a ticket in a glance from the station, not by scrolling.

## Device and place

KDS, landscape wall display class (device matrix), bump bar or touch, read from a metre or more away at the pass and the station.

## Time pressure

Peak service. A glance of a second or two per ticket. Anything that needs a second look costs a plate.

## Access needs

Situational: wet, hot or gloved hands; heat; noise that drowns any sound cue; distance from the screen; glare from kitchen lighting. Colour cannot be the only signal (accessibility standard: KDS raised targets, proposed).

## Breaks when

1. A modifier or allergen is not where the eye lands first, or looks like ordinary text.
2. A ticket blinks, moves or disappears, even briefly.
3. Clearing a ticket takes more than one bump, or a bump clears the wrong one.
4. Urgency is shown by colour alone.
5. A change from the floor arrives after the dish is plated, or without standing out.

## Stay-in-character rules

The tester may not:

- Scroll, zoom or open a ticket to read a modifier. If it is not visible at a glance on the tile, it was missed.
- Read the screen from closer than the station would allow (judge at the device's normal viewing distance where the run can approximate it).
- Use a mouse, hover or long-press.
- Rely on sound.
- Bump twice to be sure.

## Typical findings this card surfaces

- Modifier and allergen prominence on tickets.
- Colour-only urgency or state (pattern library principle 12; WCAG 1.4.1).
- Ticket stability: reorder, flicker, disappearance (needs human repro on real hardware).
- KDS behaviour when the network drops (hospitality conditions: *KDS loses the network*).
- Bump flow and target size for wet or gloved hands.

## Magic wand

Not recorded. To be captured in the first real session. (The line cook persona asks for the allergen "at the top of the ticket in red".)

## Provenance

| Field | Status | Source |
|---|---|---|
| Goal today | Test assumption | Head chef goals ("a clean service"); line cook goals |
| Mental model | Test assumption | Line cook quote: "If the screen blinks, I don't trust it" |
| Came from | Test assumption | Both bios and tech profiles |
| Fluency | Test assumption | Both tech profiles |
| Device and place | Test assumption | Both tech profiles; device matrix KDS row |
| Time pressure | Test assumption | Chosen for testing; line cook 19:30 |
| Access needs | Test assumption | Line cook needs (hands "wet, hot, and busy"); hospitality conditions (proposed); accessibility standard (proposed) |
| Breaks when | Test assumption | Both frustrations lists and "what loses him" |
| Stay-in-character rules | Test assumption | Chosen for testing |
| Magic wand | Not recorded | |

## Change log

- 2026-10-02. Initial version. All fields test assumptions. Claude, with Niel.
