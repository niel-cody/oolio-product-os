# Research OS — the operating model for compounding research

The shared standard every research skill follows (`signal-radar`, `competitor-watch`, `win-loss`, `storm-research`, and `jpd-loop`'s evidence step). Its one job: make research **compound**. A run that leaves no structured trace in the Brain is a run the team pays for twice, because the next question starts cold. Insight repositories die from contribution tax and from insights that are never resurfaced (NN/g's repository-failure research: no owner, ad-hoc taxonomy, contribution treated as extra work). An agent removes the contribution tax; this file supplies the taxonomy and the resurfacing cadence.

## The pipe

Signal flows one way, and every stage has an owner:

```
raw signal (web, social, HubSpot, reviews, sweeps)
  → evidence log (Brain, append-only, cited)
  → insight (Brain, atomic, linked to evidence)
  → JPD idea or existing-idea Insight (via feedback-to-idea / signal-radar)
  → council verdict (jpd-loop / convene-vpc)
  → shipped → metrics-review
```

The agent moves material down the pipe and proposes; the human triages and decides. Discovery output must land as backlog items or idea evidence, not as reports that sit in a folder.

## Brain page taxonomy (the real vault)

The brain is the `my_brain` Obsidian vault (git-backed, one source of truth), whose canonical layout is its own `STRUCTURE.md` and `_system/operating-system.md` — **the vault's rules win** wherever this file and they disagree. Research pages follow page-per-entity: one page per competitor, per trend, per insight. Questions are sections on an entity's page, never pages of their own. Where research output lands:

| Type | Vault home | What it is |
|---|---|---|
| Competitor dossier | `30 Knowledge/Market/Competitors/<Name>` | The **one canonical page** per competitor, `type: entity`, tag `entity/competitor`. Everything we know about them, across every capability, on one page. Schema in `${CLAUDE_PLUGIN_ROOT}/skills/competitor-watch/references/dossier-standard.md`. Capability domains never copy it; they write a domain-scoped synthesis that links back. |
| Trend / cross-competitor thesis | `30 Knowledge/Market/` (page at this level) | `type: synthesis` — the landscape read, win/loss theses, where we lead or lag. |
| Insight | the relevant domain or Market page section, or its own page where genuinely atomic | One finding plus its evidence links and status; `type: concept` or a synthesis section. Never merge two insights. |
| Evidence log / source capture | `30 Knowledge/Market/Sources/` (or the owning domain's `Sources/`) | One page per source capture (a review batch, a scan, a closed-lost analysis), `type: source`, with provenance. Append-only; never rewritten after creation. |
| Gap ledger | `01 Command Centre/Gap Ledger` | The standing dashboard of monitored candidate gaps and open research questions: evidence count, review-by date, status, JPD key once routed. The research queue and scoreboard. Create it on first use if absent. |

Vault-wide rules that bind research pages: every page carries `type:` frontmatter (`source | entity | concept | synthesis | overview`) plus `created`/`updated`, provenance (`sources:` and inline links) is mandatory, page titles are globally unique in Title Case With Spaces, supersession never deletes, and contradictions are flagged, not overwritten. Access the vault through the wiki skills (`oolio-pm:wiki-query`, `wiki-new`, `wiki-ingest`) where available.

**The operator wall (hard):** research skills may write only the vault's work layers. `20 Areas/Personal` and `10 Projects/Personal` are NO-GO, always, per the vault's STRUCTURE.md §4 — no research run reads or writes them.

**Finding pages again (anti-forking rule):** the paths above are naming conventions, not lookup keys. Always `wiki-query` by topic or title first ("the gap ledger", "the Toast dossier"), using the path only as a hint; and after any `wiki-new`, record the identifier Brain actually assigned (in the run report, and on the gap ledger for ledger-adjacent pages) so the next run finds the same page instead of concluding it doesn't exist and creating a duplicate. A forked ledger or dossier is worse than none — it splits the record silently.

## Metadata every research page carries

State these in the page body (or frontmatter where Brain supports it):

- **Last verified** date, distinct from last edited. A claim re-confirmed today and a claim last checked in January are different things even if the text matches.
- **Review by** date, per type: competitor pricing 30 days, competitor product claims 60 days, trend pages 90 days, insights 180 days.
- **Status**: `verified` (recently confirmed), `contested` (conflicting evidence exists; link both sides), `stale` (past review-by; downweight until re-verified).
- **Source tier** (below) on every claim, with the source URL and its date.

## Linking rules (what makes retrieval work)

- Every insight links at least one evidence log. No orphan claims.
- Competitor and trend claims cite evidence inline, dated.
- Contested pages link the conflicting evidence on both sides.
- When an insight becomes a JPD idea, record the key on the insight page. That closes the loop and lets us measure conversion.
- Supersede, don't append-duplicate: when new evidence updates a claim, replace the claim and move the old one to a dated history note on the same page. A dossier where January and July pricing sit side by side unmarked is worse than no dossier.

## Source reliability tiers

1. HubSpot, direct and specific (a named account's blocker, churn reason, repeated request).
2. The Brain, `verified` status (vetted once already; `stale` pages drop to tier 4 until re-verified).
3. Primary competitor or brand source (their own pricing, docs, release notes), dated.
4. Analyst or industry report, dated.
5. Aggregated social or review signal (the same point across several independent posts or reviews).
6. A single social post, forum comment, or review, uncorroborated.

Impact caps for JPD Insights: tier 5 caps at 4/5, tier 6 caps at 2/5 (full rules in `${CLAUDE_PLUGIN_ROOT}/skills/signal-radar/references/insight-and-gap-format.md`). The general principle is Gilad's: investment stays proportional to evidence strength, and evidence types differ by orders of magnitude, not degrees.

## Cadence per signal type

Match frequency to volatility; trigger events override the calendar.

| Signal | Cadence |
|---|---|
| Competitor pricing pages | Weekly check; act same-day on a detected change |
| Release notes, newsrooms, changelogs | Weekly |
| Careers pages (tier-1 competitors) | Weekly to fortnightly |
| Competitor social campaigns and engagement (tier 1) | Weekly, within the sweep |
| News, funding, leadership moves | Weekly triage |
| Emerging-independents scan (new entrants, indie launches) | Quarterly |
| Review platforms (G2, Capterra, ProductReview, app stores) | Quarterly; re-run after a competitor's major release or pricing change |
| Win/loss pattern analysis | Monthly |
| Full dossier freshness audit | Quarterly |
| Trigger events (funding, launch, pricing change, M&A, market entry) | Within the week, regardless of schedule |

The weekly unit of work is a `competitor-watch` sweep; the monthly unit is a `win-loss` run; the quarterly unit is the deep review-mining pass and the freshness audit. Skills cannot schedule themselves: set a recurring task (Cowork scheduled tasks, or a Claude Code cron/scheduled prompt) whose prompt is simply "run the competitor-watch sweep" or "run win-loss for last month". Until that is set up, the cadence table is a checklist the human drives; note at the end of each run when the next one is due.

## Freshness and the stale queue

Any research page past its review-by date is treated as `stale`: still readable, weighted at tier 4 at best, and queued for re-verification. Every sweep ends by listing the pages that went stale since the last run. The quarterly freshness audit re-verifies every dated claim in tier-1 dossiers; one wrong fact costs more trust than ten missing ones.

## Measurement (is the research house working?)

Keep a short scoreboard section on `gaps/ledger`, updated by whichever skill touches it:

- Gap candidates raised → became JPD ideas → reached a council verdict → shipped.
- Insights attached to ideas → cited in a council verdict (jpd-loop records which evidence the verdict leaned on).
- Sweep deltas raised → acted on (dossier update, battlecard update, idea, or consciously ignored).

No conversion after several cycles means the pipe is blocked at triage or the signal quality is poor; either way it shows up here instead of nowhere.

## Division of labour (hard boundaries)

The agent: gathers, cites, diffs, clusters, drafts, links, flags staleness, proposes routing. The human: conducts interviews (AI summaries miss detail and remove the learning; interviews stay human), triages the gap ledger weekly, approves anything that writes to Jira or publishes outward, and owns every go/no-go. Research skills never write Jira fields directly; they hand to `feedback-to-idea`, `jpd-idea-groomer`, or `jpd-loop`.
