# Strong and weak JPD examples

Worked pairs across Oolio's typical idea shapes. All examples are illustrative writing exemplars, not claims about the real backlog. Use them to calibrate tone, altitude, and structure before drafting.

## Summaries: strong vs weak, by idea shape

### POS / service

- Weak: `Improve tab management`
- Strong: `Split and merge tabs mid-service to reduce payment queues at close`

Why: "Improve" is a banned verb and hides the capability. The strong version names the capability (split/merge mid-service) and the outcome (shorter payment queues).

### BackOffice / venue management

- Weak: `Permissions update`
- Strong: `Role-based permission templates to cut new-venue setup time`

Why: a noun fragment is not prioritisable. The strong version tells Steering what changes and what it buys.

### Multi-venue

- Weak: `Better multi-site reporting`
- Strong: `Cross-venue menu sync to end per-site price drift`

Why: "Better" says nothing. The strong version passes the five-second board-scan test: a multi-site operator knows instantly whether this matters to them.

### Offline / resilience

- Weak: `Fix offline mode`
- Strong: `Offline-first payments to keep taking cards through outages`

Why: "Fix" reads as a bug, not a capability decision. The strong version states the capability and the commercial outcome (revenue continuity).

### Pricing

- Weak: `Surcharging enhancements`
- Strong: `Scheduled surcharge rules for public-holiday compliance`

Why: "enhancements" is filler. The strong version is concrete enough to size and to route (Menu & Pricing).

### Reporting / analytics

- Weak: `More dashboards`
- Strong: `Daily margin summary emailed to owners for faster pricing decisions`

Why: the strong version names the artefact, the audience, and the decision it speeds up.

### Integrations

- Weak: `Xero improvements`
- Strong: `Xero integration to eliminate manual end-of-day accounting`

Why: name the system and the workflow that disappears.

## Descriptions: one full strong example

### Problem / Opportunity

Multi-venue operators lack a unified real-time stock view. Stock drift between venues causes overselling at peak, manual reconciliation at shift end, and inconsistent menu availability across locations. It directly costs revenue (orders taken for items that cannot be fulfilled) and staff time, and erodes guest experience when items disappear mid-service.

### Hypothesis / Solution

A centralised stock service that syncs in near real time across all venues and channels, surfaced in BackOffice and POS, will give operators a single source of truth and remove manual reconciliation.

### Success Metrics

- Reduce stock-related order failures by 60%
- Decrease manual stock reconciliation time by 40%
- Increase multi-venue operator NPS by +10

## Descriptions: the common failure modes

**Solution smuggled into the problem.** "The problem is we don't have a Kafka-backed stock service" is a solution wearing a problem's clothes. State the operator's broken workflow, not the missing architecture.

**Delivery content leaking in.** Acceptance criteria, API contracts, and UX flows belong in delivery Stories, Swagger, and Figma. Strip them and tell the user where they should live.

**Vanity metrics.** "Feature shipped", "users who clicked", and page views prove activity, not value. Metrics must measure behaviour change or business movement.

**Wall of context.** If the Problem section runs past three short paragraphs, it is a Confluence page trying to live in JPD. Summarise and link out.

## Field-setting examples

A multi-venue stock idea, well set:

- Pillar: `Multi-Venue Management`, `Operational Efficiency`
- Theme: `Inventory & Enterprise Readiness`
- Investment Type: `Customer Problem`
- Source: `Customer`, `Support`
- Customer Signal: `Repeated support trend`
- Primary Persona: `Multi-site Operator`
- Secondary Personas: `Kitchen Staff`, `Venue Manager`
- Applicable Segments: `Multi-location`, `Franchise`, `Enterprise`, `QSR`
- Category: `Products`
- Our Objective: `Operational efficiency`, `Retention`
- Size: `Rock`
- Innovation: 2 (common in market, catch-up with execution upside)

The same idea, badly set (and why):

- Pillar: all seven (dilutes the signal; pick the two that are true)
- Customer Signal: `Churn risk` when the evidence is three support tickets (overstating the signal corrupts prioritisation)
- Applicable Segments: only `QSR` (understates reach; the problem is multi-location, not vertical-specific)
- Innovation: 4 (generous; several competitors already offer central stock)
