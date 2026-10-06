# Worked examples

One real release, one notice shape. The release is the one the skill was proven on; the notice is a shape to be replaced by the first real one.

## Release: Insights, 28 September 2026

Source: OR version 23878, "Sept 3 -> Incidents & Insight improvement", released 28 September 2026. Filed at `20 Areas/Oolio/Insights/releases/2026-09-28 Incidents and Insight Improvement/`.

**Collected.** Five items, all at `Released / GA`, version flipped, release date matching. Three parent epics: Trade Monitoring Grouping and Intervals (Phase 2), Insights Report Experience Improvements, Insights Platform Modernisation and Reliability, plus one bug with no parent (manual EFT excluded from the Variance Summary). Three resolved incidents carried alongside, read live from `INC`.

**Classified.** All five shipped and visible. No flags from status. One flag from the incidents: a screenshot doing the rounds showed INC-820 as done and Jira showed it In Progress; INC-763 was closed as Won't Do, not fixed. Both became `incident-status-mismatch` caveats and went into the Teams message as things to watch before anyone repeated them externally.

**Themed.** Four themes, none named after its epic:

| Epic | Theme as written |
|---|---|
| Trade Monitoring Grouping and Intervals (Phase 2) | One report, the level you need |
| Insights Report Experience Improvements | Charts when you want them |
| Insights Platform Modernisation and Reliability (Upgrade Datagrid) | The data grid finally behaves |
| (no epic) Manual EFT bug | Reconciliation |

**The why.** Shape: a gap forcing a workaround. The person's framing: a report is a question, and asking it a slightly different way should not mean building a different report. The headline followed from it: **One report. Every level.**

**The forward look.** From the project's unreleased versions, by date: 6 October, gift card reporting (version 22166); 20 October, self-service labour onboarding (version 21689). Each with one operator sentence and the subject-to-change line.

**Teams message, opening** (internal, 28 September):

> **Insights release | 28 September**
>
> A report is a question. Until now, asking it a slightly different way meant building a different report.
>
> This release adds grouping, so one report answers at whatever level you happen to be thinking: the hour, the day, the week, the store, the venue. It also finishes the job we started on scheduled reports, and it fixes the data grid that everyone has been quietly working around.

**Customer page, hero:**

> **Eyebrow:** Platform update | 28 September 2026
> **H1:** One report. Every level.
> **Standfirst:** Group by venue, by store, by hour or by month, and get a different answer from the same report.

Note what the customer page did with the incidents: no customer names, no incident keys, one paragraph under "Scheduled reports" saying what was fixed and inviting the reader to check their next one.

**What verification caught.** Nothing in the version itself. The two incident mismatches, which would have been repeated to customers as fixed. That is the pass earning its keep on a release where Jira was clean.

**Caveats reported, two of three allowed:** INC-820 still In Progress despite the screenshot; INC-763 Won't Do, not fixed.

## Notice: a shape, not a precedent

No notice has been written with this skill yet. This is the structure the first one follows; replace this section with the real example once it exists. Everything in brackets is a placeholder, not a fact.

**Record.** `mode: notice`, `version: null`, one item with its Jira key if there is one (a withdrawal usually has a story or a decision record behind it), `brief.shape` most often `promise-kept` (a regulation, a partner date) or `trade-refused` (keep a broken thing running, or pause it and say so), plus `from`, `affects` and `instead`.

**Teams message:**

> **[Product] notice | [capability], from [date]**
>
> [One paragraph: the why. What outside the release forced the change, and why doing nothing was the worse option.]
>
> **What changes.** [The capability, plainly. What stops, what pauses, what behaves differently.]
>
> **Who it affects.** [Which customers, which surfaces, from when. If it rolls out by cohort or behind a flag, say who sees it first.]
>
> **What to do instead.** [The path that still works, or the honest statement that there is none yet.]
>
> **What happens next.** [The next dated step, from an unreleased version if one exists, with the subject-to-change line.]
>
> Full notice for customers: [link]

**Customer page.** Same six parts, second person, no keys, no internal names, closing CTA to the help centre. The headline is still a claim: what the customer keeps, not what they lose.

**Confluence page.** Title `<YYYY-MM> <subject> | Release Note` under the product's Release Notes section, carrying the Jira key, the decision record if there is one, the date the change takes effect, and links to the Teams message and the customer page.

**Slack message.** One line of why, the date, the instead, the link.

**The gate is unchanged.** Nothing goes out until a person says so.
