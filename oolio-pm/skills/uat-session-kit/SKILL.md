---
name: uat-session-kit
description: Both ends of real-user UAT, the part that actually validates. Before: recruit criteria (personas, segments, pilot venues), the no-briefing task script, the facilitator and observer sheet, and the measures (task success, time on task, Single Ease Question, SUS). After: ingests Granola transcripts and notes, keys each source, de-dupes across sessions and against the synthetic run, themes it through defect-writer, and scores which real findings persona-uat predicted. Trigger on "plan the UAT sessions", "set up user testing", "pilot sessions for <release>", "write the observer sheet", "consolidate the UAT", "process the user testing transcripts", "how did synthetic UAT compare". Do NOT trigger for AI-only persona runs (persona-uat) or interview research on a problem space (design:user-research, synthesize-research).
---

# UAT session kit: real people, less overhead

Real-user UAT is the part of the family that validates; everything synthetic is a filter in front of it. This skill makes real sessions cheaper to run and faster to act on, and it measures whether the synthetic filter is earning its place.

**The rule: drop them in with no briefing.** A real user who was told how it works has tested the briefing, not the product. Every session uses the same no-briefing script, so sessions can be compared with each other and with the synthetic run.

House style: `${CLAUDE_PLUGIN_ROOT}/references/house-style.md`. Formats: [references/session-pack.md](references/session-pack.md). Shared: the scorecard and script shapes in `${CLAUDE_PLUGIN_ROOT}/skills/persona-uat/references/task-script-and-scorecard.md`; `${CLAUDE_PLUGIN_ROOT}/references/qa/finding-schema.md`, `qa-review-page.md`, `learning-loop.md`. Personas: `${CLAUDE_PLUGIN_ROOT}/personas-library/uat-panel/` and `segments.md` for recruitment; the test persona cards for the observer's predictions. Lens: `${CLAUDE_PLUGIN_ROOT}/personas-library/quality-bench/` (self-evident use).

## Before: the session pack

1. **Recruit criteria.** Which personas and segments the epic serves (from the PRD and `segments.md`), the mix the pilot needs (single site and multi-venue; a POS-heavy venue; a migrating user; the surfaces in scope), and screening questions. Three to five people per round finds most of the obvious problems; more rounds beat bigger rounds.
2. **The script.** Take `persona-uat`'s script if one exists and sharpen it with what the synthetic run found; otherwise write one in the same shape. No briefing; tasks in the operator's words; the route-to-live task last.
3. **The facilitator and observer sheet**, per the reference: the opening words, what the facilitator may and may not say, the per-task observation grid with the synthetic run's predictions pre-filled so observers can mark hit or miss.
4. **Measures.** Task success (the scorecard scale), time on task, the Single Ease Question after each task, SUS at the end (comparable across releases).
5. **The page section.** Draft the UAT section of the epic's QA Review page (sessions planned, who, when, the script). Written by `defect-writer` on approval.

Recruiting and scheduling real people is a person's job: draft the invitation text if asked; never send it.

## After: consolidation

1. **Ingest** the transcripts and notes (Granola tools; or pasted notes), plus the facilitator sheets. Key each source (one letter per session or note set, recorded in the register header, as in the Menus 2.0 consolidation).
2. **Extract findings** in the schema with source key `U` plus the session letter (`UA`, `UB`), quoting the moment (transcript timestamp) as evidence. Separate what the person did from what they said; behaviour outranks opinion.
3. **Score** each person per task, compute task success, median time, SEQ per task and SUS.
4. **Hand to `defect-writer`** to de-dupe across sessions and against earlier findings (including the synthetic `S` findings), type, theme and route.
5. **Score the synthetic run.** For each real P1-and-above finding: did `persona-uat` predict it (hit), predict something near it (partial), or miss it? Also count synthetic findings real users never hit (false alarms). Report the prediction rate and draft it for the QA Review page's Lessons section (written by `defect-writer` on approval) for the learning loop. Below a third across two releases is the kill signal for full synthetic runs.

## Must never

- Brief participants on how the feature works before the tasks.
- Contact, invite or schedule real people, or post anything, without approval.
- Record personal details beyond what the session needs; refer to participants by role and venue type in findings.
- Report a UAT pass on fewer than the planned sessions without saying so.

## Guardrails

Trigger: on demand, or by `qa-mission` at Full. Reads: Granola, Confluence, Jira, the persona library. Autonomous: drafting the pack, consolidating. Always pauses: any message to a participant, any Jira or Confluence write. Escalation: a P0 from a real session is escalated the same day (drafted for the release owner, sent on approval). Autonomous writes (run-prefixed data) on PR previews only; shared hosts need approval (`environment-register.md`). Every escalation is drafted, never sent (`quality-model.md`). Vault scope: the Brain's work layers only, read only; never writes the vault.

## Definition of done

Before: recruit criteria, no-briefing script, facilitator and observer sheet with predictions, measures, and the page section drafted. After: every source keyed; findings in schema with timestamps; per-person scores, SEQ and SUS; handed to `defect-writer`; the synthetic-to-real prediction rate computed and recorded.
