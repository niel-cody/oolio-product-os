# The release record

One file per release, written into the release folder in the Brain before any prose. Every artefact reads from it and nothing re-queries Jira. The `flags` are what the chat caveats are built from. The `brief` is the only part a machine cannot fill.

File: `release-record.json` beside the four artefacts (`product-map.md` has the folder). Keep it valid JSON; the morning sweep, when it exists, reads it.

## Schema

```json
{
  "product": "Insights",
  "mode": "release",
  "source": "jira-version",
  "version": {
    "id": "23878",
    "name": "Sept 3 -> Incidents & Insight improvement",
    "url": "https://oolio.atlassian.net/projects/OR/versions/23878",
    "releaseDate": "2026-09-28",
    "released": true,
    "statedDate": "2026-09-28"
  },
  "items": [
    {
      "key": "OR-2703",
      "type": "Story",
      "status": "Released / GA",
      "class": "shipped",
      "visible": true,
      "weight": "headline",
      "epic": { "key": "OR-2768", "summary": "Trade Monitoring Grouping and Intervals (Phase 2)" },
      "behaviour": "Every eligible report can group by venue; metrics recalculate per venue; permissions respected; grouping carried into the export."
    }
  ],
  "themes": [
    {
      "title": "One report, the level you need",
      "why": "A report is a question. Asking it a different way should not mean a different report.",
      "items": ["OR-2703", "OR-2704"],
      "epics": ["OR-2768"]
    }
  ],
  "flags": [],
  "evidence": [
    { "kind": "incident", "ref": "INC-814", "status": "Resolved", "note": "Scheduled reports not arriving" }
  ],
  "brief": {
    "shape": "promise-broken | gap-workaround | trade-refused | logs-not-guesses",
    "why": "The person's own framing, verbatim or close to it.",
    "notCovered": ["Grouping by venue is Back Office only for now."],
    "next": [
      { "id": "22166", "name": "Oct 1 -> Gift Card Report & Insight Improvement", "date": "2026-10-06", "for": "Gift cards get their own reports." },
      { "id": "21689", "name": "Oct 2 -> self-service labour onboarding", "date": "2026-10-20", "for": "Connecting Tanda or Deputy becomes something the customer does." }
    ]
  },
  "artefacts": {
    "teams": "Teams Message.md",
    "customerPage": "HubSpot Page Copy.md",
    "confluence": "Confluence Release Page.md",
    "slack": "Slack Message.md",
    "published": {}
  },
  "approval": { "status": "pending", "by": null, "at": null }
}
```

## Field notes

- `class` is one of `shipped`, `flagged`, `not-shipped`, from the status table in `jira-queries.md`. `visible` is false for a flagged item.
- `weight` is `headline`, `supporting` or `invisible`. Invisible items appear on the Confluence page only.
- `behaviour` is one line of customer-visible behaviour, written from the item's description. It is the only sentence from Jira that may reach the copy, and only after rewriting.
- `flags` take these values, and each one is a caveat candidate: `items-not-done`, `feature-flagged`, `version-not-released`, `date-mismatch`, `forward-claim-unsourced`, `incident-status-mismatch`, `borrowed-line`.
- `version.statedDate` is what the person said. If it differs from `releaseDate`, raise `date-mismatch` and do not silently pick one.
- In `notice` mode, `version` is null, `items` holds the one change with its Jira key if it has one, and `brief` carries `from`, `affects` and `instead` fields in addition to `why`.
- `artefacts.published` is filled after approval with the URL of each thing that went out. Until then it is empty, and that emptiness is the proof the gate held.
