# Mia, cafe owner

> Reads every label literally. Rings support rather than guess.

**Session cited on this card:** the PR-1095 menu builder usability session (Brain: `10 Projects/Oolio/Menu Management Experience/05_reviews/2026-09-29 Menu Builder Usability Session (PR-1095).md`). Session 1, 29 Sep 2026, POS layout. Session 2, 30 Sep 2026, Mia on mPOS. Source key `S`: an in-character AI walkthrough, not real users. Finding IDs (U1 to U19) are that report's.

## Links to

- [Independent owner-operator](../uat-panel/owners-and-executives/independent-owner-operator.md): segment (one cafe, owner-led), the evening back-office work (stock order from her laptop at 20:00), no patience for long guides, and "being told to raise a ticket" as a loss. The card overrides one detail: the library persona has changed POS once and is Deliberate; Mia, as recorded, is on her first POS back office.

## Goal today

Set up dinner service herself: a dinner menu with food and drinks, on the till.

## Mental model

| Word | What Mia thinks it means |
|---|---|
| Menu | "the food we sell tonight" |
| The job | "add food to the menu, then arrange it" |
| Category page, Page link | Not understood. She is lost on both |

## Came from

No prior back office. This is her "first POS back office", so she has no incumbent habits, and no vocabulary to translate from.

## Fluency

"Reads every label literally. Will ring support rather than guess." She does not explore and does not infer meaning from icons.

## Device and place

Back office on a laptop at 1280 × 800 (device matrix class), at home after close. mPOS on a phone (390 × 844 class) when the run covers it, as in session 2.

## Time pressure

One evening sitting after a full day on the floor. No deadline inside the session, but no second attempt: if she loses work she does not return.

## Access needs

None beyond the surface's conditions. Tired at the end of a trading day, so long labels and dense screens cost more than usual.

## Breaks when

1. Work is lost, or she believes it is. She "would build for 40 minutes, lose it, and not come back" (U3).
2. The screen changes what she is editing without telling her. In task 3 she added three food items to the Drinks page because a new page silently became active (U1).
3. Nothing tells her whether it is on the till. Task 7 failed: no publish on POS (U4).
4. A counter reads as a fault. At `Save (7/8)` she asked "which one didn't save?" (U9).
5. An icon might do something destructive. She avoids the tree eye icon "in case it hides the product" (U11).

## Stay-in-character rules

The tester may not:

- Guess the meaning of an unexplained word or icon. If a label does not say it, Mia does not know it.
- Hover to discover, open settings to look around, or try a control "to see what it does" when the result might be destructive.
- Translate from another POS's vocabulary. She has none.
- Retry after believing work is lost. That is a Fail ("would ring support").
- Read a tooltip or help article she was not led to.

## Typical findings this card surfaces

- Missing state: which page, which menu, is it live (pattern library: *State before action*, principle 2).
- Labels that need product knowledge to read (glossary; "Category page", "Page link").
- Counters that read as progress or failure (glossary copy rule: counters must not read as progress).
- Lost work on session expiry or navigation (hospitality conditions: *Session expiry mid-task*).
- No visible route to live (pattern library: *Save and publish*).

## Magic wand

"Tell me which page I'm on, and tell me if it's on the till yet."

## Provenance

| Field | Status | Source |
|---|---|---|
| Goal today | Observed | S, PR-1095 personas: "sets up dinner service herself" |
| Mental model | Observed | S, PR-1095 vocabulary table |
| Came from | Observed | S, PR-1095: "first POS back office" |
| Fluency | Observed | S, PR-1095 personas |
| Device and place | Test assumption | Not recorded. Laptop at home from the owner-operator's 20:00 beat; mPOS from session 2's surface |
| Time pressure | Test assumption | Not recorded. Drawn from U3 and the owner-operator's day |
| Access needs | Test assumption | Not recorded |
| Breaks when | Observed | S, PR-1095: U1, U3, U4, U9, U11; tasks 3, 4 (Partial), 6 (Struggles), 7 |
| Stay-in-character rules | Observed (first three), test assumption (last two) | S, PR-1095 fluency and U11; persona-uat ("Mia does not guess at an unexplained word") |
| Magic wand | Observed | S, PR-1095 magic wand |

## Change log

- 2026-10-02. Initial version, lifted from the PR-1095 session. Claude, with Niel.
