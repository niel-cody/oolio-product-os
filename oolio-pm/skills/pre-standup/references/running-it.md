# Running it: the Mac Mini, the schedule, the first week

## Where it runs

**On Niel's always-on Mac Mini, as a Cowork scheduled task**, the same footing as `hubspot-sweep`. The run needs three things that live together only there: the Atlassian connector and the Slack connector signed in as Niel, and the Brain at `~/my_brain` for the decision logs and the daily log. A cloud session has no vault, and a laptop is asleep at 07:00.

A Cowork scheduled task is bound to the machine it was created on, so the schedule is set up from a Cowork conversation on the Mac Mini itself; it cannot be created from another machine on its behalf.

## The schedule

- **07:00 Australia/Sydney, Monday to Friday**, one run for all five teams, in the order they appear in `config/teams.json`.
- The task prompt is one line: `Run the pre-standup for all teams.`
- NSW public holidays are skipped by `scripts/run-context.mjs`, which the run calls first. A team-specific holiday goes in that team's `holidays` array in `config/teams.json` as `YYYY-MM-DD`; the team is skipped and the log says so.
- 07:00 Sydney is 03:00 in Ho Chi Minh City. Vietnam-based people read it on arrival; "Yesterday" is cut at the post time, which is why the window is "since the previous working day" rather than "the last 24 hours".

## Preflight, once per machine

From a Cowork or Claude Code session on the Mac Mini:

1. `node ${CLAUDE_PLUGIN_ROOT}/skills/pre-standup/scripts/run-context.mjs --pretty` prints today's context. `vaultFound` must be true and `lastLog` should point at the most recent log.
2. Ask the session to run the pre-standup in **dry-run** mode: it assembles all five posts and shows them in chat without touching Slack. Read them as the teams will.
3. Confirm the Slack connector can see all five channels (`slack_read_channel` on each `channelId`) and that the operator's Slack id in `config/teams.json` is Niel's.
4. Create the scheduled task.

## Modes

- `run` (default): all teams, post or draft per the checks, log, report.
- `team <name>`: one team, same rules. For a re-run after a correction, remember the one-draft rule.
- `dry-run`: assemble and show every post in chat; write nothing to Slack or the Brain. The first-week review tool, and the way to check a config change.
- `replies`: read the thread replies on yesterday's posts and file any decisions, without assembling a post. Useful if the morning run could not reach Slack.

## A missed day

If the Mac Mini was asleep or offline at 07:00, the next run's window still starts at the previous working day, so nothing is lost from "Yesterday"; the teams simply did not get a post. Run `team <name>` by hand later in the morning if it matters; a post at 10:00 is better than a gap. Do not back-post for a day that has passed.

## The first week

Done means five consecutive working days of posts with no corrections, for all five teams. Until then:

- Read every post within an hour of 07:00 and correct in the thread, not by editing the message, so the log can record what was wrong.
- Any correction goes in the daily log under `Notes` for that team, and if it is a rule rather than a slip, into `references/checks.md` or `references/post-template.md` in this repo, then shipped.
- Watch the three known traps from the trial: a second draft in a channel (double post), a name matched instead of an id (wrong person tagged), and Jira lagging Slack on a release (something reported as in review that was live).

When the week is clean: set the framework and runbook pages in the Brain to `status: active` (annotate, do not delete anything), and close EVITA-218.

## Keeping the config honest

- **A person joins or leaves.** Edit `config/roster.json`: Jira account id from `lookupJiraAccountId`, Slack id from `slack_search_users` by name (email search returns nothing). Mark leave with `"away": true` rather than deleting the row.
- **A team changes channel or project.** Edit `config/teams.json`. Both files are read fresh on every run; there is nothing to restart.
- **Incidents move into the team projects.** Nothing to change: the incident query already covers `issuetype = Incident` in each team's projects. When Ngara AI is registered in Jira Teams, fill in its `teamFieldValue`.
- **Each January.** Refresh the NSW holiday table in `scripts/run-context.mjs`.
- **Monthly.** Anyone with Jira work in a team project for 14 days who is not in the roster is flagged to Niel in the Friday Update, not added automatically.
