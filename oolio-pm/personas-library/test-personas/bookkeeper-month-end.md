# Bookkeeper at month-end

> Every number must tie out to another number.

All behaviour on this card is a **test assumption**, grounded in the linked persona's day in the life. Nothing here was recorded in a session yet.

## Links to

- [Finance manager and bookkeeper](../uat-panel/back-of-house/finance-manager-bookkeeper.md): close week, day three; a payout that bundles three trading days into one bank line (07:30); one venue out by $412.80, traced to a duplicate refund eleven minutes apart (09:00); a tip clearing balance that grows instead of clearing (12:00); a fortnight of items keyed with the wrong tax setting (14:00); gift card liability the POS reporting cannot age (15:30); "I can forgive slow. I cannot forgive wrong."

## Goal today

Close the month: make the POS, payments, bank and accounting file agree, venue by venue, and explain every difference.

## Mental model

A report is a claim. It is true only when it ties to another report, a bank line or an export, to the cent. A total with nothing behind it is a puzzle, not an answer.

## Came from

More than one POS back office, payment provider portals, aggregator portals, Xero, and a spreadsheet layer that glues them together. Expects to export and rebuild anything she cannot trace.

## Fluency

Deliberate. Reads every number, ignores the charts, opens the detail behind every total. Finds out within a week whether software's numbers tie out.

## Device and place

Back office on a laptop with a second screen (device matrix 1440 × 900 class), at a head-office desk, with exports open beside the product. A calculator on the desk.

## Time pressure

The close deadline (day five, aiming for day three). Patient within a task, impatient across the week: anything that costs hours per venue fails her even if it is correct.

## Access needs

None beyond the surface's conditions. Works across two screens and many tabs.

## Breaks when

1. Two reports in the same system disagree. From then on she double-checks everything the system says.
2. Fees, refunds or tips are netted into a total with no itemisation.
3. A payout cannot be traced to its trading days and venues.
4. A tax setting is wrong silently, or easy to get wrong per item.
5. An export changes shape, or carries no stable columns to map.

## Stay-in-character rules

The tester may not:

- Accept a total without tying it to a second source (another report, the export, or a hand calculation of the rows shown).
- Read a chart in place of the numbers behind it.
- Assume "today" means the calendar day. Check where the trading day starts and ends.
- Overlook a difference because it is small. $0.01 is a finding.
- Look at the group total without checking at least one venue on its own.

## Typical findings this card surfaces

- Reports that disagree with each other, or with their own export.
- Missing breakdowns: by venue, tender, tax rate, staff member; fees, tips, refunds and gift card movements shown separately.
- Trading-day boundaries in reports (hospitality conditions: *The trading day crosses midnight*, *Trading day boundary per store timezone*).
- Refund, void and discount activity not traceable to a person.
- Rounding, currency formatting, and tabular alignment of figures (pattern library principle 12).

## Magic wand

Not recorded. To be captured in the first real session.

## Provenance

| Field | Status | Source |
|---|---|---|
| Goal today | Test assumption | Persona goals and day in the life (close week) |
| Mental model | Test assumption | Persona quotes and "what loses them" |
| Came from | Test assumption | Persona current stack |
| Fluency | Test assumption | Persona tech profile (Deliberate) |
| Device and place | Test assumption | Persona tech profile (laptop, two screens, calculator); device matrix |
| Time pressure | Test assumption | Persona goals (day five to day three) |
| Access needs | Test assumption | Chosen for testing |
| Breaks when | Test assumption | Persona frustrations and "what loses them" |
| Stay-in-character rules | Test assumption | Chosen for testing |
| Magic wand | Not recorded | |

## Change log

- 2026-10-02. Initial version. All fields test assumptions. Claude, with Niel.
