---
name: pre-standup
description: >-
  The daily pre-standup: one Slack post per team every weekday at 07:00 Sydney,
  incidents first, then yesterday, today, next and decisions, read from Jira,
  Slack and the Brain. Posts automatically when every check passes; a post that
  fails a check is held as a draft. Covers Insights, Products App, Inventory,
  Ngara AI and Loyalty & Engagement. Trigger when the user says "run the
  pre-standup", "post the standup for Insights", "morning post", "pre-standup
  for all teams", "dry-run the pre-standup" or "what is each team doing today",
  and when the 07:00 scheduled run fires on the Mac Mini. Do NOT trigger for the
  weekly stakeholder update (product-management:stakeholder-update), release
  comms (release-notes), a personal standup from your own activity
  (engineering:standup), or handling the incident itself.
---

# Pre-standup

One short post per team, every working morning, before standup. What happened yesterday, what each person is on today, what is next, what was decided. Incidents always come first. Standup then starts from the post and talks about blockers and decisions, not status.

Trialled by hand for Insights on 7 October 2026 ("That's worked really well"), then written down. The rules are Niel's from that review: Today shows in-progress work only; next work only for someone with nothing in progress; nobody is overloaded; the second line is a thought for the day; incidents are priority one and every team works towards **net zero open incidents at any priority**.

## The rules that do not bend

- **Incidents first, always present.** At zero it is one line with the streak. An open incident on a team outranks every story in the quarter plan, P1 to P4. Unassigned is a red line, shown in bold.
- **Every line carries a Jira key or a link.** A line with no evidence is cut.
- **Today is what is in progress.** Never future work for someone who is busy. Three items per person at most; overload goes to the operator, not the post.
- **Post only when every check passes.** Otherwise hold as a draft, once. Never draft twice in a channel on the same day: the connector cannot edit or delete drafts, and a second draft caused a double post on 7 October.
- **Never assign work, change Jira, or name a person in connection with fault.** The post reflects Jira; it does not move it.
- **No partial post.** If Jira, Slack or the Brain cannot be read, nothing is assembled and the operator is told.

## What it reads

Config, both read fresh every run: `${CLAUDE_PLUGIN_ROOT}/skills/pre-standup/config/teams.json` (channels, projects, team field values, plan pages, the operator, the Jira cloud id) and `${CLAUDE_PLUGIN_ROOT}/skills/pre-standup/config/roster.json` (people keyed on Jira account id with their Slack id). Match on ids only; names differ between Jira and Slack (Thuan Nguyen is "Nick Thane", Dung Nguyen is "Zuri", two people are called Tony).

References, all under `${CLAUDE_PLUGIN_ROOT}/skills/pre-standup/references/`: `jira-queries.md` (the JQL per section and the gotchas), `post-template.md` (the post, the section rules, a worked example), `checks.md` (the checks, the draft rule, the run report), `thought-for-the-day.md`, `daily-log.md` (the log shape the script parses), `running-it.md` (the Mac Mini, the schedule, modes, the first week). House style: `${CLAUDE_PLUGIN_ROOT}/references/house-style.md`.

## Run order

**0. Context.** Run the script first:

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/pre-standup/scripts/run-context.mjs
```

It returns today's date in Sydney, whether it is a working day, the previous working day and the JQL window, the last daily log, and per team the last incident count, the days-at-zero streak, how yesterday's post was delivered and whether a draft already exists today, plus the thought lines used in the last twenty logs. Not a working day: stop, write nothing. Already ran today: stop unless asked to re-run one team by name.

**1. Replies first.** For each team with a post yesterday, read the thread replies (`slack_read_thread`). A reply that states a decision goes into the team's decision log in the Brain (annotate, never delete) and into today's Decisions. A reply that corrects yesterday's post goes in today's log under Notes.

Then, per team, in config order:

**2. Incidents.** The incident query in `references/jira-queries.md`. Count, oldest, unassigned, age. Days at zero from the streak in run-context. A P1 or P2 is DM'd to the operator now, before anything else.

**3. Yesterday.** State changes since the previous working day, `Cancelled` excluded. Cross-check the channel (`slack_read_channel` since the previous working day): a release Slack reports and Jira does not is reported with "Jira still shows <status>".

**4. Today.** One query per roster member not marked away: in progress only, incidents leading, next work only for someone with nothing in progress, three at most.

**5. Next.** The next one or two dated unreleased versions, named as what venues get when the plan page says so.

**6. Decisions.** Brain decision logs since the previous working day, operator comments on the items already fetched, thread replies from step 1. Omit the section when there are none.

**7. Thought.** One line from `references/thought-for-the-day.md`, not in `recentThoughts`, the same line for every team today.

**8. Assemble** in the template. **9. Check** every item in `references/checks.md`. **10. Deliver**: `slack_send_message` on a pass; `slack_send_message_draft` once on a fail; nothing at all if a source was unreachable or a draft already exists. **11. Log** the team's section to the daily log before moving on.

**12. Report.** One line per team to whoever is watching. A clean run sends nothing else; silence to the operator is the quiet default, and the log is the proof it ran.

## Modes

`run` is the default: all five teams. `team <name>` runs one. `dry-run` assembles every post and shows it in chat without touching Slack or the Brain; use it for the preflight and after any config change. `replies` does step 1 only. Details in `references/running-it.md`.

## Where it runs

On Niel's always-on Mac Mini, as a Cowork scheduled task at 07:00 Sydney on weekdays, with the prompt `Run the pre-standup for all teams.` The Atlassian and Slack connectors, signed in as Niel, and the Brain at `~/my_brain` all live there. The task is created from a Cowork session on that machine. `references/running-it.md` has the preflight, the missed-day rule and the first-week watch list.

## Where it sits

The daily layer under `friday-update` (weekly, stakeholders) and the quarter plan. It reads the plan and feeds the Friday Update with the incident streaks. `release-notes` tells the business what shipped; this tells the team what is happening today. Not a stakeholder update, not incident response, not a place to assign work.

## Guardrails

Trigger: the schedule, or on demand. Reads: Jira, Slack (the five channels and yesterday's threads), the Brain's work layers, the team plan pages in Confluence. Writes: one Slack message or one draft per team per day; the daily log at `02 Daily Briefs/Pre-Standup/`; decision log entries for decisions stated in thread replies; a DM to the operator for a P1 or P2 or a run that could not complete. Never: a Jira write of any kind, a second draft in a channel on the same day, a post built from a source that could not be read, a Personal layer of the vault. Escalation: P1 and P2 to the operator immediately; overload and roster gaps in the run report.

## Definition of done, per run

Every team in config either has a post in its channel, a single draft with the failing check named, or a `held` or `skipped` line with the reason; every post passed every check; incidents led every post and the count matched Jira; nobody was shown work not in progress unless they had none; no person was named in connection with fault; the daily log has a section per team in the parsed shape; replies to yesterday's posts were read and any decision filed; the operator heard about any P1 or P2 within the run.
