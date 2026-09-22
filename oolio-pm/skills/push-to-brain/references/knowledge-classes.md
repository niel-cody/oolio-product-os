# Knowledge classes: what a session leaves behind that is worth keeping

The harvest step of `push-to-brain` walks the conversation once against this list. Anything that
fits a class is a candidate; anything on the skip list is not. The four marks then say how sure the
vault is allowed to be about it, and the routing table says which layer takes it.

## 1. The classes

| Class | What it looks like in a session | Keep when |
|---|---|---|
| **Decision and reasoning** | Niel resolved a question with intent to act: "go with X", "we are not doing Y", "the answer is D" | The call and the why are both stated. A call with no why is captured as `status: open` with the why marked missing |
| **Requirement, new or changed** | A must-have, a constraint on scope, an acceptance condition, a "phase 1 is web only" | It changes what gets built, not how the chat went |
| **Direction** | Where a product or project is heading, what is in and out, the framing that replaced an older framing | The framing is the settled one, not one option among several |
| **Agreed terminology** | A name for a thing that the session settled on, or renamed | It will be used again and someone else needs to know the word |
| **Constraint or assumption** | A fact taken as given, a limit imposed from outside, a dependency, a date | It would change the work if wrong, so it needs to be visible |
| **Research finding** | A fact established from a source read in the session, a number, a competitor move | It has a source. A finding with no source is an assumption |
| **Preference or principle** | How Niel wants work done, a rule of the house, a working habit | It will apply to the next session too |
| **Status, progress, blocker** | What shipped, what moved, what is stuck and on whom | The owning project or area page says something older |
| **Open question and next action** | A question raised and not settled; a thing somebody committed to do | The owner or the question is named. Actions go to the page as a capture, never as a tracker |

## 2. The skip list

Leave these out, and say so in the receipt only when the user might expect them to be kept.

- Casual conversation, thinking out loud that went nowhere, courtesy.
- Suggestions that were raised and abandoned, or options not chosen. Exception: a rejection with
  stated reasoning is a decision ("not the accordion, because it overwhelms during service").
- Repeated content: keep the last, most complete statement.
- Debugging, tool errors, retries, intermediate outputs a later one replaced.
- Low-value detail: file paths, command lines and IDs that the repo or the source system already
  records, unless the note is about them.
- Anything already recorded accurately in the vault. Checked, not assumed (the `has` command).
- Anything behind the work/personal wall, and anything that is HR, compensation, performance,
  health or personal, even when it appeared in the session.
- Anything from a chat, session or agent you cannot see. It does not exist for this run.

## 3. The four marks

Every kept item carries exactly one mark, in the text, so the reader knows how much weight it
bears. The mark is a word at the start of the line or the sentence, not a tag.

| Mark | Meaning | Written as |
|---|---|---|
| **Decision** | Niel (or someone with authority in the session) settled it with intent to act | A decision page in `41 Decisions/`, or a line beginning `Decided YYYY-MM-DD:` on the owning page that links the decision page |
| **Proposal** | Suggested in the session, by anyone, and not settled. This includes anything Claude proposed that Niel did not answer | `Proposed YYYY-MM-DD:` and the reason it was raised. Never promoted on a re-run |
| **Assumption** | Taken as true without a source, or a finding whose source was not in the session | `Assumed YYYY-MM-DD:` and what would falsify it |
| **Open question** | Raised, not settled, and worth carrying | `Open:` with who or what would settle it |

A line without a mark is a fact with a source, cited inline as `([[Source Page]])` or `(jira:KEY)`
or `(confluence:<id>)`. When the only source is the conversation itself, it is `(session,
YYYY-MM-DD)`, and the reader knows to treat it as Niel's word on the day.

## 4. Routing: where each class lives

The `find` command usually settles this: the page whose title or headings already carry the topic
is the home. When the search returns nothing decisive, this table decides. Layers are the vault's
own (`STRUCTURE.md` §8 and `operating-system.md` §6).

| Class | Home, in order of preference |
|---|---|
| Decision | An existing `41 Decisions/YYYY/` page with `status: open` that this settles (update it) → a new page from `60 Templates/Decision.md` in `41 Decisions/YYYY/`, linked from the owning project or area page. A decision about the vault's own shape belongs in `STRUCTURE.md` §9, which this skill proposes but never edits |
| Requirement, direction | The owning project's `README.md` (its Status or the section that already covers the topic) → the PRD in that project's `prd/` if one exists → the owning area's `README.md` |
| Agreed terminology | The concept or entity page that names the thing in `30 Knowledge` → the domain `README.md` entity and concept list → for the operating system itself, the page in `20 Areas/Product Management OS/` that owns the concept |
| Constraint, assumption | The owning project `README.md` → the knowledge page the assumption is about |
| Research finding | The `30 Knowledge` page for the capability, concept or synthesis, citing the source. A competitor fact goes to its canonical page in `30 Knowledge/Market/Competitors/`. A finding with a source document that has no `Sources/` page yet is flagged for `wiki-ingest`, which gives it provenance properly |
| Preference, principle | `_system/memory/MEMORY.md` under "Durable learnings", as a dated line (the file asks to be updated at the end of substantive work). A product principle is proposed for `_system/Product Principles.md`, not written there |
| Status, progress, blocker | The owning project `README.md` Status section (replace the stale line, keep the old one as a dated history note if it recorded a claim) → the owning area page |
| Open question | The owning project or area page, under an existing "Open questions" heading, or the decision page it relates to with `status: open` |
| Next action | An inline `- [ ] owner: what, by when` on the owning page. Per the vault's rule of 2026-09-02 the vault does not track actions: this is a capture, and the receipt says Jira is the tracker |
| Work-person fact | An existing `50 People/` page only. This skill does not create person pages; the daily ingest does, on the second appearance |
| PMOS, skills, the operating system itself | `20 Areas/Product Management OS/` for durable thinking, `10 Projects/Product Management OS/` for a finite build. Not Oolio, not Personal |

Ambiguous after all that: file to the most plausible page and flag it in the receipt, or leave a
one-line note in `00 Inbox/` naming the item and the two candidate homes. Wrong-but-visible beats
silently-lost.
