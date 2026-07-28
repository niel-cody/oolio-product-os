---
name: signal-radar
description: >-
  Synthesise HubSpot, web, and social signal (via Apify) into evidence for JPD
  ideas, and scan for gaps between market demand and the backlog. Two modes:
  idea mode (a JPD key: gathers evidence and attaches it as
  native Insights) and gap-scan mode (no key: scans the backlog against market,
  customer, and social signal, handing candidates to `feedback-to-idea`).
  Findings always land in the Brain, so research compounds. Trigger when the
  user says "run signal radar", "sync the brain",
  "what's the market saying about X", "validate this idea with real signal",
  "find gaps in the backlog / roadmap", "what are we missing", or "scan HubSpot
  and social for signal". Do NOT trigger for one already-found piece of evidence
  to attach (use `add-insight`), raw pasted feedback (use `feedback-to-idea`),
  the full VPC loop (use `jpd-loop`), a deep-dive with no backlog tie-in (use
  `storm-research`), competitor dossiers, sweeps, or battlecards (use
  `competitor-watch`), or closed-lost deal analysis (use `win-loss`).
---

# Signal radar

The research layer that sits between the outside world and the backlog. It pulls signal from HubSpot (what customers actually say and do), the web and social media via Apify (what the market, competitors, and operators are saying), and the Brain (what we already know), then does two things with it: strengthens an existing JPD idea with cited external evidence, or surfaces a gap the backlog does not yet cover. Every run leaves Brain richer than it found it, so the next run starts further ahead instead of re-researching the same ground.

This skill gathers and synthesises. It does not groom fields, does not create or edit Jira issues, and does not run the council. Those stay with `jpd-idea-groomer`, `feedback-to-idea`, `jpd-loop`, and `convene-vpc` — hand off to them rather than duplicating their logic.

Operating model (Brain taxonomy, cadences, the routing pipe): `${CLAUDE_PLUGIN_ROOT}/references/research-os.md` — read before the first run in a session. House style: `${CLAUDE_PLUGIN_ROOT}/references/house-style.md`.

## Environment (Oolio)
cloudId `98b2c73a-4f2e-4b23-aca7-dbc5b45b1e24`; project **OHSI — Oolio One Ideas** (`10052`); idea type `10071`. Field IDs (read-only reference here; this skill does not write them) in `${CLAUDE_PLUGIN_ROOT}/skills/jpd-idea-groomer/references/field_standards.md`, including the two mandatory JQL guards for any backlog query (`issuetype = Idea` + the archived filter — never sweep OHSI without both).

## Required connectors & tools
If one is missing, note the gap and continue with what's available; never pretend a source was checked when it wasn't.

- **The Brain** (`oolio-pm:wiki-query`, `wiki-new`, `wiki-ingest`, `wiki-status`) — our own accumulated knowledge in the `my_brain` vault. Query first, write last. This is what makes runs compound instead of repeat.
- **Atlassian** (Jira) — `searchJiraIssuesUsingJql`, `getJiraIssue`. The backlog itself: what exists, in what state.
- **HubSpot** — CRM signal: tickets, deals, conversations, campaign engagement. Needs the connector authorised; if it isn't, say so and continue with web and social.
- **Web search + web browsing** — `WebSearch` to find, `web_fetch` (or Chrome tools for JS-heavy pages) to read.
- **Apify** — social media, review sites, and scale web scraping via Actors (`fetch-actor-details`, `call-actor`, `get-dataset-items`; use the pinned Actor names — `search-actors` is a last-resort fallback, see `references/apify-actors.md`).

Detail on how to search each source well, and the reliability/citation discipline, is in `references/signal-sources.md`. The Insight and gap-report formats are in `references/insight-and-gap-format.md`.

## Mode A — idea signal sync
Trigger: a single JPD key given ("add insights to OHSI-612", "validate this idea").

1. **Load.** `getJiraIssue` the key. Read the problem, hypothesis, and current Insights/evidence if any.
2. **Check Brain first.** `oolio-pm:wiki-query` for existing knowledge on this problem, persona, or product area. Don't re-research what Brain already has settled; use it as a starting point and look for what's changed since.
3. **Gather external signal**, internal first per `references/signal-sources.md`:
   - HubSpot — tickets, deals, conversations naming this problem or a close synonym.
   - Web — competitor dossiers in Brain first (maintained by `competitor-watch`), then the competitor/brand pages in `${CLAUDE_PLUGIN_ROOT}/skills/jpd-loop/references/evidence-sources.md`, market and analyst sources.
   - Social — via Apify, using the pinned Actors and scoping rules in `${CLAUDE_PLUGIN_ROOT}/skills/competitor-watch/references/mining-playbook.md` (workflow basics in `references/apify-actors.md`).
   Look for evidence **for and against** the idea, not just confirmation.
4. **Draft Insights.** For each strong item: one-line description, the real source URL, an impact rating 1-5 with a one-line reason. Format and impact-rating discipline (including the social-evidence cap) in `references/insight-and-gap-format.md`. Never fabricate or guess a link.
5. **Present the list, then attach as native Insights.** Show the drafted Insight list (description · link · impact) and get one approval for the batch. Then create them as native Insights on the idea with the helper: `node ${CLAUDE_PLUGIN_ROOT}/skills/jpd-loop/scripts/jpd-insight.mjs get <KEY>` first to avoid duplicates, then `create --file` for the batch. Usage and fallbacks in `${CLAUDE_PLUGIN_ROOT}/skills/jpd-loop/references/jpd-insights-api.md`. Only if the helper and the Chrome fallback are both unavailable, hand the user the paste-ready list.
6. **Sync to Brain, including the Insight lines themselves.** Per research-os: an evidence log for the run, and the drafted Insight lines (description · link · impact · tier) written as insights linked to it — the Insight set is the run's product and must survive in Brain, not just in chat. `wiki-ingest` onto existing pages found in step 2; `wiki-new` otherwise.

## Mode B — gap scan
Trigger: no key given ("what are we missing", "scan for gaps", "run signal radar on the roadmap").

1. **Snapshot the backlog.** `searchJiraIssuesUsingJql` across all OHSI ideas, all statuses (both mandatory guards), pulling summary, Pillar, Theme, Category, and status. This is "what we have." For a large backlog, batch the semantic cross-referencing in step 4 by Category rather than holding everything at once.
2. **Check Brain first.** `oolio-pm:wiki-query` the gap ledger (`gaps/ledger`), competitor dossiers, and trend pages, so the scan builds on prior work instead of repeating it. Candidates already on the ledger get their evidence counts updated, not rediscovered.
3. **Scan for signal**, aggregated across the backlog rather than idea-by-idea. Concrete recipe, not a vibe: default window is the last 90 days (or since the last gap scan recorded in Brain, whichever is longer); each source below gets its own pass; a candidate needs evidence from **at least two distinct platforms, ideally spanning two of the three source classes** (HubSpot / web / social) before it reaches the report — two posts on the same platform are corroboration within a source, not independence.
   - HubSpot — recurring ticket/deal themes: query the problem-space nouns per Category, plus standing queries for "feature request", "missing", "competitor", "cancel"; note themes with 3+ independent accounts.
   - Web — every tier-1 competitor on `${CLAUDE_PLUGIN_ROOT}/skills/competitor-watch/references/watchlist.md` gets checked (dossier first — if `competitor-watch` sweeps are running, the dossiers already hold the deltas and this pass is cheap); then market/industry trend searches bounded to the window.
   - Social — via Apify with the pinned Actors and scoping rules in `${CLAUDE_PLUGIN_ROOT}/skills/competitor-watch/references/mining-playbook.md`: operator forums and review platforms, complaint and request mining.
   Stopping rule, per source: within each source, run query rounds (a round = one batch of distinct queries); when a round yields no new candidate, only corroboration of existing ones, that source is saturated — move to the next, and say so in the report rather than padding.
4. **Cross-reference every candidate against the backlog snapshot and Brain.** Already covered by an existing idea, in any status (including Not Now or Rejected, which matters — a killed idea with fresh corroborating signal is worth resurfacing, not silently re-proposing)? If yes, this is reinforcing evidence for that idea, not a gap — route it to Mode A instead. Also sanity-check against delivery: work can exist as a delivery epic with no JPD idea. Known delivery projects include **OR** and **EDU**; on the first scan confirm the live list with `getVisibleJiraProjects` (everything relevant that is not OHSI), note it in the run's Brain evidence log for reuse, and run a quick JQL on the candidate's nouns over those projects so nothing already being built is proposed as a gap. If genuinely uncovered, it's a candidate gap.
5. **Build the gap report.** Table format in `references/insight-and-gap-format.md`: candidate, problem, evidence with source links, likely persona, signal strength and why, overlap check result, recommended action. Present it; do not touch Jira yet.
6. **Get one approval for the batch**, same discipline as `feedback-to-idea`'s bulk sweeps. For each approved candidate, hand off to `feedback-to-idea` to draft and de-dupe properly rather than drafting it here.
7. **Sync to Brain regardless of outcome** — per research-os: the run's evidence log, and the gap ledger updated for every candidate (raised, corroborated, declined, or monitored, each with its review-by date so `competitor-watch` sweeps give monitored candidates a heartbeat). A declined candidate is still recorded so it isn't re-surfaced identically next scan without new evidence.

## Signal-strength discipline
Not all sources carry equal weight. A HubSpot-confirmed pattern across several accounts outranks a single scraped social post. Full reliability tiers and impact caps are in `references/insight-and-gap-format.md` — read before rating anything above 3/5 on social-only evidence.

## Privacy and scraping discipline
Apify pulls from public sources only. Never scrape login-gated content, private profiles, or DMs. Aggregate sentiment and public reviews/posts are fair game; do not compile a dossier on a named private individual. Keep Actor runs scoped (small result counts, narrow date ranges) — this is signal sampling, not mass collection. Full detail in `references/apify-actors.md`.

## This skill must never
- Create, edit, or transition a Jira issue, or write a JPD custom field. Hand off to `jpd-idea-groomer`, `feedback-to-idea`, or `jpd-loop`. (Creating native Insights per step 5 is allowed — an Insight is an evidence attachment, not an issue edit.)
- Fabricate, guess, or omit a source link. No link, no Insight, at most a note.
- Treat a single uncorroborated social post as strong (4-5) evidence.
- Propose a "gap" that's already an idea in the backlog, including killed or parked ones, without checking first.
- Scrape login-gated or private content, or compile personal data on a named individual.
- Overwrite an existing Brain page wholesale — ingest onto it, don't replace it.

## Definition of done
**Mode A:** Brain checked first; available connectors queried (or gaps noted); a balanced set of cited Insights drafted with impact ratings; the Insights created natively on the idea (or the paste-ready list handed over if no route was available); findings synced to Brain.
**Mode B:** backlog snapshot pulled; Brain checked first; signal scanned across available sources; every candidate cross-checked against the backlog and Brain; a gap report presented and one batch approval taken; approved candidates handed to `feedback-to-idea`; findings synced to Brain whatever the outcome.

## References (read on demand)
- `references/signal-sources.md` — how to search HubSpot, web, and Brain well; source reliability and citation discipline.
- `references/apify-actors.md` — the Apify Actor workflow (discover, inspect, run, fetch results) and scraping discipline.
- `references/insight-and-gap-format.md` — the Insight format, impact-rating caps for social evidence, the gap-report table, and the Brain sync-entry format.
