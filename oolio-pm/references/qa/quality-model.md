# The quality model

What a release has to answer before it ships and again after it reaches the market, which oracle answers each question, and which skill asks it. `qa-mission` uses this table to plan a run and to report coverage; a question nobody asked is reported as **Not tested**, with the reason, never left blank.

## Terms

- **Release owner.** The person who makes the ship call for this release. `qa-mission` names them when it frames the run; by default the epic's PO, and if that is unclear it asks. Every "escalate" in the family goes to them.
- **Escalate.** Put the item at the top of the run's output, marked **ESCALATION** (and at the top of the Daily Brief when the operator runs it), with a message to the release owner **drafted, never sent**. It is sent only on the approval of the person running the session. No skill in the family notifies anyone on its own.
- **Release candidate.** Any build intended for the next release train, including PR previews of stories carrying that train's fix version.
- **Core flow.** A flow rated High on frequency or consequence in the Test Basis risk map. With no risk map, the flows named in the PRD's What section; and the run says the rating is assumed.

## The questions

| # | The question | Quadrant | Oracle | Skill |
|---|---|---|---|---|
| 0 | Is the spec testable and measurable, and do our sources agree? | Q2 (shift left) | PRD, epic, stories, decisions, Figma, success metrics | `test-basis` |
| 1 | Is the code covered where it matters? | Q1 | ACs mapped to tests in the repo, the diff | `code-qa` |
| 2 | Does it do what the acceptance criteria say? | Q2 | ACs as examples | `functional-qa` |
| 3 | Does it emit the data its success metrics need? | Q2 | The measurability plan from `test-basis` | `functional-qa` (instrumentation pass) |
| 4 | What breaks off the happy path? | Q3 | HICCUPPS, SFDPOT, hospitality conditions | `exploratory-qa` |
| 5 | Does it match the design and the design system? | Q2/Q3 | Figma frame, component reference, patterns, tokens, glossary | `design-conformance` |
| 6 | Can everyone use it? | Q3/Q4 | WCAG 2.2 AA and the surface targets | `accessibility-audit` |
| 7 | Would a real operator get it, under real conditions? | Q3 | Test persona cards, task scripts | `persona-uat` |
| 8 | Is the design still sound now it is built? | Q3 | Design Council lenses | `design-council-review` (built mode) |
| 9 | Would real users accept it on a Friday night? | Q3 | Real people, framed by the Operator Council | `uat-session-kit` + `operator-council-review` (built mode) |
| 10 | Does it hold under load, failure and scale? | Q4 | Hospitality conditions, Doherty threshold, scale fixtures | `resilience-qa` |
| 11 | Should it ship, and what may we say about it? | All | Exit criteria per tier; the verified-claims list | `qa-mission` |
| 12 | Did it do in the market what the spec promised? | After launch | PRD success metrics | `metrics-review` (fed by `qa-mission`) |

The quadrants are the Agile Testing Quadrants (Marick, then Crispin and Gregory): Q1 technology-facing tests that support the team (unit, component), Q2 business-facing tests that support the team (functional, story, examples), Q3 business-facing tests that critique the product (exploratory, usability, UAT), Q4 technology-facing tests that critique the product (performance, resilience, security, the other "-ilities"). The family is deliberately strongest in Q2 and Q3, where an AI acting as a user adds most.

## Tiers

The risk map from `test-basis` sets the tier, using the grid in [risk-model.md](risk-model.md); that grid is the single rule and this table only describes what each tier runs. The owner can raise or lower it; the verdict records who did and why.

| Tier | When | What runs | Independent verification |
|---|---|---|---|
| **Smoke** | Every changed flow rates Smoke on the grid in [risk-model.md](risk-model.md) | `functional-qa` on the high-risk ACs, the automated accessibility pass, the instrumentation pass | P0 only |
| **Standard** | The highest-rated changed flow rates Standard on the grid | Smoke, plus `exploratory-qa`, `design-conformance`, the assisted accessibility pass, `persona-uat`, `code-qa` | Every P0 and P1 |
| **Full** | Any changed flow rates Full on the grid (High consequence at Medium or High frequency: money, tax, publish, archive, anything that reaches a till), or by request | Standard, plus both councils in built mode, `resilience-qa` where fixtures exist, `uat-session-kit` planning | Every P0, P1 and every claimed pass on a high-consequence flow. Not optional |

## Exit criteria

The verdict is decided against these, not against a feeling.

**Ship** needs all of the following, and no open finding above P3:
- no open P0, and no open P1 on a flow rated high consequence;
- nothing in **Awaiting human repro**, and no P0 or P1 (unconfirmed), on a high-consequence flow: each is confirmed or rejected by a person, or the release owner records in writing that the release ships with it;
- every high-risk AC run, with at least one negative case, and passed;
- the accessibility passes for the tier run (automated at Smoke; automated and assisted from Standard), with no open WCAG A failure on a core flow;
- no high-risk AC or instrumentation pass left **Blocked** (a Blocked one is a Hold blocker named "environment");
- every PRD success metric either measurable (the event fires and is queryable) or recorded as an accepted measurement gap with an owner;
- independent verification done at the tier's depth, and agreeing;
- no open **Decision needed** on a high-consequence flow;
- at **Full** only: real UAT run per the session pack with no open P0 or P1 from it, **or** the release owner records that real UAT follows launch, with a date, and the verdict says "not UAT-passed";
- at **Full** only, for any publish or pricing change: what the receiving channel actually got (online store page, kiosk preview, POS sync, read only) compared with what was published; if it cannot be reached, it is Not covered and no claim about it is Verified;
- at **Full** only, on any flow touching money or permissions: a role matrix run (each role, including one that must be refused), or "permissions not tested" as a named Hold blocker; flag-off or rollback checked on the release candidate; any data migration run on a production-shaped fixture with before and after counts.

**Ship with known issues**: every Ship criterion, except that open P1s off the high-consequence flows, P2s and P3s remain, each with an owner and a fix version, and each listed for the release notes and for `gtm-handover`. A WCAG A failure on a core flow is never a known issue.

**Hold** for anything else. A Hold names each blocker and what would move it.

**Gate authority.** Today the verdict is advisory: `qa-mission` recommends, the release owner decides, and the record shows both. Making a Hold binding is a decision for Niel and the delivery team, recorded in the decision log when it is made. Until then, no skill describes its verdict as a block.

## Out of scope, on purpose

Named in every verdict as **Not covered by this family**, so silence is never mistaken for a pass:

- security and penetration testing (the security lead and proper tooling);
- load testing at infrastructure scale (engineering);
- payments certification (scheme and acquirer processes);
- legal and regulatory sign-off on content (Legal, Risk and Compliance).

## The principles every skill in the family follows

1. **No oracle, no defect.** Every finding cites its source; no source, it is a Decision needed.
2. **Builder and checker are different.** The skill that planned a test does not grade the run alone.
3. **Frequency × Consequence sets depth.**
4. **Test where it is safe.** The environment register's allow-list only. Never write to production.
5. **Read code, never change it.** Proposed tests go to engineers as drafts.
6. **Findings are themed, not sprayed.** Broad theme tickets with the items inside, drafted for review.
7. **Say how sure you are.** Every finding carries a confidence label; synthetic drag, hover and timing are capped at *Needs human repro*.
8. **Synthetic UAT clears, humans decide.** No release is UAT-passed on AI personas alone.
9. **Measurable or it did not ship.** A success metric with no event behind it is a finding before launch, not a surprise after it.
10. **Only verified claims go to market.** GTM may claim what QA verified, and nothing it did not.
11. **One QA Review page per epic.** Every run writes to the single page under the PRD ([qa-review-page.md](qa-review-page.md)): what was tested, by whom, when, and the result. No page per run.
12. **Rework before tickets.** A failed AC before merge sends the story back; tickets are for merged work and for what the ACs missed ([routing.md](routing.md)). QA never creates Stories.
13. **Learn from every escape.** What reality finds that QA missed becomes a proposed change to the method ([learning-loop.md](learning-loop.md)).
