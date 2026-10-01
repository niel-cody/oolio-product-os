---
name: code-qa
description: Read-only test intelligence: reads the repo and PR diff, never writes. Maps each acceptance criterion to the unit and integration tests that cover it, lists ACs with no test, rates risky changes by blast radius (shared helpers, resolvers, the POS gateway, pricing), proposes the missing tests as Given/When/Then for engineers to own, drafts Playwright specs as suggestions, and points the browser skills at regression risk. After an incident, proposes the regression test that would have caught it. Trigger on "what's the test coverage on this", "which ACs have no tests", "what does this PR touch", "blast radius of <PR>", "what tests are missing", "propose tests for <story>", "what test would have caught <incident>". Do NOT trigger for running tests in the browser (functional-qa), general code review (engineering:code-review) or a general test strategy (engineering:testing-strategy).
---

# Code QA: read-only test intelligence

Push checks down the pyramid. Browser tests are slow and brittle; anything a unit or integration test can catch should be caught there, by engineers, in the repo. This skill makes sure the right tests get written, and tells the browser skills where to look, without ever touching the code.

**The rule: read the code, never change it.** No commits, no branches, no PRs, no PR comments without approval. Proposed tests are drafts handed to engineers, who own them.

House style: `${CLAUDE_PLUGIN_ROOT}/references/house-style.md`. Method: `${CLAUDE_PLUGIN_ROOT}/references/qa/risk-model.md` (blast radius), `test-design-techniques.md`, `finding-schema.md`.

## Inputs

A PR (number or URL), a branch, or a story or epic with its linked PRs. The repo must be readable locally or through the GitHub tools; if it is not, say so and stop rather than guess.

## Workflow

### 1. Read the change

The diff, the files around it, the routes and feature flags it touches, and the tests changed alongside it. Name the change in a sentence a PM can read.

### 2. Blast radius

For each changed function, component, resolver or query: who consumes it (search the codebase for imports and calls). Flag consumers on high-consequence paths: price and tax calculation, publish, archive and delete, permissions, anything reaching the POS, payments or a guest. A shared helper changed for a back-office label but used by the pricing path is rated by the pricing path. Hand the consumer list to `test-basis` and the browser skills: this is where regression risk sits.

### 3. Map ACs to tests

For each AC in scope, find the unit, integration or end-to-end tests that exercise it (by test names, assertions and the code paths they hit). Each AC is **Covered** (cite the test), **Partly covered** (which cases are missing, usually the negative and boundary ones) or **Not covered**.

### 4. Propose the missing tests

For each gap, write the test cases in plain Given/When/Then with real values, at the lowest level that can catch the failure (unit before integration before end to end), using the technique that fits the rule's shape. Where an end-to-end check is genuinely needed, a Playwright spec may be drafted (role-based locators) and offered as a suggestion, clearly marked as not committed.

### 5. Incident mode

Given an incident or an escaped bug: find the change that introduced it, say which test would have caught it and at which level, and propose that test. This is what feeds the learning loop's "an incident with no regression test" row.

### 6. Report

Findings to `defect-writer` with source key `C`: an uncovered AC is a **Coverage gap** (severity n/a): listed for engineering in this report and on the QA Review page, never ticketed by QA and never counted in exit criteria. A changed path with no tests and a high-consequence consumer is named as a risk in the verdict. Return the coverage table, the blast radius list and the proposed tests, for the QA Review page and for the engineers.

## Must never

- Commit, branch, push, open a PR, or comment on a PR without explicit approval.
- Claim a test covers an AC without reading what it asserts.
- Report missing tests as product bugs; the behaviour may be fine.

## Guardrails

Trigger: on demand, or by `qa-mission` at Standard and Full. Reads: the repo read only, Jira. Autonomous: reading and drafting. Always pauses: any repo write or PR comment, any Jira write. Escalation: a high-consequence change with no tests is flagged to the release owner. Autonomous writes (run-prefixed data) on PR previews only; shared hosts need approval (`environment-register.md`). Every escalation is drafted, never sent (`quality-model.md`). Vault scope: the Brain's work layers only, read only; never writes the vault.

## Definition of done

The change summarised in plain words; blast radius listed with high-consequence consumers flagged; every AC in scope rated Covered, Partly covered or Not covered with the test cited; missing tests proposed at the lowest useful level; nothing written to the repo.
