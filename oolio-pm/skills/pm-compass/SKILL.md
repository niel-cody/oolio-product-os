---
name: pm-compass
description: >-
  The front door and router for the oolio-pm skills. Trigger when someone
  asks "which skill should I use", "where do I start", "what can these
  skills do", "what have you got for X", "help me choose", "I'm new to
  this", or describes a product-management task without naming a skill and
  the right one isn't obvious. Also trigger for "show me the pipeline" or
  "how do these skills fit together". Reads the situation, names the one
  skill (or short chain) that fits, and starts it on request. Do NOT
  trigger when the user already named a specific skill or their phrasing
  clearly matches one skill's own triggers — route straight there instead.
---

# PM compass

The router. Thirty-three skills is too many to hold in your head, and the biggest waste is not a missing skill but the right one going unused. This skill turns a described situation into the one skill (or short chain) that fits, explains the hand-off in a sentence, and offers to start it. It never does the destination skill's work itself.

## How to route

Ask at most one clarifying question, then name the skill. Match on the **situation**, not the vocabulary:

| You have / you want | Skill |
|---|---|
| A day of meetings to drain: file the notes, chase the actions, update the tickets | `meeting-sweep` |
| Raw feedback, a support trend, a churn note, "log this" | `feedback-to-idea` |
| A JPD idea that needs cleaning up to standard | `jpd-idea-groomer` (titles only: `jpd-title-standard`) |
| "Is this idea actually worth doing?" — the full treatment | `jpd-loop` |
| A big question, no ticket attached, wants a researched briefing | `storm-research` |
| Evidence for a specific idea from market/social/CRM | `signal-radar` (idea mode) |
| One useful find to attach to the right idea(s) as an Insight | `add-insight` |
| "What are we missing?" — backlog vs market gaps | `signal-radar` (gap scan) |
| A discovery theme too big for one session | `discovery-wayfinder` |
| "What's <competitor> doing / weak at?", sweeps, battlecards | `competitor-watch` |
| "Why are we losing deals?" | `win-loss` |
| A groomed idea that needs a spec | `write-prd` |
| A plan, PRD, or decision that needs pressure-testing by interview | `grill-me` (PRDs: `grill-my-prd`) |
| A decision that needs the full challenge panel | `convene-vpc` (or one sub-council directly) |
| The behavioural, contrarian, or perceived-value read; pricing psychology, loyalty design, a feature reframed | `behavioural-alchemist` (Roy) |
| Jira epics with weak descriptions or titles | `jira-epic-groomer` / `jira-epic-titler` |
| A Steering or roadmap review to prepare | `steering-pack` |
| A launch to take to market | `gtm-handover` first, then `gtm-playbooks` / `gtm-marketing` |
| "Did the launch work?", a recurring metrics review | `metrics-review` |
| "What does the Brain say about X?", a question for the vault | `wiki-query` |
| A source to file into the Brain, or vault upkeep (health-check, new domain, status) | `wiki-ingest` / `wiki-lint` / `wiki-new` / `wiki-status` |

Chains worth knowing: intake → groom → loop → PRD → grill → steering → GTM → metrics is the full pipeline; the research trio (`competitor-watch`, `win-loss`, `signal-radar`) feeds evidence into all of it through the brain.

## For someone brand new

Give the two-minute version: the skills are written playbooks the assistant follows against our real tools (Jira, Confluence, HubSpot, the web); a person signs off everything that counts; every claim is cited; findings accumulate in a shared brain so work compounds. Then ask what they're working on and route it. Point them at the Product Operating System Confluence page for the full picture.

## Rules

- Name one skill, or one short chain, not a menu of five.
- If the described task matches nothing, say so plainly and capture it: that is a skill gap worth recording (offer to note it in the backlog or brain), not something to fake with the nearest skill.
- Offer to start the routed skill; never start the work inside this one.
