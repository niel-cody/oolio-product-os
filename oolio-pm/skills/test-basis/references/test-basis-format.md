# The Test Basis page

The output of `test-basis`. Lead with what needs a person, then what will be tested.

```
# Test Basis: <release / epic>, <date>

**Scope:** <stories in, flag, environments, surfaces> · **Out:** <what is excluded>
**Recommended tier:** Smoke | Standard | Full (<the flow that set it>)
**Status:** Ready to test | Stopped: <n> decisions needed

## Decisions needed (conflicts)
| # | Point | Source A (date, owner) | Source B (date, owner) | Build follows | High consequence? | Question |

## Risk map
| Flow | Frequency (evidence) | Consequence (evidence) | Rating | Tier | Specialists |

## Blast radius
Changed shared code and what consumes it. Any consumer on a high-consequence path, flagged.

## Claims to test
| # | Claim | Source | Oracle type | Flow | Technique |

## Untestable acceptance criteria
| Story | AC as written | Why untestable | Suggested Given/When/Then |

## Measurability
| Metric | Behaviour | Event(s) | Exists? | Query | Baseline | Segments | Dependency | Verdict |

## Sources read
Each with link, date, owner.

## Sources not read
Each with why (no access, not found, out of scope).
```

Rules:

- Conflicts first, always. A reader who stops after the first table knows what they must decide.
- Every claim carries a source a reader can open.
- The risk map's evidence column is never blank; "assumed" is allowed and must be said.
- It is not a page of its own. On approval, `defect-writer` writes it into the **Test Basis** section of the epic's single QA Review page (`${CLAUDE_PLUGIN_ROOT}/references/qa/qa-review-page.md`), updating rather than duplicating it on later runs. Until then it is delivered in chat.
