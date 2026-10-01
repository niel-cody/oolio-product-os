# The findings register

The output of `defect-writer`, and the format any QA consolidation reuses.

```
# Findings register: <release / session>, <date>

**Sources:** <source keys and what each was, e.g. F = functional-qa run R1, U = pilot sessions 1–3>
**Totals:** <n> findings → <m> after de-dupe · P0 <a> · P1 <b> · P2 <c> · P3 <d>
**By type:** Bug · Improvement · AC gap · Requirement gap · Decision needed · Instrumentation gap · Coverage gap · System gap
**By route:** Rework <n> stories · New ACs proposed <n> · Tickets drafted <n> · To PO <n> · To owner <n> · To Design <n>
**Already in Jira:** <n> matched to open issues (or "Jira not checked: drafts are de-dupe pending")

## Rework (pre-merge: stories going back, no new tickets)
| Story | Assignee | Failed ACs | Findings | Proposed transition |

## New acceptance criteria proposed (for the PO)
| Story | Proposed AC | Finding | Why the existing ACs missed it |

## Awaiting human repro
| ID | Title | Severity if confirmed | Why a human is needed | Owner |

## P0s (post-merge: each its own ticket; pre-merge: leads its rework comment)
| ID | Title | Oracle | Confidence | Sources | Proposed home |

## Decisions needed (for the release owner; "P0 if ruled wrong" first)
| ID | Question | Why it matters | Severity if it goes the wrong way |

## Themes
### T1. <theme in the user's terms> (<highest severity>, <n> items)
Owner: <team> · Home: <project / epic / type / fix version>
| ID | Item | Sev | Oracle | Confidence | Sources | Evidence |

## Matched to existing Jira
| ID | Existing key | New evidence to add |

## Requirement gaps (for the PO; QA does not create Stories)
| ID | New functionality observed | Evidence | Suggested route (story, idea, nothing) |

## Held (lone nits)
P3s that joined no theme, waiting for the end-of-run polish Improvement.

## Routed elsewhere
System gaps sent to Design; instrumentation gaps to the PO and Data.

## Source yield
| Source | Findings | Unique (found by no other source) | P0/P1 |
```

The **source yield** table is what tells us, over several releases, which sources earn their keep. A source that finds nothing unique for three releases is a candidate for cutting back.
