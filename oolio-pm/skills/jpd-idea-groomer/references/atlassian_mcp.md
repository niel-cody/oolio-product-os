# Atlassian MCP call patterns for JPD grooming

The specific tool calls this skill uses, with argument shapes and the traps. Tool names are the Atlassian connector's standard names; in some environments they carry an `mcp__atlassian__` or server-id prefix. Search the available tools for the bare names below.

## 1. Resolve the cloudId

Try the site hostname first: most tools accept `cloudId: "oolio.atlassian.net"` directly. If that fails, call `getAccessibleAtlassianResources` (no arguments) and use the returned UUID. Cache whichever works for the whole session.

## 2. Normalise the input to an issue key

- Key pasted (`OHSI-72`): use as is.
- Browse URL (`https://oolio.atlassian.net/browse/OHSI-72`): take the last path segment.
- Polaris view URL (`…/jira/polaris/projects/OHSI/ideas/view/…/idea/OHSI-72` or `…?selectedIssue=OHSI-72`): the key is the trailing segment or the `selectedIssue` query parameter.
- Raw text, no key: skip fetching; groom the text and ask how to apply (manual paste, or a key supplied later).

## 3. Fetch the idea

```
getJiraIssue {
  cloudId: "<cached>",
  issueIdOrKey: "OHSI-72",
  fields: ["*all"],
  expand: "names",
  responseContentFormat: "markdown"
}
```

- `fields: ["*all"]` is required. A narrow field list hides the custom fields you are auditing.
- `expand: "names"` maps `customfield_XXXXX` ids to display names so you can sanity-check you are reading the right field.
- Include `"comment"` in fields (or read `fields.comment.comments`) when hunting for customer names, ticket links, and CSM quotes.
- Confirm `fields.issuetype.name == "Idea"` before grooming. Stories and Bugs get routed to the epic/story skills instead.

## 4. Write back (only on explicit "apply")

One call, everything at once:

```
editJiraIssue {
  cloudId: "<cached>",
  issueIdOrKey: "OHSI-72",
  fields: {
    summary: "Cross-venue menu sync to end per-site price drift",
    description: "<the three-section description>",
    customfield_11552: [{"value": "Multi-Venue Management"}],   // Pillar
    customfield_10088: {"value": "Menu & Kitchen Operations"},  // Theme
    customfield_11553: {"value": "Customer Problem"},           // Investment Type
    customfield_11554: [{"value": "Customer"}, {"value": "Support"}],
    customfield_11560: {"value": "Repeated support trend"},
    customfield_11555: {"value": "Multi-site Operator"},
    customfield_11558: [{"value": "Multi-location"}, {"value": "Franchise"}],
    customfield_11711: {"value": "Products"},                   // Category (replaced Product Area 11561)
    customfield_11559: [{"value": "Operational efficiency"}],
    customfield_11557: {"value": "Rock"},                       // Size
    customfield_10505: 3
  }
}
```

Shapes by field type:

| Type | Shape |
|---|---|
| Single-select | `{"value": "<canonical label>"}` |
| Multi-select | `[{"value": "…"}, {"value": "…"}]` |
| Rating (Innovation) | bare number, `3` |
| Escalate | `1` / `0`; fall back to the JPD UI toggle if rejected |
| Summary / description | plain strings (description accepts markdown) |

Canonical labels live in `field_standards.md` in this folder. A label that does not exactly match the option list makes the whole write fail, and Jira's error will not tell you which field. When a write fails: re-check every label against `field_standards.md` first, then retry with the corrected labels; if it still fails, write the narrative fields (summary, description) alone, then add custom fields one at a time to isolate the offender.

## 5. Verify

After a successful write, confirm to the user with the issue link (`https://oolio.atlassian.net/browse/<KEY>`) and a one-line list of what was set. Do not re-fetch the whole issue unless something failed.

## Traps

- **Investment Type and Category are two different, both-written fields.** Investment Type is `customfield_11553` (nature of the opportunity). Category is `customfield_11711` (product grouping), a required field as of 2026-07-25 that replaced the retired Product Area (`customfield_11561`). Earlier notes here said "never write 11711" — obsolete; write both. Never write `customfield_11561` (retired).
- **Theme is `customfield_10088`; Commitment is `customfield_11931`.** Both added 2026-07-25. Theme is required (single-select). Commitment is single-select, Now-quarter only, and its Jira options carry typos (`Will Do`, `Aim to do`, `Strech`) — send them literally. Neither is the Initiative "Strategic Pillar"; the groomer never writes any epic/initiative pillar field.
- **Do not touch the VPC loop fields** (`customfield_11663` through `11677`); they belong to `jpd-loop`.
- **Never blind-overwrite.** If a field already holds a sensible value, leave it; propose changes only for wrong or missing values.
- **Description formatting.** JPD renders simply: short paragraphs, bullets only under Success Metrics, no nested lists, no headings deeper than the three standard sections.
