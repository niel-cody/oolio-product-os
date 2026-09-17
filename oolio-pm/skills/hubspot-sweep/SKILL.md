---
name: hubspot-sweep
description: >-
  The daily HubSpot sweep: pull the last day's CRM signal, match it against the
  JPD backlog, and attach what fits as native Insights, so customer need reaches
  discovery without anyone having to read the support queue. Runs on a schedule
  or on demand. Trigger when the user says "run the hubspot sweep", "the daily
  hubspot check", "what's new in hubspot", "check hubspot for insights", "any
  new signal from support", "daily CRM sweep", or when a scheduled daily run
  fires. Covers feature and change requests, cancellations, offboarding, and
  at-risk accounts across the support pipelines. Do NOT trigger for one piece of
  evidence already in hand (use `add-insight`), for gathering evidence on a
  single named idea or a full backlog gap scan (use `signal-radar`), for raw
  pasted feedback (use `feedback-to-idea`), for closed-lost deal analysis (use
  `win-loss`), or for the full grooming loop (use `jpd-loop`).
---

# HubSpot sweep

The standing watch on the CRM. Every day, the support and success queues take in what customers actually cannot do, and almost none of it reaches discovery: the volume is roughly 1,200 tickets a day across fifty pipelines, so nobody reads it, and the product signal inside it is a thin seam. This skill mines that seam on a daily cadence, attaches what maps to an existing idea as a native JPD Insight, and hands what maps to nothing to `feedback-to-idea`. The point is to be early: a churn reason or a repeated request should reach the backlog while it is still a need, not after it becomes a loss.

It is deliberately narrow. It does not gather web or social signal, groom fields, create ideas, or run the council. `signal-radar` is the broad multi-source research run; this is the daily internal one.

Operating model (Brain taxonomy, source tiers, the routing pipe): `${CLAUDE_PLUGIN_ROOT}/references/research-os.md`. House style: `${CLAUDE_PLUGIN_ROOT}/references/house-style.md`.

## Environment (Oolio)

HubSpot portal `5205495`. Record URLs, which are the Insight source links, follow `https://app.hubspot.com/contacts/5205495/record/<objectTypeId>/<recordId>` — `0-5` tickets, `0-3` deals, `0-2` companies, `0-1` contacts.

Jira cloudId `98b2c73a-4f2e-4b23-aca7-dbc5b45b1e24`; project **OHSI — Oolio One Ideas** (`10052`). Every backlog query carries the two mandatory guards from `${CLAUDE_PLUGIN_ROOT}/skills/jpd-idea-groomer/references/field_standards.md` (`issuetype = Idea` plus the archived filter) or the results are polluted by Customer records and archived ideas.

The pipeline map, the category values, and the standing queries are in `references/hubspot-queries.md`. Scoring, the Insight format for CRM evidence, and the attach routes are in `references/triage-and-attach.md`.

## The run

### 1. Set the window

Default window is **since the last completed sweep**, from the sweep log in Brain (`wiki-query` for the HubSpot sweep log; create it on first use per research-os). No log, or a log older than seven days, means default to the last 24 hours and say so in the report. Never widen past 30 days without being asked: this is a daily watch, not a backfill.

State the window in the report as an explicit date range. A sweep whose window nobody can see is a sweep nobody can audit.

### 2. Pull the candidates

Run the standing queries in `references/hubspot-queries.md` with `query_crm_data` (it takes SQL, which is what makes a daily window cheap). Never pull the whole window and read it: the queries exist because the noise ratio is roughly fifty to one. Each query is scoped to the window and to the pipelines and categories that actually carry product signal.

**Oolio One is the product, so `ONE | Support` is the main seam** and its queue is read in full. The other brand queues are swept too, and they are not lesser signal: Bepoz, Idealpos, SwiftPOS, OrderMate and Deliverit customers are the migration path into Oolio One, so a request on one of their queues is a statement about what Oolio One has to do before that customer will move. The brand of origin is context for the Insight, never a reason to drop the record.

After that, highest yield first: the `FEATURE_REQUEST` and `Change Request` categories across every brand; the cancellation, offboarding and at-risk pipelines; then `Problem` and `PRODUCT_ISSUE` tickets whose content describes a missing capability rather than a broken install.

Deduplicate against the previous sweep by HubSpot record id before spending any reading on a record.

### 3. Triage

Most of what the queries return is still operational. Apply the discriminator in `references/triage-and-attach.md`: a candidate must describe **a need the product does not meet**, not a fault, a config question, a hardware order, or a version upgrade. Read the `content` of anything that survives, and keep the customer's own words: the verbatim line is the most valuable part of the record.

For each survivor, state the problem in operator terms rather than the feature asked for, and note the account and how much weight it carries.

### 4. Match against the backlog

For each triaged candidate, search OHSI on the problem's nouns and synonyms (both guards, **all statuses** — a parked or rejected idea with fresh signal is exactly what should resurface). Three outcomes:

- **Fits an existing idea.** It becomes an Insight on that idea. Cap at the two or three ideas it genuinely supports; broadcasting one ticket across eight ideas dilutes it to noise.
- **Fits nothing.** It is intake, not attachment. Hand it to `feedback-to-idea` with the evidence already cited. Do not force-fit it onto a neighbouring idea.
- **Already attached.** The record URL is already an Insight on that idea from an earlier sweep. Skip it silently; it is not a finding.

### 5. Present the mapping, take one approval

One table: HubSpot record and its link · the problem in one line · target idea key and summary (or "new idea — hand to feedback-to-idea") · impact 1 to 5 with a one-line reason. Take **one approval for the batch**, the same discipline as `feedback-to-idea`'s bulk sweeps.

A scheduled run with nobody watching does not get to skip this. It presents the batch, attaches nothing, and leaves the approval for the human: see **Unattended runs** below.

### 6. Attach as native Insights

On approval, `get` each target idea first to skip duplicates, then `create --file` with one object per idea so each carries its own tailored description:

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/jpd-loop/scripts/jpd-insight.mjs get OHSI-123
node ${CLAUDE_PLUGIN_ROOT}/skills/jpd-loop/scripts/jpd-insight.mjs create --file sweep.json
```

Usage, the schema traps, and the fallbacks are in `${CLAUDE_PLUGIN_ROOT}/skills/jpd-loop/references/jpd-insights-api.md`. A Jira comment is not an Insight and is not an acceptable substitute.

### 7. Log the run and close the loop

Write the sweep log entry to Brain per research-os: the window, the queries run, counts at each stage (pulled, triaged, matched, attached, handed to intake), the Insight lines themselves, and the new watermark. The log is what makes tomorrow's sweep incremental rather than repetitive, so it is written whether or not anything was attached.

Then say what is next: candidates handed to `feedback-to-idea`, and anything that recurred often enough this week to be worth a gap scan with `signal-radar`.

## Running it daily

**The sweep's home is Niel's always-on Mac mini, as a Cowork scheduled task.** That is deliberate rather than incidental: both of the attach route's prerequisites live on that machine and nowhere else. The helper needs the OAuth token at `~/.jpd-insights-token.json` and it needs to reach `api-private.atlassian.com`, which a local machine can and Anthropic's cloud sandbox cannot. A cloud run can do every part of this skill except the one that matters most, so the schedule belongs on the hardware that can finish the job.

A Cowork scheduled task is bound to the machine it was created on, so the schedule is set up from a Cowork conversation on the Mac mini itself. It cannot be created from a cloud session on that machine's behalf.

**Preflight, once per machine and again whenever a run reports an auth failure.** Confirm the helper before trusting the schedule:

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/jpd-loop/scripts/jpd-insight.mjs whoami
```

It should print the site, cloud id and token expiry. If it reports no credentials, the machine needs its one-time `auth` run before any sweep can attach anything (the command, and why the agent must not run it with the secret on the command line, are in `${CLAUDE_PLUGIN_ROOT}/skills/jpd-loop/references/jpd-insights-api.md`).

**A missed day heals itself.** The window comes from the watermark in the sweep log, not from a fixed "last 24 hours", so a run skipped because the machine was asleep, rebooting, or offline is picked up by the next one rather than lost. This is the main reason the watermark exists, and the reason not to replace it with a rolling window.

## Unattended runs

The daily run fires with nobody at the keyboard, and two things change.

**Approval still stands.** The run does everything up to step 5, then stops and reports the proposed batch. It does not attach unreviewed Insights, even where the attach route is fully available and the run could technically complete on its own. A wrong Insight costs more to find and remove than a missed one costs to catch tomorrow, and the house rule is that a person signs off anything that counts.

**The attach route may not exist.** On the Mac mini it will. Elsewhere it may not: a cloud session has no token file and no route to `api-private.atlassian.com`. When the helper is unavailable the run does not silently degrade, and it does not treat it as a bug to debug. It reports the batch **with the ready-to-run `create --file` JSON inline**, so approving and attaching later is one paste and one command, and says plainly which route was unavailable, per `references/triage-and-attach.md`.

A sweep that found nothing says so in one line. Silence is indistinguishable from a broken schedule, and a watch nobody trusts gets ignored.

## This skill must never

- Read the whole day's ticket volume instead of running the standing queries.
- Attach an Insight without the batch being approved, including on a scheduled run.
- Attach a record that is already an Insight on that idea.
- Fabricate a record URL, a quote, or an account name, or attach evidence it cannot cite.
- Force-fit a candidate onto an idea it only vaguely touches, instead of handing it to `feedback-to-idea`.
- Create, edit, or transition a Jira issue, or write a JPD custom field. Creating a native Insight is an evidence attachment, not an issue edit; everything else belongs to `feedback-to-idea`, `jpd-idea-groomer`, or `jpd-loop`.
- Treat a single ticket from one account as strong evidence. The tier rules in research-os apply: HubSpot-direct is tier 1, but one voice is still one voice.
- Copy customer contact details, card data, or anything else personal into an Insight or a Brain page. The record link is the pointer; the Insight carries the problem, not the person.
- Skip the Brain log because the run found nothing.

## Definition of done

The window was stated and taken from the sweep log; the standing queries were run rather than the raw queue read; survivors were triaged against the need-versus-fault discriminator; each was matched across all OHSI statuses; the mapping was presented and approved once; native Insights exist on each target idea, or the batch plus its `create --file` JSON was handed over with the reason the automated route was unavailable; candidates fitting no idea went to `feedback-to-idea`; the sweep log and new watermark are in Brain.

## References (read on demand)

- `references/hubspot-queries.md` — the pipeline and category map, the standing queries, the window and watermark mechanics.
- `references/triage-and-attach.md` — the need-versus-fault discriminator, scoring, the Insight format for CRM evidence, the attach routes and the unattended fallback.
