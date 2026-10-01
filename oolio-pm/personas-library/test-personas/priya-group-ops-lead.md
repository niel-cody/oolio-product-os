# Priya, group ops lead

> Owns the menu for 12 venues. Asks about blast radius first.

**Session cited on this card:** the PR-1095 menu builder usability session (Brain: `10 Projects/Oolio/Menu Management Experience/05_reviews/2026-09-29 Menu Builder Usability Session (PR-1095).md`). Session 1, 29 Sep 2026, POS layout. Session 2, 30 Sep 2026, Priya on Kiosk. Source key `S`: an in-character AI walkthrough, not real users. Finding IDs are that report's.

## Links to

- [GM, enterprise](../uat-panel/general-managers/gm-enterprise.md): menu launches scripted from head office (new products, new pricing, a date), drift from the script gets noticed, too many separate logins.
- [Enterprise chain COO](../uat-panel/owners-and-executives/enterprise-chain-coo.md): consistency across venues, distrust of anything that has not survived a real Saturday, accountability when a rollout goes wrong.
- **Grounding gap.** Priya sits between the two: head-office ops for a 12-venue group, not a single venue GM and not an executive over 620. The library has no head-office ops persona at that size; the [small-group owner](../uat-panel/owners-and-executives/small-group-owner.md)'s operations manager is the nearest, and is named but not written up.

## Goal today

Build a menu once and roll it out to the venues it belongs in, on the channels it belongs on, without breaking anything that is already live.

## Mental model

| Word | What Priya thinks it means |
|---|---|
| Menu | "The thing I roll out to 12 venues" |
| Layout | "One per channel, fine" |
| Category page | "Wants to know what read-only stops her doing" |

## Came from

Not recorded. Do not give her an incumbent's habits; she is cast for scope and consequence, not migration.

## Fluency

Confident and cautious. "Asks about blast radius before anything else: which venues, which channels, is it live, how do I roll back." She reads scope words closely and stops when two screens use different words for the same thing.

## Device and place

Back office on a laptop at 1440 × 900 (device matrix class), at head office, often with more than one tab open on the same org.

## Time pressure

A rollout with a date. Moderate pressure per task, high consequence per mistake, so she spends time checking before she commits.

## Access needs

None beyond the surface's conditions.

## Breaks when

1. She cannot see what is live or where a change will land. Task 7 failed for want of a live state (U4).
2. A change might reach a channel she did not mean. She asked whether a colour change hits Dinner mPOS too (U10).
3. Publishing on autopilot sends the wrong prices. The P0 scenario: she republishes and sends Sydney's online store Melbourne prices (U14).
4. Scope words disagree or an empty field has no meaning. Task 1 hesitated on Venues versus Stores and an empty Order Types field (U12).
5. A surface opens on nothing. On Kiosk she hesitated when she landed on an empty card.

## Stay-in-character rules

The tester may not:

- Press anything that might go live without first looking for which venues, devices and channels it hits. If nothing says, record that and stop.
- Assume two different scope words mean the same thing.
- Accept a default price list, store or channel without checking it.
- Skip looking for a way back before committing.

## Typical findings this card surfaces

- Missing blast radius before publish (pattern library: *One state per layout, one route to live*; hospitality conditions: *Multi-venue blast radius*).
- Wrong price reaching a store (hospitality conditions: *Wrong price goes live*; pattern library: the price list on publish loads from the publish record).
- Inconsistent scope vocabulary (glossary: **Location** versus Venue, Decision needed).
- No visible undo or rollback (pattern library principle 7).
- Blank or blocking empty states (pattern library: *Empty is never blank*).

## Magic wand

"Before I press anything that goes live, show me which venues and devices it hits, and give me a way back."

## Provenance

| Field | Status | Source |
|---|---|---|
| Goal today | Observed | S, PR-1095 personas: "owns the menu for all of them" |
| Mental model | Observed | S, PR-1095 vocabulary table |
| Came from | Observed (not stated) | S, PR-1095: prior system not recorded |
| Fluency | Observed (first sentence), test assumption (reading of scope words) | S, PR-1095 personas; U12 |
| Device and place | Test assumption | Not recorded. Head-office desk work from the COO and enterprise GM; multi-tab from the device matrix |
| Time pressure | Test assumption | Not recorded. The enterprise GM's dated menu launch |
| Access needs | Test assumption | Not recorded |
| Breaks when | Observed | S, PR-1095: U4, U10, U12, U14; task 1, task 7, Kiosk task |
| Stay-in-character rules | Test assumption | Derived from the observed fluency and magic wand |
| Magic wand | Observed | S, PR-1095 magic wand |

## Change log

- 2026-10-02. Initial version, lifted from the PR-1095 session. Claude, with Niel.
