# Routing: where a finding goes

How the team works, written down so every QA skill routes the same way. **Where a finding goes depends on how far the build has got, not on how bad it is.** The aim is a clean epic: a story that missed its ACs is reworked, not buried under linked tickets.

## Who creates what

- **Stories are functional requirements. Product managers and product owners create them. QA never creates a Story.** Anything that is new functionality found during testing is a **Requirement gap**, handed to the PO or PM with the evidence; they decide whether it becomes a story, an idea (`feedback-to-idea`) or nothing.
- **Bugs are what was missed**: the build does not do what an oracle says.
- **Improvements are minor**: polish or a slight change to something that works. They are raised once the feature is far enough along that the QA Review page can say clearly what was built, which requirements were met and what gaps were found.

## The decision, by stage

### Stage 1. The story is in progress or in review, and its PR is not merged

**An AC fails → rework the story. No new ticket.**

1. The finding is linked to the story and the AC it fails (`ac: <story key>#<n>`).
2. Draft a comment on the story for the assigned engineer: which AC failed, steps, expected, actual, evidence, the build or PR tested, and the confidence. Mention the assignee so they are notified.
3. Propose transitioning the story back to the team's rework status. Read the story's available transitions and propose the one that returns it to the engineer; if the transitions cannot be read, propose "the story's rework transition (name to confirm)" and ask, never guess. In the Products App project (PAPP), as recorded on 30 Sep 2026 (source: Brain, `10 Projects/Oolio/Menu Management Experience/05_reviews/2026-09-30 Menus 2.0 UAT Consolidated Findings.md`), there is no route from Testing back to To Do; the rework path is the **Code review failed** transition, which lands the story on **In Progress**. Check the transitions each time: workflows change.
4. **On approval**, post the comment and make the transition. The finding's status becomes `Rework <story key>`.
5. When the PR is updated, re-test that AC and record the result on the QA Review page. A story is never reported Done to QA while an AC is failing.

**Something the ACs missed → an AC gap: propose a new AC on the same story**, drafted for the PO with the evidence. It qualifies only if an oracle other than an AC says the behaviour is expected (Purpose, a logged decision, a pattern rule, a PRD claim, a standard, the product's own consistency); otherwise it is a Decision needed. Create a separate ticket only if the PO rules it out of the story's scope, and then as a Bug or Improvement, never a Story.

**New functionality → Requirement gap** to the PO. No ticket from QA.

**Improvements found pre-merge.** If the story is already going back for rework, add them to the same comment as non-blocking notes. If it is not, hold them on the QA Review page and raise them after merge, themed, once the page can say what was built and what was met.

**A P0 pre-merge** leads the rework comment, marked P0, and is escalated (drafted for the release owner, `quality-model.md`); it is never just one item in a list.

**A regression caused by an unmerged change.** If the build under test differs from the last passing build only by an open PR (or the diff points to it), the finding reworks the story that owns that PR, citing the broken AC on the other story as the oracle. No ticket, even though the broken AC belongs to a merged story. If the cause cannot be pinned to one PR, ask.

**Verify before routing.** No rework comment, transition or mention for a P0 or P1 is presented for approval until `qa-mission`'s independent verification has run on it (or, standalone, until it is Reproduced ×2 from a clean start).

**Do not create linked tickets for a story still being reworked.** That is how an epic ends up with thousands of tickets. One story, its ACs, its rework comments, and the QA Review page are the record.

### Stage 2. The work is merged and testing is in Dev, staging, or Prod

The story has left the engineer's hands, so rework is no longer the channel.

- **Broken against an AC or another oracle → Bug**, linked to the story (and AC) it relates to, under the epic, with the fix version.
- **Minor polish → Improvement**, under the epic.
- **New functionality → Requirement gap** to the PO, as above.
- Themes still apply (see the severity standard): one Bug or Improvement per user-facing problem, with items inside, not one per nit. A P0 always stands alone.
- In Prod, a P0 or anything trading-impacting follows the incident process first: draft the incident summary for a person to raise in the incident project (INC), with the evidence, and escalate (drafted, `quality-model.md`). The fix work is a Bug in the owning team's project, linked to the incident (link, never move). The owning project is the epic's project when the finding is in the area under test; otherwise ask which team owns it.
- **A finding with no story** (seen in an area the release did not touch): Bug or Improvement in the owning team's project, linked to the epic as "found during", never to an unrelated story.

### Not yet built (spec and design stage)

Findings from `test-basis` before build go to the story or PRD owner as proposed AC rewrites, decisions needed or instrumentation gaps. They are never tickets.

## The stage test

`defect-writer` decides the stage per story **from the state of the story's code, not from where the finding was seen**: whether its PR is merged (the PR state from the repo, read only, or the development panel on the story), cross-checked with the story's status. A branch deployed to a Dev host with its PR still open is Pre-merge. The environment is recorded separately on the finding. If the evidence disagrees (the story says Done but the PR is open), it asks rather than guesses.

## Instrumentation: gap or bug

If the event or property was never specified or built (no story, AC or code says it fires), it is an **Instrumentation gap**: to the PO and Data, on the QA Review page, no ticket from QA (the PO decides whether it becomes work). If it was specified or built and does not fire, it is a **Bug** against the metric's oracle, routed by stage like any other.

## Working offline

When Jira, the repo or the run log cannot be reached, de-duplication and the stage test cannot be completed. Say so in the register header ("Jira not checked"), mark every draft "de-dupe pending", and re-check before anything is created.

## Every write pauses

Comments, transitions, new AC proposals and new tickets are all drafted, shown together, and made only on a yes. Mentioning an engineer notifies a real person, so it is never done without approval.
