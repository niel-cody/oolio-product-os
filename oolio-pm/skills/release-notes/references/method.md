# Method

The order matters. Prose written before the record is prose that has to be rewritten.

## 1. Pull the version before writing a word

Ticket titles are not a release. Read the descriptions, because the customer-visible behaviour is usually buried in the expected-result line. Read the parent epics for the theme, never for the copy.

## 2. Classify every item by status

Membership of a version is not shipping. Two of the three September Jira releases were announced with items short of done and the version not flipped. The status table in `jira-queries.md` decides: shipped, deployed but invisible (feature flagged), not shipped. A not-shipped item is named in the Teams message as not shipped and left off the customer page entirely. A feature-flagged item is never announced as generally available.

## 3. Group by parent epic, then rename the group

Epics are the theme unit. "Permission Framework for Insights Access Control" becomes "give more people the numbers". The epic name never survives into the copy. At most four themes; a fifth means two of them are one.

Classify each item inside a theme as **headline** (the thing the release is for), **supporting** (earns a sentence) or **invisible** (plumbing, performance, internal enablement). Invisible items never reach the customer page but may reach the Teams message and always reach the Confluence record.

## 4. Find the why, specific to this release

Three shapes have covered everything so far. When the person has not given you a why, ask one question and offer these:

1. **A promise being broken.** Scheduled reports that did not match the screen. The product said one thing and did another.
2. **A gap forcing a workaround.** Menus reaching POS and online but not mPOS. Four jobs that sent people back into Oolio Orders.
3. **A trade the customer should never have had to make.** Protect wages, or give the team the numbers, but not both.

A fourth shape has appeared once, for Ngara: **we read the logs instead of guessing.** Use it only when it is literally true.

Do not infer a why from ticket titles. A why inferred from Jira produces exactly the release note nobody reads.

## 5. Lead with why, then the what in order of pain

The first paragraph is the why. The themes follow, ordered by how much the problem hurt, not by issue type and not by epic size. Fixes come last, one line each.

## 6. State what is not covered

Every theme carries its edge: the surface it does not reach yet, the group it does not include yet. This is the sentence that lets a reader trust the rest.

## 7. Name the next two releases, with dates

The standard from 29 September 2026. Take them from the project's unreleased versions in date order, not from ambition. Each gets its release date and one plain sentence of what it is for, in operator language, with scope taken from what is actually in the version. Say explicitly that dates and scope can change, and that it will be said here when they do.

If something promised in an earlier release note is not in either of the next two, correct it in the Teams message rather than leaving the expectation standing. An undated version is not a next release; mention it as undated or leave it out.

## 8. Verify, then report the caveats

Every claim traced back to a work item or to the person. Run `checklist.md` in full. Then, in chat, at most three go / no-go items. If there are more than three, the top three by consequence, and the rest on the Confluence page under known issues.

## Notice mode

A notice is a capability withdrawn, paused or changed outside a release: a report retired, a surcharge line removed to meet a regulation, an integration paused while a partner changes an API. There is no version and no item list, so the why carries the whole thing.

- The why is still one of the shapes above, most often a promise being kept (a regulation, a date) or a trade being refused (keep a broken thing running, or pause it and say so).
- The structure is: what changes, from when, who it affects, what to do instead, what happens next, and who to contact. In that order.
- Status still matters: if the change is behind a flag or rolled out by cohort, say which customers see it and when.
- The four artefacts and the gate are the same. The Confluence page carries the Jira key for the change if there is one, and the decision record it came from if there is one.
- A notice is never softened into a release. If nothing new arrives, do not pad it.

The worked example in `worked-examples.md` is a shape, not a precedent: no notice has yet been written with this skill. The first real one replaces it.

## Anti-patterns already caught

- Naming a feature after its epic.
- Writing a bugfix release as an apology.
- Letting a permissions release read as restriction rather than as making access safe to widen.
- Promising the next surface (POS, the sixth permission group) because it feels like the obvious next step.
- Announcing a feature-flagged item as generally available.
- Carrying an incident screenshot's claim into the message without checking the incident's current status in Jira.
