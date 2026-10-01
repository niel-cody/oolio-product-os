# The verdict

What the release owner reads. Verdict first, then what needs them, then the few things that matter, then the evidence. It becomes the newest entry in the QA Review page's verdict history.

```
# QA verdict: <release>, <date>, run <id>

**Recommendation: Ship | Ship with known issues | Hold**
**Owner's decision:** <pending | decision, who, date>
**Tier:** <Smoke | Standard | Full>, set by <risk map | person, why> · **Stage:** <…> · **Environment:** <…>
**Confidence:** High | Medium | Low (<what drives it>)

## Decisions needed
<only if any; each with the question and its severity if it goes the wrong way>

## Why
Three to five sentences against the exit criteria: what is met, what is not.

## Blockers (Hold only)
| Blocker | Severity | What would move it | Owner |

## Top five issues
| ID | Issue, in the user's terms | Sev | Route (rework / ticket / PO) | Verified? |

## Known issues (Ship with known issues)
| Issue | Sev | Workaround | Owner | Fix version |

## Acceptance criteria
<n> ACs · Pass <a> · Fail <b> (in rework <c>) · Blocked <d> · Not tested <e>

## Coverage
| Question (quality model) | Asked by | Result | Not tested because |
Quadrants covered: Q1 … Q4. Personas run: … Surfaces and viewports: …

## Independent verification
<what was re-checked, what held, what was overturned>

## Not covered by this family
Security and penetration testing · load at infrastructure scale · payments certification · legal sign-off on content · <anything the tier skipped>

## Market handoff
<the block from market-handoff.md>

## Findings register
<link or the register from defect-writer>
```

Rules:

- The top five are chosen by severity on high-consequence flows first. Everything else is in the register, not the verdict.
- "Confidence" is about the verdict, not the product: Low when environments, fixtures or verification were missing.
- Never describe a recommendation as a block while gate authority is advisory.
