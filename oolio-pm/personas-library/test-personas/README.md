# Test persona cards

A test persona card tells a tester (human or AI) **who to be** while using a live build: what this person is trying to do today, how they read a screen, what they expect from the system they came from, what they are holding and where, and what they would never do. `persona-uat` runs synthetic sessions from these cards; `uat-session-kit` uses them to pre-fill the observer's predictions before real people sit down.

Cards are a filter, not a verdict. **Synthetic results clear obvious friction; they are never UAT sign-off.** Only real people, run through `uat-session-kit`, validate a release.

---

## What a card is, and is not

| | UAT panel persona (`../uat-panel/`) | Test persona card (this folder) | Quality Bench lens (`../quality-bench/`) |
|---|---|---|---|
| **Job** | Reviewer. Would our real users accept this decision | Behavioural instrument. How does this person use this screen | Testing lens. How a good tester thinks |
| **Answers** | "Who are we building for, and what do they need" | "What does this person do next, and where do they stall" | "What kind of fault should I look for, and how" |
| **Holds** | Bio, goals, KPIs, frustrations, buying power | Goal today, mental model, prior system, reading behaviour, device, time pressure, break points, rules | Heuristics, techniques, failure models |
| **Used by** | `operator-council-review`, convened councils | `persona-uat`, `uat-session-kit`, `accessibility-audit` (keyboard pass), `exploratory-qa` charters | Every QA specialist |

A card always sits **on top of** one or more UAT panel personas and links to them. It does not repeat their bio or KPIs; it adds only the behaviour a tester needs to stay in character. If a card needs a fact the linked persona does not hold, the fact is a test assumption and is marked as one.

Cards are not user research. A card describes a pattern of behaviour to test against. Where a field was recorded in a session, the card cites the session; everywhere else it is a deliberate choice made for testing.

---

## The cards

| Card | Grounded in | Status | One line |
|---|---|---|---|
| [Mia, cafe owner](mia-cafe-owner.md) | [Independent owner-operator](../uat-panel/owners-and-executives/independent-owner-operator.md) | Observed, PR-1095 | Reads every label literally. Rings support rather than guess |
| [Dave, pub manager](dave-pub-manager.md) | [Bar manager, independent](../uat-panel/front-of-house/bar-manager-independent.md), [GM, independent](../uat-panel/general-managers/gm-independent.md) | Observed, PR-1095 | Ten years on Bepoz. Thinks in keyboards, panels and button text |
| [Priya, group ops lead](priya-group-ops-lead.md) | [GM, enterprise](../uat-panel/general-managers/gm-enterprise.md), [Enterprise chain COO](../uat-panel/owners-and-executives/enterprise-chain-coo.md) | Observed, PR-1095 | Owns the menu for 12 venues. Asks about blast radius first |
| [Jordan, online operator](jordan-online-operator.md) | [Small-group owner](../uat-panel/owners-and-executives/small-group-owner.md) (proposed grounding) | Observed, PR-1095 session 2 | Online first. Wants to know what the customer will pay |
| [New casual, first shift](new-casual-first-shift.md) | [Crew member, QSR](../uat-panel/front-of-house/crew-member-qsr.md), [Bartender, frontline](../uat-panel/front-of-house/bartender-frontline.md) | Test assumptions | Thirty seconds on the screen, no training, a queue waiting |
| [Head chef at the pass](head-chef-at-the-pass.md) | [Head chef, independent](../uat-panel/back-of-house/head-chef-independent.md), [Line cook](../uat-panel/back-of-house/line-cook.md) | Test assumptions | Glances, does not read. Wet hands, noise, eleven tickets up |
| [Bookkeeper at month-end](bookkeeper-month-end.md) | [Finance manager and bookkeeper](../uat-panel/back-of-house/finance-manager-bookkeeper.md) | Test assumptions | Every number must tie out to another number |
| [Keyboard-only power user](keyboard-only-power-user.md) | [IT and systems manager, enterprise](../uat-panel/owners-and-executives/it-systems-manager-enterprise.md) | Test assumptions | Never touches the mouse. Drives the assisted accessibility pass |
| [Fat finger at 8pm](fat-finger-at-8pm.md) | [Bartender, frontline](../uat-panel/front-of-house/bartender-frontline.md), [Crew member, QSR](../uat-panel/front-of-house/crew-member-qsr.md) | Test assumptions, adversarial | Double taps, back button, two tabs, walks away mid-save |
| [Edge tester](edge-tester.md) | [Bartender, frontline](../uat-panel/front-of-house/bartender-frontline.md), [Crew member, QSR](../uat-panel/front-of-house/crew-member-qsr.md) | Test assumptions, adversarial | Pushes permissions, voids, refunds and discounts on purpose |

New cards use [`_test-persona-template.md`](_test-persona-template.md).

---

## The card fields

| Field | What it holds |
|---|---|
| **Links to** | The UAT panel persona file or files the card is grounded in, as relative links |
| **Goal today** | The one job this person sat down to do. Sets the task script's frame |
| **Mental model** | What they think the system's words and objects mean, in their own vocabulary |
| **Came from** | The system they used before, and the habits it left them with |
| **Fluency** | Tech confidence and reading behaviour: do they read, scan, guess, or ring support |
| **Device and place** | The surface from the [device matrix](../../references/qa/device-matrix.md) and where they are standing or sitting |
| **Time pressure** | How long they will give a task before abandoning it, and what interrupts them |
| **Access needs** | Situational or permanent constraints on input and perception |
| **Breaks when** | The specific moments that stop them, ranked |
| **Stay-in-character rules** | What the tester may not do, because this person would not |
| **Typical findings** | The classes of finding this card tends to surface, so a cast can be checked for coverage |
| **Magic wand** | The one thing they would change, only where a session recorded it |
| **Provenance** | Each field marked observed (with citation) or test assumption |
| **Change log** | Dated edits, including every learning-loop amendment |

---

## The cast matrix

Pick three to five cards per run. The rule from `persona-uat`:

1. **Always one novice reader**: Mia (literal reader) or the new casual.
2. **One migrating user** wherever the area replaces an incumbent system.
3. **One blast-radius thinker** on anything multi-venue: Priya.
4. **An adversarial card at Full tier**: the fat finger or the edge tester (both, if the flow touches money or permissions).

Say who was left out and why, in the report.

| Feature or surface | Cast first | Add when relevant | Why |
|---|---|---|---|
| **Back-office menu and catalogue work** (products, menus, layouts, price lists) | Mia, Dave, Priya | Jordan if Online or Kiosk layouts are in scope; keyboard-only on any drag-heavy builder | The PR-1095 cast. Mia tests the words, Dave tests incumbent habits, Priya tests scope and live state |
| **Multi-venue configuration and publish** (scope, locations, price list per store, schedules) | Priya | Mia (single site sees the same screen), Jordan (channel prices), edge tester at Full | Blast radius is the failure. Priya failed publish for want of it |
| **Migration from Bepoz** | Dave | Priya if the migrating customer is a group | Dave is the only observed migrating card |
| **Migration from Idealpos, SwiftPOS, OrderMate or Deliverit** | Dave, as the nearest migrating card, with the gap stated | Mia as the novice reader | **Gap.** No card holds these systems' habits. Do not invent them inline; propose a card (see Growing the set). Until then, report that incumbent-specific habits were not tested |
| **POS order entry** (POS terminal, mPOS) | New casual | Fat finger at Full; edge tester where voids, discounts or refunds are in the flow; Mia on mPOS (observed in session 2) | The highest-volume users, trained least |
| **KDS** | Head chef at the pass | Fat finger at Full (double bump, bump the wrong ticket) | Glanceability and modifiers, at distance, under noise |
| **Finance, Insights, Pay, gift cards** | Bookkeeper | Mia (reads reports as an owner), Priya (group roll-up), edge tester for refunds and voids | Numbers that disagree with each other are the failure |
| **Online store and kiosk** | Jordan | Priya (observed on Kiosk in session 2), new casual (helping a guest at the kiosk) | Customer-facing price and live state. **Gap:** there is no guest or diner card, because the UAT panel has no diner persona yet |
| **Accessibility, assisted keyboard pass** | Keyboard-only power user | Any card, re-run keyboard only, where the flow is frontline | Drives `accessibility-audit`'s assisted pass. Never a substitute for the human screen reader run |
| **Adversarial, at Full tier** | Fat finger at 8pm | Edge tester on anything with money, permissions or destructive actions | Concurrency, interruption and abuse paths the friendly cards never take |

Any card whose surface is not in the release is "Not attempted" for that run, with why.

---

**Native surfaces.** POS, mPOS, KDS, CDS and kiosk apps, devices and simulators are not yet on the environment register's allow-list (`../../references/qa/environment-register.md`). A card cast on one of those surfaces is run on the web equivalent where one exists (the kiosk preview, the online store) or recorded as Not attempted and listed under Not covered, never quietly run on a laptop viewport instead.

## Provenance: observed or test assumption

Every field on every card is marked one of two ways.

- **Observed.** Recorded in a session. The card cites the session and, where one exists, the finding ID. Use the finding schema's source keys: `S` for a synthetic session, `U` plus a letter for a real-user session.
- **Test assumption.** Chosen for testing, grounded in the linked UAT panel persona (the card names which details it drew on), to be validated by real UAT through `uat-session-kit`.

**Read "observed" carefully for the first four cards.** The PR-1095 session was a heuristic walkthrough run in character by an AI, not research with real people; its own report says every "Mia would..." is a hypothesis to watch for, not evidence. So Mia, Dave, Priya and Jordan carry fields observed in an `S` session. They are the most specific cards in the set, not the most proven. A field moves to observed with a `U` citation only when a real person behaves that way in a real session.

The six newer cards carry no observed fields. Every behaviour on them is a test assumption until real UAT says otherwise.

---

## Synthetic results are a filter

`persona-uat` states this in the first section of every report, and it holds for anything produced from these cards:

- A synthetic Pass means the AI got through in character. It does not mean a real user will.
- Synthetic users over-complete tasks and under-report confusion. Treat a synthetic Pass with hesitation as a probable real stall.
- Findings resting on synthetic drag, timing or concurrency are *Needs human repro*.
- No release is UAT-passed on cards alone.

---

## The learning loop edits the cards

When real users behave differently from a card, the card changes. This runs through `qa-mission`'s learn mode (`../../references/qa/learning-loop.md`), after `uat-session-kit` has scored the synthetic run against the real one.

1. **Find the miss.** A real finding the card did not predict, a card prediction real users never hit, or a behaviour the card contradicts.
2. **Draft the amendment.** A diff to the card's behaviour fields, with the evidence: the session key, the participant by role and venue type (never a name), the transcript moment.
3. **Change the provenance.** A test assumption confirmed by a real session becomes observed, citing the `U` source. A field contradicted by real behaviour is rewritten and cited. An `S`-observed field confirmed by a real session gains the `U` citation alongside.
4. **Approve.** Niel approves or rejects each amendment. Rejections are recorded with the reason, so the same change is not re-proposed without new evidence.
5. **Log it.** Every approved amendment goes in the card's change log and the plugin CHANGELOG.

A card that predicts badly across two releases is rewritten from the real sessions or retired to `_archive/` with a note. It is never deleted.

---

## Growing the set

- A missing card is a proposal for the library, not something a tester invents mid-run. `persona-uat` must never make up a persona inline.
- A new card links to an existing UAT panel persona. If none fits, the UAT panel persona comes first (`../_framework/persona-template.md`), then the card.
- Known gaps today: migrating users from Idealpos, SwiftPOS, OrderMate and Deliverit; a guest or diner card for online and kiosk; a group finance or head-office card at enterprise scale.
- One file per card. Edit, do not duplicate. House rules from `../personas.md` and `../../references/house-style.md` apply: British English, no em dashes, no buzzwords, no invented Oolio features, numbers or customers.

---

## Owner

Niel Cody (Product) owns the cards. Anyone can propose a card or an amendment; Product approves.
