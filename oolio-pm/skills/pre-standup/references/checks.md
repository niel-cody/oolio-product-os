# Checks before delivery, and what happens when one fails

The checks are the only safety net. All five teams auto-post from day one, with no draft week, so the first morning is the first time four teams see the format. Run every check on every post, every day. A post that passes is sent. A post that fails is held as a draft and the operator is told. There is no third state.

## The checks

1. **Every line has a Jira key or a link.** Including the Yesterday lines built from Slack: the Slack permalink is the evidence.
2. **No em dash.** British English. No buzzword from the house style list.
3. **Today is in-progress only.** Nobody in Today has an item that is not in an In Progress status category, unless they have nothing in progress and the item is marked `(next)`. Nobody has more than three items.
4. **Incident count matches the query.** The number in the Incidents header equals the number of rows returned, and equals the number of incident lines in the post.
5. **Release dates match Jira.** Every date in Next is a Jira version release date or a date on the team's plan page. Nothing else.
6. **No blame.** No person is named for a P3 or P4 in any way beyond owner, status and age. No adjectives about people.
7. **Every Slack id tagged is in the roster** for this team, and resolved by id, not by name.
8. **The sources were all reachable.** If Jira, Slack or the Brain could not be read, the post is not assembled at all. A partial post is worse than no post.
9. **Not already posted today.** run-context reports `alreadyRanToday` and per team `draftedToday`. If the team already has a post or a draft today, stop for that team.

## When a check fails

- **Hold as a draft.** Create the post with `slack_send_message_draft` in the team's channel, once, and record `Delivery: draft` in the daily log with the reason. Tell the operator in the run report.
- **Never draft twice in a channel on the same day.** Slack allows one attached draft per channel, and the connector cannot edit or delete drafts. On 7 October a revised draft was created on top of the first and two posts went out. If `draftedToday` is already true for the team, or `slack_send_message_draft` returns `draft_already_exists`, do not create another: write the revised text into the daily log under the team and tell the operator where it is.
- **Sources unreachable (check 8).** No draft either, since there is nothing trustworthy to draft. Log `Delivery: held` with the failing source, and DM the operator (`operator.slackId` in `config/teams.json`) one line: which team, which source, what the error said.
- **A P1 or P2 in the incident query.** This is not a failure, but it does not wait for the post. DM the operator immediately with the key, title, owner and age, then carry on. The post still lists it first.

## When every check passes

Send with `slack_send_message` to the team's `channelId`, `unfurl_app_links` off. Keep the returned permalink for the log. Then write the daily log section for the team before moving to the next team, so a run that dies halfway leaves an honest record.

## The run report

After the last team, one line per team to the operator, in chat if someone is watching and as nothing else otherwise (no DM for a clean run; a clean run is the quiet default):

```
Insights · posted · 2 incidents (1 unassigned) · 4 people · 2 decisions
Products App · posted · 8 incidents (0 unassigned) · 4 people · 0 decisions · Thanh has 5 in progress, showed 3
Inventory · posted · 0 incidents, 12 days at zero · 3 people
Ngara AI · draft (check 5: release date not in Jira) · 0 incidents, 12 days at zero
Loyalty & Engagement · posted · 5 incidents (1 unassigned) · 3 people
```

Overload (more than three in progress), a roster member missing from Slack, a person with Jira work in the project who is not in the roster: these go in the report, never in the post.
