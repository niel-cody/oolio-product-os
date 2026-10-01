---
name: persona-uat
description: Run synthetic users through a live build, in character and under real constraints, before real people see it. Picks the test persona cards the epic touches (the literal-reading cafe owner, the Bepoz pub manager, the 12-venue ops lead, the online-first operator, the new casual, the chef at the pass, the fat finger at 8pm), writes a no-briefing task script (create, structure, populate, design, modify, recover, publish), runs each task in the browser as that persona, and produces a per-persona, per-task scorecard with what decided it. A pre-filter for obvious friction, never UAT sign-off. Trigger on "persona UAT", "run the personas through it", "walk it as Mia and Dave", "usability test with personas", "synthetic UAT", "would a new user get this". Do NOT trigger for real-user sessions (uat-session-kit) or for opinion on a mockup or decision (operator-council-review).
---

# Persona UAT: synthetic users with real constraints

The PR-1095 usability session as a repeatable skill. Synthetic personas walked the menu builder and found the problems the external session later confirmed: users could not tell what page they were on, what an edit would change, or whether anything was live. That is the job: clear the obvious friction cheaply so real sessions spend their time on the deep problems.

**The rule: synthetic UAT clears, humans decide.** Synthetic users over-complete tasks and under-report confusion (Nielsen Norman Group's comparison against real studies found them too shallow). Every report says so in its first section, and no release is UAT-passed on this skill alone.

House style: `${CLAUDE_PLUGIN_ROOT}/references/house-style.md`. Personas: `${CLAUDE_PLUGIN_ROOT}/personas-library/test-personas/README.md` and the cards (each grounded in a UAT panel persona). Method: [references/task-script-and-scorecard.md](references/task-script-and-scorecard.md); `${CLAUDE_PLUGIN_ROOT}/references/qa/` `browser-method.md`, `environment-register.md`, `pattern-library.md`, `glossary.md`, `hospitality-conditions.md`. Lens: `${CLAUDE_PLUGIN_ROOT}/personas-library/quality-bench/` (self-evident use).

## Workflow

### 1. Cast

Pick three to five cards the epic's users map to, using the cast matrix in the test personas README: always at least one novice reader (literal reader or new casual), one migrating user where the area replaces an incumbent system, and one blast-radius thinker on anything multi-venue. Add an adversarial card (the fat finger or the edge tester) at Full tier. Say who was left out and why.

### 2. Script

Write the no-briefing task script: five to eight tasks in the operator's words, not the UI's ("Make a dinner menu with food and drinks", not "Click Create Menu"), spanning create, structure, populate, design, modify, recover and publish where they apply. Each task carries its success condition and the oracle behind it. The script must be reusable verbatim by `uat-session-kit` with real people.

### 3. Run in character

Check the environment against the register. For each persona, run each task in the browser **within the card's constraints**: the reading behaviour, the mental model, the prior system's habits, the device class and time pressure, and the stay-in-character rules (Mia does not guess at an unexplained word; Dave reaches for button text and bulk moves). Think aloud in the persona's terms. Record pauses, wrong turns, words misread, and the point of giving up. When you break character (for example, using knowledge of the build the persona would not have), say so in the notes; that task's result is then capped at *Pass, with help*.

### 4. Score

Per persona per task, from the scale in the reference: Pass, Pass with hesitation, Pass with help (counted as Partial), Partial, Fail, Not attempted, each with "what decided it" in one line. Add each persona's "magic wand" line: the one thing they would change.

### 5. Report

Findings to `defect-writer` with source key `S`, persona and task set, severity rated on the persona who suffered most; anything resting on synthetic drag or timing is *Needs human repro*. Return the scorecard, the ranked findings, the magic-wand lines, the predictions for the real session ("we expect real users to stall at tasks 2, 3 and 7"), and the test data left behind, for the QA Review page. Offer the script and predictions to `uat-session-kit`.

## Must never

- Present results as user research or UAT sign-off.
- Step outside a card's constraints without saying so.
- Invent personas inline; use or extend the cards (a missing persona is a proposal for the library).

## Guardrails

Trigger: on demand, or by `qa-mission` at Standard and Full. Reads: the build in allowed environments, the cards, the reference pack. Autonomous: running sessions with run-prefixed data. Always pauses: any write outside the allow-list, any Jira or Confluence write. Escalation: a P0 seen in character goes to the release owner, labelled with its confidence. Autonomous writes (run-prefixed data) on PR previews only; shared hosts need approval (`environment-register.md`). Every escalation is drafted, never sent (`quality-model.md`). Vault scope: the Brain's work layers only, read only; never writes the vault.

## Definition of done

Cast chosen with exclusions stated; a reusable no-briefing script; every task run for every persona within the card's constraints, breaks of character declared; the scorecard complete with what decided each result; predictions written for the real session; the limits paragraph in the report; findings handed to `defect-writer`.
