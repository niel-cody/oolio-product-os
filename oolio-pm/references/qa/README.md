# The QA reference pack

The facts and standards the QA family tests against. The skills are the method; this pack is the oracle. "Check the design" becomes "check the Select against rule 4" only because a file here says what rule 4 is.

Read this page first. It says what each file is for, which skill loads it, and who owns keeping it true.

## The rule the whole family rests on

**No oracle, no defect.** Every finding cites the source that says it is wrong: an acceptance criterion, a logged decision, a WCAG success criterion, a component reference entry, a pattern rule, a glossary entry, a PRD success metric. A finding with no oracle is an opinion, and it is logged as **Decision needed** for a person to rule on, never as a bug. The oracles are listed, with how to cite each, in [oracles.md](oracles.md).

## The loop the family runs

Spec to shipped to proven, with a person at every gate that counts:

```
PRD + epic + decisions + Figma + code
        │
        ▼
  test-basis ──── conflicts on high-consequence flows? ──► STOP, Decision-needed list to the owner
        │  claims, risk map, measurability, blast radius
        ▼
  qa-mission picks the tier (smoke / standard / full)
        │
        ├─ code-qa              Q1  is the code covered where it matters
        ├─ functional-qa        Q2  does it do what the ACs say, and do the analytics events fire
        ├─ design-conformance   Q2/Q3  did we build what was designed, in the system's components
        ├─ accessibility-audit  Q3/Q4  can everyone use it
        ├─ exploratory-qa       Q3  what breaks off the happy path
        ├─ persona-uat          Q3  would a real operator get it (synthetic, a filter)
        ├─ councils, built mode Q3  is the built thing still sound
        └─ resilience-qa        Q4  does it survive a real service
        │
        ▼
  defect-writer: one schema, de-duped, themed, routed by stage (rework the story before merge,
        │        Bug or Improvement after), all held for approval, written to the epic's QA Review page
        │
        ▼
  independent verification of every P0, P1 and high-consequence pass
        │
        ▼
  verdict: Ship / Ship with known issues / Hold     ◄── a person decides
        │
        ├─► uat-session-kit: real people, scored against the synthetic run
        ├─► gtm-handover: the verified-claims list and the known issues (nothing unverified goes to market)
        └─► metrics-review: the success metrics, now known to be measurable, checked against reality
                    │
                    └─► feedback-to-idea: a missed metric or a real-user finding becomes the next idea

  qa-mission learn mode: escapes and real-world results become proposed changes to this pack
```

The last three arrows are what make this a loop rather than a gate. A release is not finished when it passes QA; it is finished when the market has confirmed it did what the spec promised.

## The files

| File | What it holds | Loaded by | Owner |
|---|---|---|---|
| [quality-model.md](quality-model.md) | The eleven quality questions, the quadrants, tiers, exit criteria, what is out of scope | `qa-mission`, `test-basis` | Product |
| [oracles.md](oracles.md) | HICCUPPS, the oracle types and how to cite each, the source hierarchy for conflicts | every skill | Product |
| [risk-model.md](risk-model.md) | Frequency × Consequence, how a flow is rated, how the rating sets the tier | `test-basis`, `qa-mission` | Product |
| [test-design-techniques.md](test-design-techniques.md) | Boundaries, partitions, decision tables, state transitions, pairwise, error guessing, examples | `functional-qa`, `test-basis` | QA |
| [exploration.md](exploration.md) | Charters, SFDPOT, tours, session notes, timeboxes | `exploratory-qa` | QA |
| [severity-and-defect-standard.md](severity-and-defect-standard.md) | Types, severity P0 to P3, confidence labels, mapping to INC and Jira | `defect-writer`, every specialist | Product + QA |
| [finding-schema.md](finding-schema.md) | The one shape every finding is written in | `defect-writer`, every specialist | Product |
| [routing.md](routing.md) | Where a finding goes by stage: rework the story before merge, Bug or Improvement after; QA never creates Stories | `defect-writer`, `qa-mission` | Product + QA |
| [qa-review-page.md](qa-review-page.md) | The one QA Review page per epic, under the PRD: what was tested, by whom, when, the result | `defect-writer` (sole writer), `qa-mission` | Product + QA |
| [learning-loop.md](learning-loop.md) | How the family improves itself: escapes, calibration numbers, proposed amendments, earned autonomy | `qa-mission` (learn mode) | Product |
| [accessibility-standard.md](accessibility-standard.md) | WCAG 2.2 AA floor, raised targets per surface, the three-pass method, the human-required list | `accessibility-audit`, `design-conformance` | Design (decision pending) |
| [component-reference.md](component-reference.md) | Per-component rules, states, accessibility and the checks run; the entry template | `design-conformance`, `accessibility-audit` | Design (canonical in the design repo once agreed) |
| [pattern-library.md](pattern-library.md) | Layout and interaction rules: navigation, drawers, save versus publish, destructive actions, states | `design-conformance`, `persona-uat` | Design |
| [glossary.md](glossary.md) | Product vocabulary, banned alternatives, locale and capitalisation | `design-conformance`, `persona-uat`, `test-basis` | Product |
| [hospitality-conditions.md](hospitality-conditions.md) | The charter seeds: time, trade, place, people, network, scale | `exploratory-qa`, `resilience-qa`, `persona-uat` | Product |
| [device-matrix.md](device-matrix.md) | Surfaces, devices, viewports, input modes, and what each implies | `accessibility-audit`, `design-conformance`, `resilience-qa` | Engineering |
| [environment-register.md](environment-register.md) | Where testing is safe, what may be written, test accounts by role, what is never touched | every skill that drives a browser | QA |
| [browser-method.md](browser-method.md) | How the specialists drive a build: role and name first, evidence capture, synthetic-interaction caps | every browser skill | QA |
| [measurability.md](measurability.md) | How a spec proves it can be measured: metric to event to query, and the instrumentation check | `test-basis`, `functional-qa`, `metrics-review` handoff | Product + Data |
| [market-handoff.md](market-handoff.md) | What QA hands to GTM and to measurement: verified claims, known issues, the metric readiness note | `qa-mission`, read by `gtm-handover`, `metrics-review` | Product |

The personas the family uses live in the persona library, not here:

- `${CLAUDE_PLUGIN_ROOT}/personas-library/quality-bench/`: the **Quality Bench**, testing lenses (how a tester thinks).
- `${CLAUDE_PLUGIN_ROOT}/personas-library/test-personas/`: the **test persona cards** (who a tester pretends to be), each grounded in a UAT panel persona.

## Keeping the pack true

The pack rots faster than the skills. Three rules:

1. **Generated beats written.** Where a source exists (Storybook, the design tokens, the WCAG spec), the entry links it and records the date it was checked. Hand-written rules carry an owner.
2. **A missing entry is a finding, not a guess.** When a skill meets a component, pattern or term the pack does not cover, it reports a **system gap** (to Design or Product) and tests against the Figma frame and the general standard instead. It never invents the rule.
3. **Mark what is proposed.** The accessibility targets by surface and the severity mapping are proposals until Product and Design sign them off. Every file says which of its rules are agreed and which are proposed, and skills cite proposed rules as such.
