# signal-radar — signal sources (reference)

Read this when gathering signal in either mode. The job: find real, cited evidence, internal first, then external, and keep a record of what was checked even when a source came up empty.

## Order of search
1. **The Brain** (`oolio-pm:wiki-query`) — our own accumulated product/competitor/market knowledge in the `my_brain` vault. Cheapest, most specific, and tells you what's already settled versus what's changed.
2. **HubSpot** — direct customer signal: tickets, deals, conversations, campaign engagement.
3. **Jira/Confluence** — the backlog itself, PRDs, decision records (already covered by `jpd-loop`'s evidence gathering for a single idea; signal-radar's job is the sources jpd-loop doesn't cover well: aggregated HubSpot themes and social/Apify).
4. **Web** — competitor and brand pages, market and analyst sources.
5. **Social** — via Apify (see `apify-actors.md`). Least authoritative on its own, most useful for spotting a trend before it shows up anywhere else.

## HubSpot
Use the connector's CRM search and query tools (`search_crm_objects`, `query_crm_data`, `get_crm_objects`) to find tickets, deals, and conversations mentioning the problem's nouns and synonyms, not just the exact idea title. For gap-scan mode, look for **themes** across many records rather than one-off mentions — `get_campaign_attribution_reports` and `get_content_analytics_report` can also surface what customers are engaging with, which sometimes points at unmet demand (high engagement on content about a problem we don't have a feature for). If the connector isn't authorised, say so in one line and continue with web and social.

## Web
`WebSearch` to find, `web_fetch` (or the Chrome browser tools for JS-heavy pages) to read. For competitor and brand research, use the maintained list in `${CLAUDE_PLUGIN_ROOT}/skills/jpd-loop/references/evidence-sources.md` rather than keeping a second copy here — that file is the single source of truth for Oolio's brand and competitor help centres, and it changes independently of this skill. Add to it (not here) if you find a competitor missing from the list during a scan.

## The Brain
Query via `oolio-pm:wiki-query` before researching anything external — "what does the brain say about X" — so you're extending existing knowledge, not starting cold. After the run, write findings back per `insight-and-gap-format.md`'s Brain-entry format: `wiki-ingest` onto an existing page if one covers the topic, `wiki-new` if none does. `wiki-lint`/`wiki-status` are Brain's own hygiene tools; use them if a sync looks like it went wrong, not as part of the normal flow.

## Source reliability tiers (for impact ratings)
The canonical six-tier list lives in `${CLAUDE_PLUGIN_ROOT}/references/research-os.md` (HubSpot-direct at the top, single uncorroborated social post at the bottom, Brain pages at tier 2 only while their status is `verified` — `stale` pages drop to tier 4). Impact-cap rules for mapping tiers onto the 1-5 Insight scale are in `insight-and-gap-format.md`.

## Citation discipline (hard rules, same as jpd-loop)
- Every claim used as evidence has a real, working source URL. No link, no Insight.
- Never fabricate or guess a URL.
- Quote or paraphrase faithfully; don't overstate what a source says.
- Date-stamp anything time-sensitive (prices, competitor features, social sentiment — it moves fast).
- Look for disconfirming evidence too. A one-sided signal sweep is worth less than a balanced one.
