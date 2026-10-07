# The post

One message per team per working day, in the team's channel. Slack messages sent through the connector take standard markdown (`**bold**`, `_italic_`), which Slack renders as its own formatting; do not write mrkdwn single asterisks. People are tagged as `<@SLACKID>` from `config/roster.json`.

## Template

```
**<Team>: yesterday, today, next** · <Ddd D Mmm>
_<thought for the day: one line, Niel's product lens, a little witty>_

**Incidents** · <n> open, target 0 · <days> days at zero
• <INC key> <P> <short title> · <@owner or **UNASSIGNED**> · <status> · <age>d

**Yesterday**
• <what shipped, released, closed or was decided, with keys>

**Today**
• <@person> <what they have in progress, with keys and the release it serves>

**Next**
• <next one or two release dates and what venues get>

**Decisions**
• <decided since the last post, with the people it affects tagged>
```

Dates are `Wed 8 Oct`, never numeric. Jira keys are linked (`[OR-2814](https://oolio.atlassian.net/browse/OR-2814)`), which the connector unfurls when `unfurl_app_links` is on; keep unfurls off so the post stays one screen.

## Section rules

- **Thought for the day.** One italic line. Product lens, a little witty, never sarcastic about a person. From `references/thought-for-the-day.md`; not a line used in the last twenty working days (run-context lists them).
- **Incidents.** Always first, always present. At zero it is one line with the streak, so silence is a statement: `**Incidents** · 0 open · 12 days at zero`. Each open incident on its own line: key, priority, short title, owner or **UNASSIGNED** in bold, status, age in days. Owner, status and age only; nothing that reads as blame.
- **Yesterday.** Only things that changed state: released, closed, merged to production, decided. Not "worked on". If nothing changed, one line: `• Nothing released or closed since <day>.`
- **Today.** Only what each person has in progress in Jira, led by any incident they own, plus a stated priority for today if there is one. Next work only for someone with nothing in progress, marked `(next)`. Never future work for someone who is busy. Max three per person, then `+n more`.
- **Next.** The next one or two release dates from Jira versions, named as what venues get. No dates that are not in Jira or the plan page. If the project has no dated unreleased version, say `• No dated release in Jira yet.`
- **Decisions.** Only decisions recorded since the last post. Tag the people affected. Omit the whole section when there are none.
- **Asks.** Not a standing section. The thread is for asks.
- **Every line carries a Jira key or a link.** A line that cannot cite anything is cut.
- **Length.** One screen on a phone. Roughly 25 lines is the ceiling; if a team breaks it, the three-item cap and the "+n more" are doing their job.
- **House style.** British English, no em dashes, no buzzwords, short lines. Full rules: `${CLAUDE_PLUGIN_ROOT}/references/house-style.md`.

## Worked example

Insights, Wednesday 7 October 2026, the trial, rebuilt in the final format (the trial post had no incidents section; it was added after the review). The incident lines and the two Yesterday lines are the real Jira results of that day. The Today and Next lines carry `<key>` and `<date>` where this file, written from the daily log rather than the post, cannot vouch for the exact key or date; a real post never ships a placeholder.

```
**Insights: yesterday, today, next** · Wed 7 Oct
_Done means released and used. Testing is a waiting room, not a destination._

**Incidents** · 2 open, target 0 · 0 days at zero
• INC-601 P3 Deactivated location hidden in Insights · <@U01LW3PH7UL> · To Do · 59d
• INC-885 P4 Coffee Guru, Gungahlin Espresso · **UNASSIGNED** · New · 1d

**Yesterday**
• Gift card reports released to production: activity, liability and performance, inter-location settlement, export, save and share, filters (OR-2550, OR-2551, OR-2552, OR-2630 to OR-2637)
• Labour dashboard date-range fix released (OR-2692)

**Today**
• <@U090WL1SH3K> Deputy mapping for the labour connect (<key>)
• <@U08UDLGKU3H> Tanda connect (<key>); variance summary fix queued for production (OR-2814)
• <@U01LW3PH7UL> INC-601 first, then the weather ingestion backfill (OR-2823)
• <@U07PX6RCQTZ> settlement ledger data model (<key>)

**Next**
• <date>: scheduled reports, saved reports land in inboxes (<version>)
• <date>: Home v1, the diary (<version>)

**Decisions**
• Net payout per transfer, not gross; ledger to 10 Nov (<@U090WL1SH3K> <@U07PX6RCQTZ>)
• Signals service is a separate deployable (<@U01LW3PH7UL>)
```

What the example shows: incidents lead even when the rest of the day is good; the unassigned one is bold; Nalin's line leads with his incident; Hanh's line says queued for production rather than released, because OR-2814 was in Ready for Prod-Green; the keys for the gift card batch are collapsed to a range rather than listed thirteen times.
