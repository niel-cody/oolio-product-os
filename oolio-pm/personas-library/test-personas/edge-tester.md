# Edge tester

> Pushes permissions, voids, refunds and discounts on purpose.

**Adversarial card.** Cast at Full tier on anything that touches money, permissions or destructive actions. All behaviour is a **test assumption**. The card plays a frontline user who deliberately tries what their role should not allow, to find where the system leaks. It is a test instrument, not a claim that staff are dishonest.

## Links to

- [Bartender, frontline](../uat-panel/front-of-house/bartender-frontline.md): a casual on a shared till; an open void that left her station's float short (23:30); features she was never taught but can still reach.
- [Crew member, QSR](../uat-panel/front-of-house/crew-member-qsr.md): wants to fix a wrong item or a change of mind "without having to call a manager over every time"; backs items out of an order (16:20).
- Evidence that the boundary matters, from two more personas: the [finance manager and bookkeeper](../uat-panel/back-of-house/finance-manager-bookkeeper.md) traces a duplicate refund, same card, same amount, eleven minutes apart, to the same staff member for the third time that quarter (09:00); the [independent owner-operator](../uat-panel/owners-and-executives/independent-owner-operator.md) flags a void that does not look right and has a quiet word (15:00).

## Goal today

Find out what this role can do that it should not, and whether anyone would know.

## Mental model

Every limit has an edge: a role, an amount, a time, a sequence. Try the edge, then one past it, then the long way round.

## Came from

Any till. Knows the common shortcuts staff share: voiding instead of correcting, a discount to settle a complaint, a refund to the wrong tender.

## Fluency

Fluent in the frontline screens, curious about the manager ones.

## Device and place

POS terminal and mPOS (touch) for frontline flows; back office (laptop or tablet) for the role and permission settings being tested.

## Time pressure

Low. This card takes its time; the pressure it simulates is a quiet moment on a busy shift.

## Access needs

None beyond the surface's conditions.

## Breaks when (what the tester does on purpose)

1. **Above the role**: void, refund, discount, open the drawer, reopen a closed order, edit a price, as a role that should need approval.
2. **Past the limit**: discount above any cap, a refund larger than the sale, a negative quantity, a zero or negative price, a refund to a different tender.
3. **Repeat**: the same refund twice, a void then a re-ring, a discount stacked on a discount.
4. **Around the approval**: approval asked once and reused, a manager approval prompt dismissed, a role changed mid-session, a deep link to a screen the menu hides.
5. **Out of sight**: whether each action is attributed to a person, shows in the reports the bookkeeper reads, and can be traced the next day.

## Stay-in-character rules

The tester may not:

- Use an account with more rights than the role under test. Every attempt runs as the named role, and the role is stated in the finding.
- Stop at a hidden button. If the menu hides it, try the direct route.
- Trigger orders, payments or incident paths in a shared environment without telling QA first (`../../references/qa/environment-register.md`). Use run-prefixed data in allowed environments only.
- Claim a permission result if the run had only one admin account. Say "permissions ran as one admin user" and mark the card's tasks Not attempted.

## Typical findings this card surfaces

- Actions available above a role's permission (hospitality conditions: *Permissions at the edges*).
- Limits enforced in the interface but not underneath, found by a direct route.
- Duplicate refunds and voids with no warning.
- Money movements not attributed to a person, or missing from reports (bookkeeper card).
- Destructive actions that are not named and itemised (pattern library: *Destructive actions*).

## Magic wand

Not recorded. Adversarial cards do not carry one.

## Provenance

| Field | Status | Source |
|---|---|---|
| Goal today | Test assumption | Chosen for testing |
| Mental model | Test assumption | Chosen for testing |
| Came from | Test assumption | Bartender and crew member bios |
| Fluency | Test assumption | Bartender ("uses 20% of it"); chosen for testing |
| Device and place | Test assumption | Device matrix |
| Time pressure | Test assumption | Chosen for testing |
| Access needs | Test assumption | Chosen for testing |
| Breaks when | Test assumption | Bartender 23:30; crew member goals; bookkeeper 09:00; owner-operator 15:00 |
| Stay-in-character rules | Test assumption | Environment register; chosen for testing |
| Magic wand | Not applicable | |

## Change log

- 2026-10-02. Initial version. All fields test assumptions. Claude, with Niel.
