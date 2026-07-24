---
name: steering-pack
description: Build a Steering-ready review pack over a slice of the JPD backlog — per-idea one-liners, field completeness, VPC verdicts and rubric scores, and a recommended discussion order — published as a Confluence page with a chat summary. Trigger PROACTIVELY when the user says "build the Steering pack", "prep Steering", "what's going to Steering", "get these ideas Steering-ready", "roadmap review pack", or gives a JQL slice, a list of JPD keys, or a status (e.g. everything in Decision) and asks for the review pack. Do NOT trigger for grooming a single idea (jpd-idea-groomer), running the loop (jpd-loop), or a general stakeholder update.
---

# Steering pack

Assemble the pack a Steering or roadmap review actually needs: what is on the table, whether each item is fit to be decided, what the evidence and council said, and the order to take them in. The pack's job is to make the meeting shorter and the decisions better; anything that does not serve a decision stays out.

House style: `${CLAUDE_PLUGIN_ROOT}/references/house-style.md`. Environment: project **OHSI**; field IDs in `${CLAUDE_PLUGIN_ROOT}/skills/jpd-idea-groomer/references/field_standards.md`.

## Inputs

One of: a JQL slice (`status = Decision`), a list of keys, a Horizon value, or a plain description ("everything new since last Steering"). Confirm the slice and the meeting date before building. If no slice is given, propose the default: ideas in `Decision` plus ideas flagged `Escalate`, ordered by update date.

## Workflow

### 1. Pull the slice

`searchJiraIssuesUsingJql` with `fields: ["*all"]` so the custom fields come back, always carrying the two mandatory guards from field_standards.md (`issuetype = Idea` + the archived filter). For each idea capture: summary, status, Pillar, Theme, Investment Type, Source, Customer Signal, Primary Persona, Category, Our Objective, Size, Innovation, Horizon, Commitment (where set), Escalate, the VPC fields where set (Verdict, Confidence, the four rubric scores, Loop State, Sign-off Status), and whether a **delivery link exists** (a `Polaris work item link` in the issue links — the Delivery status/progress fields are dynamic and read null via the API, so the link is the truth).

### 2. Fitness check each idea

An idea is **Steering-ready** when its title passes the Title Standard, its description carries the three standard sections, and every required field is set. An idea in `Ready for delivery` or `In Engineering` with **no delivery link** is flagged as a fitness failure regardless of field completeness. Run the title check objectively (`${CLAUDE_PLUGIN_ROOT}/skills/jpd-title-standard/scripts/check_titles.py`). Mark each idea **Ready** / **Needs grooming** (list exactly what is missing) / **Not fit** (no problem statement at all). Do not fix anything in this skill; offer `jpd-idea-groomer` or `jpd-title-standard` for the failures, and note that an ungroomed idea going to Steering wastes the room's time.

### 3. Build the pack

One Confluence page (ask for the space and parent; reuse and append to the existing Steering pack page series if one exists, never overwrite). Structure:

```
# Steering pack — <date>

**Slice:** <the JQL or description> · **Ideas:** <n> (<ready> ready, <needs> need grooming)

## Recommended order
Numbered. Decisions that unblock other items first, then by signal strength
and strategic weight. One line each on why it is placed there.

## The table
| Key | Idea (one line) | Pillar | Theme | Signal | Size | Horizon | Commitment | Delivery link? | VPC verdict · confidence | Fit | Ask |
Each row's "Ask" is the specific decision Steering is being asked to make:
proceed / park / kill / fund / re-scope. An item with no ask does not belong
in the pack.

## Per idea (one block each, ready ideas only)
**<KEY> — <summary>**
Problem in two lines. Evidence: the strongest one or two cited signals.
Council: verdict, confidence, rubric (D/F/V/S), and the one live objection
if any. Open question for the room, if one exists. The ask.

## Not fit for this session
The Needs-grooming and Not-fit items, each with what is missing and who owns
fixing it before next session.

## Back from the freezer
Not Now ideas whose "Revisit on" date has passed since the last session, one
line each: why it was parked, what has changed, re-park (new date) or revive.

## Shipped 90-day checks due
Ideas that entered Shipped ~90 days ago, each with its Success Metrics and
whatever measurement exists; the ask is "did it work, and is there a follow-up
idea?"
```

### 4. Deliver

Post the page, then give the user in chat: the page URL, the headline counts, the recommended first three items, and any idea whose Escalate flag or VPC escalation makes it urgent. Offer to draft the meeting invite line or a Slack pre-read message.

## Rules

- **Report, do not decide.** The pack presents evidence, verdicts, and asks; the humans in the room decide. No recommendation beyond ordering and the per-idea ask framing.
- **Cited or absent.** Signal claims come from the idea's fields, comments, and insights. Nothing uncited.
- **Reporter-neutral.** The page may name the VPC (it is internal), but keep tooling out of any content that could be pasted to a wider audience.
- **Append, never overwrite.** Each session is a new page or a new dated section; history is the record.

## Definition of done

Every idea in the slice appears exactly once (in the table or the not-fit list); every ready idea has an ask; the fitness failures name their gap and owner; the page is published and the chat summary delivered.
