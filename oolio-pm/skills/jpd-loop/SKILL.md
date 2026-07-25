---
name: jpd-loop
description: >-
  Run the Virtual Product Council grooming loop over a SINGLE Jira Product
  Discovery idea, end to end. Trigger when the user gives a JPD/Jira key
  (e.g. OHSI-123) and asks to "run the jpd loop", "groom and review this idea",
  "VPC this idea", "run the council on this idea", "pressure-test this JPD idea",
  or "take this idea through the loop". Grooms the idea, de-dupes and links it
  against the whole backlog, gathers cited evidence (Atlassian, web, HubSpot,
  Slack, Microsoft 365/Teams, Figma) and builds validation Insights, convenes
  the VPC, iterates to a verdict, takes a human sign-off, then writes the result
  back to JPD and moves the idea to Decision. Manual, human-gated (Phase 1).
  Do NOT trigger for non-JPD work, PRD/Figma reviews (use convene-vpc), or bulk runs.
version: 0.3.0
---

# jpd-loop — manual VPC grooming loop for one JPD idea

## What this is
The Phase-1, manually-triggered orchestrator that takes ONE Jira Product Discovery idea through the full Virtual Product Council loop, validates it with cited evidence, and writes the result back to Jira. It composes existing skills (`jpd-idea-groomer`, `convene-vpc` and its sub-councils) and adds the JPD wrapper, evidence/Insights, the loop control, and the write-back.

Operating principle: **nothing is final until a human validates it.** This skill proposes; the human disposes. It never moves status, records a Kill, or merges a duplicate without explicit sign-off. **Every claim is cited** — uncited assertions don't drive the verdict.

A second operating principle, equally hard: **the tooling stays invisible to the reporter.** The idea Description block and the reporter comment must read as ordinary product-team work. "VPC", "council", "jpd-loop", "AI", and model names are confined to the internal DISC decision-record page.

## Input
A single JPD/Jira key, e.g. `OHSI-612`. If none is given, ask for one. One idea per run.

## Required connectors & tools
The loop gathers evidence from across the stack. Have these connected; if one is missing, note the gap and continue with what's available. Detail and usage in `references/evidence-sources.md`.

- **Atlassian** (Jira + Confluence) — the idea, the backlog, PRDs/specs, decision records, personas.
- **Web search + web browsing** — `WebSearch` to find, `web_fetch` / Chrome tools to read. Competitors, market, analysts, reviews.
- **HubSpot** — CRM signals: deal blockers, churn/retention, customer requests, pipeline impact.
- **Slack** and **Microsoft 365 / Teams** — internal discussion, Outlook/SharePoint docs, strategy material.
- **Figma** — existing designs/flows/prototypes the idea touches.
- **The Brain** (the `my_brain` vault, via `oolio-pm:wiki-query`) — our own product/competitor/market knowledge.
- **Page ↔ idea linking:** the Atlassian connector exposes no create-remote-link tool, and the JPD idea Links panel is not API-writable. To associate the DISC page natively, the human pastes the page URL into the idea's Links panel in the JPD UI. The loop should state this as a hand-over step, not attempt it via API.

## Environment (Oolio)
- cloudId `98b2c73a-4f2e-4b23-aca7-dbc5b45b1e24`; project **OHSI — Oolio One Ideas** (`10052`); idea type `10071`.
- Loop inbox/outbox statuses: `Exploring` → `Decision`. Post-Decision exit mapping (human executes): Proceed → `Ready for delivery` (lowercase d) · Park → `Not Now` + set Revisit on (`customfield_11811`) · Kill → `Rejected` · Duplicate → link + archive.
- Field IDs and option IDs: see `references/field-map.md`. Skills: `jpd-idea-groomer`, `convene-vpc`.

## Guardrails (Phase 1 defaults)
- **Iteration cap = 3** groom→council passes, then escalate.
- **No-progress stop** — two passes with no material change → escalate.
- **Kill needs sign-off** — every verdict, including Kill, is proposed; never autonomous.
- **Budget** — keep within a sensible time/token budget; if exceeded, escalate (`Budget`).

## Procedure

### 0. Load & scope-guard
`getJiraIssue` the key. If it is **not in `Exploring`**, stop and say so. If `VPC Reviewed = 1`, confirm before re-running. Set `VPC Loop State = Grooming`, increment `VPC Iterations`. (`VPC Last Run` is not API-writable in this instance — leave it unset and note the gap; see `references/field-map.md`.)

### 1. Groom
Run `jpd-idea-groomer` to bring the idea to the JPD Field Standards (problem, hypothesis, success metrics, required fields). Programmatic gate: must be field-complete before the council runs.

### 2. Match & de-dupe (state `De-duping`)
Search the **entire** backlog (all statuses) via `searchJiraIssuesUsingJql` + semantic match on problem/persona/area — always with the two mandatory guards from the groomer's field_standards.md (`issuetype = Idea` + the live archived filter), or the sweep is polluted by Customer records and archived ideas. Set `Dedupe Status` and create native issue links (`Relates`/`Duplicate`/`Blocks`). True duplicate → propose link + escalate, set `Halted — duplicate`, stop. Match further along the workflow → likely redundant, escalate, stop. Never merge yourself.

### 3. Gather evidence & build Insights (state `In Council`)
**Consume before gathering:** query Brain for competitor dossiers (`competitor-watch`), gap-ledger entries, and any existing `signal-radar` Insight list on this problem — evidence already gathered and cited is used as-is, not re-researched; only the gaps get fresh passes. Then gather evidence **for and against** the idea using the connectors and web — internal first (the Brain, Confluence, Slack, HubSpot, M365), then external (web/competitors). For each strong item draft an **Insight**: one-line description + **real source URL** + **impact 1–5**. Keep a balanced set. Full method, rubric, and the brand/competitor wiki list are in `references/insights-and-citations.md` and `references/evidence-sources.md`. Never fabricate a link.

### 4. Convene the council
Invoke `convene-vpc`, passing the de-dupe links and the Insights as evidence. Phase 1 runs in-model; follow the protocol (independent opinions → anonymized cross-review & rank → Chairman synthesis) and score the rubric: Desirability, Feasibility, Viability, Strategic Fit (1–5). Each sub-council returns **key decisions only** (1–3 DECIDED/UNDECIDED items, each with a one-line *why*) per the convene-vpc recording contract — not a full persona/lens transcript.
> Cross-model review is deferred to Phase 3; until then the human sign-off (step 6) is the independent check.

### 5. Synthesise & verdict gate (judge)
Set `VPC Verdict`, the four rubric ratings, and `VPC Confidence`. **Proceed** → sign-off. **Park** → iterate (step 1) if under cap and progressing, else escalate (`Max iterations`/`No progress`). **Kill** → propose, do not record.

### 6. Human sign-off (state `Awaiting sign-off`)
Present a concise summary: verdict, rubric, top objections, the Insight list, links, and proposed action. Capture the decision in `Sign-off Status` + `Sign-off Owner`. Approved Proceed → step 7. Approved Kill → set Kill/`Killed`, write back, `VPC Reviewed = 1`, do not move to Decision. Changes requested → iterate or escalate. Rejected → stop, leave a note.

### 7. Write back & hand over
1. **Append a neutral Discovery Review to the idea Description** (append-only, below existing
   content). This block is reporter-visible, so it MUST be tool-neutral: no "VPC",
   "council", "jpd-loop", "AI", or model wording. Use the neutral header/labels from
   field-map.md ("Discovery Review", "Direction", "Assessment"). Do NOT link the DISC
   "VPC Decision Record" page from this block (its title exposes the tooling). Include:
   direction, the four-dimension assessment, recommendation, open questions, de-dupe, and
   the cited evidence list (description · source · impact).
2. **Create the DISC decision-record page** (canonical, internal). Title format:
   `KEY - <summary> | VPC Decision Record`. Live page, status **Ready for Review**, never
   Verified. The page MAY use full VPC/council framing (it is internal). It must contain:
   - a **Decisions** section built with the Confluence **decision component**
     (`<ul data-type="decision-list"><li data-type="decision-item" data-state="DECIDED|UNDECIDED">`),
     one item per key council decision with a one-line *why* — key decisions only, no
     persona-by-persona transcript;
   - the rubric (with why), de-dupe, a balanced evidence table referencing sources by number,
     and a mandatory **References** section listing every source URL in full.
3. **Create the native Insights on the idea** (description · link · impact each). Native
   creation IS now supported — see `references/jpd-insights-api.md` for the two routes
   (Polaris GraphQL API when network + creds allow; Chrome UI automation from cloud
   sessions). Only if both routes are unavailable, fall back to handing the human a
   paste-ready native-Insight list.
4. **Notify the reporter** (see Step 7a).
5. Set `VPC Loop State = Done (Decision)`, `VPC Reviewed = 1`, then move `Exploring → Decision`.
6. **If a matching delivery epic already exists** (found during evidence/de-dupe), offer to create the `Polaris work item link` (implements) idea → epic via `createIssueLink` — the delivery-link standard applies from `Ready for delivery` onward, and creating it now saves the Stage-6 backfill a row.

**If a write-back step fails partway.** The five outputs above are ordered so the most important land first. If a step fails (a write is rejected, a page create errors, a field is not writable), do not unwind what already succeeded and do not silently skip the rest: complete the remaining steps that can still run, then report exactly which steps landed and which did not, with the error, so the human can finish by hand. Never leave the run looking complete when it is partial, and never retry a failed write blind; re-check the payload (labels, formats) against `references/field-map.md` first.

### 7a. Reporter update (on Proceed/approved)
Add a Jira comment on the idea that @mentions the reporter, written in **product-team
voice**. Hard rule: it must read as work done and researched by the real product team and
MUST NOT reference VPC, councils, jpd-loop, AI, or any model. Do not link the
"VPC Decision Record" page. State: the outcome, how it fits the backlog, the open questions
before build, and an ask for a customer/venue example to attach as signal. Keep it short.
Skip this step on Park/Kill/escalation unless the human asks for it.

## State & log
Per idea, keep a `state.json` (step, decisions, iterations, blockers) and append a `run-log.md` (each pass, what changed, the verdict and evidence trail). Verbose detail lives here, not in JPD fields.

## Confluence convention
Always create a **live page**; set it to **Ready for Review** on completion; **never** set **Verified** (human-only). Append-only. Discovery records live in **DISC**.

## This skill must NEVER
- Move status, record a Kill, archive, or merge a duplicate without explicit human sign-off.
- Overwrite or delete existing idea Description content — the Discovery Review is appended **below** it.
- Expose tooling to the reporter: never let "VPC", "council", "jpd-loop", "AI", or model
  names appear in the idea Description block or in the reporter comment. That framing is
  confined to the internal DISC page.
- Link the "VPC Decision Record" page from a reporter-visible surface (idea Description or
  reporter comment).
- Set a Confluence page to `Verified`.
- Fabricate, guess, or omit a source link — every Insight cites a real URL.
- Act on an idea not in `Exploring`; loop past the cap (3) or a no-progress stop.
- Decide the go/no-go in `Decision` — that is the human product team's call.

## Definition of done for a run
Idea groomed to standard; de-dupe run and linked; a balanced set of cited Insights gathered; council returned a verdict with rubric scores and rationale; guardrails respected; human signed off; on Proceed the idea is in `Decision` with fields populated, the neutral Discovery Review appended to the Description, the DISC page created (`… | VPC Decision Record`, decision component + References), the reporter notified in product-team voice, and the native-Insight list handed to the human. Otherwise the idea is left in a clear state with `Escalation Reason` set.

## References (read on demand)
- `references/field-map.md` — field IDs, option IDs, neutral Description append format.
- `references/evidence-sources.md` — connectors, internal wikis, brand/competitor wiki list, search method.
- `references/insights-and-citations.md` — what a JPD Insight is, impact rubric, recording method, citation rules.
