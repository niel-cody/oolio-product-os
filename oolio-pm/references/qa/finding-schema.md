# The finding schema

The one shape every finding is written in, by every specialist, so `defect-writer` can merge them and a reader can compare them. A finding missing a required field is returned to the skill that wrote it; it is not repaired by guessing.

## Fields

| Field | Required | What goes in it |
|---|---|---|
| `id` | yes | `<run-id>-<source-key><n>`, for example `R1-F07`. The run ID is the next `R<n>` in the epic's QA Review page run log. Findings arriving from outside with their own numbers keep them in `ext`. A merged finding keeps the earliest ID and lists the rest in `sources`. Real-user sessions use `U` plus the session letter: `R2-UA03` |
| `ext` | if any | The finding's ID in its original source (a tester's list, a session register) |
| `title` | yes | The problem in the user's terms, under 80 characters. "Saving a weekend schedule deletes the weekday schedule", not "Schedule bug" |
| `type` | yes | Bug / Improvement / AC gap / Requirement gap / Decision needed / Instrumentation gap / Coverage gap / System gap |
| `severity` | yes | P0 to P3, per the [standard](severity-and-defect-standard.md); "P0 (unconfirmed)" below Reproduced ×2; `n/a` for a Requirement gap or Coverage gap |
| `oracle` | yes | The source that says it is wrong, cited per [oracles.md](oracles.md). For Decision needed: the question a person must answer |
| `flow` | yes | The flow from the risk map, so findings roll up by risk; `unrated` if no Test Basis exists, which caps the verdict's confidence |
| `ac` | if one applies | The story and acceptance criterion it fails, `<story key>#<n>`. Drives routing: a failed AC before merge reworks that story |
| `stage` | yes | Spec / Pre-merge / Dev / Staging / Prod, per [routing.md](routing.md). No staging host is registered yet: a Staging run stops and asks |
| `environment` | yes | Environment name, build or PR number, commit if known, account role, device and viewport |
| `steps` | yes for Bug | Numbered, from a stated starting state, with real values |
| `expected` | yes | What the oracle says should happen |
| `actual` | yes | What happened |
| `evidence` | yes | At least one of: screenshot path, accessibility-tree excerpt, console or network error, session note link, transcript timestamp |
| `persona` | if from UAT | Test persona card and task number |
| `confidence` | yes | Reproduced ×N / Corroborated ×N / Seen once / Needs human repro / Verified independently |
| `sources` | after consolidation | Every skill and session that found it, by source key |
| `theme` | after consolidation | The theme it was bundled into |
| `home` | after consolidation | Where it goes, per routing: `Rework <story>#<ac>`, `New AC on <story>`, a ticket draft (project, epic, type, fix version), `PO` for requirement gaps |
| `status` | after consolidation | Draft / Awaiting human repro / De-dupe pending / Approved / Rework <story key> / Created <key> / Held (lone nit) / Re-tested Pass / Rejected (with reason) |

**Findings before a build exists** (from `test-basis` at Spec stage): `environment` is the sources read, `steps` and `actual` are `n/a`, and `expected` is what the clearest source says. They are never Bugs.

## Source keys

Each finding's ID prefix says which source found it, so a merged register shows at a glance where findings come from and which sources earn their keep. The pattern extends the one used for the Menus 2.0 UAT consolidation.

| Key | Source |
|---|---|
| `B` | `test-basis` (conflicts, untestable ACs, measurability) |
| `C` | `code-qa` |
| `F` | `functional-qa` |
| `E` | `exploratory-qa` |
| `D` | `design-conformance` |
| `A` | `accessibility-audit` |
| `S` | `persona-uat` (synthetic) |
| `U` | `uat-session-kit` (real people) |
| `K` | the councils in built mode |
| `R` | `resilience-qa` |
| `V` | independent verification (a finding the verifier found that nobody else did) |
| `X` | external: a person, a support ticket, an incident |

## Example

```
id:          R1-E03
title:       Saving a Sat/Sun schedule deletes every existing schedule on the price list
type:        Bug
severity:    P0
oracle:      Purpose (scheduling adds a schedule; it does not replace others).
             AC <story>#2 "existing schedules are unaffected".
flow:        Price list scheduling (Frequency Medium, Consequence High: Full)
ac:          <story key>#2
stage:       Pre-merge (story in review, PR open) → home: Rework <story key>#2
environment: <PR preview>, back-office admin role, Chrome 1440×900
steps:       1. Open price list "Happy hour" with schedule Mon to Fri 16:00 to 18:00
             2. Add schedule Sat, Sun 16:00 to 18:00
             3. Save, reload
expected:    Two schedules: Mon to Fri and Sat/Sun
actual:      One schedule: Sat/Sun. Mon to Fri is gone, no warning shown
evidence:    screenshots/R1-E03-before.png, R1-E03-after.png; session note E-S2 14:32
confidence:  Reproduced ×3
```
