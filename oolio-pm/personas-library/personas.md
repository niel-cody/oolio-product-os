# Personas

The Oolio persona library. The source of truth for who we build for, who we sell to, who we advise, and the expert lenses we test our work against.

These are not marketing avatars. They are working references used in product decisions, executive decks, GTM material, roadmap discussions, and customer research. Treat them as real people the business has committed to understand.

The library is the persona side of the **Oolio Virtual Product Council**, our system for stress-testing a decision from every angle that matters before it is committed. It holds four subcommittees, one elevated Chair, and supporting reference sets. The **Operator Council** (the UAT panel of user personas) answers "would our real users accept this". The **Design Council** of expert lenses answers "is the design sound by expert principles". The **Leadership Subcommittee** of executive and commercial lenses answers "should we invest in this, and can we sell, support and deliver it". The **STORM Subcommittee** of research lenses answers "have we researched this widely and grounded it in real sources before we argue". The **Product Council Chair** sits above all of them, on every subcommittee, and chairs the master council when they convene. The **Behavioural Alchemist** (summoned as Roy) is elevated in the same way, a cross-cutting lens convened into any panel when a decision touches perceived value, pricing, loyalty, positioning, or the felt experience of a merchant, a member of staff, or a diner. A serious decision should be researched by STORM and then survive the other three: the reality of the hospitality personas, the scrutiny of the expert lenses, and the discipline of the commercial table. A review is a loop, not a single pass. It runs until it meets the success criteria defined up front, verified and checked, before a named human validates it. How that works is in `CLAUDE.md`, under "Done is defined, verified, and checked".

New to the folder, or running an admin pass over it? Read `CLAUDE.md` first. It is the operating guide for how this library is built and how it grows.

---

## When to use this folder

Use it any time work touches a human end of the business. That covers:

- Product specs, PRDs, JPD ideas, Jira epics (every one names the primary and secondary persona)
- GTM packs, one-pagers, supporting decks (pull persona quotes and pain points directly)
- Executive and board material (reference the persona by name, not "the user")
- Sales and AM enablement (battle cards anchor on persona pain)
- Onboarding and training material (segment the training to the persona)
- Research and discovery (interview recruitment maps back to a persona definition)
- Consultancy engagements (persona-by-persona walkthrough is the diagnostic)

If a piece of work names "users", "customers", or "operators" without naming a specific persona, the work is not finished.

---

## What is a persona, here

A persona is a single, named, realistic individual who represents a meaningful slice of the people Oolio's technology and services touch. Each persona has:

- A real-feeling name, age, location, and venue
- A role and segment (independent, small group, enterprise)
- A day in the life under actual operational pressure
- Goals, frustrations, KPIs, decision power
- A tech profile and current stack
- What they need from Oolio and what would lose them
- The Oolio brand or product that fits them today

If a persona could be swapped for "any user", it is not finished. Specificity is the point.

---

## Folder structure

```
personas/
├── CLAUDE.md                   how to use this folder. read this first.
├── personas.md                 this file. the index and the rules.
├── product-council-chair.md    the elevated Chair. sits on every subcommittee.
├── behavioural-alchemist.md    the elevated cross-cutting lens (Roy). convened on any subcommittee.
├── segments.md                 cross-cutting map: personas by segment and vertical
├── _framework/
│   ├── oolio-context.md        what Oolio is and what Oolio wants to be
│   ├── segmentation.md         the axes we segment on
│   └── persona-template.md     the canonical template for every user persona
├── uat-panel/                  SUBCOMMITTEE 1, the Operator Council: hospitality user personas
│   ├── README.md
│   ├── owners-and-executives/
│   ├── general-managers/
│   ├── front-of-house/
│   └── back-of-house/
├── design-council/             SUBCOMMITTEE 2, the Design Council: expert design lenses
│   ├── README.md               the council rules and the assignment matrix
│   ├── _design-council-template.md
│   └── (fourteen expert lens files)
├── quality-bench/             the Quality Bench: testing lenses for the QA family (how a tester thinks)
│   ├── README.md               the bench, the assignment by QA skill, the decision rule
│   ├── _quality-bench-template.md
│   └── (eleven testing lens files)
├── test-personas/             test persona cards: who a tester pretends to be, on top of the UAT panel
│   ├── README.md               the cards, the cast matrix, provenance rules
│   ├── _test-persona-template.md
│   └── (ten cards)
├── leadership-subcommittee/    SUBCOMMITTEE 3, the Leadership Subcommittee: executive and commercial lenses
│   ├── README.md               purpose, membership, how to run a review
│   ├── _leadership-subcommittee-template.md
│   └── (seventeen executive and commercial lens files)
│                               SUBCOMMITTEE 4, the STORM Subcommittee, is now run by the
│                               `storm-research` skill. Its original Co-STORM role files are
│                               archived in `../_archive/storm-subcommittee/`.
└── _archive/                   retired personas, kept for reference
    └── organisations/          retired. business-level view now in segments.md
```

Four subcommittees, one elevated Chair, one elevated cross-cutting lens, and a cross-cutting map:

1. **Operator Council (UAT panel).** The hospitality user personas: individual human users of Oolio's products and services, grouped by role (owners and executives, general managers, front of house, back of house). This is our user-acceptance lens, and where almost all current user personas live. See `uat-panel/README.md`.
2. **Design Council.** Expert lenses, inspired by the published work of real design and research practitioners, used to attack every new feature before it ships. These are not people we build for, they are design philosophies we validate against, chosen to disagree with each other. See `design-council/README.md`.
3. **Leadership Subcommittee.** Executive and commercial lenses (CPO, CEO, CFO, CRO, and the functional leads) that judge whether a direction is worth investing in, and whether it can be sold, supported, and delivered. These are role lenses, not named individuals. See `leadership-subcommittee/README.md`.
4. **STORM Subcommittee.** The council's research arm, modelled on the Stanford OVAL STORM and Co-STORM method. Where the other three test a decision, STORM researches it first: it discovers perspectives, grounds claims in real sources, and surfaces the unknown unknowns, then hands the Chair a cited briefing so the testing panels argue from evidence. This is now run by the **`storm-research` skill**; the original five Co-STORM role files are archived in `../_archive/storm-subcommittee/`.
5. **Product Council Chair.** The elevated role that sits on every subcommittee, adjudicates the master council, and turns the argument into a decision record. Not filed inside any subcommittee. See `product-council-chair.md`.
6. **The Behavioural Alchemist (Roy).** The elevated cross-cutting lens. Also not filed inside any subcommittee, because his remit (perceived value, pricing, loyalty, positioning, felt experience) lands on all three testing panels. Convened as a conditional seat when a decision touches his ground, and summonable on his own through the `behavioural-alchemist` skill. See `behavioural-alchemist.md`.
7. **The Quality Bench and the test persona cards.** Not a council: they serve the QA family, which tests the *built* product rather than a decision. The Quality Bench (`quality-bench/`) holds testing lenses, inspired by published testing and accessibility practitioners, and judges whether the build is right (the Design Council still judges whether the design is good). The test persona cards (`test-personas/`) sit on top of UAT panel personas and add the behaviour a tester needs to use a screen in character: reading habits, prior system, device, time pressure, and what they will not do. Lenses are how a tester thinks; cards are who the tester pretends to be. See each folder's README.
8. **Segments and verticals.** The cross-cutting map. Personas live once by role in the UAT panel, and `segments.md` pulls them through by size-segment (independent, small group, mid-market, enterprise) and by vertical (cafe, fine dining, pub, QSR, and so on). It also shows the coverage gaps and maps to the JPD business-segment field. See `segments.md`.

The `organisations/` folder was retired on 2026-06-24 and moved to `_archive/`. The business-level view of the customer is now the owner and executive personas plus `segments.md`, not a separate organisation-persona type.

The Domain Expert Council (product, BA, data, implementation, architecture, support detail) is named in the council framework and may become a further subcommittee. The system is also expected to grow into verticals and business types, covered by adding tagged UAT personas rather than new persona types. See `CLAUDE.md`.

---

## How to invoke

The standing vocabulary for calling the panels. Use these terms and the right group is always loaded.

| When you say | What is convened |
|---|---|
| **"UAT panel"**, "the Operator Council", "the users", "the operators" | All hospitality user personas (`uat-panel/`, every role group) |
| **"Design Council"**, "the Council", "the experts", "the lenses" | All fourteen expert lenses (`design-council/`) |
| **"Leadership Subcommittee"**, "the leadership panel", "the commercial table", "the exec lenses" | The default nine leadership lenses plus the Chair (`leadership-subcommittee/`), and any conditional lenses the decision touches |
| **"STORM"**, "the STORM Subcommittee", "research this", "ground this", "what are we missing" | The `storm-research` skill, run as the research loop before the testing panels |
| **"the Chair"**, "the Product Council Chair", "the adjudicator" | The elevated Chair (`product-council-chair.md`), always present in any review |
| **"Roy"**, "the Behavioural Alchemist", "the behavioural lens", "the contrarian" | The elevated cross-cutting lens (`behavioural-alchemist.md`), convened when a decision touches perceived value, pricing, loyalty, positioning, or felt experience |
| **"the master council"**, "the town hall", "full council" | All four subcommittees together, chaired by the Product Council Chair |
| **"both"**, "personas", "everyone", "the full library", "full review" | All four subcommittees together, plus the Chair |
| "back of house" / "BOH" | `uat-panel/back-of-house/` |
| "front of house" / "FOH" | `uat-panel/front-of-house/` |
| "GMs" / "general managers" | `uat-panel/general-managers/` |
| "owners" / "executives" | `uat-panel/owners-and-executives/` |
| **"Quality Bench"**, "the testing lenses" | All testing lenses (`quality-bench/`), loaded by the QA skills |
| **"test personas"**, "the test cards", "Mia, Dave and Priya" | The test persona cards (`test-personas/`), used by `persona-uat` and `uat-session-kit` |
| a persona, expert, or seat by name ("Mel", "Norman", "the CFO") | just that one file |
| a segment ("Enterprise", "Independent", "small group", "mid-market") | the personas tagged to that tier in `segments.md` |
| a vertical ("QSR", "fine dining", "pubs", "cafe", "stadia") | the personas tagged to that vertical in `segments.md` |
| a feature plus "run UAT" / "review this" | the UAT panel personas it touches, plus the three mandatory and two contextual lenses from the Design Council matrix |

Default rule: a bare **"personas"** means everyone, all four subcommittees plus the Chair. If only one subcommittee is wanted, name it ("UAT panel", "Design Council", "Leadership Subcommittee", or "STORM").

---

## The UAT panel: user personas

The hospitality user personas, grouped by role. This is the user-acceptance lens. Invoke the whole panel as "the UAT panel", or a single group by its role name ("back of house", "FOH", "GMs", "owners and executives").

### Owners and executives

| Persona | Segment | File |
|---|---|---|
| Independent owner-operator | Independent, single venue | [uat-panel/owners-and-executives/independent-owner-operator.md](uat-panel/owners-and-executives/independent-owner-operator.md) |
| Small-group owner | Small group, 3 to 8 venues | [uat-panel/owners-and-executives/small-group-owner.md](uat-panel/owners-and-executives/small-group-owner.md) |
| Franchisee owner, QSR | Mid-market, 9-restaurant franchise (McDonald's benchmark) | [uat-panel/owners-and-executives/franchisee-owner-qsr.md](uat-panel/owners-and-executives/franchisee-owner-qsr.md) |
| Franchisee owner, pizza | Small group, 3-store franchise (Domino's benchmark) | [uat-panel/owners-and-executives/franchisee-owner-pizza.md](uat-panel/owners-and-executives/franchisee-owner-pizza.md) |
| Enterprise chain COO | Enterprise, 100+ venues | [uat-panel/owners-and-executives/enterprise-chain-coo.md](uat-panel/owners-and-executives/enterprise-chain-coo.md) |
| IT and systems manager, enterprise | Enterprise, head-office deal gate | [uat-panel/owners-and-executives/it-systems-manager-enterprise.md](uat-panel/owners-and-executives/it-systems-manager-enterprise.md) |
| Catering director, stadium | Enterprise, contract-catered stadium precinct (invented benchmark) | [uat-panel/owners-and-executives/catering-director-stadium.md](uat-panel/owners-and-executives/catering-director-stadium.md) |

### General managers

| Persona | Segment | File |
|---|---|---|
| GM, independent venue | Independent | [uat-panel/general-managers/gm-independent.md](uat-panel/general-managers/gm-independent.md) |
| Restaurant manager, QSR | Mid-market franchise restaurant (McDonald's benchmark) | [uat-panel/general-managers/restaurant-manager-qsr.md](uat-panel/general-managers/restaurant-manager-qsr.md) |
| Store manager, pizza | Small-group franchise store (Domino's benchmark) | [uat-panel/general-managers/store-manager-pizza.md](uat-panel/general-managers/store-manager-pizza.md) |
| GM, enterprise venue | Enterprise chain branch | [uat-panel/general-managers/gm-enterprise.md](uat-panel/general-managers/gm-enterprise.md) |
| Venue operations manager, stadium | Enterprise, contract-catered stadium (invented benchmark) | [uat-panel/general-managers/venue-operations-manager-stadium.md](uat-panel/general-managers/venue-operations-manager-stadium.md) |
| GM, casual dining (US) | Independent, high volume, United States | [uat-panel/general-managers/gm-casual-dining-us.md](uat-panel/general-managers/gm-casual-dining-us.md) |

### Front of house

| Persona | Segment | File |
|---|---|---|
| FOH manager, independent | Independent | [uat-panel/front-of-house/foh-manager-independent.md](uat-panel/front-of-house/foh-manager-independent.md) |
| FOH manager, enterprise | Enterprise chain branch | [uat-panel/front-of-house/foh-manager-enterprise.md](uat-panel/front-of-house/foh-manager-enterprise.md) |
| Bar manager, independent | Independent | [uat-panel/front-of-house/bar-manager-independent.md](uat-panel/front-of-house/bar-manager-independent.md) |
| Bar manager, enterprise | Enterprise chain branch | [uat-panel/front-of-house/bar-manager-enterprise.md](uat-panel/front-of-house/bar-manager-enterprise.md) |
| Bartender, frontline | Mixed | [uat-panel/front-of-house/bartender-frontline.md](uat-panel/front-of-house/bartender-frontline.md) |
| Crew member, QSR | Mid-market franchise, frontline (McDonald's benchmark) | [uat-panel/front-of-house/crew-member-qsr.md](uat-panel/front-of-house/crew-member-qsr.md) |
| Delivery driver, pizza | Small-group franchise, last mile (Domino's benchmark) | [uat-panel/front-of-house/delivery-driver-pizza.md](uat-panel/front-of-house/delivery-driver-pizza.md) |
| Bar supervisor, stadium | Enterprise, event-day frontline (invented benchmark) | [uat-panel/front-of-house/bar-supervisor-stadium.md](uat-panel/front-of-house/bar-supervisor-stadium.md) |

### Back of house

| Persona | Segment | File |
|---|---|---|
| Head chef, independent | Independent | [uat-panel/back-of-house/head-chef-independent.md](uat-panel/back-of-house/head-chef-independent.md) |
| Head chef, enterprise | Enterprise chain branch | [uat-panel/back-of-house/head-chef-enterprise.md](uat-panel/back-of-house/head-chef-enterprise.md) |
| Kitchen line cook | Mixed | [uat-panel/back-of-house/line-cook.md](uat-panel/back-of-house/line-cook.md) |
| Team member, in-store pizza | Small-group franchise, makeline (Domino's benchmark) | [uat-panel/back-of-house/team-member-pizza.md](uat-panel/back-of-house/team-member-pizza.md) |
| Stock controller, multi-site | Small group and enterprise | [uat-panel/back-of-house/stock-controller-multisite.md](uat-panel/back-of-house/stock-controller-multisite.md) |
| Kitchen operations director, mid-market | Mid-market group, 14 casual-dining venues | [uat-panel/back-of-house/kitchen-operations-director-midmarket.md](uat-panel/back-of-house/kitchen-operations-director-midmarket.md) |
| Finance manager and bookkeeper | Small group, 6 venues | [uat-panel/back-of-house/finance-manager-bookkeeper.md](uat-panel/back-of-house/finance-manager-bookkeeper.md) |

Frontline service staff (servers, runners) sit close enough to the bartender and FOH manager personas that they are covered there. If a discrete server persona is needed for a specific piece of work, add it.

---

## The Design Council

The expert lenses we test features against. Fourteen design and research philosophies, chosen to disagree, convened to review every feature alongside the hospitality personas. The hospitality personas hold the floor of operational reality. The Council raises the ceiling on design quality. A feature has to satisfy both.

Do not run every feature past every lens. Assign three mandatory and two contextual lenses per feature, using the assignment matrix in `design-council/README.md`.

| Lens | Persona | File |
|---|---|---|
| Simplicity and craft | Jony Ive | [design-council/jony-ive.md](design-council/jony-ive.md) |
| Human cognition and affordance | Don Norman | [design-council/don-norman.md](design-council/don-norman.md) |
| Usability heuristics | Jakob Nielsen | [design-council/jakob-nielsen.md](design-council/jakob-nielsen.md) |
| Goal-directed workflow | Alan Cooper | [design-council/alan-cooper.md](design-council/alan-cooper.md) |
| Research to requirements | Kim Goodwin | [design-council/kim-goodwin.md](design-council/kim-goodwin.md) |
| Design at scale | Irene Au | [design-council/irene-au.md](design-council/irene-au.md) |
| Behavioural data | Julie Zhuo | [design-council/julie-zhuo.md](design-council/julie-zhuo.md) |
| Inclusion and exclusion | Kat Holmes | [design-council/kat-holmes.md](design-council/kat-holmes.md) |
| Mobile, forms and speed | Luke Wroblewski | [design-council/luke-wroblewski.md](design-council/luke-wroblewski.md) |
| Responsive and device fluidity | Ethan Marcotte | [design-council/ethan-marcotte.md](design-council/ethan-marcotte.md) |
| Research sceptic | Erika Hall | [design-council/erika-hall.md](design-council/erika-hall.md) |
| Delight and trust | Aarron Walter | [design-council/aarron-walter.md](design-council/aarron-walter.md) |
| Data and evidence display | Edward Tufte | [design-council/edward-tufte.md](design-council/edward-tufte.md) |
| Human-centred AI and control | Ben Shneiderman | [design-council/ben-shneiderman.md](design-council/ben-shneiderman.md) |

The panel rules, the feature-to-lens assignment matrix, the contradiction philosophy, and the decision rule (operational correctness beats aesthetic purity, learnability beats novelty, measurable user impact beats internal preference) all live in `design-council/README.md`.

---

## The Leadership Subcommittee

The executive and commercial lenses we test a decision against before it moves into PRD approval, steering, or delivery. They judge whether a direction is worth investing in, what risk we are taking, and whether it can be sold, supported, and delivered. Like the Design Council, these are lenses, not user personas, and they are written as functions, not named individuals.

Convene the default nine plus the Chair for most reviews, and add conditional lenses only when the decision touches their ground. The full membership rules, the default and conditional split, and how to run a review live in `leadership-subcommittee/README.md`. The Chair is not a member of this subcommittee. The Chair is elevated and sits across all of them (`product-council-chair.md`).

| Lens | Membership | File |
|---|---|---|
| Chief Product Officer | Default | [leadership-subcommittee/chief-product-officer.md](leadership-subcommittee/chief-product-officer.md) |
| Chief Executive Officer | Default | [leadership-subcommittee/chief-executive-officer.md](leadership-subcommittee/chief-executive-officer.md) |
| Chief Financial Officer | Default | [leadership-subcommittee/chief-financial-officer.md](leadership-subcommittee/chief-financial-officer.md) |
| Chief Revenue Officer | Default | [leadership-subcommittee/chief-revenue-officer.md](leadership-subcommittee/chief-revenue-officer.md) |
| Customer Success Manager | Default | [leadership-subcommittee/customer-success-manager.md](leadership-subcommittee/customer-success-manager.md) |
| Support Manager | Default | [leadership-subcommittee/support-manager.md](leadership-subcommittee/support-manager.md) |
| CTO or Head of Engineering | Default | [leadership-subcommittee/cto-head-of-engineering.md](leadership-subcommittee/cto-head-of-engineering.md) |
| Head of Design | Default | [leadership-subcommittee/head-of-design.md](leadership-subcommittee/head-of-design.md) |
| Migration Lead | Default | [leadership-subcommittee/migration-lead.md](leadership-subcommittee/migration-lead.md) |
| Head of Sales | Conditional | [leadership-subcommittee/head-of-sales.md](leadership-subcommittee/head-of-sales.md) |
| Implementation Lead | Conditional | [leadership-subcommittee/implementation-lead.md](leadership-subcommittee/implementation-lead.md) |
| Marketing or GTM Lead | Conditional | [leadership-subcommittee/marketing-gtm-lead.md](leadership-subcommittee/marketing-gtm-lead.md) |
| Partnerships and Integrations Lead | Conditional | [leadership-subcommittee/partnerships-integrations-lead.md](leadership-subcommittee/partnerships-integrations-lead.md) |
| Data and Analytics Lead | Conditional | [leadership-subcommittee/data-analytics-lead.md](leadership-subcommittee/data-analytics-lead.md) |
| Legal, Risk and Compliance Lead | Conditional | [leadership-subcommittee/legal-risk-compliance-lead.md](leadership-subcommittee/legal-risk-compliance-lead.md) |
| Security Lead | Conditional | [leadership-subcommittee/security-lead.md](leadership-subcommittee/security-lead.md) |
| Payments Risk Lead | Conditional | [leadership-subcommittee/payments-risk-lead.md](leadership-subcommittee/payments-risk-lead.md) |

---

## The STORM Subcommittee

The research and perspective-discovery body, modelled on the Stanford OVAL STORM and Co-STORM method. Where the other three subcommittees test a decision, STORM researches it first, so the council argues from grounded evidence and from perspectives we had not thought to take. It runs at the front of the loop and hands the Chair a cited briefing. It can be re-entered whenever a clash exposes an evidence gap.

STORM is now run by the **`storm-research` skill**, which executes a five-lens, citation-verified research pipeline and returns a grounded briefing (in council mode, key decisions for the Chair to record). The original five Co-STORM role files (Perspective Discoverer, Question-Asking Researcher, Grounded Expert, Knowledge Curator, Moderator) are retired and kept for reference in [`../_archive/storm-subcommittee/`](../_archive/storm-subcommittee/README.md). To invoke STORM, call the `storm-research` skill rather than reading the role files.

---

## House rules

1. **British English only.** Spelling, punctuation, idiom. Hospitality is global, but Oolio writes in British English.
2. **No em dashes.** Use commas, parentheses, or full stops.
3. **No buzzwords. No corporate tone.** If a sentence could come out of a generic SaaS deck, rewrite it.
4. **Real names, real venues.** Made up but realistic. Anchor each persona to a believable location, role, and operating context.
5. **Designed for pressure.** Every persona description must hold up under the conditions they actually work in. Friday 9pm, kitchen on fire, two staff short. Not the demo.
6. **Always grounded in an Oolio brand.** Each persona is linked to one or more of bepoz, deliverit, idealpos, ordermate, swiftpos, the Oolio platform, or Oolio Pay. This keeps personas tied to real product reality, not invention.
7. **No fabricated Oolio claims.** Do not invent features, integrations, partnerships, or numbers. If a fact about Oolio is needed and is not in `_framework/oolio-context.md`, leave it out or flag it.
8. **Update, do not duplicate.** When a persona shifts, edit the file. Never branch into v1, v2.
9. **Retire to `_archive/`.** Personas that are no longer used are moved, not deleted, with a note on why and when.
10. **The Design Council uses real people, as lenses, never as puppets.** The user and organisation personas are invented but realistic (rules 4 and 5). The Design Council is different: each lens is inspired by a real, living practitioner. Never attribute invented quotes or statements to them. The "signature challenge questions" in each panel file represent what the lens asks in a review, not words the person said. Keep the philosophy, drop the impersonation. Roles drift, so update them when convenient, but never let a role change weaken the lens.

---

## Adding a new persona

1. Confirm the persona does not already exist or is not adequately covered by an existing one. Duplication dilutes the library.
2. Copy `_framework/persona-template.md` into the correct subfolder under `uat-panel/`.
3. Fill every section. Empty sections are not allowed.
4. Anchor to the segmentation framework (`_framework/segmentation.md`) so the persona is comparable to others.
5. Add the persona to the index table in this file.
6. Note the date added and the trigger (research, customer signal, executive ask) in a one-line entry at the bottom of the persona file under "Change log".

---

## Reviewing the library

Review cadence: quarterly, or after any major piece of customer research, M&A activity, or strategy shift.

In each review, check:

- Is every persona still active in the business and the roadmap
- Are KPIs and tools still accurate (the hospitality stack moves fast)
- Has segmentation drifted (have we crossed into a new tier we do not have a persona for)
- Are any personas underused (signal we are building for the wrong people)
- Are any quotes or stories stale

Archive what is dead. Add what is missing. Edit what is drifting.

---

## Reading order, for someone new

1. `_framework/oolio-context.md` (what Oolio is and what Oolio wants to be)
2. `_framework/segmentation.md` (how we slice the market)
3. `_framework/persona-template.md` (the schema)
4. `uat-panel/README.md` (overview of all user personas)
5. Pick the persona(s) closest to the work in front of you and read them in full

---

## Owner

Niel Cody (Product) owns the library. Anyone in the business can propose a persona, an edit, or an archive. Approval sits with Product, in conjunction with the relevant function lead (sales for sales-led personas, AM for renewal personas, etc.).
