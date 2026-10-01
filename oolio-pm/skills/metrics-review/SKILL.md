---
name: metrics-review
description: Run a product metrics review against real data — post-launch validation of a PRD's success metrics, or a recurring weekly/monthly product review — producing a scorecard with targets, actuals, trends, verdicts, and actions. Trigger PROACTIVELY when the user says "metrics review", "how is [feature] performing", "did [launch] work", "check the success metrics", "weekly product review", "validate the launch", or names a shipped PRD/feature and asks whether it met its numbers. Uses the connected PostHog MCP where available, and PRD success metrics as the target source. Do NOT trigger for ad-hoc SQL help or building a dashboard (use the data skills), or for market research (storm-research).
---

# Metrics review

Close the loop the toolkit opens: the PRD promised success metrics, the council endorsed them, the feature shipped. This skill checks whether reality agrees, and turns the numbers into a scorecard with verdicts and actions. It also runs as a recurring review over a product area's standing metrics.

House style: `${CLAUDE_PLUGIN_ROOT}/references/house-style.md`. No fabricated numbers, ever: every figure in the scorecard traces to a query, a named dashboard, or data the user supplied. A metric that cannot be measured is reported as **Unmeasurable**, with what is missing; that finding is as valuable as a number.

## Two modes

- **Launch validation.** Input: a PRD (Confluence URL), a JPD idea key, or a feature name. The PRD's Success metrics section defines the targets; the review answers "did it work".
- **Recurring review.** Input: a product area and cadence ("weekly review of Ordering"). The standing metrics come from the last review page (append-only series) or are agreed with the user on the first run.

## Workflow

### 1. Establish targets

For launch validation, fetch the PRD and lift its Success metrics verbatim: headline metric, guardrails, operational metrics, and the measurement dependencies it named. If the release went through `qa-mission`, start from the **metric readiness note** in its market handoff (on the epic's QA Review page): it says which metrics were proven measurable before launch, the comparison group (often the feature-flag cohort), and when this review was due. A metric QA marked measurable that now cannot be measured is a learning-loop finding for QA; say so. If the PRD marked a metric as depending on infrastructure (a hold-out group, an attribution join), check first whether that dependency exists; if not, the metric is Unmeasurable and the review says so plainly rather than substituting a vanity proxy.

For a recurring review, load the previous scorecard and carry its metric set; propose additions or retirements explicitly rather than drifting.

### 2. Pull the data

Use the connected **PostHog MCP** (insights, queries, SQL over events) as the primary source. Where a metric lives elsewhere (revenue in finance systems, tickets in support tooling), pull it from the relevant connector if available, or ask the user for the number and mark it user-supplied. Record, for every figure: the source (query or dashboard), the time window, and the comparison window.

Query honestly: define the event or property being counted before trusting a number; check for the obvious traps (timezone, test venues, internal users, incomplete current-period data). When a number looks surprising, verify it a second way before reporting it.

### 3. Score

For each metric: **target** (from the PRD or the standing set), **actual**, **trend** against the prior period, and a **verdict**: Met / On track / Off track / Unmeasurable. Then the honest reading: is the movement attributable to the feature, or is something else plausible? Flag confounds rather than claiming credit.

### 4. Deliver the scorecard

```
# Metrics review — <subject>, <date>

**Window:** <period> vs <comparison> · **Sources:** <PostHog project / others>

| Metric | Type | Target | Actual | Trend | Verdict |
(headline first, guardrails marked, operational last)

## Reading
Three to six sentences. What actually happened, what is attributable, what is
noise, and the one thing the numbers say to do next.

## Unmeasurable
Each metric that could not be measured, what is missing (event, join,
hold-out), and who owns closing it. This list feeds Insights/engineering work.

## Actions
1. <specific action> — owner, by when.
```

Deliver in chat; offer to publish to Confluence (append to the review series page for recurring mode; a child under the PRD for launch validation, never editing the PRD body beyond what the write protocol allows).

### 5. Feed the loop

If the review changes the picture for a live idea or PRD (a guardrail breached, a hypothesis disproven), say so and offer the follow-on: a new JPD idea via `feedback-to-idea` for the fix, or a note to carry into the next `steering-pack`.

## Definition of done

Every target metric appears in the scorecard with a verdict; every figure has a source and window; unmeasurables are named with owners; the reading distinguishes attribution from correlation; actions have owners.
