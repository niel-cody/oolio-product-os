# The QA Review page

**One page per epic, a child of the epic's PRD in Confluence, and every QA run on that epic writes to it.** No page per run, per session or per skill. The page is the record of what was tested, by whom, when, and what happened, and over time it is the documentation the team reads to learn what this product area breaks on.

`defect-writer` is the only skill that writes it (one writer, so the page never forks). Other skills draft their sections for it. The only other page the family keeps is the **regression pack**, one per product area, also written only by `defect-writer`. Every write follows the non-destructive protocol used for PRDs: append and update sections, never delete; mark and date anything changed; previous verdicts stay in the history.

## Finding or creating it

1. Look for a child of the PRD titled `QA Review: <epic title>`. If the epic has no PRD, look under the epic's Confluence home, then ask where it should live.
2. If none exists, create it from the skeleton below, **on approval**, and link it from the epic (a remote link or a line in the description, on approval).
3. Never create a second one. If two exist, report it and ask which is canonical.
4. **A release spanning several epics:** each epic's page records its own AC results and a verdict line for its scope; the release verdict is written to every page with the same run ID and a link to the others. No release page.

## The skeleton

```
# QA Review: <epic title>

**Epic:** <key, link> · **PRD:** <link> · **Owner:** <PO> · **QA:** <who runs QA on this epic>
**Current verdict:** Ship | Ship with known issues | Hold | Not yet run · <date>, <run ID>
**Stage:** Spec | Pre-merge | Dev | Staging | Prod

## Status at a glance
| Story | ACs | Pass | Fail | Blocked | Not tested | Status |
| <key> <title> | 6 | 4 | 1 | 0 | 1 | In rework (AC#3) |

## Acceptance criteria results
### <story key>: <title>
| AC | Criterion | Result | Tested by | When | Build / env | Evidence | Note |
| #1 | … | Pass | functional-qa (R2) | 2026-10-07 | PR-123 preview | link | |
| #3 | … | Fail → Rework | functional-qa (R2), verified | 2026-10-07 | PR-123 preview | link | Comment on story, engineer notified |

## Quality checks
| Check | Result | Tested by | When | Notes |
| Accessibility (automated / assisted / human) | … |
| Design conformance | … |
| Synthetic UAT (persona-uat) | scorecard link or summary |
| Real UAT (uat-session-kit) | sessions, SUS, task success |
| Instrumentation (metrics measurable) | … |
| Resilience | … |

## Open findings
Themes and P0s with their Jira keys or rework status. Decisions needed with their owner.

## Requirement gaps (for the PO)
New functionality spotted during testing. Not tickets.

## Known issues (for release notes and GTM)
From the latest verdict.

## Test Basis
The sources, conflicts and how each was ruled, risk map, measurability table. Updated, not duplicated, when it changes.

## Run log
| Run | Date | Tier | Who / which skills | Build / env | Verdict | Summary | Test data left behind |

## Verdict history
Every verdict ever given on this epic, newest first, with who decided.

## Lessons
What this epic taught the family: escapes, new charters, new regression scenarios, reference pack changes proposed and their status.
```

## Result scale

At AC level, four results and nothing else:

| Result | Meaning |
|---|---|
| **Pass** | Run with at least one negative case, passed, evidence linked |
| **Fail** | Failed against the AC; routed per [routing.md](routing.md) (rework pre-merge, Bug post-merge) |
| **Blocked** | Could not be run; the reason and what would unblock it |
| **Not tested** | Deliberately not run at this tier, or out of scope, with the reason |

For the quality checks, each check reports its own scale (the accessibility conformance levels, the persona scorecard, SUS) and a one-line overall: **Pass**, **Pass with issues**, **Fail**, **Not run**.

"Tested by" names the skill and run ID for AI runs and the person for human runs. "Verified" is added when the independent pass or a person confirmed the result.
