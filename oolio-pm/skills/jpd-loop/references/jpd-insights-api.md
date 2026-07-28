# Creating native JPD Insights (reference)

How to attach evidence to a JPD idea as a native Insight. **Do not hand-roll curl for this.** The plugin ships a helper that owns auth, token refresh, ID lookup and the mutation: `${CLAUDE_PLUGIN_ROOT}/skills/jpd-loop/scripts/jpd-insight.mjs`.

Set up and proven live on 27 Jul 2026 (first agent-written Insight: OHSI-80). The Atlassian MCP connector still cannot write Insights and will offer a comment instead; a comment is not an Insight and is not an acceptable substitute.

## Use the helper

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/jpd-loop/scripts/jpd-insight.mjs create \
  --idea OHSI-80 \
  --description "One line saying what this evidence shows and how strong it is" \
  --url "https://source.example.com/article" \
  --title "The page title" \
  --quote "The sentence that will show on the card" \
  --labels "loyalty,vendor-source"
```

| Command | What it does |
|---|---|
| `create --idea KEY --description … --url …` | Creates one Insight. `--description` and `--url` are required; `--quote`, `--title`, `--labels`, `--group`, `--icon` are optional. |
| `create --file batch.json` | Same options as a JSON array, one object per Insight. Use this for a batch across several ideas; it resolves each idea once and reports per line. |
| `get OHSI-80` | Existing Insights on one idea. **Run this before creating, to avoid duplicates.** `null` means the idea has none yet, not an error. |
| `get --project 10052` | Every Insight in the project in a single call, no pagination. |
| `whoami` | Site, cloud id, token expiry. Use to diagnose auth. |

Defaults are chosen to match what JPD writes itself, so agent-created cards are indistinguishable from hand-added ones: group `{name: "Web Page", id: "web"}` and a Google favicon icon derived from the source host. Override with `--group` only when the evidence genuinely belongs to a named collection.

Batch file shape:

```json
[
  {"idea": "OHSI-80", "description": "...", "url": "https://...", "quote": "...", "title": "...", "labels": "loyalty,pricing"},
  {"idea": "OHSI-92", "description": "...", "url": "https://...", "quote": "..."}
]
```

## Standing rules

- **No source URL, no Insight.** A reader must be able to follow the evidence. Evidence without a followable source goes in a Brain note instead.
- **Read before you write.** `get` the idea first and skip anything that would duplicate an existing card.
- **Tailor the description per idea.** The same article attached to three ideas needs three descriptions, each written for that idea's problem. Broadcasting one line across ideas dilutes it to noise.
- **Impact is not an API field.** The create payload has no impact control; only free-form labels. The 1 to 5 rating from `insight-and-gap-format.md` travels as a label, or is set by hand in the UI. Do not claim an Insight carries an impact rating that it does not.
- **Say what the source is worth.** Where the source is vendor marketing, a single review, or an unsourced statistic, put that in the description and label it. The reliability tiers and social-evidence caps in `${CLAUDE_PLUGIN_ROOT}/skills/signal-radar/references/insight-and-gap-format.md` apply.

## Environment (Oolio)

Cloud id `98b2c73a-4f2e-4b23-aca7-dbc5b45b1e24` (`oolio.atlassian.net`), project **OHSI — Oolio One Ideas** id `10052`. The helper resolves and caches these itself; they are recorded here for diagnosis only.

## Auth (one time, already done)

Credentials and tokens live at `~/.jpd-insights-token.json`, mode 600, **never in this repo**. The access token lasts an hour and the helper refreshes it silently using the refresh token, so no browser step recurs.

Re-authorisation is only needed if the file is deleted, the refresh token goes unused for 30 to 90 days, or access is revoked at id.atlassian.com/manage-profile/apps. To redo it:

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/jpd-loop/scripts/jpd-insight.mjs auth --client-id <ID> --client-secret <SECRET>
```

It prints an authorize URL, the user clicks Accept, and the local callback on port 7777 captures the code. The agent must not run this with the secret on the command line; hand the command to the user. If port 7777 is held by a stale run, `lsof -ti:7777 | xargs kill`.

The 3LO app needs scopes `read:jira-user read:jira-work write:jira-work offline_access` and callback `http://localhost:7777`. **`offline_access` is essential** — without it there is no refresh token and auth recurs hourly. Atlassian's own setup guide omits it from the sample authorize URL.

## Fallbacks

1. **Chrome UI automation** — for cloud sessions, which cannot reach `api-private.atlassian.com`. Open the idea in the user's connected browser, Insights tab, paste the source URL so JPD unfurls a card, add the description, set the impact dots, Create. Read the tab first to avoid duplicates.
2. **Paste-ready list** — only when neither route is available. Hand the user description, link and impact per line, and say why the automated route failed.

## Underlying API (for maintaining the helper)

`POST https://api-private.atlassian.com/graphql`, headers `Authorization: Bearer <token>`, `Content-Type: application/json`, and `X-ExperimentalApi: polaris-v0` (required, the API errors without it).

Mutation `createPolarisInsight(input: CreatePolarisInsightInput!)` returns `success`, `errors { message }`, `node`. Query `polarisInsights(project: ID!, container: ID)`.

Schema traps, all verified live:

- Input type is `CreatePolarisInsightInput`, not `PolarisCreateInsightInput`.
- Mutation variables take **plain ids** (`cloudID`, `projectID`, `issueID`); the read query takes **ARIs** (`ari:cloud:jira:<CLOUD_ID>:project/<PROJECT_ID>`).
- Top-level `data: []` is required even when empty.
- The mutation returns `node`, not `insight`.
- `snippets[].data.type` must be `"quotes"`; `"card"` is rejected.
- `snippets[].data.content` is an **array** of `{"type": "quotesItem", "quote": "..."}`.
- `snippets[].data.context` requires `icon`, `url` **and** `title`; `icon` is mandatory.
- `snippets[].data.group` is required: `{"name": "...", "id": "..."}`.
- `container` in the read query is a scalar; requesting `container { id }` is a validation error.

Source: Atlassian's reference app, `github.com/Jira-Product-Discovery-Integrations/polaris-forge-ref-app` (`ai-skills/`, `push-example/`). Its token-refresh sample is broken (reads a temp file it never writes, uses `os` unimported) — the helper implements refresh independently and should not be re-synced from it.
