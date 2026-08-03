# The item model: what a meeting is broken into

Loaded by `meeting-sweep` at extraction (step 3) and filing (step 4). One meeting produces a handful
of typed items, each with an evidence line, a confidence band and a route. Everything downstream
keys off this shape.

## The seven item types

| Type | What counts | What does not |
|---|---|---|
| **Decision** | A choice made, with enough specificity to act on. "We're going with the two-step flow, Q3." | An option discussed and left open. A preference expressed with nobody agreeing. |
| **Action** | A commitment with an owner. "Niel will get the pricing table to Sam by Friday." | "Someone should look at that." An intention with no owner is an open question, not an action. |
| **Product signal** | Customer, sales or support evidence about a problem: a quote, a churn reason, a repeated request, a venue's workaround. | An internal opinion about what customers want. That is an open question until evidenced. |
| **Jira reference** | An existing key named or clearly identified ("the offline printing epic"), with something new said about it. | A key mentioned in passing with nothing new attached. |
| **Confluence reference** | An existing page or spec the meeting updated, contradicted, or resolved a question on. | A page mentioned as background. |
| **Risk or blocker** | A named thing that will stop or delay work, with what it blocks. | General worry with no object. |
| **Open question** | Something the meeting could not settle, still live. | Rhetorical questions, and anything the meeting then answered (that is a decision). |

**Executive asks** are a flag, not a type: any item where a leader asked Niel for something gets
flagged so it surfaces first in the close-out, whatever its type.

## Extraction rules

- **Quote, don't paraphrase, for the evidence line.** One line of the actual wording per item, from
  the Granola notes or (where it matters) the transcript. The paraphrase is the item; the quote is
  what makes it auditable.
- **One item, one claim.** A decision that carries an action carries two items, cross-linked.
- **Attribute by name where the meeting names people.** Speaker labels in a Granola transcript are
  `Me`, `Them`, or a name; only a name is an attribution. `Them` is "a participant", never a guess.
- **Contradictions are items too.** When a meeting contradicts something already in the Brain or on
  a Confluence page, that is a high-value item: it routes to a flagged note, never a silent
  overwrite.
- **A meeting with nothing in it produces nothing.** A status call where nothing was decided gets a
  meeting page and no items. Do not manufacture items to justify the run.

## Confidence bands

From the operating model's confidence gate (`docs/operating-model_v0.1_2026-07-14.md` §3). Every
item carries a band and a one-line why. The band describes how sure the extraction is; the *action*
threshold rises with who the action reaches.

| Band | Meaning | What it may drive |
|---|---|---|
| **Low** | Inferred from vague wording, or one ambiguous mention. | The Brain and the needs-you list. Nothing outward. |
| **Medium** | Plausible reading, but a person should confirm the wording or the owner. | Proposed outward with the wording shown; never pre-ticked in the batch table. |
| **High** | Stated clearly and unambiguously in the meeting. | Proposed outward, pre-ticked. Eligible for Niel's own board (EVITA). |
| **Very High** | Stated explicitly, and corroborated (restated, confirmed by another participant, or already reflected in a ticket). | Proposed outward including anything that reaches another person. |

Nothing outward runs without the step-5 approval regardless of band. The bands exist so Niel can
approve a batch by reading four columns instead of thirty rows, and so the thresholds can be
loosened later on evidence rather than on optimism.

## The routing table

| Item | Route | Owned by |
|---|---|---|
| Decision | `41 Decisions/` page, linked from the meeting page. If it changes a ticket or a spec, also a comment on that Jira issue or Confluence page. | this skill |
| Action, Niel's | Inline `- [ ]` on the meeting page, rolled up in `42 Actions/`, plus a task on **EVITA** with owner and due date. | this skill |
| Action, someone else's | Inline `- [ ]` on the meeting page, plus a comment on the relevant issue naming what was agreed. A new ticket on a team's project only where the meeting agreed the work; route by `${CLAUDE_PLUGIN_ROOT}/references/jira-teams.md`. | this skill |
| Product signal, new problem | Hand to `feedback-to-idea` with the quote, the customer, the date and the meeting citation. | `feedback-to-idea` |
| Product signal, existing idea | Hand to `add-insight` with the source. A meeting is tier 1 evidence when it carries a named customer's own words, tier 2 when it is Oolio staff reporting it (`${CLAUDE_PLUGIN_ROOT}/references/research-os.md`). | `add-insight` |
| Jira reference | Comment on the issue with what was said, quoted and cited. | this skill |
| Confluence reference | Footer or inline comment by default; an appended dated section when the page's content genuinely moved. | this skill |
| Risk or blocker | The meeting page and the close-out. A ticket only if the meeting agreed one. | this skill |
| Open question | The meeting page, and the `01 Command Centre/` rollup where it is a standing question. | this skill |
| Durable product or market knowledge | Hand to `wiki-ingest`, with the meeting page as the source. | `wiki-ingest` |
| Epic description that needs rewriting | Hand to `jira-epic-groomer`. | `jira-epic-groomer` |

## The meeting page

One page per meeting in `40 Meetings/`, filename `YYYY-MM-DD <Meeting Title>.md`. Frontmatter follows
the vault's Metadata Standard; `granola_id` is what makes the sweep idempotent, so it is never
omitted.

```yaml
---
type: meeting
class: record
title: YYYY-MM-DD <Meeting Title>
granola_id: <uuid>
date: YYYY-MM-DD
attendees: ["[[Person Name]]"]
tags: [meeting, <topic>]
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: "Granola: <Meeting Title>, YYYY-MM-DD"
swept: YYYY-MM-DD
---
```

Body, in this order: a two-to-four line summary of what the meeting was for and what came of it;
**Decisions** (each linking its `41 Decisions/` page); **Actions** as `- [ ]` checkboxes with owner
and due date; **Signal** (quotes worth keeping, with who said them); **Open questions**; **Routed**,
a short list of every outward write the sweep made from this meeting, with links. The Routed section
is what lets a future reader see the meeting's consequences without re-reading the notes.

## The personal filter

Skip and do not summarise: health, HR, compensation, performance reviews, recruitment where Niel is
the candidate, personal appointments and personal life. Where a work meeting contains a personal
passage, file the work items and leave the passage out entirely, without a placeholder describing
it. Count the skipped meetings in the close-out; name nothing.

Doubt resolves towards skipping. A missed work item costs one follow-up; a personal item filed into
a shared knowledge base cannot be unfiled.
