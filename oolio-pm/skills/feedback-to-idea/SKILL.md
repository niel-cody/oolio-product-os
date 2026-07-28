---
name: feedback-to-idea
description: Turn raw customer, support, or sales signal into a Jira Product Discovery idea, or attach the signal to an existing idea, de-duped against the whole backlog. Trigger PROACTIVELY when the user pastes customer feedback, a support trend, a Slack thread, a HubSpot ticket or deal note, a churn reason, or a feature request and says "raise this as an idea", "get this into JPD", "log this feedback", "is this already on the backlog", or "turn this into an idea". Also trigger when the user asks to sweep a channel or ticket queue for product signal. Do NOT trigger for grooming an existing idea (use jpd-idea-groomer), for running the full loop (use jpd-loop), or for general feedback summarisation with no JPD intent.
---

# Feedback to idea

The intake end of discovery: raw signal in, a well-formed JPD idea (or a strengthened existing one) out. The skill's first duty is **not to create an idea**: most signal belongs on an idea that already exists, and a backlog polluted with duplicates costs more than a missed ticket. Create only when the problem is genuinely new.

House style: `${CLAUDE_PLUGIN_ROOT}/references/house-style.md`. Environment: project **OHSI — Oolio One Ideas**, idea type `Idea`; field IDs and canonical option labels in `${CLAUDE_PLUGIN_ROOT}/skills/jpd-idea-groomer/references/field_standards.md` (load before writing any field).

## Inputs accepted

- Pasted feedback: a quote, an email, a churn note, a review.
- A Slack thread or channel to sweep (via the Slack connector).
- A HubSpot ticket, deal, or conversation (via the HubSpot connector).
- A support trend the user describes ("we've had five venues ask for X this month").
- An approved candidate handed over by `signal-radar` (gap scan), `competitor-watch` (sweep or deep-dive finding), or `win-loss` (loss-pattern gap) — already cited, already checked against the backlog once; still run the de-dupe sweep below, don't skip it.

If a named connector is not available, say so in one line and work from what the user pastes.

## Workflow

### 1. Extract the signal

From the raw material, state in plain terms: **the problem** (what breaks or is missing, in the operator's workflow terms, not the feature they asked for), **who** it affects (map to a JPD Primary Persona and segments), **the evidence** (who said it, where, when: a real quote, ticket, or thread link), and **the strength** (one customer, several, a trend, a revenue blocker or churn risk). Keep the customer's words: verbatim quotes are the highest-value part of intake.

A request is not a problem. "We want an API for rosters" is a solution; the problem underneath ("they re-key staff hours into their payroll system nightly") is what gets logged. Dig one level down before drafting anything.

### 2. De-dupe against the whole backlog

Search OHSI across **all statuses** with `searchJiraIssuesUsingJql` on the problem's nouns and synonyms (not the customer's phrasing alone), plus a semantic pass over near-matching summaries. Always carry the two mandatory guards from field_standards.md — `issuetype = Idea` plus the archived filter — or the sweep is polluted by Customer records and ~43 archived ideas. Three outcomes:

- **Existing idea covers it.** Propose attaching the signal instead of creating: a comment on the idea carrying the quote, source, and date; a stronger `Customer Signal` value if this signal raises it (per the option ladder in field_standards.md); an added `Source`; and an Insight line (description, link, impact 1 to 5) created as a native Insight on the idea with `node ${CLAUDE_PLUGIN_ROOT}/skills/jpd-loop/scripts/jpd-insight.mjs create` (see `${CLAUDE_PLUGIN_ROOT}/skills/jpd-loop/references/jpd-insights-api.md`; paste-ready hand-over as fallback). Show the idea and the proposed additions; apply on approval.
- **Related but distinct.** Create the new idea and propose a `Relates` link to the neighbour, so Steering sees the cluster.
- **Genuinely new.** Proceed to draft.

Never silently create a near-duplicate. When unsure, show the closest match and ask.

### 3. Draft the idea

Draft to the JPD Field Standards: a summary to the Title Standard (65-character cap, capability plus outcome), a Problem / Opportunity paragraph carrying the evidence and quote, a Hypothesis / Solution only as firm as the signal supports (a thin hypothesis is honest; an invented one is not), Success Metrics only if the signal implies them, and every required custom field proposed with a one-line rationale. Use the canonical labels. Set `Source` and `Customer Signal` from the actual evidence, not optimism.

Do not inflate: one loud customer is `One customer`, not `Churn risk`. The intake skill sets the evidence bar for everything downstream; overstating signal here corrupts prioritisation everywhere.

### 3a. Connect the customer

If the signal names a customer that has a Customer record in OHSI (issuetype `Customer`), propose a **`Discovery - Connected` issue link** between the record and the idea (new or existing) — that link is the system of record for customer↔idea connections. If the customer has no record, create one **only** if the account is recurring across ideas or strategically weighty (churn risk, flagship, migration anchor); one-off requesters stay as a cited quote on the idea. **Never add customer-name labels** — the link replaces that habit.

### 4. Present, then create on approval

Show the draft in the jpd-idea-groomer review shape (audit is trivial for a new idea; show summary options, description, and proposed fields). On explicit approval, create with `createJiraIssue` (project OHSI, type Idea) and set the custom fields in the same call where possible, or one `editJiraIssue` immediately after. Confirm with the new key and link.

### 5. Close the loop

Offer the natural next steps: `jpd-loop` to take the new idea through grooming, de-dupe confirmation, evidence, and the council; and a one-line reply the user can send back to whoever raised the signal ("logged, tracked as OHSI-xxx"), so the reporter learns their feedback landed. If the signal carries durable market or competitor knowledge beyond this one idea (a competitor named in a churn reason, a trend several customers reference), offer a Brain ingest per `${CLAUDE_PLUGIN_ROOT}/references/research-os.md` so it compounds instead of living only on the idea.

## Bulk sweeps

When asked to sweep a channel or queue: extract candidate signals first and present them as a table (signal, affected persona, closest existing idea, proposed action: attach / create / ignore) before touching Jira. Get one approval for the batch. Then process each row per the workflow above. Report a summary count at the end, including what was deliberately ignored and why.

## This skill must never

- Create an idea without showing the draft and getting approval.
- Fabricate a quote, a source, a link, or signal strength.
- Duplicate an existing idea it found in step 2.
- Groom beyond intake quality: deep grooming belongs to `jpd-idea-groomer` and the loop.

## Definition of done

- The signal is on the backlog exactly once: attached to an existing idea or created as a new one, with the evidence carried verbatim and cited.
- Fields set with canonical labels; signal strength matches the actual evidence.
- The user has the key, the link, and the reply line for the person who raised it.
