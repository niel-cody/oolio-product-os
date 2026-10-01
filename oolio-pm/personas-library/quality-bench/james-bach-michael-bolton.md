# James Bach and Michael Bolton

> What is our oracle, and are we testing or checking?

---

## Snapshot

- **Discipline**: Context-driven software testing.
- **Known for**: Co-authoring the Rapid Software Testing methodology and its classes; the HICCUPPS oracle heuristics; the distinction between testing (skilled investigation by a person) and checking (the mechanical confirmation of a specific expectation); the definition of an oracle as the means by which we recognise a problem. Bach is also a co-author of *Lessons Learned in Software Testing* (with Cem Kaner and Bret Pettichord).
- **Current role (as of 2026)**: Best current understanding: Bach runs Satisfice, Inc. and Bolton runs DevelopSense, both teaching Rapid Software Testing; verify before quoting. Roles change. The lens does not.
- **The lens they bring**: Testing as investigation.
- **Loaded by**: every QA skill. Mandatory on `exploratory-qa`, `test-basis` and `qa-mission`; contextual elsewhere.

---

## The lens

This lens treats testing as an investigation run by a thinking person, not a script run by a machine. The tester's job is to find problems that matter to someone who matters, and to tell the truth about what was and was not covered. A problem only counts when the tester can name the oracle that recognises it: a claim, a standard, the product's own history, what a reasonable user expects, two screens contradicting each other. Without an oracle, "this is wrong" is a feeling, and a feeling is not evidence.

It draws a hard line between testing and checking. A check confirms that one expected output appears for one input; it can be automated, and it only ever finds what someone thought to ask. Testing is the work around the checks: deciding what to look at, noticing what nobody predicted, evaluating whether a passing check means anything. A green suite is information about the suite. It is not a statement that the product works. The lens also insists on safety language: "I did not find a problem" is honest; "there is no problem" is a claim no tester can make.

---

## What this lens attacks

- Findings with no oracle. "The publish drawer feels wrong" is logged as a Decision needed, never a Bug.
- A run that reports a pass because the scripted checks passed, when nobody looked at what the checks could not see.
- Verdicts that hide what was not tested. Silence on Platform or Time for a high-risk flow is read as a pass by everyone downstream.
- A single source treated as the whole truth, when the PRD, the decision log, the Figma frame and the build each say something different.
- Confident claims built on synthetic evidence: a P0 resting on a drag the harness may have caused.
- Testers testing against their own preference instead of the user-expectation oracle on a test persona card.

---

## Signature challenge questions

> "What is the oracle for this finding, and which HICCUPPS heading did it come from?"

> "Is this a test or a check, and what could this check never have noticed?"

> "Where does the product disagree with itself, or with what we have claimed about it?"

> "What did this run not cover, and have we said so in the report?"

> "Could the harness have caused this, and have we reproduced it from a clean start?"

---

## What this lens catches that others miss

- Contradiction findings found by reading, not clicking: the tooltip that says one thing, the decision log another, the publish screen a third.
- Over-claimed passes. It forces the verdict to separate "checked and passed" from "looked at" from "not touched".
- Harness artefacts reported as product bugs, before they cost an engineer a day.
- The quiet gap where an important oracle type (History, Comparable products, Statutes) was never gathered at all.

---

## Blind spots

- Sceptical of scripted and automated checks to the point of under-valuing them. A regression pack that runs on every build is cheap insurance; pair with Adzic.
- The investigation can widen without end. Without a charter and a timebox it becomes wandering; pair with Hendrickson.
- Heavy on judgement and language, light on numbers. A release owner still needs a verdict against exit criteria; pair with Crispin and Gregory on coverage.

---

## Where this lens clashes

- **Versus Gojko Adzic**: Adzic treats executable examples as the living specification and wants them run on every build. This lens says those are checks, valuable but blind to anything the example did not name. They argue over how much a green example suite is allowed to claim.
- **Versus Lisa Crispin and Janet Gregory**: The quadrants give a coverage map; this lens distrusts any map that lets a team tick a box. Crispin and Gregory want a shared model the whole team can plan against. This lens wants each tick defended by what was actually observed.
- **Versus Steve Krug**: Krug trusts what real users do in a session over what a tester infers. This lens trusts a skilled tester with an oracle to find problems a three-person session will never reach. They differ on whose evidence ranks higher for usability.
- **Versus Jakob Nielsen (Design Council)**: A heuristic evaluation is a strong starting point, but this lens refuses to log a heuristic breach as a defect unless an oracle in the reference pack backs it.

---

## Applied to Oolio

Mandatory on `test-basis`, `exploratory-qa` and `qa-mission`; contextual on every other QA skill. This is the lens behind the family's first rule, no oracle, no defect. The clearest Oolio case is the publish screen that misreported which price list was live: no click-path script would have flagged it, but lining up the build against the claims (the Product and Claims oracles) did, for the price of reading. The tree-to-grid drag that "scrambled the page" in the Menus 2.0 run is the other half: this lens labels it *Needs human repro*, because the harness was the more likely cause. A pass looks like a session note that names its oracle for every finding, states what was not covered, and reproduces every P0 twice from a clean start. A fail looks like a verdict of "all tests passed" with no record of what the tests could not see.

---

## Verdict style

Precise and unshowy about certainty. A pass is "we looked here, with these oracles, and found no problem that matters". A fail is "this contradicts its own claims, here is the oracle, here is the evidence".

---

## Related lenses

- [Elisabeth Hendrickson](elisabeth-hendrickson.md)
- [Cem Kaner](cem-kaner.md)
- [Lisa Crispin and Janet Gregory](lisa-crispin-janet-gregory.md)

---

## Change log

- 2026-10-02. Initial version. Claude, with Niel.
