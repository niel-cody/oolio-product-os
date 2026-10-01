---
name: qa-mission
description: The quality gate and orchestrator of the QA family, for releases what convene-vpc is for decisions. Takes an epic, fix version, PR preview or flag, runs test-basis and stops on high-consequence conflicts; picks Smoke, Standard or Full by risk; convenes the specialists that tier needs (functional, exploratory, design, accessibility, persona UAT, code, resilience, councils in built mode); merges through defect-writer; verifies independently; recommends Ship, Ship with known issues or Hold; and hands GTM only verified claims and metrics-review a measurable launch. Learn mode turns escapes into method fixes. Trigger on "QA this release", "is it ready to ship", "run QA on <epic>", "release verdict", "quality gate", "what did QA miss". Do NOT trigger for one specialist pass (call that skill), a decision, PRD or mockup (convene-vpc), or a deploy checklist (engineering:deploy-checklist).
---

# QA mission: the quality gate

What `convene-vpc` does for decisions, this does for releases: it plans the testing by risk, convenes the right specialists, makes them report in one shape, has an independent checker attack the result, and gives a verdict a person can act on. Then it closes the loop: it tells GTM what it may claim, tells measurement what to measure and when, and learns from what reality finds later.

**The rule: builder and checker are different.** The run that planned and executed the tests never grades itself alone. An agent that saw none of the planning re-checks every P0, every P1 and every claimed pass on a high-consequence flow before a verdict is given.

House style: `${CLAUDE_PLUGIN_ROOT}/references/house-style.md`. The model and standards, in `${CLAUDE_PLUGIN_ROOT}/references/qa/`: `README.md` (the loop), `quality-model.md` (questions, tiers, exit criteria, gate authority), `risk-model.md`, `routing.md`, `qa-review-page.md`, `market-handoff.md`, `measurability.md`, `learning-loop.md`. Formats: [references/verdict-format.md](references/verdict-format.md), [references/independent-verification.md](references/independent-verification.md). Lenses: `${CLAUDE_PLUGIN_ROOT}/personas-library/quality-bench/` (whole-quadrant coverage, testing as investigation).

## Release mode

### 1. Frame

Name the release, the release owner (who decides the verdict), the stage (pre-merge, Dev, Staging, Prod) and the environment. A release spanning several epics writes to each epic's QA Review page under one run ID (`qa-review-page.md`). Check the environment against the register. Define done up front: the exit criteria for the tier, from `quality-model.md`.

### 2. Basis

Run `test-basis`. If it stops on conflicts on a high-consequence flow, **stop here**: present the decisions needed and wait. Testing the wrong truth is the most expensive mistake available.

### 3. Tier and plan

Take the tier from the risk map (the owner may raise or lower it; record who did). Plan which specialists run on which flows: Smoke (`functional-qa` on high-risk ACs, automated accessibility, the instrumentation pass); Standard (adds `exploratory-qa`, `design-conformance`, assisted accessibility, `persona-uat`, `code-qa`); Full (adds `design-council-review` and `operator-council-review` in **built mode**, `resilience-qa` where fixtures exist, `uat-session-kit` planning). Show the plan in five lines and proceed.

### 4. Run

Run independent specialists in parallel where the environment allows (subagents, each given its skill, the Test Basis, the environment and its flows), sequentially otherwise. Each reports findings in the schema. Merge everything through `defect-writer`, which de-dupes, themes and drafts routes by stage (rework the story before merge; Bugs and Improvements after; requirement gaps to the PO). **No write batch for a P0 or P1 is presented until step 5 has run on it**, so no story is bounced and no engineer interrupted on an unverified finding.

### 5. Verify independently

Per [references/independent-verification.md](references/independent-verification.md): a fresh agent, given only the build, the claims and the findings to check (never the plans or reasoning), re-checks findings and passes at the tier's depth (Smoke: every P0 plus three passes of its choosing; Standard: every P0 and P1 and every pass on a high-consequence flow; Full: the same, not optional). Unreproduced findings are downgraded and flagged, never dropped. Disagreement on a pass reopens that flow.

### 6. Verdict

Against the exit criteria: **Ship**, **Ship with known issues** (each with owner and fix version), or **Hold** (each blocker and what would move it). The verdict is a **recommendation**; the release owner decides, and the record shows both. Lead with the verdict, then decisions needed, then the top five issues; every lower item must earn its line. Include the coverage map (questions asked, quadrants, personas, what was not tested and why) and the **Not covered by this family** list. Format in the reference.

### 7. Hand forward

Write the **market handoff** (`market-handoff.md`): verified claims (the only claims GTM may make), unverified claims, known issues in customer language, the metric readiness note with the date of the first `metrics-review`, and the three first-week sticking points for support and onboarding. The handoff carries the run ID, build and owner's decision, and is valid only while it belongs to the newest verdict and that decision is Ship or Ship with known issues; write it once the owner has decided. Offer `gtm-handover` (and `gtm-playbooks`, `gtm-marketing`) the block, and `metrics-review` the readiness note.

### 8. Record

`defect-writer` updates the epic's single QA Review page: AC results, quality checks, run log, verdict history, known issues. All Jira and Confluence writes held for approval.

## Learn mode

Run after escapes (a Bug or incident found after a Ship), after real UAT, after the first launch validation, or on a cadence. Per `learning-loop.md`: trace each escape to the quality question that should have caught it and why it did not; compute the calibration numbers from the QA Review pages and Jira (escape rate, verification overturn rate, synthetic-to-real prediction, source yield, false positives, measurement hits); propose each amendment as a diff to a named reference file or skill, with its evidence; hold for approval. Approved amendments are handed to a person to apply, commit and push; learn mode never writes to the repo.

## Must never

- Pass a release on synthetic UAT alone, or with an open P0, or with a suspected P0 awaiting human repro on a high-consequence flow.
- Call its verdict a block while gate authority is advisory.
- Let GTM claim anything not in Verified claims.
- Create, transition or comment in Jira, or write Confluence, without approval.
- Drop a finding to make the numbers look better.

## Guardrails

Trigger: on demand; later on event (a PR preview deployed for a release ticket) and schedule (nightly smoke on the flagged build), when promoted. Reads: everything its specialists read. Autonomous: planning, running specialists in allowed environments, drafting. Always pauses: every external write, any production action, any destructive action outside the register. Escalation: a P0 on a release candidate goes to the top of the output as an ESCALATION, with a message to the release owner drafted for approval. A scheduled or event run that needs a sign-in stops, records Blocked, and reports; it never waits. Autonomy: starts Red (proposes only); promotions per `learning-loop.md`. Autonomous writes (run-prefixed data) on PR previews only; shared hosts need approval (`environment-register.md`). Every escalation is drafted, never sent (`quality-model.md`). Vault scope: the Brain's work layers only, read only; never writes the vault.

## Definition of done

Test Basis run and no open high-consequence conflict; tier recorded with who set it; every planned specialist run or marked not run with the reason; findings merged and routed; independent verification done at the tier's depth; verdict against the exit criteria with the owner's decision recorded; market handoff written; QA Review page update drafted.
