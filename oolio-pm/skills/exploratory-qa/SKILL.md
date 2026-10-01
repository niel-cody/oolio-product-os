---
name: exploratory-qa
description: Run chartered, timeboxed exploratory testing sessions against a live build to find what breaks off the happy path, the defects nobody wrote an AC for. Charters come from the risk map, the hospitality conditions library (midnight trading days, two managers in two tabs, back button mid-publish, empty venues, big catalogues) and past failures; SFDPOT checks coverage and HICCUPPS recognises problems. Session notes are the evidence. Trigger on "explore this", "try to break it", "exploratory test", "what happens off the happy path", "edge cases on <feature>", "run some charters", "bug bash". Reports through defect-writer. Do NOT trigger for scripted AC checks (functional-qa), synthetic users in character (persona-uat), load, network loss or scale (resilience-qa), or the full release run (qa-mission).
---

# Exploratory QA: what breaks off the path

Simultaneous learning, test design and execution, with a charter, a timebox and notes, so it is investigation rather than wandering. This is the skill that would have caught "creating a Sat/Sun schedule deletes every existing schedule": a Time × Data charter on overlapping schedules, not an AC anyone wrote.

**The rule: a charter, a timebox, and notes, every time.** A session without notes did not happen; a session that found nothing still files its note, because "explored X with Y and found nothing" is what lets the verdict claim a risk was covered.

House style: `${CLAUDE_PLUGIN_ROOT}/references/house-style.md`. Method, in `${CLAUDE_PLUGIN_ROOT}/references/qa/`: `exploration.md` (charters, SFDPOT, tours, notes), `oracles.md` (HICCUPPS), `hospitality-conditions.md`, `browser-method.md`, `environment-register.md`. Lenses: `${CLAUDE_PLUGIN_ROOT}/personas-library/quality-bench/` (testing as investigation, chartered exploration, stability under failure).

## Workflow

### 1. Write the charters

From, in order: the risk map's highest-rated flows; the hospitality conditions library; the Familiarity oracle (incidents and earlier QA Review pages on this area). One sentence each: *Explore <target> with <conditions> to discover <information>*. Tier sets the number: Standard two to four on the top flows, Full one per high-rated flow plus at least two condition charters. Show the charter list before starting when run standalone; under `qa-mission`, start.

**When the run cannot execute.** If `test-basis` stopped on decisions, or no allowed build is reachable, work in **plan-only mode**: write the cases or charters in full, mark each one that depends on an unruled decision *Blocked on <decision>*, run nothing, and hand the plan back so execution starts the moment the decisions land.

### 2. Run each session

Check the environment against the register first. Then explore within the charter and the timebox (30, 60 or 90 minutes of testing). Use the tours in `exploration.md` when a starting move is needed: empty data, back button, interruption, two of everything, boundaries, permissions, the copy read literally. Recognise problems with HICCUPPS and name the oracle as you go. When a session finds something big, end that charter and write a new one for the new area rather than drifting.

Drive by role and name; capture evidence for every observation that could be a finding; read the console and network. Reproduce anything you will call P0 or P1 from a clean start. Anything resting on drag, hover or timing is *Needs human repro*.

### 3. Write the session note

The shape in `exploration.md`: charter, build and environment, timebox, SFDPOT coverage, timestamped notes (including what was tried and passed), findings, questions with no oracle, issues that slowed testing, and next charters.

### 4. Check coverage

After the sessions, tick SFDPOT across the high-risk flows. A dimension nobody touched on a high-risk flow is reported as a coverage gap in the hand-back, not hidden.

### 5. Report

Findings to `defect-writer` in the schema with source key `E`, each linking its session note. Questions with no oracle go as Decision needed. Return the charter list with outcomes, the session notes, and the coverage gaps, for the QA Review page. Clean up run-prefixed data.

## Must never

- Explore without a charter and a timebox, or report a session without a note.
- Report a finding with no oracle as a Bug; it is a question for a person.
- Call a P0 on a synthetic gesture alone.
- Touch production or data the register marks as shared.

## Guardrails

Trigger: on demand, or by `qa-mission` at Standard and Full. Reads: the build in allowed environments, the Test Basis, incident and QA history. Autonomous: sessions and run-prefixed data in allowed environments. Always pauses: anything outside the allow-list, any real login, any write to Jira or Confluence. Escalation: a P0 is escalated. Autonomous writes (run-prefixed data) on PR previews only; shared hosts need approval (`environment-register.md`). Every escalation is drafted, never sent (`quality-model.md`). Vault scope: the Brain's work layers only, read only; never writes the vault.

## Definition of done

Every charter run within its timebox with a note; SFDPOT coverage recorded and gaps named; every finding cites an oracle and links its note; questions raised as Decision needed; findings handed to `defect-writer`; test data cleaned up or listed.
