# The learning loop: how the family gets better

A QA function that does not learn from what it missed tests the same blind spots forever. The family improves itself through `qa-mission`'s **learn mode**, which runs after a release has met reality. It proposes changes to its own reference pack; a person approves them. Nothing about the method changes silently.

## When it runs

- **After escapes:** a Bug found in Dev or Prod, a support ticket, or an incident on an epic that QA passed or tested.
- **After real UAT:** once `uat-session-kit` has scored the synthetic run against the real one.
- **After the first launch validation:** once `metrics-review` has run against the metric readiness note.
- **On a cadence:** every few releases, over the run logs of every QA Review page touched since the last pass.

## What it measures

| Measure | How | What it tells us |
|---|---|---|
| **Escape rate** | Bugs and incidents found after a Ship verdict, per release, by severity | Whether the gate means anything |
| **Escape origin** | For each escape: which quality question should have caught it (the quality model's numbers), and why it did not (not asked at this tier, asked badly, no oracle, environment could not reproduce) | Where the method is blind |
| **Verification overturn rate** | Share of P0 and P1 findings the independent pass could not reproduce | Whether specialists are over-calling |
| **Synthetic-to-real prediction** | Share of real UAT P1+ findings that `persona-uat` predicted | Whether synthetic UAT earns its place. Below a third across two releases: cut it back to a script writer (the proposal's kill signal) |
| **Source yield** | Unique findings per source key, from the register | Which specialists find what nobody else does |
| **False-positive rate** | Findings rejected as not-a-bug, by source | Noise, and which oracles are weak |
| **Measurement hits** | Metrics marked Measurable that `metrics-review` could in fact measure | Whether the instrumentation pass works |
| **Flake rate** | Findings labelled flaky, by harness cause | Where the browser method needs a better approach |

The numbers are drafted for the **Lessons** section of each QA Review page (written by `defect-writer` on approval) and rolled up in the learn-mode report. Any figure is computed from the pages and Jira, with its query or source; none is estimated.

## What it changes

Every escape and every pattern ends in a proposed amendment to a named file, or an explicit "no change, because". The common ones:

| Lesson | Amendment |
|---|---|
| An escape a charter would have caught | New entry in `hospitality-conditions.md` or a new tour in `exploration.md` |
| An escape a scenario would have caught | New scenario in the product area's regression pack |
| A component rule was missing or wrong | New or corrected entry in `component-reference.md`, as Proposed, to Design |
| A term confused real users | Glossary entry, to Product |
| The tier was too shallow for a flow that failed | Adjust the risk evidence for that flow type in `risk-model.md` |
| A persona card predicted badly | Edit the card's behaviour fields in the persona library |
| A specialist over-calls | Tighten that skill's confidence or evidence rule |
| An incident with no regression test | A proposed unit or integration test for engineers, via `code-qa` |

## How amendments land

1. Learn mode drafts each amendment as a diff with the evidence that motivates it (the escape, the numbers).
2. A person approves or rejects each one.
3. Learn mode drafts each approved amendment to this plugin as a diff plus its CHANGELOG entry. **A person applies, commits and pushes it**; the skill never writes to the repo. Amendments to product data (regression packs, the QA Review pages) are drafted for `defect-writer` and written on approval.
4. Rejected amendments are recorded with the reason, so the same lesson is not re-proposed without new evidence.

## Earning autonomy

The same numbers decide how much the family may do on its own. Each skill starts Red (proposes only). A skill can be proposed for Amber (acts within its lane, reports after) when, over at least three releases: its findings' overturn rate is low, its false-positive rate is low, and it caused no escape it should have caught. Promotion is a decision for Niel, recorded in the CHANGELOG. Nothing goes Green until synthetic findings are shown to track real ones.

**Autonomy never covers an external write.** At every level, Jira and Confluence writes, transitions, mentions and any message, repo writes, production access and sign-in remain approval-gated. Amber widens only what a skill may run and draft without asking: more environments, scheduled runs, larger fixtures.
