# The Quality Bench

A standing bench of eleven testing lenses, loaded by the QA family to decide how a tester thinks about a build before, during and after a run. Each lens is a testing philosophy, inspired by the published work of a real practitioner. The Bench exists so that "I tested it" means something specific: investigated against an oracle, chartered, covered across the quadrants, broken at the boundaries, failed on purpose, and used by someone who was not told how it works.

These are lenses, not people to imitate, and not users to play.

---

## What the Bench is, and what it is not

Three things in the persona library sound alike and do different jobs.

| | The question | What it judges | Where |
|---|---|---|---|
| **The Design Council** | Is the design good? | Whether the design is sound by expert principles, before or after it is built | [`../design-council/`](../design-council/README.md) |
| **The Quality Bench** | Is the build right? | Whether the thing built does what our sources say, survives real conditions, and can be used by everyone | this folder |
| **The test persona cards** | Who is the tester pretending to be? | Nothing. A card is a set of constraints a tester runs in character (the literal reader, the Bepoz pub manager, the new casual) | [`../test-personas/`](../test-personas/) |

A Design Council lens can say a drawer is the wrong pattern. A Bench lens cannot: it can only say the drawer does not match the frame, traps the keyboard, loses work when the network drops, or contradicts the publish screen. Taste is not a finding here. A broken oracle is.

A Bench lens tells a tester **how to look**. A test persona card tells the tester **who to be while looking**. A run usually needs both: `persona-uat` runs the Bepoz pub manager card through the Krug lens; `accessibility-audit` runs the keyboard-only card through the Watson and Pickering lenses.

---

## The panel

| Lens | Inspired by | The question it asks | Loaded by | File |
|---|---|---|---|---|
| Testing as investigation | James Bach and Michael Bolton | What is our oracle, and are we testing or only checking? | every QA skill; mandatory on `exploratory-qa`, `test-basis` | [james-bach-michael-bolton.md](james-bach-michael-bolton.md) |
| Chartered exploration | Elisabeth Hendrickson | What are we exploring, with what, to discover what, and which variables have we not touched? | `exploratory-qa` | [elisabeth-hendrickson.md](elisabeth-hendrickson.md) |
| Whole-quadrant coverage | Lisa Crispin and Janet Gregory | Which of the four quadrants did this run cover, and which did it quietly skip? | `qa-mission`, `test-basis` | [lisa-crispin-janet-gregory.md](lisa-crispin-janet-gregory.md) |
| Specification by example | Gojko Adzic | Can this acceptance criterion be written as a concrete example with real values? | `test-basis`, `functional-qa` | [gojko-adzic.md](gojko-adzic.md) |
| Domain and risk testing | Cem Kaner | Where are the boundaries, and which failure costs the operator most? | `functional-qa`, `test-basis` | [cem-kaner.md](cem-kaner.md) |
| Stability under failure | Michael Nygard | What happens when the thing it depends on is slow, down, or half there? | `resilience-qa`, `exploratory-qa` | [michael-nygard.md](michael-nygard.md) |
| Assistive technology in use | Léonie Watson | Does it work with a real screen reader, not only in the accessibility tree? | `accessibility-audit` | [leonie-watson.md](leonie-watson.md) |
| Inclusive components | Heydon Pickering | Is this the right native element, or a div pretending to be one? | `accessibility-audit`, `design-conformance` | [heydon-pickering.md](heydon-pickering.md) |
| Component fidelity | Brad Frost | Is this the system's component, in all its states, or a lookalike? | `design-conformance` | [brad-frost.md](brad-frost.md) |
| System governance | Nathan Curtis | Is this deviation a bug, a deliberate exception, or a gap in the system? | `design-conformance` | [nathan-curtis.md](nathan-curtis.md) |
| Self-evident use | Steve Krug | Can someone with no briefing tell what to do, and did we watch a real person try? | `persona-uat`, `uat-session-kit` | [steve-krug.md](steve-krug.md) |

---

## Which lenses each QA skill loads

A skill loads its mandatory lenses on every run and its contextual lenses when the condition in brackets applies. Five lenses on one run is the ceiling. More than that and the findings stop agreeing on what matters.

| Skill | Mandatory | Contextual |
|---|---|---|
| `qa-mission` | Crispin and Gregory, Bach and Bolton | Kaner (when the owner moves the tier), Nygard (Full tier) |
| `test-basis` | Bach and Bolton, Adzic, Kaner | Crispin and Gregory (to check the plan reaches every quadrant) |
| `functional-qa` | Adzic, Kaner | Bach and Bolton (when an AC has no clear oracle or the sources conflict) |
| `exploratory-qa` | Bach and Bolton, Hendrickson | Nygard (network, concurrency and interruption charters) |
| `design-conformance` | Frost, Curtis | Pickering (any custom or lookalike component) |
| `accessibility-audit` | Watson, Pickering | Kat Holmes, from the Design Council (situational exclusion on POS, mPOS, Kiosk, KDS) |
| `persona-uat` | Krug | Bach and Bolton (the user-expectation oracle), Holmes from the Design Council (novice and low-confidence cards) |
| `uat-session-kit` | Krug | Watson (when an assistive-technology user is in the recruit), Crispin and Gregory (when the team is watching the sessions) |
| `resilience-qa` | Nygard | Kaner (to rank which failure scenario to run first) |
| `code-qa` | Kaner (risk by blast radius) | Bach and Bolton (what the tests check versus what they claim) |
| `defect-writer` | Bach and Bolton (no oracle, no defect) | Curtis (bug, deliberate exception, or system gap) |

Bach and Bolton is the one lens loaded across the whole family, because "no oracle, no defect" is its rule. On skills where it is not mandatory it is contextual, and it is always the lens to reach for when someone writes a finding that rests on preference.

---

## The bounded overlap with the Design Council

Kat Holmes **stays on the Design Council**. The Bench does not keep a copy of her lens and does not write a second inclusion lens.

`accessibility-audit` defers to the Holmes lens on **situational exclusion**: glare, wet hands, gloves, noise, interruption, a first-shift casual with limited English. Those are real exclusions, but most of them are not WCAG failures, and the audit must not report them as if they were. The split:

- **Watson and Pickering** (the Bench) own conformance and assistive technology in use. Their findings cite a WCAG 2.2 success criterion or a component reference rule.
- **Holmes** (the Design Council) owns who the design leaves out under real venue conditions. Her findings cite the hospitality conditions library or a test persona card, and go as Improvements or Decisions needed unless a raised surface target has been agreed.

When the two disagree about severity, the Bench lens rates WCAG failures and the Holmes lens rates situational ones. Neither borrows the other's oracle.

---

## The contradictions are the point

The lenses are chosen to disagree. Bach and Bolton say an automated check is not a test; Adzic says the examples are the specification and should run on every build. Hendrickson wants breadth across variables inside a timebox; Kaner wants depth on the one boundary that costs most. Frost wants the system component used as built; Pickering says the system component is itself a div pretending to be a button. Krug says watch three people this month; Watson asks whether any of the three used a screen reader. Each clash is written into both lens files.

A run that only heard one lens has a blind spot shaped exactly like that lens.

---

## The decision rule

When lenses clash, resolve the clash with this fixed order. It does not move from release to release.

1. **Operational correctness and data integrity first.** A schedule save that deletes other schedules, the wrong price reaching a till, a publish screen that misreports what is live. Anything that loses data or puts the wrong thing live outranks every other argument, including speed, coverage and elegance.
2. **Evidence over opinion: a finding needs an oracle.** A lens that cannot name the source that says the build is wrong has a question, not a defect. It goes as a Decision needed, never a Bug ([`../../references/qa/oracles.md`](../../references/qa/oracles.md)).
3. **Learnability over novelty.** If a new casual cannot get through it in one shift, a clever pattern that passes every check is still the wrong pattern. The Bench reports it; the Design Council and the Operator Council rule on it.

Operational reality is the floor. The hospitality personas and the hospitality conditions library hold it.

---

## House rules for this folder

These sit on top of the house rules in [`../personas.md`](../personas.md) and [`../CLAUDE.md`](../CLAUDE.md).

1. **Lenses, not impersonations.** Each file is a testing philosophy. It is a tool, not a tribute, and not a claim about what the person would say about Oolio.
2. **No invented quotes from real people.** The signature challenge questions are what the lens asks in a run. They are never quotations from the named practitioners. Do not attribute fabricated statements to a real person.
3. **The philosophy is the stable part.** Roles drift. Update them when convenient, and never let a role change weaken the lens. Where a current role is uncertain, the file says so.
4. **Every lens names its clashes.** A new lens names the gap it fills and the lens it argues with, inside the Bench and, where relevant, on the Design Council.
5. **No fabricated Oolio facts.** The real cases in the lens files come from the QA reference pack (`../../references/qa/`). Do not add numbers, customers or features that are not there.
6. **Use the template.** New lenses copy [`_quality-bench-template.md`](_quality-bench-template.md) and fill every section.

---

## Owner

Niel Cody (Product) owns the Bench, as part of the persona library. Proposals to add, retire or reweight a lens go through Product, with QA for the testing lenses and Design for the conformance and accessibility lenses.
