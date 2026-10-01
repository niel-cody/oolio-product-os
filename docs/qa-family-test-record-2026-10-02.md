# QA family: test record, 2 October 2026

How the eleven QA skills, their reference pack and their personas were tested and pressure-tested before shipping, what each test found, and what was changed as a result. Four tests, each run by an agent that had not written the thing it tested.

## 1. Mechanical lint (`scripts/check-skills.mjs`)

A new, permanent script, wired into `npm --prefix site run check`. It fails on any skill description over 950 characters (Cowork drops such skills silently; see the 17 Sep 2026 CHANGELOG entry), a frontmatter name that does not match its folder, a per-skill version field, a `${CLAUDE_PLUGIN_ROOT}` path or relative link that does not resolve, and an em dash anywhere in the QA family's files.

**First run:** 32 errors. Two would have shipped silently broken: `qa-mission` at 957 characters, and the existing `jpd-idea-groomer` at 963, both over the ceiling. Also a run of em dashes and unresolved links. **Final run:** 45 skills, 0 errors; every QA skill under the 900-character target. Two older skills (`jira-epic-titler`, `jpd-title-standard`) remain between 900 and 950 as warnings.

## 2. Routing test (`defect-writer`)

Twelve findings across three stories in different states (in review with an open PR, merged and on Dev, in progress), plus one finding from production. The expected route for each was written down before the test agent saw the cases, and kept from it.

**Result: 12 of 12 routed as expected.**

| Case | Expected | Got |
|---|---|---|
| Failed AC, PR open, data loss | Rework the story, no ticket; P0 escalated | Yes |
| Missed empty state, PR open | Proposed new AC for the PO | Yes |
| Failed AC, merged | Bug linked to the story's AC | Yes |
| Padding off token, merged | Improvement P3, themed | Yes (held as a lone nit) |
| New capability a persona wanted | Requirement gap to the PO, never a Story | Yes |
| Synthetic drag scrambled the page once | Needs human repro, not a confirmed P0 | Yes |
| Tooltip contradicts behaviour, no ruling | Decision needed for the release owner | Yes |
| Event behind the headline metric never fires | Instrumentation gap, P1 | Yes |
| Keyboard trap in a core dialog | Bug P1 against WCAG | Yes |
| Second failed AC on the same open PR | Same rework comment, no ticket | Yes |
| Same colour-only status from two sources | One finding, two sources | Yes |
| Wrong price live in production | Incident first, then a linked Bug | Yes |

**Friction it reported (23 items), and what changed:** the "not supplied" cap would have downgraded a three-times-reproduced P0 (now: a missing field goes back to its source and a stated repro count stands); a P0 below two reproductions had no defined consequence (now "P0 (unconfirmed)", still escalated, blocks Ship on a high-consequence flow); no label for two sources each seeing something once (added **Corroborated ×N**); a finding the ACs missed had no type (added **AC gap**, with the oracles that qualify it); release owner, release candidate and core flow were undefined (now defined in `quality-model.md`); plus rules for lone nits, pre-merge Improvements, offline de-duplication, findings with no story, run IDs, Jira priority mapping and the "Awaiting human repro" state.

## 3. Back-test against known defects (`test-basis`, `functional-qa`, `exploratory-qa`)

A planner agent was given only a neutral brief of the price list schedules feature (no defect list, no access to the Brain) and asked to build the Test Basis, the case plan and the exploratory charters. Its plan was then scored against the ten defects (D1 to D10) found by hand in the 25 Aug 2026 price list schedule test.

**Result: 7 of 10 squarely targeted, 3 partly targeted, 0 missed.** Both P0 data-loss defects were targeted: the Sat/Sun regression case and the overlap-by-order-type case. Also targeted: order-type rows vanishing from the timeline, the missing default lane, the warning that does not name what it deletes, "All day" stopping at 23:59, and the no-soft-delete risk. Partly: the blank step with no stores (charted for stores with no order types), the order types offered not matching the price list's, and the "Default" row label (covered only by the copy tour). The plan also stopped correctly, with six high-consequence decisions for a person before any testing.

**Friction it reported (22 items), and what changed:** the risk grid and the tier table disagreed on Medium × High (the grid is now the single rule); a source that is silent on a high-consequence outcome had no stop rule (now treated like a conflict); `test-basis` did not point at the hospitality conditions library (it now does); the SFDPOT mnemonic listed seven dimensions while saying six (now SFDIPOT); and there was no plan-only behaviour when the basis stops or no build is reachable (added to `functional-qa` and `exploratory-qa`).

## 4. Adversarial pressure test (the whole family)

A reviewer in the Giles role (attacks, never creates) read every skill, reference, persona folder and the edits to existing skills, against the team's working rules: rework before tickets, no QA Stories, one QA Review page per epic, no unapproved writes or notifications, no fabricated facts, and the loop to market.

**Result: 38 findings, 7 Critical, 21 Major, 10 Minor. All fixed.** The routing core held. The Criticals were at the edges where the gate meets people and the market:

- "Escalate at once" was an unapproved notification. **Escalate** is now defined: top of the output, message drafted, sent only on approval.
- Earned autonomy could have let a skill write to Jira unasked. Autonomy now never covers an external write, at any level.
- Passes on low-frequency, high-consequence flows were never independently re-checked. Verification depth now reaches every tier.
- A suspected P0 awaiting human repro could not block Ship. It now does, unless a person rules or the owner accepts it in writing.
- GTM could read a stale market handoff after a Hold. A handoff is now valid only while it belongs to the newest verdict and the owner said Ship.
- Rework could be sent before independent verification. P0 and P1 write batches now wait for it.
- A regression caused by another story's open PR would have become a ticket. It now reworks the story that owns the PR.

Majors fixed include: Ship and Ship-with-known-issues made mutually exclusive; Smoke releases able to Ship; real UAT (or a recorded owner decision) required at Full; session keys renamed `UA`, `UB` so they cannot collide with source keys; `defect-writer` confirmed as the only writer of the QA Review page and the regression pack; council built mode no longer treats a lens opinion as an oracle; missing tests become **Coverage gaps**, never tickets; trigger collisions fixed in `operator-council-review`, `convene-vpc`, `test-basis`, `code-qa` and `qa-mission`; `gtm-playbooks` and `gtm-marketing` now gated on verified claims, and "numbers beat adjectives" now requires a source for the number; no PRD, no metric or no ACs now fail loudly; multi-epic releases defined; facts from the Brain now carry their source page; autonomous writes limited to PR previews; the independent verifier's brief now forbids credentials, writes and messages; learn mode drafts diffs and never pushes; Blocked environments are a named Hold blocker; native surfaces listed as not yet testable; and Full tier now checks what the till actually received, permissions by role, rollback, and migrations.

## 5. Site

`npm --prefix site run check` passes (45 skills, the new Quality column, gate, loop and flow, counts in every file in agreement). `npm run build` succeeds. `npm run check:public` against a local production build passes: the landing page shows the new stage and the Inspector, and leaks no gated skill name, trigger or flow step.

## Not tested, and why

The skills were not run against a live build: that needs an allowed environment, a test account per role and a person to sign in, none of which this session had. The first real run should be the pilot the proposal recommends, on a Products App 2.1 release, with `uat-session-kit` scoring the synthetic run against real sessions. That is the test that decides whether `persona-uat` earns its place.
