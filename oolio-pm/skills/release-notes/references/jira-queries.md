# Jira and Confluence queries

Everything the collect step needs, and the two gotchas that cost a round trip each on 6 October 2026.

Cloud id: `oolio.atlassian.net`. Tools: the Atlassian connector (`searchJiraIssuesUsingJql`, `getJiraIssue`, `searchConfluenceUsingCql`, `getConfluencePage`, `createConfluencePage`). Reading is free; every write waits for approval.

## The two gotchas

1. **`OR` is a JQL operator.** Insights' project key is `OR`, so `project = OR` is a syntax error ("Expecting either a value, list or function but got 'OR'"). Always quote it: `project = "OR"`. Quoting every key is harmless, so do it by habit.
2. **`in` is a CQL reserved word.** The Insights Confluence space is "Insights (Web & Mobile)", key `KB`, URL alias `in`. CQL accepts the alias but only in quotes: `space = "in"`. Unquoted, the search fails with "'in' is a reserved keyword". `space = KB` also works.

## Pull the version

A version id is global, so `fixVersion = <id>` needs no project clause:

```
fixVersion = 23878 ORDER BY status ASC
```

Fields to request: `summary, description, issuetype, status, resolution, parent, labels, components, fixVersions, project`. Ask for `description` in markdown; the customer-visible behaviour is usually in the expected-result line. Pages are 50; follow `nextPageToken` until `hasNextPage` is false. Never ask for a count.

Version metadata comes back on every issue under `fixVersions`: `id`, `name`, `releaseDate`, `released`. That is the only place the version's own facts live through this connector, so read them from the first item.

A version URL has the form `https://oolio.atlassian.net/projects/<KEY>/versions/<id>`. The id is the last segment.

## Classify by status

Membership is not shipping. Statuses seen across the September and October 2026 versions:

| Status | Class | In the copy |
|---|---|---|
| `Released / GA` | Shipped | Announced |
| `Prod-Green - Feature Flagged` | Deployed, possibly invisible | Named as flagged in Teams and Confluence, never announced as available to customers |
| `Ready for Prod-Green` | Not shipped | Named as not shipped in Teams; absent from the customer page |
| `Testing`, `Test-in Testing`, `Code Review`, `In Progress`, `READY FOR DEV`, `Draft`, `To Do` | Not shipped | Same |
| `Building`, `Releasing` | Not shipped (epic level) | Same |

Anything not in the table: read the status category. `done` is shipped only if the status name says released; otherwise treat it as not shipped and say so in the caveats.

## Theme by parent epic

Each item's `parent` carries the epic key and summary. Group on the key. Read the epic (`getJiraIssue`) only when the summary is not enough to name the outcome; the epic's description is for the theme, never for the copy.

## The next two releases

```
project = "OR" AND fixVersion in unreleasedVersions() ORDER BY fixVersion ASC
```

Fields: `summary, fixVersions, status`. The distinct `fixVersions` in the result are the unreleased versions. Sort them by `releaseDate` yourself; the query orders by version id, not date. A version with no `releaseDate` (seen: "Feb 1", 20596) is undated and is not one of the next two. Scope for each comes from the items in it, in operator language, never from the version name alone.

## Incidents carried with a release

Incidents live in `INC`. When the person says a release carried incident fixes, read each incident's current status before repeating it:

```
key in ("INC-814", "INC-781", "INC-817")
```

On 28 September one incident in a screenshot read as fixed and in Jira read as In Progress, and another was closed as Won't Do. Both went into the Teams message as things to watch, not as fixes.

## Confluence

Find the product's Release Notes section and any existing release pages:

```
type = page AND space = "in" AND title ~ "Release Note" ORDER BY created DESC
```

Existing Insights pages predate the naming standard (`12/08/2026 - Release Notes`). New pages follow `<YYYY-MM> <subject> | Release Note` and go under the space's Release Notes section (Insights: "8. Release Notes"). If the section cannot be found by search, ask for the parent page rather than creating at the root.

## Write-backs, after approval only

- Comment the published page link on every item in the version (`addCommentToJiraIssue`).
- Comment the theme narrative on each parent epic.
- Flip the version to released if it is not. The connector cannot edit versions; say so and ask the person to flip it in Jira, then re-read `fixVersions` to confirm.
- Never transition or close an epic. Releasing is a legitimate status and open epics stay open by standing rule.
