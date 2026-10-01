# Severity and defect standard

One scale, one set of types, one set of confidence labels, used by every skill in the family so findings from six specialists can be merged, compared and trusted. **Status: the types and the P0 to P3 scale are standard (lifted from the PR-1095 usability session and Niel's Bug and Improvement definitions, with Story replaced by Requirement gap because QA does not write requirements). The mapping to INC priorities is proposed until QA and Support agree it.**

## Types

Where each type actually goes depends on how far the build has got: a failed AC before merge reworks the story rather than raising a ticket. See [routing.md](routing.md).

| Type | Meaning | Goes to |
|---|---|---|
| **Bug** | What was missed: it does not do what an oracle says it should | Pre-merge: rework on the story, no ticket. Merged: a Bug under the epic, linked to the story |
| **Improvement** | Minor: polish or a slight change to something that works | Merged: an Improvement under the epic. Pre-merge: a note in the rework comment, or held until the build is far enough along to report clearly |
| **AC gap** | Behaviour the story should plainly have that no AC states (the ACs missed it). Needs a qualifying oracle other than an AC: Purpose, a logged decision, a pattern rule, a PRD claim, a standard, or the product's own consistency. Taste alone does not qualify: that is a Decision needed | Pre-merge: a proposed new AC on the same story, for the PO. Merged: a Bug (it was missed) |
| **Requirement gap** | New functionality we do not do today. **QA never creates Stories**: stories are functional requirements and belong to PMs and POs | The PO or PM, with the evidence, listed on the QA Review page; they decide whether it becomes a story, an idea (`feedback-to-idea`) or nothing |
| **Decision needed** | Sources conflict, or there is no oracle, so a person must rule | The release owner; never to engineering until ruled |
| **Instrumentation gap** | A success metric cannot be measured because the event, property or join it needs does not exist or does not fire | The PO and Data, before launch |
| **Coverage gap** | An AC or a high-consequence path with no automated test in the repo (from `code-qa`). The behaviour may be fine; the test is missing | Engineering, in the code-qa report and on the QA Review page. Never ticketed by QA, never counted in exit criteria; a high-consequence path with no tests is named as a risk in the verdict |
| **System gap** | The design system has no answer for this case | Design, never engineering |

## Severity

| Sev | Meaning | Examples | If found in production |
|---|---|---|---|
| **P0** | Loses or corrupts data, puts the wrong thing live, money or tax wrong, permission breach | A schedule save deletes other schedules; the wrong price reaches a till | Incident, high priority, by trade impact |
| **P1** | Stops an untrained user finishing a core task, or needs support to finish it; WCAG level A failure on a core flow | Cannot tell what is live; keyboard trap in the publish drawer | Incident or a high-priority bug |
| **P2** | Slows them or erodes trust; WCAG AA failure off the core flow; visible design system deviation | Wrong component variant; ambiguous label | Bug or Improvement |
| **P3** | Polish | Spacing off token; inconsistent capitalisation | Improvement |

Rules:

- **Severity is set by consequence to the user, not by effort to fix.** A one-line fix that loses data is P0.
- **Severity is set on the worst credible persona.** A label a fluent user shrugs at and a first-shift casual cannot get past is rated for the casual, and the finding says so.
- **Decision needed, Instrumentation gap and System gap carry a severity too**, as the severity the issue would have if the answer goes the wrong way. A Decision needed that could be a P0 stays in the Decisions section of the register, at the top, marked "P0 if ruled wrong", and is escalated like a P0. It is never ticketed to engineering.
- **Requirement gaps and Coverage gaps carry no severity.** Priority is the PO's call; the field reads `n/a`.
- **Instrumentation gap severity** follows the metric: P1 for the headline metric, P2 for a guardrail, P3 for an operational metric.
- **When two rules disagree, the higher severity wins.** The accessibility floor below can raise a consequence rating; it never lowers one.
- **Accessibility maps by level and flow.** WCAG A failure on a core flow is at least P1; AA failure on a core flow is at least P2; any failure that fully blocks a task for an assistive-technology user on a core flow is P1 regardless of level.

## Confidence

Every finding carries one, and the verdict counts them separately.

| Label | Meaning |
|---|---|
| **Reproduced ×N** | Seen N times from a clean start, with the same steps. N ≥ 2 for any P0 or P1 |
| **Seen once** | Observed, not yet reproduced |
| **Needs human repro** | Rests on synthetic drag, hover, timing, animation, or anything where the test harness may be the cause. **Always the label for findings that depend on synthetic pointer gestures**, whatever was seen. Cannot be a confirmed P0 on the model's word alone: it is listed as "P0 if confirmed", goes to Awaiting human repro, and blocks Ship on a high-consequence flow until a person rules |
| **Corroborated ×N** | Seen by N independent sources (two specialists, or a specialist and a person), each from its own run. Stronger than Seen once, weaker than Reproduced ×2 from a clean start |
| **Verified independently** | Re-checked by the independent verification pass (an agent that saw none of the planning) or by a person, and confirmed |

A finding the independent pass could not reproduce is downgraded to *Seen once* and flagged, never silently dropped.

**A P0 or P1 below Reproduced ×2.** It keeps its severity, written as "P0 (unconfirmed)", and is still escalated (drafted for the release owner, per `quality-model.md`), because a real P0 is too expensive to sit on. It cannot become a ticket until it is reproduced, corroborated by an independent source, or confirmed by a person, and on a high-consequence flow it **blocks Ship** until a person confirms or rejects it. Findings labelled *Needs human repro* go to the register's **Awaiting human repro** section, owned by the QA engineer on the epic (or the release owner if none is named).

## Themes, not sprays

Findings are bundled into **themes** before anything reaches Jira: one ticket per theme, with the items inside as a checklist, under the release's epic, carrying the release's fix version and label. A theme is a single user-facing problem with one owner ("Orientation: users cannot tell what is live"), not a component ("Buttons"). Ten themes from seventy findings is normal; seventy tickets is QA theatre.

A P0 is never buried in a theme. Post-merge it gets its own ticket; pre-merge it leads the story's rework comment, marked P0, and is also listed at the top of the register and the verdict.

**Lone nits are held, not ticketed.** A P3 that joins no theme waits on the QA Review page; at the end of the release run, the held P3s on an epic become one polish Improvement, or are closed as Rejected (not worth a ticket), with the reason recorded.

**Jira priority** (proposed; the Menus 2.0 UAT register used Highest, High, Medium, Low, source: Brain, `10 Projects/Oolio/Menu Management Experience/05_reviews/2026-09-30 Menus 2.0 UAT Consolidated Findings.md`): P0 → Highest, P1 → High, P2 → Medium, P3 → Low. Fix version comes from the epic under test; if it cannot be read, ask rather than leave it blank.

## Jira

`defect-writer` drafts; a person approves; only then is anything written. Pre-merge, the draft is a rework comment and a transition on the story (see [routing.md](routing.md)), not a ticket. Post-merge, each ticket draft carries the epic, issue type, fix version, label (`qa-family` plus the run ID, so findings stay traceable), priority, the theme description, and the item checklist with each item's oracle and evidence link. Project keys and fix versions come from the epic under test; never guess a project.
