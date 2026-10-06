---
name: release-notes
description: Turn an Oolio Jira release version into the full comms set, written in Oolio's house voice and verified against what actually shipped. Produces a Teams message for the business, customer page copy for HubSpot, an internal Confluence release page in the product's own space, a short Slack version, and a filed record in the brain. Trigger when the user hands over a Jira version URL or id (a /projects/<KEY>/versions/<id> link, or "release notes for 23878"), or says "write the release notes", "do the release comms", "we shipped this yesterday", or pastes a release report. Also handles a product notice, where a capability is withdrawn, paused or changed outside a release. Do NOT trigger for a GTM launch pack (gtm-handover), a stakeholder update (product-management:stakeholder-update), or writing up defects (defect-writer).
---

# Release notes

One release, one record, four audiences. Nothing retyped, nothing drifting.

## The rule that does not bend

Assemble and draft, then stop. A person approves before anything is posted, published or written back to Jira. Two of the first four releases written this way were announced with items that had not actually shipped. The verification pass is the product.

This skill is the September 2026 method written down (Brain: `10 Projects/Oolio/Release Launch Pattern/`, four releases across Products App, Insights and Ngara). It is the judgement and the voice. The plumbing (a morning sweep, webhooks, fan-out on approval) stays out of it, by design.

References, all under `${CLAUDE_PLUGIN_ROOT}/skills/release-notes/references/`. House style: `${CLAUDE_PLUGIN_ROOT}/references/house-style.md`.

## Run order

1. **Collect.** Pull the version and every item in it. `references/jira-queries.md` has the JQL, the fields, and the two gotchas that will otherwise cost you a round trip.
2. **Classify.** Every item is shipped, deployed but invisible, or not shipped. Status, never membership of the version. The table is in `references/jira-queries.md`.
3. **Theme.** Group by parent epic, then rename each group as an operator outcome. The epic name never reaches the copy.
4. **Get the why.** You cannot write without it. If the user has not given you one, ask one question, offering the three shapes in `references/method.md`. Do not guess a why from ticket titles.
5. **Build the record.** `references/release-record.md`. Everything downstream reads this file. Write it before any prose.
6. **Draft the four artefacts.** Same facts, four registers, never copy and paste:
   - `references/artefacts/teams-message.md`
   - `references/artefacts/customer-page.md`
   - `references/artefacts/confluence-page.md`
   - `references/artefacts/slack-message.md`
7. **Verify.** Run every line of `references/checklist.md`. This is not optional and it is not a skim.
8. **File and report.** Write the folder into the brain (`references/product-map.md` has the path per product). Report at most three go / no-go caveats in chat. Then stop and wait.

On approval, and only then: post the Teams message, publish the HubSpot page, create the Confluence page, send the Slack draft, and write back to Jira (comment the page link on the items, flip the version if it is not flipped). One approval covers the set the person approved, nothing more.

## Modes

`release` is the default. `notice` is for a capability withdrawn, paused or changed outside a release: no version, no item list, and the why carries the whole thing. Same voice, same gate. See the worked example in `references/worked-examples.md`.

## Non-negotiables

- Read `references/voice.md` before writing a word. It is the reason this reads like Oolio and not like a changelog.
- No em dash anywhere, body or title. A Confluence title uses the pipe, `<YYYY-MM> <subject> | Release Note`, per the Confluence Naming Standard (`references/artefacts/confluence-page.md`).
- Nothing is published, posted or written back to Jira without explicit approval.
- Never invent forward scope. The next two releases come from the project's unreleased versions, with dates, flagged subject to change.
- Repos are read only. Read the code to ground a claim, never commit.
- No fabricated Oolio facts. A claim the version, the code or the person cannot support is cut, not softened.

## Where it sits

After `qa-mission` has made the ship call and the version is in Jira. Before `gtm-marketing` if the release is big enough to deserve a campaign, and feeding `metrics-review` with what was announced, so adoption is read for the things customers were told about. A GTM launch pack is `gtm-handover`; this is the release that shipped on Tuesday.

## Guardrails

Trigger: on demand. Reads: Jira, Confluence, HubSpot, the Brain's work layers, the product repos read only. Writes before approval: the release folder in the Brain only. Writes after approval: Teams, HubSpot, Confluence, Slack, Jira comments and the version flag, each named in the approval. Vault scope: the work layers only (`20 Areas/Oolio/<product>/releases/`); `20 Areas/Personal` and `10 Projects/Personal` are NO-GO, always. Escalation: an item announced as shipped that is not at a done status blocks the set until a person rules on it; a mismatch between the version's release date and what the person said is reported, never silently corrected.

## Definition of done

The record exists and every artefact reads from it; every item is classified by status with the not-shipped and feature-flagged ones named; the why is the person's, not inferred; the four artefacts are drafted in four registers with no em dash in any of them; the next two releases are named from unreleased versions with dates and the subject-to-change line; every line of the checklist is answered; the folder is filed in the Brain under the product's path; at most three caveats are reported; nothing has been posted, published or written to Jira.
