---
name: push-to-brain
description: Push the durable knowledge from the current conversation into the my_brain vault by changing what the Brain already holds. Appends to an existing section, edits outdated wording, updates a status or a decision, inserts a section into the right existing note, and creates a new note only when no home exists. Trigger ONLY on an explicit invocation at the end of a working session, such as "/push-to-brain", "push this to the brain", "push to brain", "save this session to the brain", or "update the brain with what we decided". Never trigger on your own, never from inside another skill, and never mid-task unless the user asks. Do NOT trigger to file a document, transcript or URL (use wiki-ingest), to answer a question from the vault (use wiki-query), to health-check or tidy the vault (use wiki-lint), for an overview snapshot (use wiki-status), or to stand up a domain (use wiki-new).
---

# Push to Brain

The Brain is the source of truth and the conversation is a diff against it. This skill works out
what the session changed or enriched, then makes the smallest change that leaves the right existing
note correct. It does not write a summary of the chat and drop it in a new file: a note nobody
links to is knowledge nobody will find, and the vault already has 599 of those.

**Explicit invocation only.** Run when the user names this skill or says to push the session to the
Brain. Being at the end of a long chat is not an invocation. If a skill or an automation thinks a
session is worth keeping, it says so and waits.

## The law lives in the vault

Read `_system/Runbooks/Push to Brain.md` first: it is this procedure as the vault states it, and it
wins where the two disagree. Then the pieces it points at: `_system/operating-system.md` §3 (the
object model), §4 (what counts as a decision), §6 (routing) and §8 (privacy);
`_system/Metadata Standard.md` §2c (the type vocabulary); `_system/Runbooks/Brain Maintenance.md`
§6 (the birth gate). If the vault cannot be opened, the fallback shape is
`${CLAUDE_PLUGIN_ROOT}/references/vault-model.md`, and the output is a paste-ready diff, not a claim
of having written anything.

Two reference files carry the detail: `references/knowledge-classes.md` (what is durable, what to
skip, the four marks, where each kind of knowledge lives) and `references/change-patterns.md` (the
shape of each operation, the idempotency protocol, supersession, worked examples, the receipt).

## Procedure

1. **Scope what you can see.** The current conversation and the agent outputs visible in it. State
   that scope in the receipt. Never claim to have reviewed other chats, sessions or agents.
2. **Harvest candidates.** Walk the conversation once and list every item that fits a class in
   `knowledge-classes.md`: decisions with their reasoning, new or changed requirements, direction,
   agreed terminology, constraints and assumptions, research findings, preferences, status and
   blockers, open questions and next actions. Give each item one of the four marks: **Decision**,
   **Proposal**, **Assumption** or **Open question**. Drop what the skip list names: casual talk,
   abandoned suggestions, repeats, debugging, low-value detail, anything behind the wall.
3. **Find the home for each item before deciding anything.** Run the helper, which searches only
   the work layers and ranks canonical pages above the ledger:
   ```
   node ${CLAUDE_PLUGIN_ROOT}/skills/push-to-brain/scripts/brain-locate.mjs find <terms>
   ```
   Then open the top candidates and read the section that would take the item. The routing table
   in `knowledge-classes.md` says which layer each class belongs in when the search is ambiguous.
   Generated pages (`generated: true`, the registers, the Command Centre rollups) are never a home.
4. **Diff, don't re-read.** For each item, prove it is not already there:
   ```
   node ${CLAUDE_PLUGIN_ROOT}/skills/push-to-brain/scripts/brain-locate.mjs has <page> "<key phrase>"
   ```
   Present and accurate means skip, and the receipt says so. Present but stale or incomplete means
   edit or update. Absent means append or insert. Only when no page can take it does create enter.
5. **Choose the operation, in this order:** append to an existing section → edit incomplete or
   outdated wording → update a status, fact or decision → insert a new section into the right
   existing note → create a new note. Each has a fixed shape in `change-patterns.md`. Every written
   item carries its date and its mark, and cites a real source when the session had one (a vault
   page, a Jira key, a Confluence page); otherwise it cites `(session, YYYY-MM-DD)`.
6. **Supersede, never stack.** When the session overturns a recorded decision: the old page gets
   `status: superseded` and a "superseded by" line, the new decision gets its own page from
   `60 Templates/Decision.md` with the reasoning and a "supersedes" line, and both link each other.
   A recorded claim the session corrects is replaced in place, with the old wording kept as a dated
   history note on the same page. Nothing is deleted, ever.
7. **Link it.** Add or repair the `[[wikilinks]]` the change makes useful: the project to its
   decision, the decision to its domain, the area to its new project. A page you create passes the
   birth gate before you move on:
   ```
   node ${CLAUDE_PLUGIN_ROOT}/skills/push-to-brain/scripts/brain-locate.mjs check <page>
   ```
8. **Bookkeep.** Bump `updated:` on every page touched. Append `## [YYYY-MM-DD] push | <subject>`
   with one to three lines to the owning domain's `log.md` when the change landed in
   `30 Knowledge`. If a decision page changed and `_system/scripts/build_decision_registers.py`
   exists, run it; if it fails, say so. Do not commit: the vault is committed by Niel on the weekly
   pass, so the receipt lists the changed paths instead.
9. **Report the receipt** in the shape `change-patterns.md` gives: files updated; what was
   appended, edited, updated or inserted; any new file and why creation was necessary; the decisions
   and open questions captured; what was skipped and why; anything that needs confirmation. If
   nothing durable came out of the session, change nothing and say exactly that.

## What pauses for the user

Go ahead without asking for appends, updates, inserts, decision supersession and a new page that
passes the birth gate. Stop and ask, once, with everything batched, before: creating a folder or a
domain (route to `wiki-new`), touching `STRUCTURE.md`, `Metadata Standard.md` or any `_system`
manual, merging or moving pages, or any change where you cannot tell whether the session settled
the point or only discussed it. A proposal never becomes a decision because it went unanswered.

## Operator guardrail block

- **Trigger** — on demand only, by explicit user invocation. Never scheduled, never chained.
- **Reads** — the current conversation, its visible agent outputs, and the vault's work layers.
  No connectors, no web, no other sessions.
- **Vault scope** — writes the work layers only: `10 Projects/Oolio`, `10 Projects/Product
  Management OS`, `20 Areas/Oolio`, `20 Areas/Product Management OS`, `30 Knowledge`,
  `41 Decisions`, `50 People` (work), `_system/memory`. `20 Areas/Personal`, `10 Projects/Personal`
  and any personal meeting or person page are NO-GO, always. No HR, compensation, performance,
  health or personal content, even when the session contained it: skip it and do not summarise it.
- **Autonomous actions** — the five operations above on existing work pages, and page creation
  that passes the birth gate. All reported.
- **Human-in-the-loop** — the list under "What pauses for the user".
- **Escalation** — when a home is genuinely ambiguous, file to the most plausible page and flag it
  in the receipt rather than guess silently, or leave a note in `00 Inbox/` naming the item.

## Done when

Every durable item from the session is either recorded in the right existing note, recorded in a
new note that passes the birth gate, or listed in the receipt as skipped with the reason. Running
the skill a second time on the same session produces no new writes. Decision history is intact:
nothing overwritten, the superseded position still readable, the new one linked to it.
