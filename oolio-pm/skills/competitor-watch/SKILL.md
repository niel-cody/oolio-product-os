---
name: competitor-watch
description: >-
  Run Oolio's competitor intelligence: maintain one living dossier per
  competitor in the Brain, sweep the watchlist for changes on a weekly
  cadence and report only the deltas, deep-dive a competitor's reviews and
  communities for weaknesses, and build Fact-Impact-Act battlecards. Trigger
  when the user says "run the sweep", "competitor sweep", "watch the
  competition", "what's changed in the market", "update the <name> dossier",
  "deep-dive <competitor>", "build a battlecard for <competitor>", "what are
  <competitor>'s weaknesses", "what are competitors marketing", "check their
  campaigns/socials", "is <claim> real or marketing", or asks what a rival
  is doing, shipping, pricing, hiring, or campaigning on. Routes product-gap findings to `feedback-to-idea` and
  idea evidence to `signal-radar`; never writes Jira itself. Do NOT trigger
  for validating a specific JPD idea (use signal-radar), a general research
  briefing (use storm-research), or win/loss deal analysis (use win-loss).
---

# Competitor watch

The standing competitive-intelligence function. Four jobs, four modes: keep one truthful, dated dossier per competitor in the Brain (**dossier**), detect what changed since last week and report only the deltas (**sweep**), mine a competitor's reviews and communities for exploitable weaknesses (**deep-dive**), and turn the accumulated intel into sales-usable battlecards (**battlecard**). The operating model, cadences, and Brain taxonomy live in `${CLAUDE_PLUGIN_ROOT}/references/research-os.md`; read it before the first run in a session.

The discipline that makes this worth having: **diff, don't re-read** (compare against the dossier and surface only meaningful change), **date every claim** (verified-as-of, per research-os), and **honesty about where they win** (a battlecard that pretends the competitor has no strengths gets ignored by the first rep who loses to them).

House style: `${CLAUDE_PLUGIN_ROOT}/references/house-style.md`.

## Inputs and references
- `references/watchlist.md` — the tiered watchlist: who we watch, at what cadence, and the pinned source URLs per competitor. The single source of truth for coverage; maintain it (add sources found mid-run, mark dead ones) rather than working around it.
- `references/dossier-standard.md` — the Brain dossier schema and supersede rules.
- `references/mining-playbook.md` — the ordered source list and pinned Apify Actors for review/community mining.
- `references/battlecard-standard.md` — the one-page Fact-Impact-Act battlecard format.

Connectors: the Brain (required — this skill is pointless without it), web search/fetch, Apify (deep-dive), Atlassian (publishing battlecards and sweep notes to Confluence when asked). If Apify is unavailable, deep-dive degrades to web-only and says so.

## Mode: dossier — build or refresh one competitor
Trigger: "update the Toast dossier", "build a dossier for Zeller", a sweep/deep-dive finding that needs recording, or a `win-loss` pattern to record against a competitor (creating the dossier first if none exists — win-loss evidence is often the only tier-1 material available for low-web-signal competitors like Redcat and H&L).

1. `wiki-query` Brain for the existing dossier. If none, create one to `dossier-standard.md` via `wiki-new`.
2. Fill or refresh each section from the watchlist's pinned sources for that competitor: positioning, pricing (dated), product moves timeline, strengths, weakness themes, AU relevance. Every claim gets a source URL and a verified-as-of date.
3. Supersede, never append-duplicate: replace outdated claims and move the old text to the dossier's dated history section (audit trail, per dossier-standard).
4. Update `Last verified` and `Review by` per the research-os cadence table.

## Mode: sweep — the weekly delta pass
Trigger: "run the sweep", "what's changed", or a scheduled run. Designed for a weekly cadence (research-os, "Cadence"); the last-sweep date lives on Brain's `gaps/ledger` (each sweep records it there). If more than a fortnight has passed, say so and widen the search window to cover the gap.

**First sweep (or any competitor with no dossier yet):** there is no diff baseline, so the run establishes one instead of reporting deltas. Scope it to **tier 1 only**: seed each tier-1 dossier from the watchlist's seed snapshot (verify the headline claims, don't re-research everything), pin the "pin on first sweep" URLs for tier 1, and create tier-2/3 dossiers as stubs (name, tier, position line) with staggered `Review by` dates so they come due across the following weeks rather than all at once. Say plainly that this was a baseline run, not a delta report.

1. **Load state.** `wiki-query` the dossiers for every tier-1 competitor (tier-2 fortnightly, tier-3 monthly — stagger by `Review by` dates). Note each dossier's last-verified date; that is the diff baseline. A competitor with no dossier gets the first-sweep treatment above.
2. **Check the due signals** per competitor from the watchlist: newsroom/release notes, pricing page, careers page, news search (`"<competitor>" news` bounded to the window since last sweep), and for tier 1 the public social accounts — campaign themes and engagement outliers per the campaign-mining method in `references/mining-playbook.md`. Fetch and compare against the dossier's current claims.
3. **Significance-score each change** before reporting: **high** (pricing change, market entry/exit, acquisition, major launch, funding, leadership change — act this week), **medium** (notable feature ship, partnership, hiring cluster — dossier update and routing decision), **low** (content marketing, minor releases — dossier note only, no airtime). Careers-page reads use the STAR frame: scale (how many roles), timing (clusters mean urgency), alignment (do postings match announced plans or reveal something undisclosed), recurrence (replacement vs net-new). A cluster of AU sales roles or a first-of-function hire is medium at least.
4. **Update dossiers** with the confirmed changes (supersede rule), refresh verified dates.
5. **Report deltas only.** A sweep with nothing significant is one line: "swept n competitors, no significant change, dossiers re-dated." Otherwise a short table: competitor · change · significance · source · proposed routing.
6. **Route.** Product gap or threat that belongs on the backlog → hand to `feedback-to-idea` (or `signal-radar` Mode A if it strengthens an existing idea). A high-engagement competitor campaign on a capability we have an idea for → desirability evidence for that idea (route to signal-radar Mode A with the engagement figures). A marketed claim worth testing → queue a claim-vs-reality pass (playbook) now if quick, or for the deep-dive if not. Sales-relevant → flag the affected battlecard for update. Everything routed or consciously ignored is noted on `gaps/ledger` per research-os measurement.
7. **End with the stale queue and the ledger heartbeat**: list research pages past review-by, **and check `gaps/ledger` for monitored gap candidates past their review-by dates** — each gets a quick corroboration look during the sweep window and its ledger row updated (fresh evidence found, or still quiet, re-dated either way). This is the heartbeat signal-radar's monitored candidates rely on. Record the sweep date on the ledger and state when the next sweep is due.

## Mode: deep-dive — mine one competitor for weaknesses
Trigger: "deep-dive Lightspeed", "what are Toast's weaknesses", or a sweep finding that warrants it. This is the quarterly-cadence heavy pass; expect Apify usage.

1. Run the ordered playbook in `references/mining-playbook.md` for the competitor: review platforms (the dislike/switching fields specifically), Reddit and AU forums, app-store reviews of their companion apps, X search, campaign/engagement mining of their public social accounts, and a claim-vs-reality pass over whatever they are currently marketing. Respect every scoping and ToS rule in that file.
2. **Cluster complaints into 5-8 themes** with counts and representative verbatims (each with its URL). Classify items as complaint / feature request / switching signal. Note review-velocity anomalies (a spike after a pricing change is itself a finding).
3. A pattern needs volume before it is a finding: one angry post is tier-6 colour, the same complaint across many independent sources is a theme. Follow the review-mining discipline in the playbook (12-month window, minimum corpus before trusting patterns).
4. Write results to the dossier's weakness section (dated, sourced), and route: recurring gaps operators complain about at a rival are gap-scan candidates for us → `feedback-to-idea` via the usual approval; sales ammunition → battlecard update.

## Mode: battlecard — the sales-facing output
Trigger: "build a battlecard for <competitor>", or a high-significance sweep change touching a card.

1. Build from the dossier and any `win-loss` patterns in Brain — never from scratch research (if the dossier is thin, say so and run dossier mode first).
2. Follow `references/battlecard-standard.md`: one page, ten-second findability, every claim Fact-Impact-Act framed with a verified-as-of date, honest strengths included.
3. **"How we win" claims about Oolio products must come from `${CLAUDE_PLUGIN_ROOT}/personas-library/_framework/oolio-context.md`, `${CLAUDE_PLUGIN_ROOT}/products/`, or a connected source** — meaning Confluence, official Oolio pages, or a claim the human confirms in the run, nothing looser. Where the dossier shows their weakness but our counter-capability is unverified, write the weakness and flag the counter as a gap for the human, never invent one. Check `products/` for a brief on the relevant product before starting and say up front when there is none (the folder is scaffolded and may be empty) — the card will then carry mostly flagged gaps in "How we win", which is honest, but the user should know before it is built, not after.
4. Publish to Confluence on approval (ask space/parent; live page, never Verified status). Note in the card footer how reps flag stale intel (a comment on the page), and that the card updates on detected change, not on a calendar.

## This skill must never
- Create, edit, or transition a Jira issue or field. Route through `feedback-to-idea` / `signal-radar` / `jpd-loop`.
- Fabricate a fact, URL, price, or Oolio counter-claim. Undated claims don't go in dossiers.
- Scrape login-gated or private sources, or profile individuals. Companies and their public footprint only.
- Delete dossier history. Supersede with the dated history note; the audit trail is the point.
- Publish a battlecard or sweep note outside Brain without explicit approval.
- Pretend coverage: if a watchlist source was unreachable or a connector missing, the run report says which, every time.

## Definition of done
**Dossier:** page exists to standard, every claim dated and sourced, verified/review-by set. **Sweep:** all due competitors checked, deltas reported with significance and routing, dossiers re-dated, stale queue and next-due stated. **Deep-dive:** playbook run within its scoping rules, themes clustered with counts and cited verbatims, dossier updated, candidates routed. **Battlecard:** built from dossier evidence to the standard, Oolio claims verified or flagged, published only on approval.
