# The environment register

Where the QA family may drive a build, what it may write there, and what it must never touch. Every browser skill checks a URL against this file before the first click. **If a URL is not covered here, the answer is stop and ask, not "probably fine".**

**Status: partly known.** The URL patterns and orgs below are the ones recorded in the Brain (sources: `10 Projects/Oolio/Menu Management Experience/05_reviews/2026-09-29 Menu Builder Usability Session (PR-1095).md`, `20 Areas/Oolio/Inventory/Project Docs/STK-4 Purchase Orders & Credit Notes/06 UAT, PR-399 Purchase Orders (2026-09-30).md`, the 24 Sep 2026 CEO update on Products App UX in `20 Areas/Oolio/Products App/`; read 2 Oct 2026). There is **no documented set of test accounts per role and no agreed allow-list** yet; both are owed by QA (the Products App QA lead owns deploy coordination and is the natural owner). Until they exist, every run that needs a login pauses for a person to sign in.

## The allow-list

| Pattern | What it is | May the family write? | Notes |
|---|---|---|---|
| `products-pr-<n>.oolio.dev` | Products App PR preview | **Yes**, run-prefixed data only | PR environments go down for maintenance; a burst of 401s may be the environment, not the app. Mark findings that may be PR-only **(PR?)** |
| `inventory-pr-<n>.oolio.dev` | Inventory PR preview | **Yes**, run-prefixed data only | Embedded in Back Office PR builds |
| `insights-pr-<n>.oolio.dev` | Insights PR preview | Yes, run-prefixed data only | Pattern seen once; confirm with QA on first use |
| Other `*.oolio.dev` hosts (`office.oolio.dev`, `office-au.oolio.dev`, `inventory.oolio.dev`, `ordering.oolio.dev`, `menuboard.oolio.dev`) | Shared development environments | **Read and test in named test orgs only**; ask before creating data | Shared with every team. Test activity here has raised a false P1 incident before (a dev test account on `ordering.oolio.dev`; source: Brain, `10 Projects/Oolio/FY26 Product Annual Review/04_council_reviews/red-team-1.md`). Creating data or touching an alerting path (orders, payments, incidents) here needs approval from the person running the session, who agrees it with QA |
| `storybook.oolio.dev` | Component Storybook | Read only | The component reference's source |
| `*.oolio.io` (`products`, `office`, `insights`, `inventory`, `kiosk-v2`, `ordering`, `menuboard`) | **Production** | **No.** Never write. | See below |

## Autonomy by environment

**Autonomous writes (run-prefixed test data) are allowed on PR previews only.** On shared hosts every write needs the approval of the person running the session. **POS, mPOS, KDS, CDS and kiosk apps, devices and simulators are not on the allow-list yet**: runs on them are Not attempted and listed under Not covered until an entry is added here.

## Production

Production is customers' live trade. The family never creates, edits, publishes or deletes anything in production, and never acts inside a customer's org.

Post-release verification in production happens, and it is a person's call: a named person may authorise a specific, read-only check (for example, confirming a fixed defect no longer reproduces on an internal org) for one run. The authorisation, who gave it and the scope are recorded on the QA Review page. A finding seen in production follows the routing for Prod (incident process first if trading is affected).

## Known orgs

| Org | Where | Use | Write? |
|---|---|---|---|
| **Thanh Coffee** (a PR-environment org, apparently named for an engineer; QA to confirm it is a test org and not a customer before the family writes in it) | Products App PR previews (PR-1095) | Menus and layouts testing; venues Sydney (store Sydney Coffee) and Melbourne; several price lists including Melbourne and Online | Yes, run-prefixed only; existing products are not renamed or changed |
| **Ponanna - Test Inventory** | Inventory | Inventory UAT (purchase orders, credit notes) | Yes, run-prefixed only |
| The demo org | Back Office | Live app audits and onboarding QA; carries real-looking tax codes and unassigned products | Ask first: it is shared and used for demonstrations |

Org IDs are recorded in the source pages in the Brain and are looked up there when needed, not copied into this plugin.

## Rules for test data

Learnt from the Menus 2.0 and Inventory UAT runs:

1. **Name it so it is findable**: prefix every object with the run ID (`QA-R1-Dinner menu`, PO reference `QA-R1-01`).
2. **Use fake contact data** on any send path: `.example` domains only.
3. **Do not change existing products or shared data.** Create your own.
4. **Do not publish a channel that would replace something real.** Kiosk publish was skipped in the PR-1095 session because it would have replaced the online menu.
5. **Clean up in dependency order** (unpublish before deleting the menu), or list what was left behind.
6. **Every QA Review page run entry ends with "Test data left behind"**: what, where, and why it stayed.
7. **Say what was not tested by design**, for example "permissions ran as one admin user".

## Accounts and sign-in

- No credentials are stored in this plugin, the Brain, or any skill output. Ever.
- If a run needs a login, the skill pauses and a person signs in in the browser.
- Feature flags are per org (PostHog). A run records the flag state it tested under; turning a flag on for a test org is a write and needs approval.

## Owed

To make this register complete, QA needs to supply: the allow-list confirmed, one test account per role per environment (named, not with passwords here), the named test orgs per product, the Products App 2.1 flag name, and the hosts that must never receive test traffic. Each is a gap the family reports in its verdict until it lands.
