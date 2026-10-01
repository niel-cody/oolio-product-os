# Test persona card template

Copy this file into `test-personas/` to create a card. Fill every section; an empty section is not allowed, but "Not recorded" with a provenance mark is. Keep it to half a page or a page. British English, no em dashes, no buzzwords, no invented Oolio features, numbers or customers.

A card sits on top of a UAT panel persona. Do not repeat the persona's bio, goals or KPIs; add only the behaviour a tester needs to use a screen in character. Replace the `[bracketed]` text and remove the brackets.

---

# [Card name, role-led: "Mia, cafe owner" or "Head chef at the pass"]

> [One line. How this person uses a screen, in nine words or fewer.]

## Links to

- [UAT panel persona name](../uat-panel/<category>/<file>.md): [which details this card draws on]

## Goal today

[The one job they sat down to do, in their words.]

## Mental model

[What they think the system's objects and words mean. A short vocabulary table if the session recorded one.]

## Came from

[The prior system, how long, and the habits it left them with. "No prior system" is a valid answer.]

## Fluency

[Tech confidence, and reading behaviour: reads every word, scans for a familiar word, guesses, or stops and rings support.]

## Device and place

[Surface and viewport class from `../../references/qa/device-matrix.md`, input mode, and where they are: at a desk, behind the bar, at the pass.]

## Time pressure

[How long they give a task before abandoning it, and what interrupts them.]

## Access needs

[Situational or permanent constraints on input and perception: glare, wet or gloved hands, noise, one hand, keyboard only. "None beyond the surface's conditions" is a valid answer.]

## Breaks when

1. [The moment that stops them, most damaging first]
2. [ ]

## Stay-in-character rules

The tester may not:

- [Something this person would not do, so the tester must not do it either]
- [ ]

Breaking a rule is declared in the notes, and the task is capped at *Pass, with help*.

## Typical findings this card surfaces

- [Class of finding, with a pattern-library, glossary or hospitality-conditions reference where one exists]

## Magic wand

[Their one change, quoted, only where a session recorded it. Otherwise: "Not recorded. To be captured in the first real session."]

## Provenance

| Field | Status | Source |
|---|---|---|
| Goal today | Observed / Test assumption | [Session and finding ID, or the UAT panel details drawn on] |
| Mental model | | |
| Came from | | |
| Fluency | | |
| Device and place | | |
| Time pressure | | |
| Access needs | | |
| Breaks when | | |
| Stay-in-character rules | | |
| Magic wand | | |

Observed fields cite the source key: `S` for a synthetic session, `U` plus a letter for a real-user session. Test assumptions are validated by real UAT through `uat-session-kit`.

## Change log

- [YYYY-MM-DD]. Initial version. [Author].
