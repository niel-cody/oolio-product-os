---
name: gtm-playbooks
description: Build the three internal-facing GTM playbooks for a single Oolio product. Sales (discovery, demo, objections, pricing, close), Account Management (adoption signals, expansion, renewal, at-risk, QBR), and Onboarding (configuration, migration, training, go-live, first-week). Trigger PROACTIVELY when the user asks to "build the GTM playbooks for [product]", "do the sales playbook", "do the AM playbook", "do the onboarding playbook", "draft the playbooks for [product]", "build the rep enablement", or any combination of the three. Also trigger when the user pastes a Jira epic key (OR-XXXX, EDU-XXXX) and asks for sales / AM / onboarding enablement. Don't trigger for the executive One-Pager or Deck, use gtm-handover. Don't trigger for campaign material, use gtm-marketing. Reads pack_content.json produced by gtm-handover and refuses to run if that file is missing.
---

# GTM Playbooks

Produces the three internal-facing GTM playbooks for a single Oolio product. Sales, Account Management, and Onboarding. These are the artifacts the three teams that touch the product after handover actually use day to day.

This skill reads from the `pack_content.json` produced by `gtm-handover`. Run handover first. If the file is missing, this skill stops and tells you to run `gtm-handover` before continuing.

## Voice. Read this before writing anything.

Every word produced by this skill follows Niel's voice rules. Read `references/voice-rules.md` before drafting any content. The rules in short.

- No em dashes. No semicolons. Limit parentheses and colons.
- British English throughout. Optimise, prioritise, colour, behaviour, organise.
- No hedging. Cut "however", "it's worth noting", "I think", "we could potentially".
- No buzzwords. No leverage, synergy, game-changing, robust, seamless.
- Calm authority. Sound like someone who already did the work.
- Be specific or don't write it. Numbers beat adjectives. `[TBC]` is fine, "much faster" is not.

If a sentence sounds like marketing wrote it, rewrite it.

## How to use this skill

You start by naming the product. The skill assumes handover has already run.

1. **Confirm scope and pre-flight.** Skill checks for `Insights/Packs/[Product Name]/pack_content.json`. If missing, stop and tell the user to run `gtm-handover` first.
2. **Confirm which playbooks.** All three by default. User can pick a subset.
3. **Answer questions in three rounds.** One per playbook. Each takes 4 to 7 minutes.
4. **Review the drafts.** Files appear as `03_*`, `04_*`, `05_*` in the product folder.
5. **Hand over.** Skill stamps the version, updates README, drafts a Slack-ready announce message.

You can stop after any round and pick up later.

## What you produce

```
Insights/Packs/[Product Name]/
├── pack_content.json            (read from handover, this skill adds playbook keys)
├── 03_Sales_Playbook_v1.0.docx
├── 04_Account_Management_Playbook_v1.0.docx
├── 05_Onboarding_Playbook_v1.0.docx
└── README.md                    (appended)
```

This skill adds the `playbooks` block to `pack_content.json` (sales, account_management, onboarding subkeys). It does not modify keys owned by `gtm-handover` or `gtm-marketing`.

Versioning. Match the version of `pack_content.json` produced by handover. If handover is `v1.0`, all three playbooks ship as `v1.0`. Bump alongside handover when the narrative changes meaningfully.

## The workflow

Six phases. Walk them in order.

### Phase 1. Pre-flight

Check for `Insights/Packs/[Product Name]/pack_content.json`. Three outcomes.

- **Missing.** Stop. Tell the user "Run `gtm-handover` first. The handover writes the narrative and ICP this skill reads from." Do not scaffold.
- **Present, no playbooks block.** Treat as fresh playbooks build.
- **Present with playbooks block.** Treat as refresh. Diff what's there.

Exit when the file is present and you've decided fresh or refresh.

### Phase 2. Scope confirmation

Use `AskUserQuestion`.

- **Which playbooks?** All three (recommended), Sales only, AM only, Onboarding only, or any combination via multiSelect.
- **Mode**, fresh build or refresh.

Exit when the user has chosen.

### Phase 3. Ingest

Pull what's already known about how this product is sold, renewed, and rolled out, in this order.

1. **From `pack_content.json`.** The narrative, ICP, value prop, competitive, proof, and pricing summary are already there. Read them. Don't re-ask the user for any of it.
2. **Confluence.** Search the `PE` (GTM & Product Enablement) space and the relevant region space for existing battle cards, win/loss notes, AM playbooks, and onboarding runbooks for similar products. Use the Atlassian MCP.
3. **Jira.** Fetch the anchor epic and any linked stories. Capture rollout dependencies, training requirements, and known objections from comments.
4. **Local files.** List anything in `Insights/` mentioning this product, especially demo recordings, customer call transcripts, support tickets, or onboarding postmortems.

Write a short summary back to the user. "Here's what I have for each playbook from ingest. Before we polish, I need answers on [N] gaps per round."

Exit when the playbook keys in `pack_content.json` are either filled or marked `[GAP]`.

### Phase 4. Interview by playbook

Three rounds. Run only the ones the user picked in Phase 2.

1. **Sales Playbook.** Discovery questions, demo flow, objections, pricing posture, close motion.
2. **Account Management Playbook.** Adoption signals, expansion plays, renewal motion, at-risk indicators, QBR template.
3. **Onboarding Playbook.** Configuration steps, migration path, training plan, go-live checklist, first-week ops.

Mechanics that matter.

- Batch the questions. Use `AskUserQuestion` for choices. For open-ended detail, ask 2 to 4 prompts in a single message.
- Show what you already know first. "Here's what I have for the Sales playbook from ingest. Before we polish, I need answers on [N] gaps."
- Don't ask for content already in `pack_content.json` from handover. ICP, value prop, and competitive frame come from there.
- Save after every round.

Question scripts live in `references/interview-questions.md`.

Exit when the playbook keys for the chosen rounds have zero `[GAP]` markers, or every remaining gap is explicitly accepted as `[TBC]`.

### Phase 5. Build

Run the bundled build script.

```bash
node ../gtm-handover/scripts/build_pack.js "Insights/Packs/[Product Name]/pack_content.json"
```

Regenerates the chosen playbook files from the JSON. Idempotent. The script accepts a `--only sales,am,onboarding` flag if you only want to rebuild a subset.

Exit when the chosen files exist with the version number in their filename.

### Phase 6. Visual check and handover

Run `bash ../gtm-handover/scripts/preview_pack.sh "<pack folder>"` to convert each file to PDF and render JPEGs into `_preview/`. Use `Read` on at least page 1 of each.

Look for and fix.

- Text that overflows or wraps awkwardly.
- Empty or near-empty pages.
- Placeholder text that wasn't replaced. Square brackets that aren't `[TBC]`.
- Em dashes, semicolons, US spellings, or hedging that slipped through.
- Customer-facing language slipping into internal-only sections, or vice versa.

Then.

1. Append to `README.md` with playbook version, last reviewed date, owner names per playbook, a one-line summary per playbook of what changed.
2. Confirm version numbers match handover.
3. Write the announce message. Two to three sentences for Slack or email. Format.

   > **[Product] playbooks [vX.Y] are ready.** Sales, AM, and Onboarding playbooks at [folder link]. Owners [Sales lead], [CS lead], [Onboarding lead]. Reviewed by [GTM partner].

Exit when the user has the announce message and confirms done.

## Bundled resources

Read on demand, not upfront.

This skill shares its references and scripts with `gtm-handover` (the upstream skill in the same plugin); paths are relative to this skill folder.

- `../gtm-handover/references/voice-rules.md`. Authoritative voice and writing rules. Read before drafting any prose.
- `../gtm-handover/references/templates.md`. Catalogue of the artefact templates and which JSON path feeds which section.
- `../gtm-handover/references/interview-questions.md`. Full question scripts.
- `../gtm-handover/references/content-schema.md`. Shape of `pack_content.json`, including the sales / am / onboarding blocks this skill owns.
- `../gtm-handover/references/handover-checklist.md`. Final QA checklist for Phase 6.
- `../gtm-handover/scripts/build_pack.js`. The shared pack engine; regenerates every artefact in the pack folder, including the three playbooks (`build_pack.py` is the Python fallback).
- `../gtm-handover/scripts/preview_pack.sh`. Renders JPEG previews for visual QA.

## Conventions

- **Voice.** Niel's rules in `references/voice-rules.md`. Non-negotiable.
- **Brand colours.** Primary `#673AB6`, dark `#5E35B1`, light `#F9F8FC`. Hard-coded in the build script.
- **Internal framing where appropriate.** Playbooks are internal-only artifacts. Reps may quote sentences directly to customers, so any customer-facing line still passes the operator-framing test from handover.
- **Numbers beat adjectives.** "Cuts order entry time by 30%". If unknown, mark `[TBC]` and move on.
- **Only verified claims.** Every capability, performance, reliability or accessibility claim traces to Verified claims in the current QA market handoff (`${CLAUDE_PLUGIN_ROOT}/references/qa/market-handoff.md`), or to a cited source; every number too. Otherwise `[GAP]` or `[TBC]`. Known issues from the handoff go into support and onboarding material in customer language.
- **One playbook set per product, not per feature.**

## See also

- `gtm-handover`. Run before this skill. Produces the One-Pager, Deck, and the foundational keys in `pack_content.json` that this skill reads from.
- `gtm-marketing`. Run after this skill or in parallel. Produces the Marketing Pack. Reads handover keys plus its own.

## When this skill is the wrong tool

- The product narrative or ICP is not yet locked. Run `gtm-handover` first.
- Just updating the pricing line in the Sales Playbook. Edit the file directly or update `pack_content.json` and re-run with `--only sales`.
- Producing customer-facing launch comms. Use `gtm-marketing`.
- Drafting a single Confluence runbook. Use the Confluence MCP and a writing skill.
- Anything for a non-Oolio context. This skill assumes Oolio brand, templates, and segments.
