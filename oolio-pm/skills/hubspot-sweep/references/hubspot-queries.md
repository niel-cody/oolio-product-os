# hubspot-sweep — the queries (reference)

Read before the first sweep in a session. Everything here was taken from the live Oolio portal (`5205495`) on 17 Sep 2026; where a value is an id rather than a label, it is because the API filters on the id.

## Why this file exists

The portal takes roughly **1,200 tickets a day across fifty pipelines**, and the product signal inside that is a thin seam. A sweep that pulls the window and reads it burns its budget on call-back requests, remittance advice, warehouse allocations, and terminal-offline reports. The standing queries below go straight at the seam. Run them; do not read the queue.

## The tool

`query_crm_data` takes **SQL**, which is what makes a daily window cheap:

```sql
SELECT hs_object_id, subject, content, hs_ticket_category, hs_pipeline,
       source_type, createdate, hs_ticket_priority
FROM TICKET
WHERE createdate >= '<window start>'
  AND hs_pipeline IN (<pipeline ids>)
ORDER BY createdate DESC
LIMIT 200
```

`search_crm_objects` takes free text and is the right tool for a synonym pass over a known problem noun. It ranks by relevance and ignores the window, so always re-check `createdate` on what it returns. `get_properties` with explicit `propertyNames` returns an enumeration's options, which is how the maps below were built and how to re-check them if a pipeline is added.

Record URLs, which become the Insight source links: `https://app.hubspot.com/contacts/5205495/record/0-5/<hs_object_id>` for tickets, `0-3` for deals.

## Which brand's queue matters

**Oolio One is the product.** `ONE | Support` is the main seam and the first query every sweep runs.

The legacy and sibling brand queues are swept too, and they are not a lower class of signal. Bepoz, Idealpos, SwiftPOS, OrderMate and Deliverit customers are the migration path into Oolio One, so a request landing on one of their queues is a statement about **what Oolio One has to do before that customer will move**. Read it that way: the brand of origin is context for the Insight, never a reason to drop the record. What it changes is framing and weight, per `triage-and-attach.md` — a capability three brands ask for independently is a stronger signal than the same count from one.

### Tier 1 — Oolio One
| Pipeline | Id | Why |
|---|---|---|
| ONE \| Support | `134862761` | **The main seam.** Direct product signal on the product we are building. |
| ONE \| Sales Enablement | `831963267` | What sales cannot answer or cannot sell: capability gaps, stated as objections. |
| OM & ONE \| Implementation | `750873953` | What blocks go-live. Onboarding friction is product friction. |
| OM & ONE \| Offboarding | `747762493` | **Churn.** Why a One customer is leaving. Highest-value record in the portal. |

### Tier 2 — Oolio Pay
| Pipeline | Id | Why |
|---|---|---|
| OPAY \| Support | `53799547` | Payments signal, and payments is where hospitality churn starts. |
| OPAY \| Offboarding | `53834523` | Churn off Oolio Pay. |
| OPAY \| Chargebacks | `687809285` | Disputes recur as product gaps (evidence, receipts, reconciliation). |
| OPAY \| QR Fallback | `779116563` | A named failure mode with its own queue is a product problem by definition. |

### Tier 3 — the other brands, read as Oolio One requirements
| Pipeline | Id |
|---|---|
| BP \| Bepoz Support | `135250587` |
| BP \| Customer Experience | `681648961` |
| BP \| Add Ons | `682391083` |
| IP \| Idealpos Support | `135493247` |
| IP \| Cancellations | `778302749` (churn) |
| SP \| Swiftpos Support | `135493249` |
| SP \| Customer Success | `913509239` (at-risk accounts) |
| SP \| Cancellations | `783099052` (churn) |
| OM \| OrderMate Support | `134919217` |
| DI \| Deliverit Support | `124950146` |
| DI \| COO / Offboarding | `704603477` (churn) |

### Excluded — operational, never product signal
`OG | NO REPLY` `133880171` · `OG | Allocation` `681393258` · `OG | QLD Warehouse` `732696498` · `UK | Procurement` `912987669` · `UK | Warehouse` `915001651` · `OG | Enterprise Systems & Support` `107749131` · `OG | Internal Maintenance and Security` `870468792` · `SP | Procurement` `651368056` · `BP | Upgrades` `682405761` · every `* | Accounts` pipeline (`672633965`, `658666772`, `136815800`) · the KYC and capital pipelines (`53799546`, `920773548`, `894770061`).

`BP | Upgrades` deserves its own warning. It is the single biggest false positive in the portal: its tickets are templated forms whose body contains the words "New Functionality" and "Feature Release", so a naive text search for "feature request" returns page after page of version-upgrade paperwork. Exclude the pipeline rather than trying to filter the text.

## Categories

`hs_ticket_category` is an enumeration. The values that carry product signal:

| Value | Use |
|---|---|
| `FEATURE_REQUEST` | **Highest yield.** Someone has already done the triage for you. |
| `Change Request` | Next highest. Often a configuration limit that should be a setting. |
| `Problem` | ITIL sense: a recurring fault with no fix. Frequently a real product gap. |
| `PRODUCT_ISSUE` | Mixed. Worth reading only when the body describes a missing capability rather than a broken install. |

`GENERAL_INQUIRY`, `BILLING_ISSUE`, `Incidents` and `Service Request` are swept only inside the churn and at-risk pipelines, where the category is usually left at its default but the record still matters.

`source_type` values are `PHONE`, `EMAIL`, `CHAT`, `FORM`, `Site Visit`, `Internal`. `Internal` is worth noting in the Insight (a colleague relaying a customer is one remove from the customer) but is not grounds for dropping a record.

## The standing queries

Run these in order. Stop reading a query's results when a full page yields nothing that survives triage.

**1. Declared requests, every brand.** The highest-yield query in the sweep.
```sql
SELECT hs_object_id, subject, content, hs_ticket_category, hs_pipeline, source_type, createdate
FROM TICKET
WHERE createdate >= '<window start>'
  AND hs_ticket_category IN ('FEATURE_REQUEST', 'Change Request')
ORDER BY createdate DESC LIMIT 200
```

**2. Everything on the Oolio One queues**, category-independent, because the main product's queue is small enough to read properly.
```sql
SELECT hs_object_id, subject, content, hs_ticket_category, source_type, createdate
FROM TICKET
WHERE createdate >= '<window start>'
  AND hs_pipeline IN ('134862761', '831963267', '750873953')
ORDER BY createdate DESC LIMIT 200
```

**3. Churn, offboarding and at-risk**, category-independent across every brand. Treat as priority reading whatever the count.
```sql
SELECT hs_object_id, subject, content, hs_pipeline, createdate
FROM TICKET
WHERE createdate >= '<window start>'
  AND hs_pipeline IN ('747762493', '53834523', '778302749', '783099052', '704603477', '913509239')
ORDER BY createdate DESC LIMIT 100
```

**4. Recurring faults** on the product pipelines, where a `Problem` or `PRODUCT_ISSUE` is the third of its kind this month.
```sql
SELECT hs_object_id, subject, content, hs_pipeline, createdate
FROM TICKET
WHERE createdate >= '<window start>'
  AND hs_ticket_category IN ('Problem', 'PRODUCT_ISSUE')
  AND hs_pipeline IN ('134862761', '53799547', '135250587', '135493247', '135493249', '134919217', '124950146')
ORDER BY createdate DESC LIMIT 200
```

**5. Lost deals**, weekly rather than daily — a day's closed-lost is too thin to read. `win-loss` owns the monthly pattern analysis; this query only catches a loss reason naming a capability, so it can reach the backlog the same week.
```sql
SELECT hs_object_id, dealname, closed_lost_reason, amount, closedate
FROM DEAL
WHERE closedate >= '<window start>' AND closed_lost_reason IS NOT NULL
ORDER BY closedate DESC LIMIT 100
```

**6. A synonym pass**, only when the window looks unusually thin, via `search_crm_objects` on the nouns of whatever the backlog is currently exploring. Always re-check `createdate` on the results: this tool ignores the window.

## Window and watermark

The watermark is the `createdate` of the newest record the previous sweep processed, recorded in the Brain sweep log with the run. The next sweep's window opens there and closes at run time.

- No log, or a log older than seven days: default to the last 24 hours and say so.
- Never widen past 30 days unless asked. This is a watch, not a backfill.
- Record-id dedupe is the belt; the record URL already being an Insight on the target idea is the braces. Use both, and check the cheap one first.

If the sweep log has gone missing, do not silently start again from zero: say the watermark was lost, run a 24-hour window, and note in the new log that there is a gap.
