# Change patterns: the shape of each operation, and how a re-run stays silent

`push-to-brain` makes five kinds of change, tried in this order. Each has one shape so two sessions
a month apart leave a page that reads as one page. The idempotency protocol at the end is what
makes running the skill twice a no-op.

## 1. Append: add to an existing section

The default. The page and the section already exist; the session adds to what they say.

- Add at the end of the section, as a dated bullet or a dated sentence, in the register the section
  already uses (a bulleted section gets a bullet, a prose section gets a sentence).
- Carry the mark and the source: `- Decided 2026-09-22: purchase orders are web-only in phase 1
  ([[Purchase order surfaces are web back office only in phase 1]]).`
- Extend the section that exists. Never add a second heading with the same name: the POS domain
  README carried two `## Signals received` headings after an append that did not look first, and
  that is the failure this rule prevents.

## 2. Edit: fix incomplete or outdated wording

The page says something the session showed to be wrong, partial or out of date.

- Replace the wording in place. If the old wording recorded a claim (a number, a position, a
  plan), keep it: strike it and add the correction with the date, the way the Storefront Websites
  README does (`~~old line~~ **Superseded by the VPC, 5 August 2026.**` then the new position).
- A pure wording improvement with no change of meaning does not need the history note.
- Do not rewrite the page around the edit. One sentence wrong means one sentence changed.

## 3. Update: change a status, a fact or a decision

The page is right in shape and wrong in one value.

- Frontmatter: `status:`, `priority:`, `review:`, `jira:`. Always `updated:` to today.
- A Status section: replace the current line. If it had a date, the old line becomes a dated
  history note under it rather than vanishing.
- A decision with `status: open` that the session settled: set `decided`, fill **Decided by** and
  **Evidence that settled it**, add the reasoning to **Why** if it changed, bump `updated:`.

## 4. Insert: a new section in the right existing note

The page is the home, but nothing on it covers this yet.

- Put the section where a reader would look for it, not at the foot: an "Open questions" section
  after Status, a "Constraints" section before Links. Mirror the heading level of its neighbours.
- Keep the page's own vocabulary and structure. The Project template has `Status`, `Headline
  deliverable`, `Links`, `Related`; a project page gets those names, not new ones.
- An inserted section still carries dates and marks on its lines. The heading carries neither.

## 5. Create: the last resort

Only when the `find` search and the routing table both fail to produce a page that can take the
item. The receipt names the pages that were considered and why each was wrong.

- Use the template for the type (`60 Templates/Decision.md`, `Project.md`, `Area.md`; a knowledge
  page follows the schema in `operating-system.md` §3). Filename `Title Case With Spaces.md`,
  globally unique title, in the folder `STRUCTURE.md` §8 names for that kind of thing.
- **Born with frontmatter, born linked.** The block first, then the body, then a link from the page
  that caused it to exist or a listing on the owning folder's README. Verify with
  `brain-locate.mjs check <page>` before moving on; a fault means fix it now.
- `source: session:YYYY-MM-DD-<slug>` on an operational page, where the slug is two to four words
  naming the session's subject (`session:2026-09-22-push-to-brain-skill`). Knowledge pages cite
  their sources inline instead.
- Never create a folder, a domain, a person page, a template, or anything under `_system`. Those
  are `wiki-new`, the daily ingest, or a proposal to Niel.

## 6. Supersession: the decision history is a ledger

A session that overturns a recorded decision touches two pages, and both stay readable.

**The old page:** `status: superseded`, `updated:` today, and the line
`**Supersedes / superseded by:** superseded by [[New Decision]] (YYYY-MM-DD), because <one clause>.`
Nothing else on it changes. The vault's live example is
`41 Decisions/2026/Auto-Generate Venue and Store IDs on First Send, Not Manual Mapping.md`.

**The new page:** from the Decision template, `status: decided`, its own **What / Why / Decided by /
Dissent / Evidence**, and `**Supersedes / superseded by:** supersedes [[Old Decision]] (YYYY-MM-DD),
because <one clause>.` Its `source:` is the session unless the session was working from a meeting or
a document, in which case that is the source and the session is a `refs:` entry.

**Elsewhere:** the project or area page that cited the old decision gets its citation updated with
the strike-and-date pattern from §2. The registers in `41 Decisions/Registers/` are generated: never
edit them; run `python3 _system/scripts/build_decision_registers.py` if it exists.

The same discipline applies to a corrected claim on any page: the old claim becomes a dated history
note on the same page, the new one takes its place. Deleting is not an operation this skill has.

## 7. The idempotency protocol

Running the skill twice on the same session must produce no second write. Four checks, in order.

1. **Same-session check.** Before anything else, look for this session's footprint: a `push |
   <subject>` entry dated today in the owning `log.md`, or `session:YYYY-MM-DD-<slug>` on a page.
   Found means this is a re-run: treat everything already pushed as present and diff only what is
   new since.
2. **Same-fact check.** For every item, `brain-locate.mjs has <page> "<two or three key phrases>"`
   against the destination. All found means skip and list under "already present". Partly found
   means the item is an edit or an update, not an append.
3. **Same-section check.** Before an insert, confirm no heading on the page already covers the
   topic under another name (`find` prints the headings). An existing section wins.
4. **Marks never escalate on their own.** A Proposal already on the page stays a Proposal on a
   re-run unless the session in front of you settled it. An Assumption becomes a fact only when a
   source arrived.

Every written line carries its date, which is what makes checks 1 and 2 possible next time.

## 8. Worked examples

Compact before-and-after for the seven cases the skill is tested against. The session is the
same throughout: a working session on a project called Tenders that ends with `/push-to-brain`.

**Append to an existing project.** The session established that the Tenders response is due on
the 30th and that Legal owns the liability schedule. `find tenders` returns
`10 Projects/Oolio/Tenders/README.md`; its Status section has neither fact.
Append two dated bullets under Status. Receipt: "Appended (2 lines) to Tenders README › Status."

**Update a changed decision.** The vault holds `Submit the Tender as a Single Consolidated
Response` (`status: decided`). The session, with Niel deciding, split the response into two lots
because the buyer's portal rejects a single upload over 50 MB. New page `Submit the Tender as Two
Lots` from the template, `supersedes` line naming the size limit; old page `status: superseded`
with the `superseded by` line; the Tenders README line that cited the old decision struck and
dated. Receipt lists both pages and the README.

**Insert a missing requirement.** The session surfaced a requirement (WCAG 2.1 AA on any
customer-facing surface in the response) and the Tenders README has no section for requirements.
The Project template does not name one, so it takes the neighbour-level heading `## Requirements`
after Status, one dated line, marked Decision if Niel settled it or Proposal if the bid lead only
raised it. Receipt: "Inserted section Requirements (1 line) in Tenders README."

**Avoid duplicated content.** The session repeated that the deadline is the 30th, which run one
already appended. `has` finds "due 30 September" on the page. Skipped. Receipt: "Already present:
deadline (Tenders README › Status)."

**Ignore casual conversation.** Twenty minutes of the session were about whether the portal's UI
was designed by someone who hates bid writers, plus one abandoned idea to automate the upload.
Nothing kept; nothing in the receipt unless the user asks why. The abandoned automation idea is
skipped as a suggestion not adopted; had Niel rejected it with a reason, that reason would be a
Decision line.

**Create a new note only when no destination exists.** The session settled how the team will
score competing tenders in future, a reusable method, and no project, area or knowledge page covers
tender scoring (`find tender scoring` returns nothing above the ledger). A synthesis page in the
owning domain, or a page under `20 Areas/Oolio/Product Leadership/` if the method is a way of
working, born with frontmatter, linked from the Tenders README under Related, checked with the
helper. Receipt names the pages considered and why none fitted.

**No changes when the Brain is already current.** The session re-read the Tenders README, agreed
with it, and did some drafting in Confluence that Confluence holds. Every candidate fails the
same-fact check or the skip list. No writes. Receipt: "Reviewed this conversation. Nothing durable
is missing from the Brain: the three facts discussed are already on the Tenders README; the draft
lives in Confluence at <link>."

## 9. The receipt

Always the last thing the skill produces, in this order, omitting empty sections.

```
Push to Brain: <subject>, YYYY-MM-DD
Reviewed: this conversation and the agent outputs visible in it.

Files updated
- <path>: appended 2 lines to Status; updated bumped
- <path>: status open → decided; Evidence filled

Appended / edited / updated / inserted
- <one line per change, naming the page, the section and the operation>

Created
- <path>: why no existing page could take it (pages considered: …); birth gate clean

Decisions and open questions captured
- Decision: <title> ([[page]]), supersedes <old> because …
- Open: <question> (on <page>)

Skipped
- Already present: <item> (<page> › <section>)
- Not durable: <item>, <reason>
- Behind the wall: <count> item(s), not summarised

Needs confirmation
- <the batched Amber list, or "none">

Not done: git commit (Niel commits weekly); Jira issues for the 2 captured actions.
```
