# Confluence release page

The durable internal record, in the product's own space under its Release Notes section. As long as the facts need. This is the page an auditor, a support lead or next quarter's PM reads to find out what shipped on a date and which tickets it was.

## Title

```
<YYYY-MM> <subject> | Release Note
```

The Confluence Naming Standard (`10 Projects/Oolio/Confluence Space Model/Naming Standard.md` in the Brain): one separator, the pipe, nothing else. Not an em dash, not an arrow, not a hyphen. Subject in sentence case, artefact type `Release Note` exactly. Example: `2026-09 Grouping and reliability | Release Note`. Two releases in one month get distinct subjects, never a version number in the title.

The two existing Insights pages (`12/08/2026 - Release Notes`) predate the standard. Leave them; do not copy them.

## Placement

Under the space's Release Notes section (Insights: "8. Release Notes" in the `KB` space, alias `in`; Ngara: section 8 in `NGA`; Products App: ask). Find the parent by searching the space for the section title. If it cannot be found, ask for the parent page id. Never create at the space root.

Create with `createConfluencePage` after approval. Before that, the page lives as `Confluence Release Page.md` in the release folder, in the markdown below.

## Structure

```
# <The claim, same as the customer page H1>

| | |
|---|---|
| Product | <Product> |
| Version | <KEY> "<version name>" (<id>), linked |
| Released | <YYYY-MM-DD> (Jira release date) |
| Status | Released / <flags, if any> |
| Customer page | <URL once published, or "unpublished"> |
| Teams message | <posted date, or "not posted"> |
| Record | Brain: <folder path> |

## Why

<The why, as written for Teams. Internal register.>

## What shipped

### <Theme 1>
<The narrative, then the items:>

| Key | Item | Status | Shown to customers |
|---|---|---|---|
| OR-2703 | Group by venue | Released / GA | Yes |

### <Theme 2>
...

## Not in this release

<Every item in the version that is not shipped or is behind a flag, with its key and status. If none: "Every item in the version is at Released / GA.">

## Incidents carried

<Each with key, customer, status at time of writing. Or "None.">

## Known issues and caveats

<The flags from the record, in full, not the three-caveat cut.>

## Next two releases

<Name, date, one sentence, taken from the unreleased versions. Subject to change.>

## Links

<Jira version, the epics, the customer page, the QA Review page if there is one, the decision records the release closed.>
```

## Rules

- Keys, customer names and engineer names are allowed. This is the record.
- The theme narratives are the Teams narratives, not the customer ones: same facts, internal register.
- After publication, the page link is commented on every item in the version and on each parent epic, with approval.
- No em dash anywhere, including the title.
