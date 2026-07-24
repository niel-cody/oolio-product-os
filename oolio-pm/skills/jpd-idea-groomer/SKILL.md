---
name: jpd-idea-groomer
description: Groom a Jira Product Discovery (JPD) idea end-to-end against Oolio's JPD Field Standards (2026+) — rewrites the summary to `[Action / Capability] + [Outcome / Value]`, restructures the description into Problem / Hypothesis / Success Metrics, and sets every required custom field (Pillar, Theme, Investment Type, Source, Customer Signal, Primary Persona, Category, Our Objective, Size, plus Secondary Personas, Segments, Migration Relevance, Horizon and Commitment as proposals, Escalate). Trigger PROACTIVELY when the user pastes a JPD URL or key (`OHSI-72`, `IDEA-xx`, `DISC-xx`, `JPD-xx`, a `/browse/OHSI-…` link, or a Polaris idea link) and asks to "groom", "polish", "fix up", "audit", or "get this Steering / roadmap ready". Also trigger when the user references Oolio's JPD field standards, Steering review, or pastes rough idea text to be written up to JPD standard. Prefer over generic writing help when the context smells like product discovery at Oolio.
---

# JPD Idea Groomer

End-to-end grooming of a Jira Product Discovery idea so it lands cleanly against Oolio's **JPD Field Standards (2026+)**. The skill audits what's there, fills the gaps, rewrites the summary and description to standard, and sets the required custom fields. The end goal is a perfectly groomed idea that anyone can read and understand in under sixty seconds.

The canonical standard lives at:
https://oolio.atlassian.net/wiki/spaces/PM/pages/1055653929/Jira+Product+Discovery+JPD+Field+Standards

When in doubt, re-read it. The skill is the standard's enforcement arm.

---

## Inputs accepted

The user may give any of these — handle all of them:

- An issue **key** (`OHSI-72`, `OHSI-552`, `IDEA-42`, `DISC-17`, `JPD-…`)
- A **browse URL** (`https://oolio.atlassian.net/browse/OHSI-72`)
- A **Polaris view URL** (`https://oolio.atlassian.net/jira/polaris/projects/OHSI/ideas/view/…/idea/OHSI-72` — extract the trailing key)
- Pasted raw idea text, with no Jira link

Always normalise to the issue key before fetching.

---

## Workflow

### 1. Resolve cloudId and fetch the idea

1. Call `getAccessibleAtlassianResources`. Cache `cloudId` for the rest of the session. If multiple resources are returned, prefer the one whose `url` matches the URL the user pasted.
2. Call `getJiraIssue` with `cloudId`, `issueIdOrKey`, `expand: "names,schema"`, and `fields: ["*all"]` so every custom field comes back. Don't request a narrow field list — you need to see everything that's set and everything that's missing.
3. Confirm `fields.issuetype.name == "Idea"` (or otherwise a JPD type). If not, flag it to the user — grooming a Story/Bug to the JPD standard is a mismatch.
4. Read comments and linked issues briefly — customer names, ticket links, churn signals, and CSM quotes often live there rather than in the description.

If the user pasted raw text with no key, skip the fetch and work directly from the text. You will need to ask the user how to apply changes (they'll either paste them into Jira manually, or give you a key after the fact).

### 2. Audit against the standard

Grade the idea on three axes before drafting anything:

- **Narrative** — summary, description (Problem, Hypothesis, Success Metrics)
- **Strategic context** — Pillar, Theme, Investment Type, Category, Our Objective, plus Horizon and Commitment (proposed only — Steering owns the values)
- **Signal & audience** — Source, Customer Signal, Primary Persona, Secondary Personas, Applicable Segments
- **Delivery framing** — Size, Migration Relevance, Escalate
- **Innovation** — Innovation rating (1–5): novelty vs competitors/market, or use of emerging tech

For each item, mark `strong` / `weak` / `missing` / `wrong`. The audit is what drives every later decision — record it.

**Stage-gating:** the full required-field standard applies from **Exploring** onward. An idea still in **Captured** is not failed for missing strategy fields — at intake it only needs a title to standard, a description sketch, and Source. Grooming to the full standard is part of the Exploring entry process (rule recorded on EVITA-80, 13 Jul 2026).

### 3. Ask before fabricating

Never invent business impact, customer evidence, or success metrics. If those are missing, **pause and ask the user** in a single tight question set. Bundle questions — don't drip-feed.

Good questions when information is missing:

- "What workflow actually breaks here — and any support tickets, CSM feedback, or churn signals to point to?"
- "What's the commercial lens — revenue, cost, growth, or experience? Rough impact if useful."
- "What does success look like in numbers? What would you measure, and what movement would you call a win?"
- "Who's the primary persona — Venue Owner, Venue Manager, FOH, Kitchen, Multi-site Operator, etc.?"
- "Is this tied to a migration (Bepoz, Idealpos, SwiftPOS, Deliverit, OrderMate)?"
- "Which segments does this genuinely serve — café, QSR, casual dining, pub, bar, hotel, fine dining, franchise, enterprise, multi-location, takeaway, pizza, bakery, gaming venue?"
- "How innovative is this on a 1–5 scale — parity with competitors (1) through to market-leading or AI-led novelty (5)?"

Skip any question whose answer is already obvious from the existing content.

### 4. Polish the summary

See **Summary Rules** below. Offer **2–3 options** (e.g. capability-led, outcome-led, customer-led) so the user picks the framing.

### 5. Restructure the description

See **Description Structure** below. Exactly three required headers, in this order. Strip anything that belongs in delivery (acceptance criteria, API contracts, UX flows).

### 6. Propose custom-field values

See **Custom Fields** below. For every required field, propose a value with a one-line rationale. For optional fields, only propose a value if the idea genuinely calls for it. Flag fields you cannot infer and ask.

### 7. Present for review

Output in this exact shape — it's how the user compares your proposal to what's in Jira:

```
### Audit
- Narrative: <strong / weak / missing> — <one-line reason>
- Strategic context: …
- Signal & audience: …
- Delivery framing: …

### Current Summary
<existing summary>

### Proposed Summaries
1. <option 1>
2. <option 2>
3. <option 3>   (optional)

### Current Description (summary)
<1–3 sentence summary of what's there now>

### Proposed Description

Problem / Opportunity
…

Hypothesis / Solution
…

Success Metrics
- …
- …
- …

### Proposed Custom Fields
- Pillar (required, multi): <values> — <why>
- Theme (required, single): <value> — <why: this year's frame the idea belongs to>
- Investment Type (required, single): <value> — <why>
- Source (required, multi): <values> — <why>
- Customer Signal (required, single): <value> — <why>
- Primary Persona (required, single): <value> — <why>
- Secondary Personas (optional, multi): <values or — none —>
- Applicable Segments (multi): <values — every materially-relevant segment, not fringe>
- Innovation (rating 1–5): <n> — <why: uniqueness vs market / emerging tech>
- Size (required, single): <Sand / Pebble / Rock / Boulder> — <why>
- Category (required, single): <value> — <why: primary product grouping>
- Our Objective (required, multi): <values> — <why>
- Horizon (propose only — Steering owns placement; Now / Next / Later): <value> — <why>
- Commitment (propose only, for Now items — Will Do / Aim to do / Stretch): <value or — n/a —> — <why>
- Migration Relevance (optional, multi): <legacy products (Bepoz/SwiftPOS/IdealPOS/DeliverIT/OrderMate) or — none —>
- Escalate (tag): <Yes/No>

### Gaps the user filled in
- …

### Apply?
Reply "apply" to write all of this back, or call out anything to change first.
```

### 8. Apply (only on explicit approval)

When the user says "apply" (or equivalent), call `editJiraIssue` with the cached `cloudId`, the issue key, and a `fields` object containing everything that's changing. Send all changes in **one** call — don't dribble. Then confirm with a one-line summary of what was set and link to the issue.

If the user picks one summary option, write only that one back. If the user says "draft only", stop after step 7.

---

## Summary Rules

The canonical rule set for JPD summaries is the **JPD Title Standard**, enforced by the sibling skill `jpd-title-standard` (a JPD idea's summary is its title). Its full rules and the objective validator (`../jpd-title-standard/scripts/check_titles.py`) are the source of truth; the essentials repeated here must never drift from it.

**Format (non-negotiable):** `[Action / Capability] + [Outcome / Value]`

**Constraints:**

- **Max 65 characters, target 40–55** (the Title Standard's budget; Tree cards truncate near 58–62 on desktop and ~40 on mobile). Count, don't estimate.
- Sentence case: capitalise the first word and proper nouns/product names only (POS, QR, Online Store). No emoji, no bracket or pipe prefixes, no trailing punctuation.
- Lead with the capability or change, not the user. "As a venue manager I want…" is a delivery story, not a JPD summary.
- **Banned generic verbs**: Improve, Enhance, Fix, Support, Better. They signal weak thinking and hide what's changing. Replace with the actual capability — "Real-time stock sync", "Auto-routing orders", "Configurable margin bands".
- **Outcome is mandatory.** A summary without an outcome is a noun, not a decision input — and Steering can't prioritise it.

**Strong examples:**

- `Configurable margin bands to improve menu profitability`
- `QR ordering for faster table turnover`
- `Multi-site stock transfers for inventory visibility`
- `Offline-first POS to eliminate outage revenue loss`
- `Xero integration to eliminate manual end-of-day accounting`

**Weak examples (and why):**

- `Improve reporting` — generic verb, no capability, no outcome
- `Loyalty feature` — capability fragment, no outcome
- `As a manager I want better analytics` — user story, not a summary
- `Receipt improvements` — generic verb, no outcome
- `Stock sync` — capability without outcome, not prioritisable

The five-second test: if a director scrolled past this on the JPD board, would they know whether this matters to them?

---

## Description Structure

**Exactly three required headers, in this order:**

1. **Problem / Opportunity** — what is broken, inefficient, missing, or strategically important. Evidence-flavoured. No solution language. This section also carries *why it matters commercially* (revenue, cost, growth, experience) — embed the commercial framing here. The previous standard had a separate "Why It Matters" section; the new standard folds it into Problem / Opportunity.
2. **Hypothesis / Solution** — what we believe may solve it, at the capability level. No UI detail, no API design, no engineering breakdown.
3. **Success Metrics** — measurable outcomes that prove value. Bullets. Behaviour change or business movement, not vanity numbers.

**Optional headers** — only when genuinely needed: `Risks / Constraints`, `Dependencies`. Don't add by default — noise dilutes signal.

**Never use these headers:**

- Overview, Background, Details — noise
- Solution (standalone) — pushes the team into solution bias; use Hypothesis / Solution instead
- User Story — belongs in delivery Stories, not discovery
- Acceptance Criteria — belongs in delivery Stories
- Technical Notes — belongs in the ARD, not JPD

### What each section should look like

**Problem / Opportunity**

```
Multi-venue operators lack a unified real-time stock view. Stock drift
between venues causes overselling at peak, manual reconciliation at
shift end, and inconsistent menu availability across locations — a
top-three driver of escalations for multi-venue groups. It directly
costs revenue (orders taken for items that can't be fulfilled) and
staff time, and erodes guest experience when items disappear
mid-service.
```

**Hypothesis / Solution**

```
A centralised stock service that syncs in near real time across all
venues and channels, surfaced in BackOffice and POS, will give
operators a single source of truth and remove manual reconciliation.
```

**Success Metrics**

```
- Reduce stock-related order failures by 60%
- Decrease manual stock reconciliation time by 40%
- Increase multi-venue operator NPS by +10
```

---

## Custom Fields

Every required field must be set. Field IDs and exact option labels live in `references/field_standards.md` — load that file before drafting field values so you use the canonical strings (some real labels differ from the Confluence wording, e.g. `Product optimisation` lowercase-o, `FOH Staff` not "Front-of-House Staff").

Quick reference (required unless marked optional):

| Field | ID | Type | What to ask |
|---|---|---|---|
| Pillar | `customfield_11552` | multi-select | Which durable company priority does this serve? At least one. (Renamed from Strategic Pillar; do not touch the separate Initiative pillar field.) |
| Theme | `customfield_10088` | single-select | Which of this year's themes does the idea belong to? One only. |
| Investment Type | `customfield_11553` | single-select | Where is the product effort being invested: customer problem, new capability, product optimisation, strategic investment? |
| Source | `customfield_11554` | multi-select | Where did the signal come from? |
| Customer Signal | `customfield_11560` | single-select | How strong is the signal? Strongest wins. |
| Primary Persona | `customfield_11555` | single-select | Who benefits **most**? |
| Secondary Personas *(optional)* | `customfield_11556` | multi-select | Anyone else genuinely impacted. |
| Applicable Segments | `customfield_11558` | multi-select | Every segment the idea is materially relevant to — not just one, not fringe cases. |
| Size | `customfield_11557` | single-select | Directional effort: Sand / Pebble / Rock / Boulder. Not engineering estimation. |
| Category | `customfield_11711` | single-select | The one primary product grouping. (Replaced the retired Product Area.) |
| Our Objective | `customfield_11559` | multi-select | Business outcome(s) this supports. |
| Horizon *(propose only)* | `customfield_11744` | single-select | Roadmap timeframe — when we pull it in (Now / Next / Later). Steering owns placement; the groomer proposes with a rationale. Not a status: Shipped / Not planned / under-consideration live in status, not here. |
| Commitment *(propose only, Now items)* | `customfield_11931` | single-select | How firm the intent is for a `Now` idea (Will Do / Aim to do / Stretch). Steering-owned; propose only alongside a Now proposal. |
| Innovation | `customfield_10505` | rating 1–5 | How novel vs competitors/market, or does it use emerging tech (e.g. AI)? |
| Migration Relevance *(optional)* | `customfield_11562` | multi-select | Legacy-product picker (Bepoz/SwiftPOS/IdealPOS/DeliverIT/OrderMate) — NOT Yes/No. |
| Escalate *(tag)* | `customfield_10432` | number (1/0) | Set only for genuine executive/commercial urgency. Do not overuse. |

> **Retired:** Product Area (`customfield_11561`) is retired (2026-07-25). Never read, propose, or write it. Category (`customfield_11711`) replaced it.

### Innovation rating (1–5)

`customfield_10505` is a Polaris rating, written as a plain number. Rate every idea:

- **1** — Parity / catch-up. Competitors already do this; table stakes.
- **2** — Incremental improvement on an existing capability; common in market.
- **3** — Solid differentiator. Not unique, but well-executed and not ubiquitous.
- **4** — Strongly differentiated. Few competitors offer it, or a novel application.
- **5** — Market-leading / novel. No direct competitor equivalent, or applies emerging tech (e.g. AI) in a new way.

Judge on uniqueness vs competitors/market and/or use of emerging technology. Be honest,
not generous — most compliance, parity, and fast-follow ideas land at 1–2. Reserve 4–5
for ideas demonstrably ahead of the market or breaking new technical ground. When the
rating isn't obvious from the idea, ask the user rather than guessing high.

**Setting custom fields via `editJiraIssue`:**

- Single-select fields: `{"value": "<canonical label>"}`
- Multi-select fields: `[{"value": "<label>"}, {"value": "<label>"}]`
- Rating fields (Innovation): a bare number 1–5, e.g. `{"customfield_10505": 4}`
- Escalate (Polaris boolean stored as Jira type number): write `1`/`0`, never `true`/`false` (fall back to the JPD UI toggle if a `1`/`0` write is rejected)

Always send the canonical labels from `references/field_standards.md`. If you set a label that doesn't exist in the field's option list, the write fails — and the failure message is unhelpful. If you're unsure, fetch a known populated idea (`OHSI-39`, `OHSI-45`, `OHSI-57`, `OHSI-72`, `OHSI-74`) to confirm the exact label string before writing back.

**Don't overwrite existing good values.** If a required field is already set sensibly, leave it. Only propose a change when the existing value is clearly wrong or missing.

---

## Formatting Rules (critical in Jira / Polaris)

JPD renders description prose simply. Keep it scannable:

- Short paragraphs, 1–3 lines each
- Bullets **only** for Success Metrics (almost always — anywhere else is suspect)
- Bold sparingly, only to emphasise a specific phrase, never whole sections
- No nested bullet chaos
- No walls of text
- No technical jargon unless it's load-bearing for the decision

Remember: **JPD is a decision system, not a documentation repository.** Research, PRDs, and POBs live in Confluence. Engineering scope lives in delivery Jira.

---

## What NOT to put in a JPD idea

These belong elsewhere and dilute the idea if they leak in:

- Acceptance criteria → delivery Jira Stories
- Technical architecture, library names, API contracts → ARD / Swagger
- Full UX flows → Figma
- Research notes, PRD content → Confluence

If the existing description contains any of these, strip them out and tell the user where the stripped content should live.

---

## The Litmus Test

Before presenting the polished output, check:

- Could a non-technical stakeholder understand this in under 60 seconds?
- Is the commercial case obvious — not implied, obvious?
- Are the metrics measuring behaviour change or business movement, not vanity numbers (page views, feature shipped, users who clicked)?
- Is every required custom field set or proposed with a rationale?
- Are Applicable Segments complete (all materially-relevant segments) and is Innovation rated 1–5 with a reason?
- Does the summary pass the five-second board-scan test?

If any answer is no, rewrite before showing the user.

---

## Reference files

Load these as needed:

- `references/field_standards.md` — canonical field IDs, option labels (as they actually appear in Jira, including small differences from the Confluence wording), and the rules from the JPD Field Standards page in one place. **Load this before proposing custom-field values.**
- `references/examples.md` — strong/weak summary and description pairs across Oolio's typical idea shapes (POS, BackOffice, multi-venue, offline/resilience, pricing, reporting, integrations).
- `references/atlassian_mcp.md` — the specific Atlassian MCP tool calls used here, with argument shapes, write-back patterns for custom fields, and how to handle URLs vs keys.
