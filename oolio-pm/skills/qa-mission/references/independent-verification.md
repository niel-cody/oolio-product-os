# Independent verification

The 5 September 2026 independent verification of the flattened menu builder is the model (source: Brain, `10 Projects/Oolio/Menu Management Experience/03_vpc/Independent Verification (2026-09-05).md`): a reviewer that had seen none of the council rounds checked the seven success criteria against the build with its own Playwright harness (55 probes at 1440 and 1280 px), found four defects the council rounds had passed, and failed the build on its first pass. After fixes, a second pass met the definition of done. An independent checker catches what the builder misses.

## Who

A fresh agent (a subagent with no access to this conversation's planning) or a person. Never the run that planned the tests. In environments without subagents, a person does it, or the verdict says independent verification was not done and its confidence drops to Low.

## What it is given, and what it is not

Given: the build URL and environment, the account role, the claims to check (the ACs and success criteria at issue, verbatim), and the findings and passes to check (title, steps, expected, actual, evidence). Not given: the Test Basis reasoning, the session notes, the persona narratives, or the specialists' conclusions about why. It should reach its own view.

## What it checks

| Tier | Re-checked |
|---|---|
| Smoke | Every P0, plus three claimed passes chosen by the verifier |
| Standard | Every P0 and P1, and every claimed pass on a High-consequence flow |
| Full | Every P0 and P1, and every claimed **pass** on a high-consequence flow (not optional) |

For each finding: reproduce from a clean start, at least twice. For each pass: re-run the AC's cases including the negative case, and probe the flow's edges the verifier thinks most likely to fail (its own choice, recorded).

## Outcomes

| Outcome | What happens |
|---|---|
| Finding reproduced | Confidence becomes *Verified independently* |
| Finding not reproduced | Downgraded to *Seen once*, flagged in the verdict; not dropped |
| Pass confirmed | Recorded as verified on the QA Review page |
| Pass overturned | The flow reopens; the new finding is source key `V`; the verdict cannot be Ship until it is resolved |
| New defect found | Source key `V`, routed like any other |

The overturn rate (findings not reproduced, passes overturned) is a learning-loop measure: a specialist whose results are often overturned needs its method tightened.

## The prompt shape for a subagent

```
You are independently verifying a release. You have not seen how it was tested.
Build: <url> (environment <env>, allowed per the register), role <role>.
Rules: read references/qa/browser-method.md and environment-register.md; never write outside run-prefixed data; never touch production.
Never type a password or token; if sign-in is needed, stop and ask. Never write to Jira, Confluence or the repo, and never message anyone. Stop if the URL is not on the register's allow-list.
Check each item below. For findings: reproduce from a clean start twice, report reproduced or not, with evidence.
For passes: re-run the cases including a negative case, then probe the edges you think most likely to fail; report pass or fail with evidence.
Items: <list>
Report in the finding schema with source key V for anything new.
```
