---
name: defect-writer
description: The single place QA findings are written, merged and routed, and the only writer of an epic's QA Review page. Takes findings from any QA skill, a tester, a UAT session or a pasted list, enforces no-oracle-no-defect, de-dupes across sources and open Jira, sets type, severity and confidence, then routes by stage. Before merge a failed AC reworks its story (drafted comment to the engineer and a transition back, no new ticket); after merge it drafts themed Bugs or Improvements. QA never creates Stories. All writes held for approval. Trigger on "write these up", "consolidate these findings", "turn this into tickets", "send it back for rework", "theme these UAT findings", "update the QA Review page", or a pasted list of test issues. Do NOT trigger for raw customer feedback (feedback-to-idea), a single incident (customer-escalation), or to run testing (qa-mission).
---

# Defect writer, the finding standard

Every QA skill reports through this one, so findings from six specialists, a human tester and a real UAT session land in one shape, with one severity scale, routed the way the team actually works. Engine and wrapper: the specialists find; this skill writes, merges, routes, and keeps the epic's one QA Review page.

The Menus 2.0 UAT consolidation is the pattern (source: Brain, `10 Projects/Oolio/Menu Management Experience/05_reviews/2026-09-30 Menus 2.0 UAT Consolidated Findings.md`): seventy-one findings from five sources, keyed by source, duplicates merged, Bug versus Improvement called, ten themes, a home proposed for each.

House style: `${CLAUDE_PLUGIN_ROOT}/references/house-style.md`. Standards, all in `${CLAUDE_PLUGIN_ROOT}/references/qa/`: `finding-schema.md`, `severity-and-defect-standard.md`, `oracles.md`, `routing.md`, `qa-review-page.md`, `risk-model.md` (the `flow` field and core flows), `accessibility-standard.md` (accessibility severity), and `quality-model.md` (terms: release owner, release candidate, core flow). Severity on the worst credible persona uses the cards in `${CLAUDE_PLUGIN_ROOT}/personas-library/test-personas/`.

## Workflow

### 1. Intake and validate

Accept findings in the schema, or convert loose input (a pasted list, a transcript, a spreadsheet) into it. For each:

- **No oracle, no defect.** No oracle makes it **Decision needed**, with the question a person must answer. Never a Bug.
- **Required fields.** A finding from a QA skill that is missing steps, expected, actual or evidence goes back to that skill. A finding from a person or a pasted list: ask them; if they cannot supply it, mark the field "not supplied" and keep the confidence they stated (a stated repro count stands), but it cannot become a ticket until the steps exist. Never invent a step.
- **Confidence.** Anything resting on synthetic drag, hover, timing or animation is *Needs human repro*, whatever the source claimed.
- **Type.** Bug (broken against an oracle), Improvement (minor), AC gap (behaviour the ACs missed, with a qualifying oracle), Requirement gap (new functionality, for the PO), Decision needed, Instrumentation gap, Coverage gap (a missing automated test, for engineering, never ticketed), System gap. **Never Story**: stories are requirements, and PMs and POs write them.
- **Severity** to the standard, on the worst credible persona, saying which.
- **AC link.** Where a finding fails a specific acceptance criterion, record `ac: <story>#<n>`. That link decides the route.

### 2. De-duplicate

- **Across sources:** the same problem found by three skills is one finding with three source keys. Match on the user-facing problem, not the wording.
- **Offline:** if Jira or the run log cannot be reached, say "not checked" in the register header and mark every draft "de-dupe pending" (`routing.md`).
- **Against open Jira and open rework:** search the epic for open issues and stories already in rework on the same flow (JQL on summary, labels, components; read candidates before calling a match). A match becomes a link plus any new evidence.
- **Against earlier runs** (the QA Review page's run log): mark **regression** if it was fixed before, **still open** if not.

### 3. Decide the stage, per story

From the state of the story's code, not where the finding was seen: is its PR merged (repo read only, or the story's development panel), cross-checked with its status. A branch on a Dev host with its PR open is Pre-merge. Spec, Pre-merge, Dev, Staging or Prod. If the evidence disagrees (story Done, PR open), ask.

### 4. Route (per `routing.md`)

- **Pre-merge, failed AC → rework the story, no new ticket.** Draft one comment per story for the assignee: each failed AC with steps, expected, actual, evidence, build tested and confidence, mentioning the assignee so they are notified. Read the story's transitions and propose the rework one by name.
- **Pre-merge, AC gap → a proposed new AC** on the same story, drafted for the PO. A ticket only if the PO rules it out of scope. A pre-merge P0 leads the rework comment, marked P0, and is escalated (drafted, `quality-model.md`). Pre-merge Improvements ride along in a rework comment as non-blocking notes, or wait for merge.
- **Needs human repro → Awaiting human repro**, for the QA engineer on the epic. Not routed further until confirmed.
- **Prod, trading-impacting → incident first**: draft the incident summary for a person to raise, escalate, then the Bug linked to the incident (`routing.md`). A finding outside the release's stories goes to the owning team's project, linked to the epic as "found during".
- **Merged (Dev, Staging, Prod) → themed Bugs and Improvements** under the epic, each linked to the story and AC it relates to, with fix version, priority and labels (`qa-family`, the run ID). One ticket per user-facing theme; **a P0 always stands alone**. In Prod, a trading-impacting P0 follows the incident process first.
- **Requirement gaps → the PO**, listed on the QA Review page. No ticket.
- **Decisions needed → the release owner.** Never to engineering until ruled.
- **System gaps → Design.**

Do not create linked tickets for a story still in rework. The story, its comments and the QA Review page are the record.

**Under `qa-mission`, P0 and P1 write batches wait for independent verification.** Standalone, they wait until the finding is Reproduced ×2 from a clean start.

### 5. Hand back, then hold

Present the register ([references/register-format.md](references/register-format.md)) with the proposed writes grouped: rework comments and transitions, new-AC proposals, ticket drafts, QA Review page update. **Then stop.** Write nothing until the person approves, batch by batch. On approval, make the writes with the Atlassian tools and update each finding's status (`Rework <key>`, `Created <key>`, `Rejected` with the reason).

### 6. Write the QA Review page

Find or create the epic's single QA Review page under the PRD (`qa-review-page.md`), on approval. The verdict line is `qa-mission`'s to set and the release owner's to decide; a standalone `defect-writer` run leaves it unchanged. AC totals per story come from the Test Basis (or the stories in Jira). Update the AC results (Pass, Fail, Blocked, Not tested, with tested-by, when, build and evidence), the quality checks, open findings, requirement gaps, known issues, the run log and the verdict history. Non-destructive: append and update, mark and date changes, never delete, never create a second page.

## Must never

- Write to Jira or Confluence, or mention an engineer, without approval for that batch.
- Create a Story, or a linked ticket for a story still in rework.
- Drop a finding to improve the numbers; rejected and merged findings keep their record.
- Type an opinion as a Bug, or raise confidence beyond the evidence.

## Guardrails

Trigger: on demand, or inside every QA skill. Reads: Jira, Confluence, the repo read only (PR state). Autonomous: validating, merging, theming, routing, drafting. Always pauses: every Jira and Confluence write and every notification. Escalation: a P0 on a release candidate is put at the top of the register as an ESCALATION with a message to the release owner drafted, not held for the batch and not sent without approval. Autonomous writes (run-prefixed data) on PR previews only; shared hosts need approval (`environment-register.md`). Every escalation is drafted, never sent (`quality-model.md`). Vault scope: the Brain's work layers only, read only; never writes the vault.

## Definition of done

Every finding validated; no Bug without an oracle; no Story created; duplicates merged with all sources kept; stage decided per story with evidence; every finding routed (rework, new AC, ticket, PO, owner or Design); nothing written without approval; the QA Review page updated with AC results and the run log.
