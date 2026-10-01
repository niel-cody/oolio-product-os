---
name: operator-council-review
description: Test a decision against the Oolio Operator Council, the hospitality user personas (the UAT panel). Use when the user says "run the operator council on this", "run the operator council", "would real users accept this", "does this survive a Friday night", "check this against our personas", or wants the in-venue, frontline reality of a feature. Convenes the user personas the decision touches, by role and by segment or vertical, and runs each persona's challenge. Built mode tests the live build through the personas' eyes, for qa-mission. Can run standalone or as part of a full council review. Do NOT trigger to test a live build (persona-uat, uat-session-kit) or for resilience (resilience-qa).
---

# Operator Council review

You are running the Operator Council, the hospitality user personas. This panel holds the floor of operational reality: whether a real venue would accept and adopt this, and whether it survives service under pressure.

## Read the panel first

- `${CLAUDE_PLUGIN_ROOT}/personas-library/uat-panel/README.md`: the panel and its role groups.
- `${CLAUDE_PLUGIN_ROOT}/personas-library/segments.md`: the cross-cutting map. Pull personas by size-segment (independent, small group, mid-market, enterprise) and by vertical (cafe, fine dining, pub, QSR, takeaway and pizza, and so on).
- The persona files under `${CLAUDE_PLUGIN_ROOT}/personas-library/uat-panel/` (owners-and-executives, general-managers, front-of-house, back-of-house).

British English, no em dashes, no buzzwords. Do not invent personas. Use the ones in the library.

## How to run it

1. **Pick who this touches.** From the decision, identify the roles and the segment or vertical it affects. Use `segments.md` to convene exactly that slice. If the decision targets QSR, pull the QSR personas. If it targets enterprise, pull the enterprise set. Do not run every persona on every decision.
2. **Read each convened persona in full.** Their day in the life, goals, frustrations, KPIs, what they need from Oolio, and what loses them.
3. **Challenge from each persona.** Ask of the decision: would this persona accept it, adopt it, and still use it after go-live? Does it survive their hardest shift? What would make them ignore it or walk? Record where it passes and where it fails, in the persona's own terms.
4. **Surface the clashes.** Where two personas would pull in different directions (for example a frontline casual versus an enterprise COO), write the disagreement down. Do not resolve it quietly. The Chair adjudicates.

## What you hand back

For each convened persona: pass or fail, with the specific reason grounded in that persona's reality. The strongest clashes between personas. The changes that would move a fail to a pass. Hand this to `convene-vpc` for adjudication (in built mode, to `defect-writer` instead). If run standalone, present it in the shared council output template at `${CLAUDE_PLUGIN_ROOT}/references/council-review-output.md`.

You do not edit the PRD or write to any Confluence page yourself. You return findings. Only the Chair records, and only by the non-destructive Confluence write protocol (never delete, mark and date edits, child Decision Log page, locked decisions as a decision list).

The Operator Council holds operational reality. A feature that cannot survive a real persona's Friday night is not ready, whatever it looked like in the demo.

## Built mode (the live build, framed by real operators)

Used by `qa-mission` at Full tier, or when asked "would real users accept what we built". The input is a live URL in an allowed environment (`${CLAUDE_PLUGIN_ROOT}/references/qa/environment-register.md`), the Test Basis, and any `persona-uat` scorecard or real UAT results already on the epic's QA Review page.

- **Same panel, same selection.** Convene the personas the release touches, by role and segment, as above.
- **Challenge the build, not the idea.** For each persona: would they accept, adopt and still use *this build* after go-live, does it survive their hardest shift as built, and what would make them ring support or walk. Ground each verdict in what the build actually does (walk it, or cite the scorecard and real sessions), not in what the PRD promised.
- **The panel frames, people decide.** This is not UAT sign-off. It sets the questions and the recruit mix for `uat-session-kit`, and its verdicts are checked against real sessions in the learning loop.
- **A persona fail is a Decision needed** unless it also breaks an oracle in `${CLAUDE_PLUGIN_ROOT}/references/qa/oracles.md` (a pattern rule, a principle, an AC, or a test persona card's stated behaviour); then cite that oracle first and the persona second. Findings use the schema, source key `K`, handed to `defect-writer`. No Jira or Confluence writes.

## Recording contract (when run inside jpd-loop)

When run inside jpd-loop, this sub-council must return its result as **key decisions only**: one to three DECIDED/UNDECIDED items each with a one-line *why*, suitable for direct rendering into the DISC page's Confluence decision component. Do not emit or persist a full persona-by-persona transcript; the chairman synthesis plus these key decisions are the record.
