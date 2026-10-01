# Test design techniques

Coverage is chosen, not hoped for. `functional-qa` picks the technique by the shape of the rule under test and records which it used against each AC, so a reviewer can see why these cases and not others. `test-basis` uses the same shapes to rewrite untestable ACs as examples.

## Pick by the shape of the rule

| The rule looks like | Technique | What you write |
|---|---|---|
| A limit, a range, a length, a quantity, a time slot | **Boundary values and equivalence partitions** | One case per partition, plus each boundary and one either side (min−1, min, max, max+1). Zero, empty, one, many |
| "Which one wins" when several conditions combine | **Decision table** | Every combination of conditions as a column, the expected outcome per column, collapsed only where a condition is provably irrelevant |
| A lifecycle: draft, active, archived, deleted, restored | **State transition** | Every valid transition, and every invalid one attempted (archive an archived item, restore a never-deleted one, publish from bin) |
| Many independent parameters (order type × channel × device profile × price list) | **Pairwise (all-pairs)** | A set of cases covering every pair of values at least once. Add any full combination a decision or incident has called out |
| A business rule stated in words | **Specification by example** | Given / When / Then, with real values, at least one positive and one negative |
| Past failure, a known weak spot | **Error guessing** | Cases aimed at where it broke before: incident history, the last release's findings, the Familiarity oracle |

## Rules for every AC

1. **At least one negative case per AC.** A pass on the happy path is not a pass on the AC. The negative case proves the rule is enforced, not merely that the easy path works.
2. **Concrete values, never placeholders.** "A price of $0.00", "a name of 64 characters", "a schedule from 23:45 to 00:15". A case without values cannot be re-run identically.
3. **One AC, one verdict.** Pass, Fail, or Blocked (with what blocked it). Partial is not a verdict at AC level; split the AC or report the failing case.
4. **Untestable is a finding.** An AC that cannot be written as an example ("the experience is intuitive", "performs well") is reported as untestable with a suggested rewrite. That feeds back to the story owner, which is the cheapest shift-left there is.

## Example rewrite

> **AC as written:** The user can schedule a price list.
>
> **Untestable because:** no outcome stated for overlaps, no boundary, no statement of what happens to existing schedules.
>
> **Suggested examples:**
> - Given a price list with a Mon to Fri 09:00 to 17:00 schedule, when the user adds Sat and Sun 09:00 to 17:00, then both schedules exist and the Mon to Fri schedule is unchanged.
> - Given a schedule from 22:00 to 02:00, when the trading day closes at 04:00, then the price applies until 02:00 on the following calendar day within the same trading day.
> - Given two price lists scheduled for the same order type and slot, when both are active, then the list a person has ruled should win is the one charged. *(No oracle yet: raise Decision needed, and mark the case Blocked until it is ruled. A case is the one place a pending ruling is allowed to stand in for a value.)*

## Regression packs

`functional-qa` keeps one regression pack per product area: the scenarios that matter, in Given / When / Then, with the AC or incident each came from. Each release re-runs the pack for every area in the blast radius. A scenario earns a place in the pack when it guards a P0 or P1, a high-consequence flow, or an incident. A scenario that has not failed in six releases and guards nothing high-consequence is proposed for retirement to engineering's own automated suite, which is where regression belongs once it is stable (push checks down the pyramid).

The pack lives with the product area's documentation, one Confluence page per product area (not per epic, because it outlives any one epic), linked from every QA Review page that ran it, and written only by `defect-writer` on approval. It is not kept in this plugin, because it is product data, not method.
