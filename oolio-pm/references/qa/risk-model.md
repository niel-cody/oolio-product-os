# The risk model: Frequency × Consequence

Risk-based testing spends effort where likelihood times impact is highest. Oolio's house version is **Frequency × Consequence**, the same law used to place destructive actions in a design. `test-basis` rates every flow in the release; `qa-mission` reads the ratings to choose the tier.

## Rating a flow

**Frequency**, how often a real user hits this path:

| Rating | Meaning |
|---|---|
| High | Every shift, or every time the feature is used (price edit, publish, order entry, login) |
| Medium | Weekly or on a routine cycle (schedule set-up, menu restructure, month-end report) |
| Low | Rarely (initial set-up, a once-a-year setting, an edge configuration) |

**Consequence**, what happens if it is wrong:

| Rating | Meaning |
|---|---|
| High | Data lost or corrupted; the wrong thing goes live; money, price, tax or surcharge wrong; a permission breach; anything that reaches a till or a guest |
| Medium | A user cannot finish a task without help; trust eroded; a support call likely |
| Low | Cosmetic, or a slower path with an obvious workaround |

Rate from evidence, and cite it: the PRD's personas and frequency of use, support ticket volume in the area, incident history, the code's blast radius (from `code-qa` or the diff). When there is no evidence, rate Consequence by the worst plausible outcome and say the rating is assumed.

## The grid

| | Consequence Low | Consequence Medium | Consequence High |
|---|---|---|---|
| **Frequency High** | Standard | Standard | **Full** |
| **Frequency Medium** | Smoke | Standard | **Full** |
| **Frequency Low** | Smoke | Smoke | Standard |

The release tier is the highest tier any changed flow earns. One high-consequence flow in an otherwise trivial release makes the release Full **for that flow**; `qa-mission` may scope Full depth to that flow and run each other flow at its own rating, and says so.

## Blast radius raises consequence

A change to shared code is rated by everything that consumes it, not by the screen it was made for. A pricing helper used by the POS gateway carries the POS's consequence even if the ticket was a back-office label. `code-qa` (or `test-basis` reading the diff) lists the consumers; any consumer on a high-consequence path lifts the flow to High consequence.

## Recording it

The risk map in the Test Basis is a table: flow, frequency (with evidence), consequence (with evidence), rating, tier, and the specialists that tier calls. The same table is reprinted in the verdict so the reader can see why depth was spent where it was.
