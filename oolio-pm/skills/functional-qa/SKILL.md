---
name: functional-qa
description: Run a release's acceptance criteria as concrete examples against the live build, in the browser, by role and name, and confirm the analytics events its success metrics need actually fire. Pass, Fail or Blocked per AC with evidence, at least one negative case each, technique chosen by the rule's shape (boundaries, decision tables, state transitions, pairwise). Also re-runs the product area's regression pack. Trigger on "test the ACs", "does it do what the story says", "functional test <story/epic/PR>", "run the regression pack", "check the events fire", "is it instrumented", "verify this fix". Reports through defect-writer, so a failed AC before merge sends the story back for rework. Do NOT trigger for off-script exploration (exploratory-qa), design or accessibility checks (design-conformance, accessibility-audit), or the full release run (qa-mission).
---

# Functional QA: does it do what we said

Runs every acceptance criterion as a concrete example against the build, and proves the release will produce the data its own success metrics depend on. The question is narrow on purpose: does the build do what the story, the decision log and the PRD's metrics say it must.

**The rule: a pass on the happy path is not a pass on the AC.** Every AC gets at least one negative case, because the negative case proves the rule is enforced rather than that the easy path works.

House style: `${CLAUDE_PLUGIN_ROOT}/references/house-style.md`. Method, in `${CLAUDE_PLUGIN_ROOT}/references/qa/`: `test-design-techniques.md`, `browser-method.md`, `measurability.md`, `environment-register.md`, `finding-schema.md`.

## Inputs

The Test Basis from `test-basis` (preferred: it carries the claims, the rewritten ACs and the measurability plan), or a story, epic or PR plus a build URL. Without a Test Basis, extract the ACs yourself and say the basis was not built.

## Workflow

### 1. Plan the cases

For each AC in scope, pick the technique by the shape of the rule (`test-design-techniques.md`) and write the cases with real values: positives, at least one negative, and the boundaries. Record the technique against the AC. An AC that cannot be turned into a case is reported untestable (with a rewrite), not skipped silently. Order the run by the risk map: high-consequence flows first, so a short session still covers what matters.

**When the run cannot execute.** If `test-basis` stopped on decisions, or no allowed build is reachable, work in **plan-only mode**: write the cases or charters in full, mark each one that depends on an unruled decision *Blocked on <decision>*, run nothing, and hand the plan back so execution starts the moment the decisions land.

### 2. Check the environment

Confirm the build URL is on the environment register's allow-list and record the build, flag state, account role, browser and viewport (`browser-method.md`). Not on the list, or possibly production: stop and ask.

### 3. Run

Drive the build by role and name. For each case: set up the data (prefixed with the run ID), act, observe, capture evidence at the verdict point, read the console and network. Verdict per AC: **Pass** (all cases passed, evidence linked), **Fail** (which case, steps, expected, actual), or **Blocked** (what blocked it, what would unblock it). Reproduce any Fail from a clean start before reporting it; anything resting on drag, hover or timing is *Needs human repro*.

### 4. The instrumentation pass

For every event in the measurability plan: perform the behaviour, then confirm the event arrived with the right name and properties, once, distinguishable as test traffic (PostHog live events or a query scoped to the test account, where connected). An event that is missing, doubled or lacking the properties the PRD's segments need is a **Bug** against the metric if a story, AC or the diff says it should fire; otherwise an **Instrumentation gap** (`routing.md`). If analytics cannot be reached, mark the pass **Blocked** and say so; never assume it fired.

### 4b. What the channel received (Full, publish and pricing changes)

For any publish or pricing change, read what the receiving channel actually got (the online store page, the kiosk preview, the POS sync where readable, read only) and compare it with what was published. If it cannot be reached, record Not covered: no claim about it may be Verified.

### 5. Regression

Re-run the regression pack for every product area in the blast radius. A scenario that used to pass and now fails is a **regression**, reported with the last build it passed on. Propose new scenarios for any P0 or P1 found today, and propose retiring stable ones to engineering's own suite (`code-qa` drafts the test).

### 6. Report

Hand every finding to `defect-writer` in the schema with source key `F` and the `ac` link set. Return the AC results table (story, AC, technique, cases run, result, evidence) for the QA Review page, the instrumentation table, and the regression results. Clean up test data per the register.

## Must never

- Report an AC as Pass on the happy path alone.
- Run against production, or an environment not on the allow-list.
- Assume an event fired, or a fix worked, without observing it.
- Create tickets or comment on stories itself; `defect-writer` routes (rework before merge, tickets after) and a person approves.

## Guardrails

Trigger: on demand, or by `qa-mission`. Reads: Jira, the Test Basis, the build in allowed environments, PostHog. Autonomous: running cases and creating run-prefixed test data in allowed environments. Always pauses: any write outside the allow-list, any real login, any Jira or Confluence write. Escalation: a P0 is reported to the release owner immediately. Autonomous writes (run-prefixed data) on PR previews only; shared hosts need approval (`environment-register.md`). Every escalation is drafted, never sent (`quality-model.md`). Vault scope: the Brain's work layers only, read only; never writes the vault.

## Definition of done

Every AC in scope has a verdict with evidence and its technique recorded; every AC has a negative case; every Fail reproduced or labelled; the instrumentation pass run or marked Blocked with the reason; regression run for the blast radius; findings handed to `defect-writer`; test data cleaned up or listed.
