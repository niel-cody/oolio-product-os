# The verification checklist

Run every line, every time. Two of the first four releases were announced with items that had not shipped. Each line is a question with a yes or a caveat; there is no "mostly".

## Facts

- [ ] Every sentence in every artefact maps to an item in the record, to the person's brief, or to an incident read live in Jira.
- [ ] Every item in the version is in the record with a status, a class and a weight.
- [ ] No item is described beyond what its description supports. "Exports grouped" is in the ticket; "exports to Excel with formatting" is not.
- [ ] Every number is from the version or the person. No invented counts, percentages or dates.

## Status

- [ ] Every item announced as available is at `Released / GA`.
- [ ] Every feature-flagged item is named as flagged in the Teams message and absent from the customer page.
- [ ] Every not-shipped item is named as not shipped in the Teams message and absent from the customer page.
- [ ] The version is flipped to released in Jira. If not, `version-not-released` is a caveat, and the Jira write-back list includes the flip.
- [ ] The version's `releaseDate` matches what the person said. If not, `date-mismatch` is a caveat.
- [ ] Every incident mentioned has been re-read in Jira and its current status is the one in the copy.

## The forward look

- [ ] The next two releases are the two nearest dated unreleased versions in the project, by date.
- [ ] Each carries its date, one sentence of what it is for, and scope taken from its items.
- [ ] The subject-to-change line is present in every artefact that names them.
- [ ] Nothing earlier promised and now missing from the next two is left standing; the Teams message corrects it.
- [ ] No forward claim rests on the person's design work rather than a version. If one does, `forward-claim-unsourced` is a caveat.

## Voice

- [ ] No em dash anywhere: bodies, headings, titles, slugs, meta descriptions.
- [ ] The headline is a claim, not a label.
- [ ] The first paragraph is the why, not a list.
- [ ] No theme is named after its epic.
- [ ] Fixes are one line each.
- [ ] Each theme states what it does not cover.
- [ ] A fix-only release reads as confidence, not apology.
- [ ] At most one borrowed line, and it is flagged in the chat report (`borrowed-line`).
- [ ] No banned words (`voice.md`). No "enhancements", no "improvements" as a heading, no "we are excited".
- [ ] Second person for the customer, first person plural for Oolio, throughout.

## Customer page hygiene

- [ ] No Jira keys, internal team names, engineer names or customer names on the customer page.
- [ ] No reproduction steps.
- [ ] Page name, slug, HTML title and meta description are present and the slug follows the product's pattern (`product-map.md`).
- [ ] The closing CTA points at the help centre.

## Structure

- [ ] Four artefacts exist and none is a copy of another; read the Teams and customer versions side by side.
- [ ] The Confluence title is `<YYYY-MM> <subject> | Release Note` and the page is placed under the product's Release Notes section.
- [ ] The record's `artefacts` paths match the files in the folder.
- [ ] The folder name is `<YYYY-MM-DD> <Release name>` and the date matches Jira.

## The gate

- [ ] Nothing has been posted, published, sent or written to Jira.
- [ ] `artefacts.published` is empty and `approval.status` is `pending`.
- [ ] The chat report names at most three caveats, each one a flag from the record, and ends by waiting.
