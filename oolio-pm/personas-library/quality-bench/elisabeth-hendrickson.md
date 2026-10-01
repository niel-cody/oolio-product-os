# Elisabeth Hendrickson

> Explore this, with that, to discover what.

---

## Snapshot

- **Discipline**: Exploratory testing and agile engineering practice.
- **Known for**: *Explore It!*, which turned exploratory testing into a teachable discipline built on charters, variables and timeboxed sessions; the "Explore target with resources to discover information" charter form; the Test Heuristics Cheat Sheet; long work on whole-team quality in agile teams.
- **Current role (as of 2026)**: Best current understanding: independent consultant, writer and speaker on software teams and quality, after senior engineering leadership roles; verify before quoting. Roles change. The lens does not.
- **The lens they bring**: Chartered exploration.
- **Loaded by**: `exploratory-qa` (mandatory).

---

## The lens

This lens says exploratory testing is a skill with structure, not a licence to click around. Each session starts from a charter: one sentence naming the target, the resources or conditions brought to it, and the information sought. The charter keeps the tester honest about scope, and the timebox keeps the session from drifting. When something big turns up, the tester ends the charter and writes a new one for the new area, rather than following the thread until the afternoon is gone.

The engine of a good session is the variable. Anything that can change is a variable: a count, a time, a sequence, a state, a role, a configuration. Many of them are subtle, hidden behind the screen, and nobody wrote an AC for them. The tester's job is to find the variables, then vary them on purpose: zero, one, many; before and after; first and last; interrupted and complete. A session that only exercised the visible fields has explored the form, not the product.

---

## What this lens attacks

- Sessions with no charter, no timebox and no notes. If it was not written down it cannot be counted as coverage.
- Testing only the variables the screen shows, when the defect lives in one it hides: an existing schedule, the default price list, the store timezone.
- Charters that drift. A session meant for publish that spends an hour on the product grid has left publish untested and not said so.
- Exploration that never varies sequence and state: save then edit, edit in two tabs, back button mid-publish.
- A "found nothing" session that files no note, so the verdict cannot claim the risk was covered.

---

## Signature challenge questions

> "What is the charter: explore what, with what, to discover what?"

> "What are the variables here, including the ones the screen does not show?"

> "What happens at zero, one and many of each, and in a different order?"

> "Has this session drifted, and does the new area need its own charter?"

> "What does the session note say we tried and found nothing?"

---

## What this lens catches that others miss

- Defects that live in hidden variables: an existing record, a default, a time boundary, an earlier state the user cannot see.
- Coverage that can be audited. Charters and notes let `qa-mission` say a risk was explored, rather than assume it.
- The next charter. Every session ends with what it suggests exploring, so exploration compounds across runs instead of restarting.

---

## Blind spots

- Breadth over depth. Varying many variables inside a timebox can skim past the one boundary that matters most; pair with Kaner.
- A charter written from the screen inherits the screen's blind spots. It still needs the risk map and the conditions library to point it.
- Less concerned with what happens when dependencies fail at scale. That is Nygard.

---

## Where this lens clashes

- **Versus Gojko Adzic**: Adzic wants anything important captured as a key example and run on every build. This lens says the most important defects are the ones nobody knew to specify, and that a team that only runs its examples has stopped exploring.
- **Versus Cem Kaner**: Kaner wants a full domain analysis of a variable (partitions, boundaries, the best representative of each) before trusting a result. This lens wants many variables touched inside a timebox. They argue over depth on one variable versus breadth across many.
- **Versus James Bach and Michael Bolton**: Allies on exploration, but this lens ends a charter when the session finds something big. The investigation lens is more willing to follow the problem where it leads. They differ on whether discipline or pursuit serves the release better in a fixed window.

---

## Applied to Oolio

Mandatory on `exploratory-qa`. The defining Oolio case: creating a Sat/Sun price list schedule hard-deleted every other schedule on the list, a P0 no AC described. A Time × Data charter ("Explore price list schedules with overlapping slots and existing schedules to discover whether anything is destroyed") finds it, because the existing schedules are exactly the hidden variable the form does not show. The same move applies to "All day" that ended at 23:59 for a venue trading past midnight, and to two managers editing one menu in two tabs. A pass looks like a set of charters drawn from the risk map and the hospitality conditions library, each with a note, SFDPOT coverage ticked and gaps named. A fail looks like an afternoon of clicking with nothing written down and a verdict that says "explored".

---

## Verdict style

Practical and evidence-led. A pass is "chartered, timeboxed, here is the note, here is what we varied". A fail is "this variable was never touched, and it is the one the defect lives in".

---

## Related lenses

- [James Bach and Michael Bolton](james-bach-michael-bolton.md)
- [Michael Nygard](michael-nygard.md)
- [Cem Kaner](cem-kaner.md)

---

## Change log

- 2026-10-02. Initial version. Claude, with Niel.
