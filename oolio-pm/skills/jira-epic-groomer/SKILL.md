---
name: jira-epic-groomer
description: Groom or backfill a Jira epic description so anyone, inside or outside engineering, can read in a minute what ships, why, who it is for, when it is done and what was decided: What, Why, Who it's for, Definition of done (native tick boxes), Decisions (native decision items), earlier history collapsed, nothing Jira already shows. Trigger PROACTIVELY whenever the user references a Jira epic key (`OR-XXXX`, `PAPP-XXXX`, `EDU-XXXX`) and asks to "describe", "groom", "polish", "backfill", "tidy up", "rewrite", "add the definition of done", "record a decision on" or "write a description for" the epic, wants epic descriptions standardised across a project or an epic ready for Steering, or pastes a PRD and asks for the matching epic description. Do NOT trigger for stories, tasks, bugs, sub-tasks or JPD ideas. Use `jpd-idea-groomer` for IDEA / OHSI / DISC tickets.
---

# Jira Epic Groomer

Write the description on a Jira epic so that a person who was not in the room can read it in under a minute and come away knowing five things: **what** we are building, **why**, **who** it is for, **when it is done**, and **what has been decided** along the way. Engineers, Steering, Sales, Support and new starters all read the same epic. The description is written for the one who knows least.

This skill is **draft-then-confirm by default**. Show the draft, get explicit approval, then push to Jira. Epics are visible to a wide audience and the description should not churn in front of them. If the user says "just push it", skip the confirm step.

The output is written in **Atlassian Document Format (ADF)**, not markdown, because tick boxes, decision items and the collapsed history only exist in ADF. The exact JSON shape, the verification markers and the fallback live in [references/epic-description-adf.md](references/epic-description-adf.md).

---

## The standard

A groomed epic description has five sections, in this order, and then a collapsed block of history. Current content first, history last and out of the way.

| Section | Answers | Shape |
| --- | --- | --- |
| **What** | What ships, and where it lives | 1 to 3 sentences, plain language, no implementation detail. One italic line underneath for facts that have no Jira field of their own, if any. |
| **Why** | The pain, the cost of not doing it, the hard date if there is one | 2 to 4 sentences, anchored in operator pain or business outcome. |
| **Who it's for** | The people who benefit | Two or three personas, each with a one-line job to be done. |
| **Definition of done** | When the epic can be closed | 4 to 7 native tick boxes. Each is an outcome a person can verify. |
| **Decisions** | What was decided during research, discovery and delivery, and why | Native decision items, newest first, one line each. |
| **Earlier notes** | What the description used to say | A collapsed expand holding the old history verbatim. Omitted when there is none. |

### Never repeat what the Jira page already shows

The description sits beside fields that answer the routine questions. Do not duplicate them. No story list or table (child issues show it). No release or target date (Fix Version). No owner (Assignee). No status. No PRD or Figma links in the text once they are attached to the issue. The one exception is a fact with no field of its own, kept to one italic line under **What**, such as which repositories the frontend and backend live in.

### Definition of done, not acceptance criteria

Acceptance criteria belong on stories: they say when a story works. The definition of done says when the epic can be closed. The two are not the same list and the epic must not copy the stories' criteria.

- Four to seven items. Each is an outcome a person can check in the build, not a feature list.
- Write each one so a tick needs evidence: "The Online Store shows only what is live and orderable", not "Resolver built".
- Every item is a native Jira tick box, state `TODO` when written.
- An item is ticked only when it has been verified in the build, never because a story moved to Done. The epic closes when every box is ticked. See **Tick mode** below.

### Decisions

- Native Atlassian decision items, state `DECIDED`, newest first.
- One line each: `<day> <Mon>: <what was decided>. <why, in a clause, if not obvious>.` Add the year only when the epic spans a year end.
- Only decisions that change scope, shape or date. Not progress notes; Jira's history already records edits.
- A reversed decision is never deleted. Add the new decision on top and strike through the text of the old one, so the trail stays visible.
- A decision that changes the product, not just the plan, also goes into the PRD's change history. The epic carries the short form; the PRD carries the reasoning. Say so in the report if the PRD still needs that entry.

### Attach, do not link in text

The PRD belongs on the epic as a linked Confluence page, and the Figma page or section as a design on the epic. Each story gets the Figma section that covers it. The Atlassian connector can read remote links but cannot create them, so the skill **checks what is attached, reports the gaps, and gives the exact links to attach by hand**. It also flags a superseded PRD that is still attached.

---

## Workflow

### 1. Fetch the epic

Use the Atlassian connector. The cloudId is `oolio.atlassian.net`.

```
getJiraIssue
  cloudId: oolio.atlassian.net
  issueIdOrKey: <EPIC-KEY>
  fields: ["summary", "description", "status", "issuetype", "assignee", "fixVersions", "issuelinks", "comment"]
  expand: renderedFields
  responseContentFormat: markdown
```

Confirm `issuetype.name` is `Epic`. If it is a Story, Task, Bug, Sub-task or JPD Idea, stop and tell the user. For JPD ideas point them to `jpd-idea-groomer`.

Keep both views of the description. The markdown is what you read. The rendered HTML (`renderedFields.description`) is how you tell which parts are already native nodes: a decision item renders with a `<>` marker at the start of its line, a tick box renders as a checkbox, and an expand renders as a collapsible block. Plain `<li>` and `<p>` mean plain text.

### 2. Pull the children for context

Ground **What** and the **Definition of done** in what is actually being built, not in the epic title.

```
searchJiraIssuesUsingJql
  cloudId: oolio.atlassian.net
  jql: parent = <EPIC-KEY> ORDER BY rank ASC
  fields: ["summary", "status", "issuetype", "assignee", "resolution"]
```

Do not list or quote the children in the description. Their text is acceptance-criteria flavoured and the child issues panel already shows them.

### 3. Check what is attached

```
getJiraIssueRemoteIssueLinks
  cloudId: oolio.atlassian.net
  issueIdOrKey: <EPIC-KEY>
```

Note which Confluence pages are linked, which one is the current PRD, and whether any linked PRD has been superseded (a later PRD covers the same scope, or the page says so). Note whether a Figma design is attached. Record the gaps for the report in step 8. If a PRD or Figma link exists only as text in the description, it moves to the gaps list and comes out of the text.

### 4. Harvest the history and the decisions

Read the existing description and the comments. Pull out:

- **Decisions already made**, dated where the source gives a date. Rewrite each to one line in the decision format. Keep every one that changed scope, shape or date, including reversed ones (struck through).
- **Everything the new shape drops**: dated "Updated..." paragraphs, struck-through lines, closed questions, old headers. This moves verbatim into **Earlier notes**. Nothing is deleted.
- **Open questions** that are not yet decisions. These go to the user, not into the description.

If **What**, **Why** or **Who** is weak or missing from the source material, ask before drafting. A focused question is cheaper than a polished draft built on an assumption the team does not share.

### 5. Draft

Use the **Output template** below and the **Writing style** rules. The current content (What to Decisions) should fit on one screen without scrolling. If the five sections run past about 250 words, cut.

### 6. Show the draft, then confirm

Present the draft as it will read, plus the gaps list. Ask for confirmation. If the user wants changes, edit and reconfirm.

### 7. Push in ADF

Build the ADF document from the reference skeleton and push it:

```
editJiraIssue
  cloudId: oolio.atlassian.net
  issueIdOrKey: <EPIC-KEY>
  contentFormat: adf
  fields: { "description": <the ADF document> }
```

### 8. Verify, then report

Re-read the issue with `expand: renderedFields` and confirm the native nodes survived: decision items carry the `<>` marker, tick boxes render as checkboxes, the expand renders collapsed. If Jira rejected a node or flattened it, fall back to the markdown shape in the reference file and **say so**. Never leave a half-converted description.

Then give the user:

- The link to the epic.
- The gaps list: which PRD and Figma pages to attach to the epic, and which Figma section each story needs. Exact URLs.
- Any superseded PRD still attached.
- Any decision that also needs an entry in the PRD's change history.
- Open questions that did not become decisions.

---

## Modes

**Groom** (default). The full rebuild described above. Also the right mode for an epic that already follows the v1 shape (What, Why, Who) and needs the done list, the decisions and the collapsed history added.

**Decide.** The user says "record a decision on PAPP-860: …". Fetch, add one decision item at the top of **Decisions** in the format above, strike through any item it reverses, confirm, push, verify. Nothing else in the description changes. Remind the user if the decision changes the product and the PRD needs the long form.

**Tick.** The user says "tick 'the Online Store shows only what is live' on PAPP-860". A box is ticked only against evidence: a finding or verdict on the epic's QA Review page, a `qa-mission` result, or the user stating in the conversation what they verified and when. Set the item to `DONE` and append the evidence in brief to the item text, for example "(verified 14 Oct, QA Review)". No evidence, no tick: say what would count. When the last box is ticked, say the epic is ready to close, and leave the transition to a person.

---

## Output template

This is how the description reads once rendered. The headings are level 3. The tick boxes, the decision items and the expand are native nodes, built from the reference skeleton.

```
### What
[1 to 3 sentences. What ships and where it lives.]
_[One italic line for facts with no Jira field, if any.]_

### Why
[2 to 4 sentences. The pain, the cost of not doing it, the hard date if there is one.]

### Who it's for
* **[Persona]** [one-line job to be done].
* **[Persona]** [one-line job to be done].

### Definition of done
[ ] [Outcome a person can verify.]
[ ] [Outcome a person can verify.]
    (4 to 7 native tick boxes)

### Decisions
<> [d Mon]: [what was decided]. [why].
<> [d Mon]: [what was decided]. [why].
    (native decision items, newest first, reversed ones struck through)

▸ Earlier notes
    (collapsed expand holding the old history verbatim; omitted when there is none)
```

---

## Writing style

The house style is tight and slightly informal. Apply it to every section.

Punctuation:

* No em dashes. Use commas, full stops, or rewrite the sentence.
* Avoid semicolons. Use full stops, "and", or "but".
* Limit parentheses. Blend extra detail into the main sentence.
* Use colons sparingly. Do not announce lists.

Language:

* Drop hedging like "however" or "it's worth noting". State directly.
* Cut filler transitions like "furthermore" or "in conclusion".
* Use contractions when the tone is informal.
* Swap formal words. "use" not "utilise", "find out" not "ascertain", "help" not "facilitate".
* British English.

Style:

* Concise sentences with varied length. Short does not mean clipped.
* Write for the reader who knows least. If a term needs the team's context to parse, say it another way.

---

## Personas to consider

Pick two or three that genuinely benefit. Do not list every persona to look thorough. If only one benefits, list one.

The names below are epic-description shorthand for the persona library bundled with this plugin (`${CLAUDE_PLUGIN_ROOT}/personas-library/`, indexed in `personas.md`). When you need more than a name, read the persona file rather than guessing.

* **Owner-operator / single-venue operator.** Runs one venue. Hands-on. Cares about cash and margin.
* **Venue manager / general manager.** Runs the day. Sets things up once, between services.
* **Group owner / multi-venue operations manager.** Runs several sites. Needs rollup and consistency without policing each venue.
* **F&B lead / executive chef.** Owns menu, recipes, modifiers and ingredient cost.
* **Front of house / cashier / floor manager.** Uses the POS in service. Cares about speed and reliability.
* **Back office / finance.** Reconciles sales, taxes, payouts.
* **Diners and guests.** For online ordering, kiosk and loyalty epics, the person at the other end of the screen.
* **Oolio internal teams (Support, Onboarding, Sales).** For tooling and enablement epics.

---

## Worked example

`PAPP-860` (Featured products, scheduled by day and daypart), as groomed on 9 October 2026. Shown as it reads. Fix Version, Assignee, the linked PRDs and the child stories are on the Jira page and so are not in the text.

```
### What
A venue builds a featured list of the products it wants to push and sets when it shows:
schnitzel on Monday, pizza on Wednesday, roast on Sunday. The Online Store shows whatever
is live, with nobody swapping anything by hand. It all lives in one place, Featured Lists,
with each list in a side drawer that has Details and Schedule tabs.
_Frontend in the BackOffice repo on the PR-430 components, backend in products-api._

### Why
Featured Pages is a manual swap, so nobody keeps it current and the real promotion lives
on a chalkboard. Scheduling it turns a static banner into merchandising, and it's how me&u
present a menu. It's a 1 November must for Duxton (Operation Me&u).

### Who it's for
* **Venue managers** set up the week's specials once, between services.
* **Group owners** run the same promotion across venues without policing each one.
* **Diners** see the special while it's on, never one that's finished or can't be ordered.

### Definition of done
[ ] A venue can build a featured list of products, sizes or whole categories, in the order the guest sees them.
[ ] Each list carries its own weekly schedules by day, time and store, and saving one never changes another.
[ ] A list can be paused or made inactive without losing its schedules.
[ ] A default list shows when nothing is scheduled, so the featured section is never blank.
[ ] The Online Store shows only what is live and orderable at that store, at that moment.
[ ] The old Featured page option is gone from menu layouts.

### Decisions
<> 9 Oct: featured lists use the PR-430 list view and side drawer pattern (Option Groups,
   Size Groups). One nav item, Featured Lists.
<> 9 Oct: two stories, one per Figma section. PAPP-899 merged into PAPP-1098 and cancelled.
<> 9 Oct: preview cut from this release. Figma sections 3 and 4 superseded.
<> 9 Oct: Inactive replaces Archive, as Size Groups. Deleting a list is out of scope.
<> 9 Oct: Pause is the blue footer button, until resumed or a date. Schedules are kept.
<> 9 Oct: ships on a simple day and time rule, not the shared schedule engine (PAPP-1084).
<> 8 Oct: Collections renamed Featured Lists. Target pulled forward from OCT 4 to OCT 3.
<> 7 Oct: PAPP-992 removes the old Featured page option from menu layouts, shipping with OCT 3.
<> 18 Sep: rescoped from "Per-location menu content" to featured products only. Images moved
   to PAPP-958, dietary labels to custom attributes, order-type messages and per-location
   descriptions dropped.

▸ Earlier notes
   (the dated 8 and 9 October update paragraphs, the closed questions and the pre-9 October
   header, verbatim, with their strikethroughs)
```

Note the details. The done list is outcomes, not the stories' acceptance criteria. Each decision is one line with its date first. The history is kept but out of the way. Nothing in the text says who owns it, when it ships or which PRD covers it, because the Jira page already does.

---

## Common mistakes

* **Writing a thesis.** The reader has a minute. Current content fits one screen.
* **Copying the stories' acceptance criteria into the done list.** Done is outcomes for the epic, checkable in the build.
* **Ticking a box because a story moved to Done.** A tick needs evidence from the build.
* **Decisions as progress notes.** "Started the schedule tab" is not a decision. Only scope, shape or date.
* **Deleting a reversed decision.** Strike it through and add the new one on top.
* **Repeating a Jira field in the text.** Release, owner, status, story list, attached PRD: all on the page already.
* **Linking the PRD in the text instead of attaching it.** Report the attachment gap with the exact URL.
* **Pushing markdown.** Tick boxes and decision items only exist in ADF. Use the reference skeleton.
* **Not re-reading after the push.** Confirm the native nodes survived before telling the user it is done.
* **Throwing away history.** Anything the new shape drops moves to Earlier notes verbatim.
* **Forgetting to confirm before pushing.** Epics are public to the team. Show the draft first.
