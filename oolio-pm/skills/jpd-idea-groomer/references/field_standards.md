# JPD Field Standards, canonical field IDs and option labels

The single source of truth for writing custom fields back to Jira Product Discovery (project `OHSI`, "Oolio One Ideas", issue type `Idea`, id `10071`). Labels below were pulled from the live Jira field metadata on 2026-07-06, re-verified 2026-07-13, and updated 2026-07-25 for the JPD model change (Size, Pillar, Theme, Commitment, Category; Product Area retired). **Always send these exact strings.** The Confluence standard page describes intent; Jira enforces spelling. Where the two differ, this file wins.

Canonical rules page: https://oolio.atlassian.net/wiki/spaces/PM/pages/1055653929/Jira+Product+Discovery+JPD+Field+Standards

If a write fails with an unhelpful error, the label is almost always the problem. Re-check here, or fetch a known populated idea (`OHSI-39`, `OHSI-45`, `OHSI-57`, `OHSI-72`, `OHSI-74`) and copy the exact string.

## Canonical statuses and mandatory JQL guards

**Statuses (as of 2026-07-13):** `Captured` → `Exploring` → `Decision` → `Ready for delivery` (lowercase d — send exactly this) → `In Engineering`, with end states `Shipped`, `Not Now`, `Rejected`. The former `Planning` and `Ready for Engineering` statuses were merged into `Ready for delivery` on 2026-07-13 and no longer exist.

**Every backlog sweep, de-dupe search, or bulk query against OHSI MUST carry two guards:**

1. `issuetype = Idea` — the project also contains `Customer` records (type id `10606`), which pollute any unguarded search.
2. An archived filter on `Idea archived` (`customfield_10835`) — ~43 archived ideas otherwise inflate every result. The verified form (tested live, 2026-07-13) is `(cf[10835] IS EMPTY OR cf[10835] != Yes)`. The `IS EMPTY` clause is load-bearing: non-archived ideas hold the field empty, and JQL's `!=` excludes empties, so a bare `cf[10835] != Yes` silently returns **zero** ideas. The bracketed spellings (`"Idea archived[Select List (single choice)]"`, `"Idea archived[Dropdown]"`) match nothing in this instance; the plain name `"Idea archived"` works identically to `cf[10835]` if preferred.

Base pattern: `project = OHSI AND issuetype = Idea AND (cf[10835] IS EMPTY OR cf[10835] != Yes) AND <your terms>`.

**Exit mapping from the VPC verdict (Decision stage):** Proceed → `Ready for delivery` · Park → `Not Now` (+ set the Revisit on date, `customfield_11811`, see below) · Kill → `Rejected` · Duplicate → link to the surviving idea, then archive.

## Required fields

### Pillar — `customfield_11552` (multi-select)

Renamed from "Strategic Pillar" on the JPD idea side on 2026-07-25 (options unchanged). The durable company strategy the idea serves: the "why". **Note (gotcha):** this is the JPD *idea* Pillar field only. The separate Initiative/epic "Strategic Pillar" field is a different custom field — never rename or write it from the JPD skills.

- `Venue Profitability`
- `Operational Efficiency`
- `Ordering Growth`
- `Multi-Venue Management` (capital V in Jira; the Confluence page writes "Multi-venue")
- `Platform Extensibility`
- `Vertical Expansion`
- `Migration & Modernisation`

Select at least one. Multiple only when genuinely relevant. Never all of them.

### Theme — `customfield_10088` (single-select)

Added to the OHSI Idea type on 2026-07-25. This year's strategic frame: the single body of work the idea belongs to (the "what"). One theme per idea. Each theme rolls up to a primary FY27 mission pillar for reporting; the mapping lives in the brain vault (`04a_Pillar_Map.md`), not here.

- `Platform & Scale`
- `Ordering & Payments`
- `Menu & Kitchen Operations`
- `Data, AI & Insights`
- `Customer Engagement & Loyalty`
- `Inventory & Enterprise Readiness`
- `Reservations & Vertical Expansion`
- `Migration off Legacy`

One value, required from Exploring onward. **ID note:** Theme lives on `customfield_10088`. Do not confuse it with the Initiative "Strategic Pillar"; the JPD skills only ever write Theme (10088) and Pillar (11552) on Ideas, never any epic/initiative pillar field.

### Investment Type — `customfield_11553` (single-select)

Renamed from "Category" on 2026-07-13. Describes where product effort is being invested. Same four options:

- `Customer Problem`
- `New Capability`
- `Product optimisation` (lowercase o, exactly as written)
- `Strategic investment` (lowercase i, exactly as written)

Choose the primary type only.

**Note:** Investment Type (`11553`) and Category (`11711`) are two different fields — do not conflate them. Investment Type is the *nature* of the opportunity (customer problem / new capability / optimisation / strategic). Category (`11711`, below) is the *product grouping* and, as of 2026-07-25, is a required field the groomer sets (it replaced the retired Product Area). Earlier versions of this file said "never write 11711" — that instruction is obsolete; 11711 is now written on every idea.

### Source — `customfield_11554` (multi-select)

The live Jira options differ noticeably from the Confluence page. Use these:

- `Customer`
- `Sales`
- `Support`
- `Operations`
- `Internal Product Insight`
- `Market / Competitor`
- `Data / Analytics`
- `Migration (legacy platform)`
- `Compliance / Regulatory`
- `Partner / Integration`

Multi-select allowed; strong ideas often carry two or three signals (for example `Customer` + `Support` + `Internal Product Insight`).

### Customer Signal — `customfield_11560` (single-select)

Sentence case in Jira, not title case:

- `One customer`
- `Multiple customers`
- `Repeated support trend`
- `Revenue blocker`
- `Churn risk`
- `Strategic prospect blocker`
- `Market insight`
- `Product vision`

Choose the strongest signal that is actually true.

### Primary Persona — `customfield_11555` (single-select)

- `Venue Owner`
- `Venue Manager`
- `FOH Staff` (not "Front-of-House Staff")
- `Kitchen Staff`
- `Finance/Admin` (no spaces around the slash)
- `Multi-site Operator`
- `Support Teams` (not "Support Staff")
- `Integrations/Partners`
- `Franchise/Enterprise Operator` (exists in Jira; not on the Confluence page)

One value: who benefits most.

### Size — `customfield_11557` (single-select)

Renamed from "Delivery Size" and consolidated to four options on 2026-07-25 (the old seven pipe-suffixed tiers no longer exist — do not send `Tiny tweak | Hours` etc., the write will fail). Send the plain single word:

- `Sand` — BAU, tweaks, fixes. Hours to days. Usually belongs in delivery, not discovery.
- `Pebble` — a small, self-contained feature. A sprint or two.
- `Rock` — a significant initiative. About a quarter for one team. Needs discovery.
- `Boulder` — a strategic bet. 3 to 6+ months, multi-team. What a CEO deck is built around.

Directional only, not engineering estimation. Sizing is also altitude: Boulders and Themes are the exec conversation, Rocks the product-lead conversation, Pebbles and Sand the team conversation. Fill the jar with boulders first, then rocks, then pebbles, then sand.

### Category — `customfield_11711` (single-select)

The primary product grouping the idea belongs to. Added to the groomer's required set on 2026-07-25, replacing the retired Product Area. Choose one:

- `Customers`
- `Integrations`
- `Kitchen Display`
- `mPOS & Tap to Pay`
- `Online Ordering`
- `Payments`
- `POS`
- `Products`
- `Reporting`
- `Self Ordering Kiosk`
- `Users & Staff`

One primary grouping only. Ask: which product area does this idea primarily belong to? (The option list is due a tidy — a few values are personas or features rather than clean product areas — but send exactly what is here until the list changes.)

> **Product Area (`customfield_11561`) is RETIRED (2026-07-25).** It is no longer on the Idea create screen. Do not read it, propose it, or write it — a write lands on a dead field. Category above replaces it.

### Our Objective — `customfield_11559` (multi-select)

Sentence case in Jira:

- `Revenue growth`
- `Retention`
- `Migration enablement`
- `Support reduction`
- `Time-to-live reduction`
- `Operational efficiency`
- `Market expansion`
- `Competitive parity`
- `Enterprise readiness`
- `Platform adoption`

### Horizon — `customfield_11744` (single-select)

The roadmap-commitment axis, orthogonal to status (status = where the idea is in the discovery process; Horizon = when we intend to act). Options:

- `Under consideration`
- `Later`
- `Next`
- `Now`
- `Shipped`
- `Not planned`

**Ownership rule: skills propose, Steering decides.** The groomer may propose a Horizon with a rationale, but never sets `Now`/`Next` without an explicit Steering decision or Niel's instruction. Do not use FY-quarter labels for roadmap timing — that is Horizon's job.

### Commitment — `customfield_11931` (single-select, Now quarter only)

Added 2026-07-25. Within the Now short list, how firmly we will really do it. Horizon says the idea is in this quarter; Commitment says how real that is. Set it **only** when Horizon is `Now`; leave empty otherwise. Like Horizon, it is a Steering-owned value — the groomer proposes, Steering sets.

**Send the exact live strings (they carry typos in the Jira option list — Jira enforces spelling, so match them literally):**

- `Will Do` (capital D in Jira)
- `Aim to do`
- `Strech` (misspelled in Jira — this is the real option value; not "Stretch")

If these option labels are corrected in Jira later, re-pull the metadata and update this list. Until then, `Strech` and `Will Do` are the only strings that will write successfully.

### Innovation — `customfield_10505` (rating, 1–5)

Written as a bare number. (Display name was " Innovation" with a leading space until 2026-07-13, now fixed to "Innovation"; writing by ID remains safest.) Rate honestly:

1. Parity / catch-up
2. Incremental, common in market
3. Solid differentiator
4. Strongly differentiated, few competitors offer it
5. Market-leading or novel (including new applications of emerging tech such as AI)

## Optional fields

### Secondary Personas — `customfield_11556` (multi-select)

Same option list as Primary Persona. Only tag personas genuinely impacted.

### Applicable Segments — `customfield_11558` (multi-select)

- `Cafe` (no accent in Jira)
- `QSR`
- `Casual Dining`
- `Pub`
- `Bar`
- `Hotel`
- `Fine Dining`
- `Franchise`
- `Enterprise` (in Jira; not on the Confluence page)
- `Multi-location`
- `Takeaway`
- `Pizza`
- `Bakery` (in Jira; not on the Confluence page)
- `Gaming Venue`

Every materially relevant segment, not fringe cases.

### Migration Relevance — `customfield_11562` (multi-select)

Despite the Confluence page describing Yes/No, the live field is a legacy-product picker:

- `Bepoz`
- `SwiftPOS`
- `IdealPOS`
- `DeliverIT`
- `OrderMate`

Select the legacy products the idea materially supports migrating from. Leave empty when not migration-relevant.

### Escalate — `customfield_10432` (number/boolean tag)

Set only for genuine executive or commercial urgency. Schema verified 2026-07-13: `jira.polaris:boolean` stored as Jira type **number** — always write `1`/`0`, never `true`/`false` (the boolean form is the likely cause of historic rejections). If a `1`/`0` write is still rejected, fall back to the JPD UI toggle and tell the user; once one clean write is confirmed, remove this fallback sentence.

### Likes — `customfield_11710` (number, read-only for skills)

Drives voting on the public-facing portal. **Do not write, clear, or treat as unused.** The separate Jira `votes` system field is not used at Oolio and is not surfaced by JPD — ignore it entirely.

### Revisit on — `customfield_11811` (Polaris date, verified attached)

Powers the targeted Not Now bubble-up: set when parking an idea (JPD automation default: +90 days), and the quarterly sweep resurfaces only ideas whose date has passed. Verified 2026-07-13: attached to OHSI Ideas, schema `jira.polaris:interval`. Plain-date API writes are rejected; a JSON-string interval write (`{"start":"YYYY-MM-DD","end":"YYYY-MM-DD"}`) was accepted in testing but UI rendering is unconfirmed — treat writes as automation/UI-owned until confirmed. JQL clause `"Revisit on[Time stamp]" <= "YYYY-MM-DD"` parses; the sweep reads, never writes.

## VPC loop fields (written by jpd-loop, read-only here)

These exist on the Idea type and are managed by the `jpd-loop` skill. The groomer should not set them, but should not clobber them either:

`VPC Loop State` (`customfield_11663`), `VPC Reviewed` (`11664`), `VPC Iterations` (`11665`), `VPC Verdict` (`11666`), `Dedupe Status` (`11667`), `Sign-off Status` (`11668`), `Sign-off Owner` (`11669`), `VPC Last Run` (`11671`), `Escalation Reason` (`11672`), `Desirability` (`11673`), `Feasibility` (`11674`), `Viability` (`11675`), `Strategic Fit` (`11676`), `VPC Confidence` (`11677`).

`VPC Last Run` (`11671`) is schema-verified as `jira.polaris:interval` (a string with undocumented serialization): API writes are rejected in this instance. **Verified, do not retry** — leave it unset and note the gap. The same applies to all Polaris date/interval fields (e.g. Project start/target).

## Fields the API cannot see (dynamic fields)

Formula fields (none currently in use; a scoring formula was ruled Won't Do on EVITA-81), `Delivery status` (`customfield_10844`), `Delivery progress` (`customfield_10843`), per-view rank, and insight *content* are never returned by the API — they read as null even when populated in the UI. Compute delivery state from `Polaris work item link` (implements) links instead, and treat the `Insights` count (`customfield_10840`, readable number) as the only API-visible insight signal.

## Delivery linking standard

From `Ready for delivery` onward, every idea carries at least one **`Polaris work item link` (implements)** to its delivery epic(s) — this is what the JPD Delivery tab renders and what the delivery automations key on. Links to INI (Initiatives) items are additional context, never a substitute. Create via `createIssueLink` with type `Polaris work item link`.

## Write-back shapes (editJiraIssue `fields` object)

- Single-select: `"customfield_11553": {"value": "Customer Problem"}` (Investment Type)
- Single-select: `"customfield_11557": {"value": "Rock"}` (Size), `"customfield_11711": {"value": "POS"}` (Category), `"customfield_10088": {"value": "Ordering & Payments"}` (Theme)
- Single-select, Now only: `"customfield_11931": {"value": "Will Do"}` (Commitment — mind the typo'd options)
- Multi-select: `"customfield_11552": [{"value": "Venue Profitability"}, {"value": "Operational Efficiency"}]` (Pillar)
- Rating: `"customfield_10505": 4`
- Escalate: `"customfield_10432": 1` (fall back to the UI toggle if rejected)

Send every change in one `editJiraIssue` call. Never overwrite an existing sensible value; only propose a change when the current value is clearly wrong or missing.

## Keeping this file honest

This file mirrors live Jira configuration. If a write fails on a label listed here, the Jira config has changed: fetch the field metadata again (`getJiraIssueTypeMetaWithFields`, project `OHSI`, issue type `10071`, `requiredFieldsOnly: false`), fix this file, and note the change in the plugin CHANGELOG.
