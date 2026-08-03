---
name: meeting-sweep
description: >-
  Sweep a day's Granola meeting notes and turn them into filed knowledge and
  proposed work: meeting, decision and action records in the my_brain vault,
  then cited comments, tasks, ideas and Insights in Jira and JPD, and additive
  notes or comments on the Confluence pages the meetings touched. Trigger when
  the user says "run my meeting sweep", "end of day sweep", "process today's
  Granola notes", "ingest my meetings", "file today's meetings", "what came out
  of my meetings today", or names a date or range of meetings to work through.
  Files to the Brain freely, proposes everything outward and acts only on one
  batch approval, and never deletes or rewrites anything it did not author.
  Do NOT trigger to answer a question about a meeting (query Granola directly),
  to ingest a document into the Brain (use wiki-ingest), to attach one piece of
  evidence to the backlog (use add-insight), or to log one piece of customer
  feedback (use feedback-to-idea).
---

# Meeting sweep

The end-of-day pass over Granola. Meetings are the richest source of decisions and actions Niel
produces, and by default all of it stays in a notes app. This skill drains it: every meeting becomes
a filed record in the Brain, and every consequence of a meeting becomes a proposed write in the
system that owns it.

Two operating principles, both hard:

- **The Brain is safe, everything else is proposed.** Filing to the vault is reversible and happens
  without asking. Anything that another person will see (a Jira comment, a new ticket, a Confluence
  note, a JPD idea) is proposed in one table and executed only on approval.
- **Additive only, always.** This skill adds notes, comments, citations and links. It never deletes
  a Confluence page or paragraph, never rewrites a description it did not author, never closes or
  transitions someone else's ticket. If landing a change would remove existing text, stop and hand
  it back.

## Environment (Oolio)

- **Granola** via its MCP server: `list_meetings`, `get_meetings`, `get_meeting_transcript`.
- **Atlassian** MCP, cloudId `98b2c73a-4f2e-4b23-aca7-dbc5b45b1e24` (`oolio.atlassian.net`).
  Discovery lands in **OHSI, Oolio One Ideas** (`10052`); Niel's own tasks land in **EVITA**;
  delivery epics live in their own projects (OR, EDU, STK and the rest). Team IDs for anything
  routed to a build team: `${CLAUDE_PLUGIN_ROOT}/references/jira-teams.md`.
- **The Brain**, the `my_brain` vault. Shape in `${CLAUDE_PLUGIN_ROOT}/references/vault-model.md`;
  the vault's own `_system/operating-system.md` and `STRUCTURE.md` win wherever they disagree.
- Day boundary is Niel's local day (Australia/Melbourne), not UTC. Check the date via shell before
  querying, because "today" resolved wrongly silently sweeps the wrong meetings.

House style: `${CLAUDE_PLUGIN_ROOT}/references/house-style.md`.

## Procedure

### 0. Scope the run

Default to today. Accept "yesterday", a date, or a range. Read `40 Meetings/log.md` in the vault (or
the vault's own daily-ingest runbook if one exists, which wins) to find the last sweep, and cover any
day since it that was missed. Say up front which days you are covering.

### 1. Pull the meetings

`list_meetings` with `time_range: custom` over the day, and `involvement` set to
`captured_by_me: true` plus `listed_as_participant: true`, so the sweep covers Niel's meetings rather
than the whole workspace. Then `get_meetings` in batches of ten for notes, summary and attendees.

Pull `get_meeting_transcript` **only** when a verbatim quote is needed: customer wording for backlog
evidence, or the exact phrasing of a contested decision. Transcripts are long and mostly noise; the
notes and summary carry the substance.

### 2. Filter before reading further

Drop personal meetings and do not summarise them: anything about health, HR, compensation,
performance, recruitment for Niel himself, or personal life. The work/personal wall is absolute
(`vault-model.md`, "The work/personal wall"). Report the count skipped, never the content.

Skip meetings already swept: a meeting page in `40 Meetings/` carrying this meeting's Granola id has
been done. Diff, do not re-read.

### 3. Extract

Per meeting, extract the item types in
`${CLAUDE_PLUGIN_ROOT}/skills/meeting-sweep/references/item-model.md`: decisions, actions, product
signal, references to existing Jira and Confluence, risks, executive asks and open questions. Each
item carries the evidence line it came from, the meeting citation, a confidence band, and a proposed
route.

The extraction bar is the one that matters: **"we should probably" is not a decision, and an
unowned intention is not an action.** Under-extracting costs a follow-up; over-extracting fills Jira
with work nobody agreed to.

### 4. File to the Brain

Do this before proposing anything outward, so the record exists even if the batch is never approved.
Per `item-model.md`'s filing shape: a meeting page per meeting in `40 Meetings/`, decisions in
`41 Decisions/`, actions as inline `- [ ]` checkboxes linked from the `42 Actions/` rollup, people
linked into `50 People/`, and the `01 Command Centre/` rollups refreshed.

Durable product or market knowledge (a competitor fact, a capability constraint, a customer
behaviour worth keeping) is handed to `wiki-ingest` with the meeting page as its source, rather than
integrated here. That keeps one ingest procedure, not two.

### 5. Propose the outward batch

One table, every meeting in one list, ordered by target system. Columns: item, evidence (the quoted
line), proposed action, target, confidence band, and why. The user strikes rows or says go.

Nothing outward happens before this table is shown, including on a scheduled unattended run.

### 6. Execute on approval

Per row, in this order (safest first), following
`${CLAUDE_PLUGIN_ROOT}/skills/meeting-sweep/references/write-rules.md` for every call:

1. **Jira comments** on referenced issues and epics: the decision or update, quoted, with the
   meeting citation.
2. **New EVITA tasks** for Niel's own actions, one per action, with the owner and due date the
   meeting actually set.
3. **New delivery tasks** on a team's project only where the meeting agreed the work, routed by
   `jira-teams.md`, never assigned to a person the meeting did not name.
4. **Confluence notes**: a footer or inline comment by default; an appended, dated section on the
   page only when the meeting genuinely updates its content, per the additive-write contract.
5. **JPD**: hand product signal to `feedback-to-idea` (it owns the de-dupe that stops a duplicate
   idea) and evidence for an existing idea to `add-insight` (it owns the native Insight write). Do
   not create ideas or Insights directly.
6. **Epic descriptions** that need rewriting go to `jira-epic-groomer`, never edited inline here.

If a write fails, complete the rest and report exactly which landed and which did not, with the
error. A partial run reported as complete is worse than a failed one.

### 7. Report and log

A short close-out: meetings swept, what was filed, what was created with links, what still needs
Niel, and what was skipped and why. Append `## [YYYY-MM-DD] sweep | N meetings` plus two or three
lines to `40 Meetings/log.md`, so tomorrow's run knows where it starts.

## Guardrail block

- **Trigger**: on-demand, or a scheduled end-of-day run. Skills cannot schedule themselves: set a
  Cowork scheduled task whose prompt is "run the meeting sweep for today".
- **Reads**: Granola (Niel's meetings), Jira, Confluence, the vault's work layers.
- **Vault scope**: writes the work layers only. `20 Areas/Personal` and `10 Projects/Personal` are
  NO-GO, always.
- **Autonomous actions**: filing to the vault, at any confidence band. Nothing else.
- **Human-in-the-loop**: every outward write, as one batch approval at step 5. A status transition
  on another person's ticket is never batched; it is asked for on its own or left as a proposal.
- **Escalation**: an item that cannot be routed confidently is listed as "needs you" in the
  close-out and dropped in `00 Inbox/`, rather than guessed into the wrong system.

## This skill must never

- Delete or rewrite existing Confluence content. Comment, or append a dated section. If a change
  would remove text, abort that row and say so.
- Overwrite a Jira description, field, or comment it did not author. Add a new comment instead.
- Transition, close, assign, or reprioritise another person's ticket on a batch approval.
- Post the same note twice. Check for the citation stamp before every write
  (`write-rules.md`, "Idempotency").
- File, quote or summarise personal content, even when the meeting mixed it with work.
- Fabricate an owner, a due date, a decision, or an attendee. If the meeting left it unsaid, the
  item carries "owner not stated" and goes to the needs-you list.
- Create a JPD idea or a native Insight directly, bypassing `feedback-to-idea` and `add-insight`
  and their de-dupe.

## Definition of done

Every meeting in scope is either filed with a page in `40 Meetings/` carrying its Granola id, or
recorded as deliberately skipped with a reason. Decisions and actions are in their vault layers with
provenance. The outward batch was shown once, approved, and executed with each write carrying its
citation stamp. Confluence gained content and lost none. The close-out names what needs Niel, and the
sweep is logged.

## References (read on demand)

- `references/item-model.md`: what to extract, confidence bands, the routing table, the meeting page
  shape, and the personal filter.
- `references/write-rules.md`: the additive-write contract, idempotency stamps, the Jira and
  Confluence call shapes and their traps, and hand-off rules.
