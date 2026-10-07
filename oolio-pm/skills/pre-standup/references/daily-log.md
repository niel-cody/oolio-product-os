# The daily log

One file per working day in the Brain, one section per team, written as each team is delivered so a run that dies halfway still leaves a record. `scripts/run-context.mjs` parses this file the next morning for the streak, the last incident count, yesterday's delivery and the thought rotation, so the line shapes below are a contract, not a style.

Path: `<vault>/02 Daily Briefs/Pre-Standup/YYYY/YYYY-MM-DD.md` (`todayLogPath` from run-context). Vault scope: this folder only. `20 Areas/Personal` and `10 Projects/Personal` are NO-GO, always.

## Shape

```markdown
---
type: log
class: record
title: "Pre-Standup YYYY-MM-DD"
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [pre-standup, log]
---
# Pre-Standup, D Mmm YYYY

## Insights
- Incidents: 2 open · days at zero: 0 · unassigned: 1 · oldest: INC-601 (59d)
- Delivery: posted · https://oolio.slack.com/archives/C03P48HMJPK/p1760000000000000
- People shown: Nalin, Tai, Hanh, Tony
- Yesterday: 2 lines · Next: 2 dates · Decisions: 2
- Thought: "Done means released and used. Testing is a waiting room, not a destination."
- Notes: Jira still showed Code Review for OR-26xx while Slack said released; flagged in the post.

## Products App
- Incidents: 8 open · days at zero: 0 · unassigned: 0 · oldest: INC-617 (56d)
- Delivery: draft · check 5 failed: a date in Next was not a Jira version date
- People shown: Nick, Thanh, Raymond
- Yesterday: 0 lines · Next: 1 date · Decisions: 0
- Thought: "Done means released and used. Testing is a waiting room, not a destination."
- Notes: Thanh has 5 in progress; showed 3. Reported to Niel.
```

The parser reads, per team section (the `## <Team name>` heading must match `name` in `config/teams.json` exactly):

| Line | Pattern | Used for |
|---|---|---|
| `Incidents: N open` | `(\d+)\s+open` | yesterday's count |
| `days at zero: N` | `days at zero:\s*(\d+)` | the streak |
| `Delivery: posted|draft|held|skipped` | first word after `Delivery:` | whether a draft already exists today |
| `Thought: "..."` | the quoted line | the twenty-day rotation |

Everything else in the section is for people. Add what the next operator needs: a correction made, a person missing from Slack, an overload, a source that was slow.

## Delivery words

- `posted`: sent with `slack_send_message`; the permalink follows.
- `draft`: a check failed; the draft was created once; the reason follows.
- `held`: nothing was created in Slack (a source was unreachable, or a draft already existed); the reason and, if there is one, the revised text follow under a `Revised text` sub-bullet.
- `skipped`: not a working day for this team (team holiday in `config/teams.json`).

A day that is not a working day for anyone gets no file. Silence on a public holiday is expected; silence on a Tuesday is a broken schedule, which is exactly why the file exists on every other day, even when a team had nothing to say.
