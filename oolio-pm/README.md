# Oolio Product Management (oolio-pm)

A single Cowork plugin bundling Oolio's product-management skills. Install it once and the whole set is available.

## What's inside

**Start here**

- `pm-compass` — the router: describe the task in plain English and it names the one skill (or short chain) that fits, and gives newcomers the two-minute picture.
- `drive` — the driver: hand it a raw, rambling, or voice-dictated request and it works out the real outcome, turns it into a clear execution contract, then plans, does, verifies, and hands back the finished result rather than advice. Invoke with `/drive`. Where `pm-compass` routes you to a skill, `drive` executes the task itself.

**Discovery and grooming**

- `feedback-to-idea` — turns raw customer, support, or sales signal into a JPD idea (or attaches it to an existing one), de-duped against the whole backlog.
- `jpd-loop` — runs the full Virtual Product Council grooming loop over one JPD idea, end to end, and writes the result back to Jira. Depends on the council skills and `jpd-idea-groomer`, both bundled here.
- `jpd-idea-groomer` — brings a JPD idea up to Oolio's JPD Field Standards.
- `jpd-title-standard` — grooms JPD idea titles to the JPD Title Standard (max 65 characters, sentence case, capability-led with a clear outcome). Works on pasted text, a single idea, or in bulk via JQL.
- `signal-radar` — synthesises HubSpot, web, and social signal (via Apify) into cited evidence for a JPD idea, or scans the backlog for gaps against real market and customer demand. Syncs every finding into the Brain (the `my_brain` vault) so research compounds instead of repeating.
- `add-insight` — the evidence-first attach: hand it one useful thing (an article, a stat, a HubSpot ticket, a quote) and it finds every backlog idea the evidence genuinely supports and attaches it as native JPD Insights, on one idea or several.
- `competitor-watch` — the standing competitive-intelligence function: one living dossier per competitor in the Brain, weekly delta sweeps over a tiered watchlist, review/community deep-dives for weaknesses, and Fact-Impact-Act battlecards for sales.
- `win-loss` — mines HubSpot closed-lost and churn data monthly for the real reasons deals are won and lost, cross-examining rep-entered reasons against deal metadata, and routes product gaps to the backlog and competitor patterns to the dossiers.
- `discovery-wayfinder` — charts a discovery theme too big for one session as a Jira map of decision tickets, worked one decision at a time until the way is clear. Routes research to `storm-research`/`signal-radar`, judgement calls to `grill-me`, and the output to the intake and loop skills.

**The Virtual Product Council**

- `convene-vpc` — the orchestrator. Chairs the subcommittees and records a validated decision.
- `operator-council-review` — the hospitality user personas (the UAT panel).
- `design-council-review` — the expert design and research lenses.
- `leadership-subcommittee-review` — the executive and commercial lenses.
- `storm-research` — the research engine that grounds the decision in cited evidence first.
- `personas-library/` — a self-contained snapshot of the persona library the council reads from.

**Definition and specs**

- `write-prd` — writes an Oolio PRD from a groomed JPD idea or brief, in the live Oolio PRD format, and publishes it to Confluence.
- `grill-my-prd` — grills a Confluence PRD one question at a time, then records the outcome as a versioned child page and badged in-place amendments.

**Launch and GTM**

- `gtm-handover` — the executive GTM handover: One-Pager and Supporting Deck, and the `pack_content.json` narrative the other GTM skills read.
- `gtm-playbooks` — the internal Sales, Account Management, and Onboarding playbooks.
- `gtm-marketing` — the Marketing Pack: launch announcement, social, email sequence, sales note, campaign brief.

**Prioritisation and measurement**

- `steering-pack` — builds a Steering-ready review pack over a backlog slice: fitness checks, VPC verdicts, asks, and a recommended order.
- `metrics-review` — validates a launch against its PRD's success metrics, or runs a recurring product review, from real data (PostHog first).

**Jira authoring helpers**

- `jira-epic-groomer` — grooms an epic description to the standard What/Why/Who pattern.
- `jira-epic-titler` — proposes stronger epic titles to the `[Capability] for [Outcome]` standard.

**Thinking partners**

- `grill-me` — interviews you relentlessly about a plan, decision, or design until every branch of the decision tree is resolved. For Confluence PRDs, prefer `grill-my-prd`.
- `behavioural-alchemist` — summons Roy, the Behavioural Alchemist: reads a decision, feature, price, loyalty scheme, or piece of positioning through behavioural economics and consumer psychology, and finds the perceived-value, contrarian, and disproportionate-intervention angles the rational lenses miss. Ten modes, from Pricing Psychology to Loyalty Architect to Experiment Designer. Also sits as an elevated cross-cutting lens inside the Virtual Product Council (`personas-library/behavioural-alchemist.md`); this skill is how you summon him on his own.

**The Brain (the knowledge engine)**

The maintenance skills for `my_brain`, the git-backed Obsidian vault that is the team's compounding knowledge base. The research skills above (`signal-radar`, `competitor-watch`, `jpd-loop`) read and write the Brain through these. Thin runbooks over the vault's own `_system/` rules; the portable shape is in `references/vault-model.md`.

- `wiki-query` — answers a question from the vault with citations, and offers to file durable answers back as a synthesis.
- `wiki-ingest` — reads a source, integrates it across the owning domain's pages with provenance, routes competitors to Market, updates the catalogue.
- `wiki-new` — stands up a new Product Domain with a README-only front door and confirmed scope; no empty scaffolding.
- `wiki-lint` — health-checks the vault for contradictions, stale claims, orphans, and frontmatter faults; changes only on approval.
- `wiki-status` — a read-only snapshot: per-domain page counts, recent activity, stubs, and gaps worth filling.

**Product context**

- `products/` — one brief per Oolio product, the facts skills may rely on. Scaffolded; briefs are added as product owners supply them.

## Keeping the persona library in step

The council reads from `personas-library/` inside this plugin, which is a snapshot. When the live persona library changes, re-bundle the snapshot so the plugin stays current.

## Editing and publishing

See `../PUBLISHING.md` in the marketplace root.
