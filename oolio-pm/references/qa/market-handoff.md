# The market handoff

What QA hands forward when a release is called, so going to market and measuring the market are built on what was actually verified. `qa-mission` writes this block at the end of every Ship or Ship-with-known-issues verdict. `gtm-handover` reads it before writing a word of proof or value; `metrics-review` reads it to know what to measure and when.

## Validity

The block carries the run ID, the build, and the release owner's decision. **It is valid only while it belongs to the newest verdict on the QA Review page and that verdict's owner decision is Ship or Ship with known issues.** A later Hold, a pending decision, an owner overruling a Ship, or a newer build makes every claim in it unverified until a new run says otherwise. Readers check this before using a single line.

## The block

```
## Market handoff: <release>, <date>
Run <id> · Build <PR or build> · Owner's decision: <Ship | Ship with known issues>, <who>, <date>

### Verified claims (GTM may say these)
| Claim, in customer language | Verified by | Evidence | Conditions |
| "Schedule a price list for weekends without touching weekday prices" | functional-qa R1-F12, independent pass | AC <key>#2 run ×3 | Back office, behind flag <x> until <date> |

### Not verified (GTM must not say these yet)
| Claim in the PRD or the draft pack | Why not | What would verify it |

### Known issues (for release notes, support and onboarding)
| Issue, in customer language | Severity | Workaround | Owner | Fix version |

### Not covered by this release's testing
Security, load at infrastructure scale, payments certification, plus anything the tier skipped.

### Metric readiness
| Metric | Measurable? | First metrics-review | Comparison group |

### For support and onboarding
The three things a first-week user is most likely to get stuck on, from persona-uat and real UAT, each with the answer.
```

## Rules

1. **Only verified claims go to market.** A capability claim in a one-pager, deck, playbook or announcement must trace to a row in Verified claims. A claim with no row is either moved to "Not verified" or removed. Performance, reliability, accessibility and compliance claims ("fast", "accessible", "works offline", "WCAG compliant") need a verification at the stated level; "accessible" with only an automated pass behind it is not a verified claim.
2. **Known issues are said once, plainly, everywhere they matter.** Support, onboarding and account management get the same list in customer language, so nobody discovers them from a customer.
3. **Conditions travel with the claim.** If it is true only on a surface, a plan, behind a flag or for a segment, the condition is part of the claim.
4. **The loop closes in measurement.** Metric readiness sets the date of the first `metrics-review` launch validation. A breached guardrail or a missed headline metric goes to `feedback-to-idea`, and the QA run that called the release is linked from the review, so the next release learns whether the testing missed something the market found.
5. **Real users score the synthetic ones.** After the first real UAT or the first weeks of support tickets, `uat-session-kit` scores which real findings the synthetic run predicted. That number decides how much the next release trusts `persona-uat`.
