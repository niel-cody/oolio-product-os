---
name: gtm-handover
description: Build the executive GTM handover for a single Oolio product. Two artifacts, the One-Pager and the Supporting Deck. This is the narrative source of truth that gtm-playbooks and gtm-marketing read from downstream. Trigger PROACTIVELY when the user asks to "build the GTM handover", "do the one-pager and deck for [product]", "draft the GTM narrative for [product]", "build the supporting deck", "write the product narrative", or pastes a Jira epic key (OR-XXXX, EDU-XXXX, etc.) and asks for the executive launch story. Also trigger when the user mentions the Oolio GTM Framework and wants the upstream artifacts only. Don't trigger for sales / AM / onboarding playbooks, use gtm-playbooks. Don't trigger for campaign material, use gtm-marketing. Don't trigger for a single tagline edit, edit the file directly.
---

# GTM Handover

Produces the two upstream GTM artifacts for a single Oolio product. The One-Pager and the Supporting Deck. These define the narrative, ICP, value proposition, competitive frame, proof, and how-to-buy. Every other GTM artifact downstream of this skill reads from the same `pack_content.json` it produces.

The skill takes you from "we have a product and some scattered collateral" to "the launch story is locked and the deck is ready to walk a customer through".

## Voice. Read this before writing anything.

Every word produced by this skill follows Niel's voice rules. Read `references/voice-rules.md` before drafting any content for the user, including interview questions and the announce message. The rules in short.

- No em dashes. No semicolons. Limit parentheses and colons.
- British English throughout. Optimise, prioritise, colour, behaviour, organise.
- No hedging. Cut "however", "it's worth noting", "I think", "we could potentially".
- No buzzwords. No leverage, synergy, game-changing, robust, seamless.
- Calm authority. Sound like someone who already did the work.
- Be specific or don't write it. Numbers beat adjectives. `[TBC]` is fine, "much faster" is not.

If a sentence sounds like marketing wrote it, rewrite it.

## How to use this skill

You start the skill by naming the product. From there.

1. **Confirm scope.** Which product, which Jira epic anchors it, version, fresh build or refresh.
2. **Drop in what you have.** Link Confluence pages, Jira epic keys, or save files into the Insights folder. The skill reads them and tells you what it found.
3. **Answer the deck round, then the one-pager round.** Two batched rounds. Each takes 5 to 8 minutes.
4. **Review the drafts.** Both files appear in `Insights/Packs/[Product Name]/`. Walk through each one.
5. **Hand over.** The skill stamps the version, sets the Last reviewed date, drafts a Slack-ready announce message, and tells you when to run gtm-playbooks and gtm-marketing.

You can stop after the deck round and pick up later. Content is stored in `pack_content.json` in the product folder, so it survives between sessions.

## What you produce

```
Insights/Packs/[Product Name]/
├── pack_content.json            (created here, read by all three GTM skills)
├── 01_One_Pager_v1.0.pptx
├── 02_Supporting_Deck_v1.0.pptx
└── README.md                    (created here, appended by sibling skills)
```

`pack_content.json` is the single source of truth across all three GTM skills. This skill writes the foundational keys (narrative, ICP, value prop, competitive, proof, pricing summary). gtm-playbooks and gtm-marketing read those keys and add their own.

Versioning. `v0.1` for first-draft pre-pilot work. `v1.0` for the first official version after pilot review. Bump by 0.1 for content refreshes within the same product version. Bump by 1.0 when the product itself ships a major change.

## The workflow

Six phases. Walk them in order.

### Phase 1. Scope confirmation

Use `AskUserQuestion` to confirm.

- **Product name** as it should appear in the pack. This becomes the folder name.
- **Anchor Jira epic** OR-XXXX or EDU-XXXX. Optional, strongly preferred.
- **Pack version**, v0.1 or v1.0.
- **Mode**, fresh build or refresh.

If refresh, look for an existing `Insights/Packs/[Product Name]/pack_content.json`. Load it and treat the interview as a delta pass.

Exit when the four answers are captured.

### Phase 2. Folder scaffold

Run the bundled scaffold script. This skill owns the scaffold because it runs first.

```bash
bash scripts/scaffold_pack.sh "[Product Name]" "[v1.0 or v0.1]"
```

Creates `Insights/Packs/[Product Name]/`, copies the One-Pager and Deck templates in renamed `01_*` and `02_*`, and seeds `pack_content.json` from `assets/pack_content.template.json` with the product name and version pre-filled.

If the templates folder is missing, stop and tell the user. Templates live at `Insights/Templates/` and are owned by the GTM Framework, not by this skill.

Exit when `pack_content.json` exists in the product folder with the metadata block populated.

### Phase 3. Ingest

Pull what's already known about this product, in this order.

1. **Confluence.** Search the `in` (Insights) and `PE` (GTM & Product Enablement) spaces for pages whose title contains the product name, or are referenced in the Jira epic. Read PRDs, narratives, competitor pages.
2. **Jira.** Fetch the anchor epic and any linked stories. Capture scope, owners, ICP cues, success metrics.
3. **Local files.** List everything in `Insights/` whose name mentions the product, was modified in the last 90 days, or is a screenshot, PDF, transcript, or PRD.
4. **The QA verdict.** If the epic has a QA Review page (a child of the PRD), read the market handoff of the **current** verdict only (`${CLAUDE_PLUGIN_ROOT}/references/qa/market-handoff.md`). If the newest verdict is Hold, pending, or newer than the handoff, treat every claim as unverified and say so. **Every capability, performance, reliability or accessibility claim in the pack must trace to a row in its Verified claims**, with its conditions; anything else is moved to `[GAP]` or cut. Its Known issues go into the playbooks' support and onboarding sections, in customer language. No QA verdict yet: say so in the summary, and mark proof claims as unverified.

Write a short summary back to the user. "Here's what I found, organised by what it'll feed."

Map every fact to a section of `pack_content.json`. Mark known sections, mark gaps. If you can write a draft from the ingested content, do it. Don't ask the user a question whose answer is already on a Confluence page you read.

Exit when every section in this skill's slice of `pack_content.json` is either filled or marked `[GAP]`.

### Phase 4. Interview

Two rounds, deck first.

1. **Supporting Deck.** Narrative, ICP, value prop, competitive, proof, how to buy, pricing summary. This is the upstream artifact. Get it right and the one-pager almost writes itself.
2. **One-Pager.** Four short blocks plus proof point. Mostly distilled from the deck. Confirm wording, don't reopen the question.

Mechanics that matter.

- Batch the questions. Use `AskUserQuestion` for choices. For open-ended narrative, ask 2 to 4 prompts in a single message.
- Show what you already know first. "Here's what I have for the Deck from ingest. Before we polish, I need answers on [N] gaps."
- Save after every round. Update `pack_content.json` immediately.

Question scripts live in `references/interview-questions.md`.

Exit when the deck and one-pager keys in `pack_content.json` have zero `[GAP]` markers, or every remaining gap is explicitly accepted as `[TBC]`.

### Phase 5. Build

Run the bundled build script.

```bash
node scripts/build_pack.js "Insights/Packs/[Product Name]/pack_content.json"
```

The shared pack engine regenerates every artefact in the folder from the JSON (One-Pager, Deck, and any playbook or marketing sections already filled). Idempotent. Run twice and you get identical output. `scripts/build_pack.py` is the Python equivalent if Node is unavailable.

Exit when both files exist with the version number in their filename.

### Phase 6. Visual check and handover

Run `scripts/preview_pack.sh "<pack folder>"` to convert each file to PDF and render JPEGs into `_preview/`. Use `Read` on at least the cover and one content page from each.

Look for and fix.

- Text that overflows or wraps awkwardly.
- Empty or near-empty pages.
- Placeholder text that wasn't replaced. Square brackets that aren't `[TBC]`.
- Em dashes, semicolons, US spellings, or hedging that slipped through.

Then.

1. Update `README.md` in the product folder with handover version, last reviewed date, owner names, a one-line summary of what changed.
2. Confirm version numbers match across both files and `pack_content.json`.
3. Write the announce message. Two to three sentences for Slack or email. Format.

   > **[Product] handover [vX.Y] is ready.** [One sentence on what's new.] One-pager and deck at [folder link]. Owner [PM]. Reviewed by [GTM partner]. Playbooks and marketing pack to follow.

4. Tell the user the next step. "Run `gtm-playbooks` next, then `gtm-marketing`. Both will read the same `pack_content.json`."

Exit when the user has the announce message and confirms done.

## Bundled resources

Read on demand, not upfront.

- `references/voice-rules.md`. Authoritative voice and writing rules. Read before drafting any prose.
- `references/templates.md`. Catalogue of the One-Pager and Deck templates and which JSON path feeds which section.
- `references/interview-questions.md`. Full question script for both rounds.
- `references/content-schema.md`. Shape of `pack_content.json` keys owned by this skill.
- `references/handover-checklist.md`. Final QA checklist for Phase 6.
- `assets/pack_content.template.json`. Empty starter JSON, copied into the product folder by scaffold.
- `scripts/scaffold_pack.sh`. Creates the product folder and copies the One-Pager and Deck templates.
- `scripts/build_pack.js`. The shared pack engine: reads `pack_content.json`, regenerates every artefact (`build_pack.py` is the Python fallback). `gtm-playbooks` and `gtm-marketing` call this same engine.
- `scripts/preview_pack.sh`. Renders JPEG previews for visual QA.
- `scripts/qa_check.py`. Objective QA pass over `pack_content.json` (gaps, voice slips, length limits).

## Conventions

- **Voice.** Niel's rules in `references/voice-rules.md`. Non-negotiable.
- **Brand colours.** Primary `#673AB6`, dark `#5E35B1`, light `#F9F8FC`. Hard-coded in the build script.
- **Operator framing, not internal product framing.** Every section reads as if a venue operator is the audience. If a Sales rep can't repeat a sentence to a customer, rewrite it.
- **Numbers beat adjectives, and every number traces to a verified claim or a cited source.** "Much faster" is wrong. "Cuts order entry time by 30%" is right only if a source says so; otherwise `[TBC]`.
- **One pack per product, not per feature.**

## See also

- `gtm-playbooks`. Run after handover. Produces the Sales, AM, and Onboarding playbooks. Reads `pack_content.json` for narrative, ICP, value prop, competitive, proof, pricing summary.
- `gtm-marketing`. Run after handover. Produces the Marketing Pack. Reads the same keys plus your launch date and channel mix.
- `qa-mission`. Runs before handover. Its market handoff is the list of what the pack may claim.

## When this skill is the wrong tool

- Updating just a tagline. Edit the One-Pager directly.
- Drafting a single Confluence page. Use the Confluence MCP and a writing skill.
- Producing slides for an internal review. Use the standard pptx skill.
- Building the Sales / AM / Onboarding playbooks. Use `gtm-playbooks`.
- Building launch comms. Use `gtm-marketing`.
- Anything for a non-Oolio context. This skill assumes Oolio brand, templates, and segments.
