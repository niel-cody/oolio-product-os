# The hospitality conditions library

Charter seeds for `exploratory-qa`, scenarios for `resilience-qa`, and conditions for `persona-uat`. A back office that works on a quiet Tuesday afternoon and fails at 7pm on a Friday is not finished: if a system fails under real operational pressure, it is not acceptable. Each condition carries what to try and, where the Brain records one, the evidence that it matters.

Status markers: **[evidence]** the Brain records this condition causing or nearly causing a problem; **[model]** it follows from how Oolio's domain is defined; **[proposed]** a sensible seed not yet evidenced at Oolio.

## Time

| Condition | Try | Why |
|---|---|---|
| **The trading day crosses midnight** [evidence] | Schedules, prices, reports and shift close for a venue trading 18:00 to 03:00. "All day" that stops at 23:59 | The price list schedule test found "All day" was 07:00 to 23:59, a live pricing gap for venues trading past midnight |
| **Trading day boundary per store timezone** [model] | A multi-state group: the same action at the same moment in Sydney and Perth. Shift auto-close at the org's boundary in each store's timezone | Trading day is evaluated in each store's timezone; a boundary must never vary below the level things are summed |
| **Overlapping schedules** [evidence] | Add a schedule that overlaps an existing one by day, by time, by order type; with and without a weekly pattern | Creating a Sat/Sun schedule hard-deleted every overlapping schedule (P0) |
| **Mid-service change** [evidence] | Publish or save a change at peak: does it hit every till at once, mid-order? | Stash-and-publish was reinstated to stop "hundreds of changes hitting tills mid-service" |
| **Friday 6pm restore** [evidence] | Restore a deleted product: does it go straight back on a live menu? | "Restoring straight to live is how a deleted product reappears on a menu at 6pm on a Friday" |
| **Daylight saving changeover** [proposed] | Schedules and shifts across the changeover weekend | Common source of off-by-an-hour faults in time-based rules |
| **Public holiday** [proposed] | Holiday pricing and surcharges, trading hours, reports on the day | Calendar concepts include public holidays; surcharge behaviour is unverified |
| **Session expiry mid-task** [evidence] | Leave a half-built menu until the session expires; return | Session expiry must keep pending changes and route through sign-in |

## Trade

| Condition | Try | Why |
|---|---|---|
| **An item runs out mid-service (86'd)** [evidence] | Mark an item 86'd at 7pm Friday: POS, Kiosk, Online, KDS all reflect it; it clears when it should | A standing scenario in the availability taxonomy; auto-clear at end of trading day is not built |
| **Unticking "menu item" is org-wide** [evidence] | Change sellability for one venue: does it block the item everywhere? | Today unticking Menu item is an org-wide sell block across POS and Kiosk |
| **Wrong price goes live** [evidence] | Republish on autopilot with a non-default price list: which prices reach which store? | The PR-1095 session found a path that sends one city's prices to another city's online store |
| **Price of zero, tax free, no locations** [model] | Create a product with defaults only | Principle: a product never arrives selling at $0.00, tax free, in zero locations |

## Place and people

| Condition | Try | Why |
|---|---|---|
| **Two managers, one menu** [proposed] | Edit the same menu in two tabs or two accounts; save both | Which edit wins, and is the loser told? |
| **Multi-venue blast radius** [evidence] | Any change in a 12-venue group: is it clear which venues, devices and channels it hits, and is there a way back? | The ops-lead persona failed publish for want of exactly this |
| **A venue with nothing set up** [evidence] | No stores, no price lists, no locations, no kiosks | Step 3 of schedules rendered blank with no stores; "No kiosks at this store" is the right answer |
| **A migrating user's habits** [evidence] | The Bepoz pub manager's moves: button text separate from product name, drag a button onto another page, bulk moves | Two of his seven tasks failed on habits the build broke |
| **Permissions at the edges** [proposed] | Every task as each role, and the tasks a role must not do | Runs so far used one admin user; permissions are untested by design |
| **Shared terminals and staff turnover** [proposed] | A new casual on a shared device with no training | Frontline users change constantly |
| **Glare, wet hands, gloves, noise, interruptions** [proposed] | Front-of-house flows with no long-press, large targets, one hand, interruptions mid-task | The POS design catalogue names these as design conditions; not yet tested at Oolio |

## Network and devices

| Condition | Try | Why |
|---|---|---|
| **POS offline** [model] | Build, send to kitchen, cash pay, LAN card pay, print with the internet down; then the blocked list (cloud card, refunds, shift close, vouchers, gift cards, menu sync) | The POS is offline-first; the blocked actions must say so clearly, not fail silently |
| **Offline versus no network** [model] | Internet down with LAN up, then LAN down | The POS distinguishes "Offline Mode" from "Network Unavailable", and the copy must match the state |
| **KDS loses the network** [model] | Bump a docket with the network down | Dockets stay visible but every action is a network call and fails |
| **Network drops mid-save or mid-publish** [proposed] | Kill the connection at the moment of save; restore it | Half-saved state is the worst state |
| **PR environment maintenance** [evidence] | A burst of 401s | Was the environment, not the app, on 29 Sep; check before reporting |

## Scale

| Condition | Try | Why |
|---|---|---|
| **A big catalogue** [proposed] | 5,000 products in the grid, search, filters, bulk edit | Principle 12 asks for legibility at 300 items; far larger libraries exist |
| **Many price lists × variants** [proposed] | 10 price lists × 10 variants on one product | The combinatorial case for pricing screens |
| **A 40-venue group** [proposed] | Publish and scope screens at group scale | Enterprise groups are a target segment |

## Adding to it

Every escape the learning loop traces to a missing condition lands here, marked [evidence], with the escape it came from.
