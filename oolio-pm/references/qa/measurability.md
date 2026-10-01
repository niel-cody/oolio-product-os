# Measurability: designed to be optimised

A feature that ships without the data to judge it cannot be optimised; it can only be argued about. The family treats measurement as part of quality: a PRD success metric with nothing behind it is a defect **before** launch, so `metrics-review` never has to report "Unmeasurable" six weeks after it.

## The chain every success metric must survive

```
PRD success metric  →  the behaviour it counts  →  the event(s) and properties  →  the query  →  the baseline
```

For each metric in the PRD (headline, guardrails, operational), `test-basis` fills one row:

| Field | Question |
|---|---|
| Metric | Lifted verbatim from the PRD |
| Behaviour | What user action or business outcome it counts, in plain words |
| Event(s) | The analytics events and properties it needs (PostHog first), or the table and column if it lives elsewhere |
| Exists? | Already tracked / added in this release (cite the story or diff) / missing |
| Query | How the number will be computed: the insight, the SQL, or the named dashboard |
| Baseline | The current value and window, if the metric already exists; "none, new behaviour" if not |
| Segments | The cuts the PRD's hypothesis needs (segment, brand, venue size, order type), and whether the properties carry them |
| Dependency | Any hold-out, flag cohort, attribution join or external data the PRD named |
| Verdict | Measurable / Measurable once <story> ships / Not measurable (Instrumentation gap) |

## The checks

**At basis time (`test-basis`).** Every metric gets a row. A metric with no event, no query or no baseline where one is needed becomes an **Instrumentation gap** finding, typed and rated like any other: P1 if it is the headline metric, P2 for a guardrail, P3 for an operational metric. A metric that measures activity rather than an outcome ("number of price lists created") is flagged for the PO with the outcome it could become; that is a Decision needed, not a bug.

**At test time (`functional-qa`, the instrumentation pass).** For each event the chain depends on: perform the behaviour on the test build, then confirm the event arrived with the right name and properties (PostHog's live events or a query scoped to the test account), and that test traffic is distinguishable from real traffic (a test-venue property, an internal-user flag, or the environment). An event that does not fire, fires twice, or fires without the properties the segments need is a Bug against the metric's oracle.

**At verdict time (`qa-mission`).** The verdict carries a **metric readiness note**: each metric, its verdict, and the date `metrics-review` should first run (from the PRD's own timeframe, or six weeks after launch by default). Ship requires every metric to be Measurable or an accepted gap with an owner.

## Feature flags as the experiment

Where the release is behind a flag, the flag cohort is the natural comparison group. `test-basis` checks whether the flag state is captured as a property on the events, because without it the before-and-after cannot be cut by cohort and the release's effect cannot be separated from everything else that happened that month.

## What this is not

Not a data model review and not a dashboard build (the data skills do those). The family checks only that the numbers the PRD promised to watch will exist and be trustworthy on the day someone asks.
