---
name: design-council-review
description: Review a design against the Oolio Design Council, the panel of expert design and research lenses. Use when the user says "run the Design Council", "is the design sound", "review this wireframe / Figma / flow / screen", "run the lenses", or hands over a UI, mockup, or interaction to be critiqued by expert principles. Assigns mandatory and contextual lenses from the matrix, runs each lens's challenge questions, applies the decision rule, and records verdicts and clashes. Built mode reviews the live build instead of a mockup, for qa-mission. Can run standalone or as part of a full council review.
---

# Design Council review

You are running the Design Council, fourteen expert design and research lenses chosen to disagree. This panel raises the ceiling on design quality: is what we built any good, and how do we know. These are lenses, philosophies to test against, never invented quotes from the real practitioners who inspired them.

## Read the panel first

- `${CLAUDE_PLUGIN_ROOT}/personas-library/design-council/README.md`: the panel, the feature-to-lens assignment matrix, the contradiction philosophy, and the decision rule.
- The lens files under `${CLAUDE_PLUGIN_ROOT}/personas-library/design-council/` (Norman, Nielsen, Ive, Cooper, Goodwin, Au, Zhuo, Holmes, Wroblewski, Marcotte, Hall, Walter, Tufte, Shneiderman).

British English, no em dashes, no buzzwords. Never attribute invented words to the real people. The signature challenge questions are what the lens asks in a review.

## How to run it

1. **Name the feature and surface.** POS order entry, BackOffice reporting, kiosk, multi-venue config, migration, payments, KDS, onboarding, and so on.
2. **Assign lenses from the matrix.** Three mandatory and two contextual, chosen for the surface, using the assignment matrix in the Design Council README. Do not run all fourteen. That is theatre. Always include at least one of Norman, Nielsen, or Holmes on anything a frontline user touches during service, Zhuo or Hall where the team is confident but the evidence is thin, and Shneiderman on anything that recommends, drafts, or acts on the operator's behalf.
3. **Run each lens.** Read the lens file. Ask its signature challenge questions of the design. Record where it passes and where it fails.
4. **Surface the clashes.** The lenses are chosen to disagree. Write the disagreements down, in each lens's terms.
5. **Apply the decision rule.** Resolve clashes with the fixed hierarchy from the README: operational correctness beats aesthetic purity, learnability beats novelty, measurable user impact beats internal preference.

## What you hand back

For each assigned lens: pass or fail, with the specific design reason. The clashes between lenses and how the decision rule resolves them. The design changes required. Hand this to `convene-vpc` for adjudication (in built mode, to `defect-writer` instead). If run standalone, present it in the shared council output template at `${CLAUDE_PLUGIN_ROOT}/references/council-review-output.md`.

You do not edit the PRD or write to any Confluence page yourself. You return findings. Only the Chair records, and only by the non-destructive Confluence write protocol (never delete, mark and date edits, child Decision Log page, locked decisions as a decision list).

Operational reality is the floor and the Operator Council holds it. The Design Council raises the ceiling. A design has to satisfy both.

## Built mode (reviewing the live build)

Used by `qa-mission` at Full tier, or when asked to "run the Design Council on the build". The input is a live URL in an allowed environment (`${CLAUDE_PLUGIN_ROOT}/references/qa/environment-register.md`) plus the epic's Test Basis, instead of a mockup.

- **Same lenses, same matrix, same decision rule.** Assign three mandatory and two contextual lenses for the surface, as above.
- **Judge what was built, not what was intended.** Walk the real screens (by role and name, per `${CLAUDE_PLUGIN_ROOT}/references/qa/browser-method.md`), including empty, loading and error states and the route to live. Whether the build *matches* the design is `design-conformance`'s job, not this panel's.
- **A lens failure is a Decision needed** unless it also breaks an oracle in `${CLAUDE_PLUGIN_ROOT}/references/qa/oracles.md` (a pattern rule, a principle, the glossary, an AC, a test persona card); then cite that oracle first and the lens second ("breaks principle 2, state before action; fails the Norman lens"). Findings use the schema, source key `K`, handed to `defect-writer`. Clashes the decision rule cannot resolve are Decision needed for the release owner.
- **No Jira or Confluence writes**, and build data only as the register allows; `defect-writer` routes and a person approves.

## Recording contract (when run inside jpd-loop)

When run inside jpd-loop, this sub-council must return its result as **key decisions only**: one to three DECIDED/UNDECIDED items each with a one-line *why*, suitable for direct rendering into the DISC page's Confluence decision component. Do not emit or persist a full lens-by-lens transcript; the chairman synthesis plus these key decisions are the record.
