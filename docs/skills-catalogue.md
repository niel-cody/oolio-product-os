# Oolio PM — Skills Catalogue

The plugin ships **33 skills**, organised here by where they sit in the product lifecycle,
signal to shipped. The folders under `oolio-pm/skills/` stay flat (that is what the Claude
Code plugin loader expects). This document is the map; the categories are a reading aid, not
a folder structure.

Use it to find the right skill fast, and to see the gaps. In a session, `pm-compass` is the
live version of this page: describe the task and it routes you.

**Statuses.** Every skill carries a lifecycle status per
[references/skill-standard.md](../oolio-pm/references/skill-standard.md): **In progress**
(lives in `skills-in-progress/`, not shipped), **New** (shipped within the last month or so),
**Stable**, or **Archived** (in `_archive/`). Unmarked skills below are Stable; there are no
per-skill version numbers, by design — the plugin versions by commit.

---

## The stages

| # | Stage | What it is for | Skills |
|---|-------|----------------|--------|
| 0 | Start here | Find the right skill, or drive any task to done | 2 |
| 1 | Intake & Discovery | Turn raw signal into shaped, groomed ideas | 11 |
| 2 | Specs & PRDs | Shape ideas into written, pressure-tested specs | 3 |
| 3 | Validation & Councils | Test decisions against the Virtual Product Council | 5 |
| 4 | Delivery & Steering | Jira hygiene and executive-facing packs | 3 |
| 5 | GTM | Take a launch to market | 3 |
| 6 | Analysis | Close the loop after launch | 1 |
| 7 | The Brain | Maintain the knowledge engine the research skills read and write | 5 |

---

## 0. Start here

- **pm-compass** *(New, July 2026)* — The router: describe the task, get the one skill (or short chain) that fits, and the pipeline picture for newcomers.
- **drive** *(New, July 2026)* — The driver: take a raw, rambling, or voice-dictated request, turn it into a clear execution contract (objective, done-when, constraints), then plan, do, verify, and hand back the finished result rather than advice. The generalist front door for any task that does not yet have a shaped brief; `pm-compass` routes, `drive` executes.

## 1. Intake & Discovery

Turn customer, support, and sales signal into groomed Jira Product Discovery ideas.

- **meeting-sweep** *(New, August 2026)* — The end-of-day pass over Granola: file every meeting, decision and action into the Brain, then propose the work that follows as Jira comments and tasks, JPD ideas and Insights, and additive notes on the Confluence pages the meetings touched. Additive only, one batch approval, never deletes.
- **feedback-to-idea** — Turn raw customer, support, or sales signal into a JPD idea, or attach it to an existing one, de-duped against the backlog.
- **jpd-idea-groomer** — Groom a JPD idea end to end against Oolio's JPD Field Standards (2026+).
- **jpd-title-standard** — Groom JPD idea titles to the Title Standard: max 65 characters, sentence case, capability-led.
- **jpd-loop** — Run the full Virtual Product Council grooming loop over a single JPD idea, end to end.
- **storm-research** — Multi-perspective, citation-verified research briefing (STORM method), delivered as a clean HTML report.
- **signal-radar** *(New, July 2026)* — Synthesise HubSpot, web, and social signal (via Apify) into cited evidence for a JPD idea, or scan the backlog for gaps against real market and customer demand. Syncs findings into the Brain.
- **add-insight** *(New, July 2026)* — The evidence-first attach: hand it one useful thing and it finds every backlog idea the evidence genuinely supports and attaches it as native JPD Insights, one idea or several.
- **competitor-watch** *(New, July 2026)* — The standing competitive-intelligence function: per-competitor dossiers in the Brain, weekly delta sweeps, review/community deep-dives, campaign and claim-vs-reality mining, and Fact-Impact-Act battlecards.
- **win-loss** *(New, July 2026)* — Mine HubSpot closed-lost and churn data monthly for the real loss drivers, cross-examined against deal metadata; gaps to the backlog, patterns to the dossiers.
- **discovery-wayfinder** *(New, July 2026)* — Chart a discovery theme too big for one session as a Jira map of decision tickets (fog-of-war scoping, HITL/AFK ticket types, one decision per session), adapted from Matt Pocock's Wayfinder.

## 2. Specs & PRDs

Shape an idea into a written spec, then pressure-test it.

- **write-prd** — Write an Oolio PRD from a groomed JPD idea, a brief, or a problem statement, in Oolio's high-level format.
- **grill-my-prd** — Interview you on a Confluence PRD one question at a time, resolve its decision tree, record a versioned grill page, and amend the PRD in place.
- **grill-me** — Relentlessly interview you on any plan, decision, PRD, or design until you reach shared understanding.

## 3. Validation & Councils

Pressure-test a decision against the Virtual Product Council and its expert lenses.

- **convene-vpc** — Convene the full Virtual Product Council to pressure-test a decision, design, requirement, spec, PRD, or piece of research.
- **design-council-review** — Review a design against the Design Council, the panel of expert design and research lenses.
- **operator-council-review** — Test a decision against the Operator Council, the hospitality user personas (the UAT panel).
- **leadership-subcommittee-review** — Test a decision against the Leadership Subcommittee, the executive and commercial lenses.
- **behavioural-alchemist** *(New, July 2026)* — Summon Roy, the Behavioural Alchemist: read a decision, feature, price, loyalty scheme, or positioning through behavioural economics, and find the perceived-value, contrarian, and disproportionate-intervention angles the rational lenses miss. Also sits as an elevated cross-cutting lens inside the council (`personas-library/behavioural-alchemist.md`); this skill summons him standalone.

## 4. Delivery & Steering

Keep Jira clean and build the packs leadership reads.

- **jira-epic-groomer** — Groom or backfill a Jira epic description to Oolio's What / Why / Who standard.
- **jira-epic-titler** — Suggest a stronger epic title using the `[Capability] for [Outcome]` standard.
- **steering-pack** — Build a Steering-ready review pack over a slice of the JPD backlog: per-idea one-liners, field completeness, VPC verdicts and rubric scores.

## 5. GTM

Take a single product launch to market.

- **gtm-handover** — Build the executive GTM handover: the One-Pager and the Supporting Deck. The narrative source for the rest of the suite.
- **gtm-playbooks** — Build the three internal playbooks: Sales, Account Management, and Onboarding.
- **gtm-marketing** — Build the Marketing Pack: launch announcement, social posts, email sequence, sales note, and campaign brief.

## 6. Analysis

Close the loop once it is live.

- **metrics-review** — Run a product metrics review against real data: post-launch validation of a PRD's success metrics, or a recurring weekly or monthly review.

## 7. The Brain

Maintain `my_brain`, the git-backed Obsidian vault that is the team's compounding knowledge engine. The research skills (`signal-radar`, `competitor-watch`, `jpd-loop`) read and write the Brain through these. Thin runbooks over the vault's own `_system/` rules; the portable shape is in [`references/vault-model.md`](../oolio-pm/references/vault-model.md).

- **wiki-query** *(New, July 2026)* — Answer a question from the vault with citations, surface caveats and staleness, and offer to file durable answers back as a synthesis.
- **wiki-ingest** *(New, July 2026)* — Read a source, surface takeaways for sign-off, then integrate it across the owning domain's pages with provenance; competitors route to Market.
- **wiki-new** *(New, July 2026)* — Stand up a new Product Domain with a README-only front door and confirmed scope; no empty scaffolding.
- **wiki-lint** *(New, July 2026)* — Health-check the vault for contradictions, stale claims, orphans, and frontmatter faults (missing `class`, past `review`); change only on approval.
- **wiki-status** *(New, July 2026)* — A read-only snapshot: per-domain page counts, recent activity, stubs, orphans, and gaps worth filling.

---

## Planned and in-progress work

The candidates the next iteration draws from; each becomes a CHANGELOG entry when it lands
(or dies quietly if it doesn't earn its place):

- **Grilling engine split** — extract the shared interview loop from `grill-me`/`grill-my-prd`
  into one engine the wrappers invoke, so the interviewing craft improves in one place.
- **setup-oolio** — a one-time per-workspace setup that records Jira project keys, Confluence
  spaces, and labels in one config the other skills consult instead of hardcoding.
- **The operator producers** — daily-brief, email-triage, jpd-keeper and the rest of the
  staged autonomy roadmap live in the operating model
  ([operating-model_v0.1_2026-07-14.md](operating-model_v0.1_2026-07-14.md)) and the vault's
  Skills Catalogue; they ship here as they are built.

## Reference material (not skills)

Skills call on shared reference material that lives outside `skills/`:

- **`personas-library/`** — the *who*: personas, segments, the Virtual Product Council and its sub-panels (Design Council, Operator Council / UAT panel, Leadership Subcommittee).
- **`products/`** — the *what we sell*: one reference file per Oolio product (`_template.md` is the shape).
- **`references/`** — the *how we work*: house style, output formats, cross-cutting standards, `research-os.md` (the operating model the research skills share: brain taxonomy, cadences, source tiers, the routing pipe), and `skill-standard.md` (how skills themselves are written: trigger specs, lifecycle statuses, the no-op test, the guardrail block).

Where new reference types land (team profiles, process docs, Obsidian routing) is being
worked out in a dedicated discovery pass. Until then, add to the closest existing folder and
flag it, rather than creating a new top-level folder.
