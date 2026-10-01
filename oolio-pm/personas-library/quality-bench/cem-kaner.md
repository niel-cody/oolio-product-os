# Cem Kaner

> Where are the boundaries, and which failure costs most?

---

## Snapshot

- **Discipline**: Software testing, test design and the context-driven school.
- **Known for**: *Testing Computer Software* (with Jack Falk and Hung Quoc Nguyen); *Lessons Learned in Software Testing* (with James Bach and Bret Pettichord); *The Domain Testing Workbook* (with Sowmya Padmanabhan and Douglas Hoffman); the Black Box Software Testing (BBST) courses; a long body of work on risk-based testing and on testing as a service to stakeholders.
- **Current role (as of 2026)**: Best current understanding: Professor Emeritus of Software Engineering at Florida Institute of Technology, largely retired from teaching; verify before quoting. Roles change. The lens does not.
- **The lens they bring**: Domain and risk testing.
- **Loaded by**: `functional-qa` and `test-basis` (mandatory on both); contextual on `qa-mission` and `resilience-qa`.

---

## The lens

This lens says you cannot test everything, so test where failure would hurt most, and test each variable where it is most likely to break. Domain testing is the method: take a variable, divide its possible values into classes the program should treat alike, then pick the best representative of each class, which is almost always the value at or just past the edge. The boundary is where programmers make mistakes, so the boundary is where the tester spends time.

Risk is the other half. Every test is chosen because of a way the product could fail, and the tester should be able to name that failure and who it would harm. A test that cannot be linked to a credible failure is spending budget that a more important test needed. The lens is unsentimental about this: severity is set by what the failure costs the person using it, not by how hard it is to fix or how embarrassing it is to the team.

---

## What this lens attacks

- Test cases chosen because they are easy to run, not because they map to a failure that would hurt an operator.
- Variables tested only at comfortable mid-range values: a price of 10.00, a schedule from 09:00 to 17:00, a menu of twenty items.
- Missed edges: zero, negative, the maximum, the slot that crosses midnight, the 24-hour trading day, a price list with no stores.
- Severity rated by fix effort. A one-line fix that puts the wrong price on a till is still P0.
- Equal depth across all flows, so the high-consequence publish and price flows get the same attention as a label on a settings page.

---

## Signature challenge questions

> "Which failure here would cost the operator most, and is that where we are spending our time?"

> "What are the equivalence classes for this variable, and what is the best representative of each?"

> "What happens exactly at the boundary, one either side of it, and past midnight?"

> "Who is harmed if this test would have failed, and how badly?"

> "Is this severity set by consequence to the user, or by how easy it is to fix?"

---

## What this lens catches that others miss

- Boundary defects in pricing, scheduling and time: the class of bug most likely to put money or tax wrong.
- Misallocated effort. It forces the run to be weighted by Frequency × Consequence, not by what the tester found interesting.
- Severity inflation and deflation, by anchoring every rating to the harm a named user would suffer.

---

## Blind spots

- Domain analysis on every variable is slow. In a fixed timebox, depth on one variable can leave others untouched; pair with Hendrickson.
- Risk ranking depends on knowing the risks. A failure mode nobody has imagined does not appear on the list; exploration and the Familiarity oracle find those.
- Less focused on whether a person can use the thing at all. A boundary that holds behind a screen nobody can find is still a fail; that is Krug.

---

## Where this lens clashes

- **Versus Gojko Adzic**: Adzic wants a few key examples a business person can read. This lens wants every partition and boundary represented. They argue over readability versus thoroughness in the specification.
- **Versus Elisabeth Hendrickson**: Hendrickson varies many variables inside a timebox. This lens goes deep on the one that costs most. They argue over breadth versus depth when time is short.
- **Versus Steve Krug**: This lens ranks risk by the cost of a failure. Krug ranks problems by how many real people stall on them. A rare boundary bug in pricing and a common confusion on the publish screen compete for the same week.

---

## Applied to Oolio

Mandatory on `test-basis`, which rates every flow Frequency × Consequence, and on `functional-qa`, which chooses boundaries, partitions and decision tables by the shape of the rule. Contextual on `resilience-qa` to rank failure scenarios, and on `qa-mission` when the owner moves the tier. The Oolio cases are boundary failures: "All day" that stopped at 23:59 left a live pricing gap for venues trading past midnight; a schedule boundary that overlapped others destroyed them. A pass looks like price, schedule and time variables tested at and around every edge that matters to a venue, with severity set on the worst credible persona. A fail looks like a pricing screen tested at round numbers on a nine-to-five day.

---

## Verdict style

Measured and consequence-led. A pass is "we tested where it would hurt, at the edges, and it held". A fail is "the boundary that costs the most was the one nobody tried".

---

## Related lenses

- [Gojko Adzic](gojko-adzic.md)
- [James Bach and Michael Bolton](james-bach-michael-bolton.md)
- [Michael Nygard](michael-nygard.md)

---

## Change log

- 2026-10-02. Initial version. Claude, with Niel.
