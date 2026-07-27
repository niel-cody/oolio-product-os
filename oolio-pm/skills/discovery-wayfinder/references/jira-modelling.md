# Jira modelling for the discovery wayfinder

How maps and decision tickets physically live in Jira. Decided with Niel on 2026-07-19 after checking JPD's current capabilities: JPD spaces support custom idea types, each with its own workflow (that is what OHSI's existing `Customer` type is), so the wayfinder gets its own types inside OHSI rather than a separate project. Connection fields (JPD Premium) can render the hierarchy in JPD views but are not the mechanism; native issue links are.

## Environment

cloudId `98b2c73a-4f2e-4b23-aca7-dbc5b45b1e24`; project **OHSI — Oolio One Ideas** (`10052`). Link types verified live 2026-07-19: `Blocks` (id `10000`, `blocks` / `is blocked by`), `Relates` (`10003`), `Discovery - Connected` (`10013`).

## One-time setup (human, in the JPD UI)

Idea types cannot be created through the API. Someone with the Creator role and space admin opens OHSI > Space Settings > Types and workflows and adds:

- **Discovery** — the map type. Suggested workflow: `Charting` → `Under way` → `Way clear` (done category).
- **Decision** — the ticket type. Suggested workflow: `Open` → `Resolved` (done category), plus `Out of scope` (done category) if easy; otherwise Out of scope is expressed by resolving with an out-of-scope comment.

After setup, fetch the new type ids once (`getJiraProjectIssueTypesMetadata`, project `10052`) and record them in this file **in the plugin repo**, shipped per the repo's CLAUDE.md; never edit the installed Cowork copy, which auto-updates over any local change. Until both types exist, the skill proposes maps in chat and creates nothing.

Optional, Premium only: a connection field (for example `Map`) linking Decision ideas to their Discovery, for JPD board and roadmap views. Connection fields are set in the JPD UI; do not attempt them via API.

## Membership and blocking

- **Map ↔ ticket membership**: each ticket carries the label `map-<mapkey>` (for example `map-ohsi-701`), lowercase, hyphens only, and a `Relates` link to the map. The label makes membership queryable in one JQL clause; the link makes it visible on both issues.
- **Ticket type**: one label per ticket from `wayfinder-research`, `wayfinder-evidence`, `wayfinder-grilling`, `wayfinder-prototype`, `wayfinder-task`.
- **Blocking**: native `Blocks` links only. For `createIssueLink`, inwardIssue is the blocker, outwardIssue the blocked ("A is blocked by B" → inwardIssue B, outwardIssue A). Wire links in a second pass after creation, since issues need keys to reference each other.

## JQL recipes

The two mandatory Idea guards (`issuetype = Idea` + the archived filter, see `${CLAUDE_PLUGIN_ROOT}/skills/jpd-idea-groomer/references/field_standards.md`) exist to protect Idea sweeps. Wayfinder queries target the wayfinder types instead, so those guards do not apply; conversely, any wayfinder step that queries Ideas (say, hunting existing ideas relevant to a theme) carries both, always.

- Open maps: `project = OHSI AND issuetype = Discovery AND statusCategory != Done`
- A map's open tickets: `project = OHSI AND issuetype = Decision AND labels = map-<mapkey> AND statusCategory != Done`
- Frontier candidates: add `AND assignee IS EMPTY` to the previous query. JQL cannot see link direction, so drop blocked candidates by fetching each candidate's links (`getJiraIssue`, fields `issuelinks`) and excluding any with an open inward `Blocks` link. With one map's tickets this is a handful of reads, not a sweep.

## Claim, resolve, record

- **Claim**: assign the ticket to the human driving the map (`editJiraIssue`, assignee) before any work. An open, unassigned ticket is unclaimed; skip claimed ones.
- **Resolve**: post the answer as a comment beginning `Resolution:`, with the decision, the why, and links to any artefacts (a storm report page, a Figma exploration). Assets are linked, never pasted in, with one exception: a grilling ticket's resolution comment carries the grill record's decisions itself, because `grill-me` produces its record in chat and the ticket is that record's durable home.
- **Close**: transition to the done-category status, then append the one-line gist to the map's Decisions so far. The map body is edited append-only within its sections; a decision's detail lives only on its ticket.
- **Out of scope**: close the ticket and add one line to the map's Out of scope section (gist, why, link). It stays out of Decisions so far, which records only the route walked.

## Known API gaps

Same instance limits `jpd-loop` documents: the idea Links panel's web links are not API-writable, and idea types are UI-only to create. Native Polaris Insights ARE creatable, via the plugin helper `${CLAUDE_PLUGIN_ROOT}/bin/jpd-insight.mjs` (see `${CLAUDE_PLUGIN_ROOT}/skills/jpd-loop/references/jpd-insights-api.md`), though still not via the Atlassian MCP connector. None of these block the wayfinder; they shape the setup step above.
