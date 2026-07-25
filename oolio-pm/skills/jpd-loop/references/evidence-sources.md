# jpd-loop — evidence sources & connectors (reference)

Read this when gathering evidence to validate an idea (loop step 3). The job: find evidence **for and against** the idea, from internal and external sources, and turn the strongest items into cited Insights (see `insights-and-citations.md`).

## Required connectors (and what each is for)
The loop should have these connected; if one is missing, note the gap and continue with what's available.

| Connector | Use it to find |
|-----------|----------------|
| **Atlassian** (Jira + Confluence) | Related ideas across the whole JPD backlog; existing PRDs, specs, research notes; decision records; the VPC concept and personas. |
| **Web search + web browsing** | Competitor features and pricing, market trends, analyst/industry sources, public reviews, standards/regulation. Use `WebSearch` to find, then `web_fetch` (or the Chrome browser tools for JS-heavy pages) to read. |
| **HubSpot** | CRM evidence — deal blockers, churn/retention signals, customer requests tied to the idea, pipeline impact. |
| **Slack** | Internal discussion — has this been raised, decided, or rejected before? Customer/sales/support threads about the problem. |
| **Microsoft 365 / Teams** | Teams chat, Outlook threads, and SharePoint documents — strategy decks, research, board/QBR material, customer correspondence. |
| **Figma** | Existing designs, flows, or prototypes the idea touches or duplicates. |

## Internal wikis (our own knowledge)
- **The Brain** (the `my_brain` vault) — query via the `oolio-pm:wiki-query` skill ("what does the Brain say about …") for our own product/competitor/market knowledge before going external.
- **Confluence** spaces — PM (concept, strategy), DISC (discovery), product-area spaces.

## Brand & competitor wikis (scour these for evidence)

**Our brands (own help/knowledge bases):**
- Oolio — https://help.oolio.com/
- Bepoz — https://help.bepoz.com/
- SwiftPOS — https://help.swiftpos.com.au/
- OrderMate — https://help.ordermate.com.au/
- DeliverIT — https://help.deliverit.com.au/
- IdealPOS — _(add help URL if one exists; in the migration list but no help site supplied)_

**Competitors (external help centres / docs):**
- Toast — https://doc.toasttab.com/ · https://support.toasttab.com/
- Square for Restaurants — https://squareup.com/help/au/en · https://squareup.com/help/us/en
- Lightspeed Restaurant — K-Series https://k-series-support.lightspeedhq.com/hc/en-us · O-Series https://o-series-support.lightspeedhq.com/hc/en-us · L-Series https://resto-support.lightspeedhq.com/hc/en-us
- TouchBistro — https://help.touchbistro.com/s/
- Revel Systems — https://support.revelsystems.com/s/
- Epos Now — https://support.eposnow.com/
- Redcat (AU) — https://www.redcatht.com/en-au/about-us/support · manual: https://downloads.redcat.com.au/FTP/Support/EnterpriseHTMLHelp/main.htm
- H&L (AU) — https://hlpos.com/ _(knowledge base is behind the Client Portal login — public site only without creds)_
- Clover — https://www.clover.com/help/
- SpotOn — https://help.spoton.com/
- Idealpos (AU) — https://help.idealpos.co/
- Abacus (AU) — https://abacus.co/ _(no public KB found; phone helpdesk)_
- Lightspeed Kounta (AU) — https://support.kounta.com/hc/en-us
- me&u (order & pay) — https://help.meandu.com/hc/en-us
- Mr Yum (order & pay) — https://help.mryum.com/

## Specialist & adjacent tools (by product area)
Indirect competitors / specialists in areas we serve — scour for feature depth, gaps, and ideas, not just direct rivals.

**Online ordering · QR · order-and-pay** (see also me&u, Mr Yum above)
- Bopple — https://help.bopple.com
- MOBI (Mobi2Go) — https://mobi2go.zendesk.com/hc/en-us
- Flipdish — https://help.flipdish.com/en/
- Olo — https://olosupport.zendesk.com/hc/en-us

**Inventory & supply**
- Apicbase — https://support.apicbase.com/
- MarketMan — https://www.marketman.com/ _(KB in-app)_

**Kitchen display (KDS) / kitchen ops**
- QSR Automations — ConnectSmart (Crunchtime) — https://qsrautomations.com/connectsmart-kitchen/
- Fresh KDS — freshkds.com _(KB limited / partner-hosted)_

**Loyalty & guest engagement**
- Punchh (PAR Engagement) — https://support.punchh.com/s/
- LOKE — https://support.loke.global/hc/en-us
- Olo Loyalty (formerly Spendgo) — https://olosupport.zendesk.com/hc/en-us

**Reservations & table management**
- SevenRooms — https://www.sevenrooms.com/help _(login-gated)_
- Now Book It (AU) — https://www.nowbookit.com/support/
- ResDiary — https://resdiary.com/ _(KB behind login)_

**Payments (AU)**
- Tyro — https://www.tyro.com/support/ · https://www.tyro.com/knowledge-hub/
- Zeller — https://www.myzeller.com/ _(24/7 support; KB in-app)_

**Delivery aggregators & integration**
- Doshii (integration hub, AU) — https://doshii.com/en-au/
- Uber Eats Merchant — https://help.uber.com/en/merchants-and-restaurants
- DoorDash Merchant — https://help.doordash.com/merchants/s/

**Enterprise ops, workforce & analytics**
- Fourth — https://www.fourth.com/support/customer-support
- Tenzo (analytics) — https://tenzo.zendesk.com/hc/en-gb/

> Notes: prefer AU region pages where they exist (Square `/help/au/en`). Several KBs are login-gated (H&L, SevenRooms, ResDiary) or in-app (MarketMan, Zeller) — use public site/feature/pricing pages in those cases. Not found with a public KB: Craftable, Como, Menulog partner, Nory — revisit. Add more as we go.

## Social signal (optional, deeper)
Neither this loop nor the connectors above cover social media, review sites, or scaled web scraping. For a decision where that signal matters (a contested Park/Kill, thin internal evidence), run `signal-radar` on the idea first and fold its Insight list into step 3 — it covers HubSpot theme aggregation and social/Apify sources this file doesn't, and syncs findings to the Brain so future loops start ahead.

## How to search well
- Start internal (the Brain, Confluence, Slack, HubSpot) — cheaper and more specific — then go external (web) for market/competitor context.
- Look for **disconfirming** evidence too, not just support. The council's value is the clash.
- Capture the **source URL** for every claim — uncited claims don't become Insights.
- Prefer primary sources (a competitor's own page, a real customer thread, an analytics figure) over second-hand summaries.
