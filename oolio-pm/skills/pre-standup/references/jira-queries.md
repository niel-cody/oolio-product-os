# Jira queries

Every section of the post is read from Jira with `searchJiraIssuesUsingJql` (cloudId in `config/teams.json`). Placeholders: `<UUID>` is the team's `teamFieldValue`, `<PROJECTS>` the team's project keys, `<ID>` a roster member's Jira account id, `<AFTER>` the `jqlAfter` value from `scripts/run-context.mjs` (`-1d` most days, `-3d` on a Monday, longer after a holiday).

All five queries were run live on 7 October 2026 and returned what the framework expected. Two gotchas cost a round trip if forgotten; they are at the foot.

## Incidents (always first)

```
((project = INC AND cf[10001] = "<UUID>") OR (project in (<PROJECTS>) AND issuetype = Incident))
AND statusCategory != Done
ORDER BY priority DESC, created ASC
```

Fields: `summary, status, priority, assignee, created, project`. Incidents live in INC today, keyed to a team by the Team field (`cf[10001]`). They are expected to move to the Incident work item type inside each software project, so the query covers both halves and keeps working through the move. Ngara AI has no Team field value, so for that team drop the INC half and run only the project half.

From the result: the open count, the oldest (first by `created ASC`), each unassigned one, and each item's age in days from `created`. Priority names are `P1 - Trade Down`, `P2 - Trade Impacted`, `P3 - Trade Degraded`, `P4 - No Trade Impact`; show the short form (`P3`).

Days at zero: if the count is zero today, the streak is yesterday's `daysAtZero` from run-context plus one; if it is not zero, the streak is zero. Working days, not calendar days.

## Yesterday (state changes since the last working day)

```
project in (<PROJECTS>)
AND status CHANGED TO ("Released / GA", "Prod-Green - Feature Flagged", "Ready for Prod-Green", Done) AFTER <AFTER>
AND status != Cancelled
ORDER BY updated DESC
```

Fields: `summary, status, assignee, updated, fixVersions`. Word each line by where it landed: `Released / GA` and `Done` are released or closed; `Prod-Green - Feature Flagged` is in production behind a flag (say so); `Ready for Prod-Green` is queued for production, not released, and the line must not say released.

`Cancelled` sits in the Done status category. Without the exclusion a cancelled story reads as shipped.

Cross-check the Slack channel for the same window (`slack_read_channel`, `oldest` set to the previous working day). If engineers or QA said something went to production and Jira still shows Code Review or Testing, report the release and add "Jira still shows <status>" so it gets fixed. Jira lags Slack on releases; on 7 October the gift card reports were live while their stories showed Code Review.

## Today (per person, in-progress only)

```
project in (<PROJECTS>)
AND statusCategory = "In Progress"
AND assignee = "<ID>"
AND issuetype not in (Epic, Initiative)
ORDER BY priority DESC, updated DESC
```

Fields: `summary, status, priority, issuetype, fixVersions, duedate`. One query per roster member who is not marked away. Rules:

- Show in-progress work only. Code Review and Testing count as in progress for the person who owns the item.
- If a person has an open incident assigned (from the incident query), it leads their line.
- If a person has nothing in progress, show their highest-priority To Do or Ready item as "next", from:
  ```
  project in (<PROJECTS>) AND statusCategory = "To Do" AND assignee = "<ID>"
  AND issuetype not in (Epic, Initiative) ORDER BY priority DESC, rank ASC
  ```
  Never show next work for someone who has something in progress.
- Maximum three items per person. Beyond three, show the top three and "+n more", and put the overload in the operator report, never in the post.
- A roster member with nothing in progress and nothing to do gets no line. Absence is not a statement.

## Next (the next release dates)

```
project in (<PROJECTS>) AND fixVersion in unreleasedVersions()
ORDER BY fixVersion ASC
```

Fields: `fixVersions` only; collapse to the distinct versions that carry a `releaseDate`, take the next one or two by date. Name the release in the words the plan page uses (what venues get), not the version string, when the plan page is known (`planPage` in `config/teams.json`). No date reaches the post unless it is a Jira version date or on the plan page.

## Decisions

The Brain is the source: the team's quarter plan decisions log, the Product Leadership decision logs, and `41 Decisions/`, any entry dated since the previous working day (paths in `config/teams.json` under `brain.decisionSources`). Jira is secondary: comments by the operator on the items already fetched for Incidents and Today (`fields: ["comment"]` on those keys, filtered to `created` after `<AFTER>`). Do not sweep every project for comments; that is a different skill.

Thread replies to yesterday's post that state a decision (read with `slack_read_thread`) count too, and they are written back to the team's decision log before they go in the post (annotate, never delete).

## Gotchas

- **`OR` is a JQL operator.** The Insights project key must be quoted everywhere: `project = "OR"`, `project in ("OR")`. Unquoted, the query fails or matches nothing.
- **Account ids, not names.** `assignee = "Hanh Lap"` does not work on Jira Cloud. Use the account id from `config/roster.json`. Names also differ between Jira and Slack, which is the whole reason the roster is keyed on ids.
- **`statusCategory` is the safe filter.** Status names differ between projects (`New`, `To Do`, `Open`); categories do not.
- **The MCP returns 50 to 100 items per page.** None of these queries should exceed that for one team; if one does, the team has a bigger problem than the post, and the operator report should say so.
