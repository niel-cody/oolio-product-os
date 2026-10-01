---
name: gtm-marketing
description: Build the Marketing Pack for a single Oolio product launch. Launch announcement, social posts, email sequence, sales note, and campaign brief. Trigger PROACTIVELY when the user asks to "build the marketing pack", "draft launch comms for [product]", "do the campaign brief for [product]", "write the launch announcement", "build the social posts for [product]", "draft the email sequence for [product]", or "build the marketing assets". Also trigger when the user pastes a Jira epic key (OR-XXXX, EDU-XXXX) and asks for launch / campaign / customer comms material. Don't trigger for the executive One-Pager or Deck, use gtm-handover. Don't trigger for sales / AM / onboarding playbooks, use gtm-playbooks. Reads pack_content.json produced by gtm-handover and refuses to run if that file is missing.
---

# GTM Marketing

Produces the Marketing Pack for a single Oolio product launch. One artifact, five sections inside it. Launch announcement, social posts, email sequence, sales note, campaign brief.

This skill reads from the `pack_content.json` produced by `gtm-handover`. Run handover first. If the file is missing, this skill stops and tells you to run `gtm-handover` before continuing.

## Voice. Read this before writing anything.

Every word produced by this skill follows Niel's voice rules. Read `references/voice-rules.md` before drafting any content. The rules in short.

- No em dashes. No semicolons. Limit parentheses and colons.
- British English throughout. Optimise, prioritise, colour, behaviour, organise.
- No hedging. Cut "however", "it's worth noting", "I think", "we could potentially".
- No buzzwords. No leverage, synergy, game-changing, robust, seamless.
- Calm authority. Sound like someone who already did the work.
- Be specific or don't write it. Numbers beat adjectives. `[TBC]` is fine, "much faster" is not.

Marketing copy is the most likely place these rules slip. Hold the line.

## How to use this skill

You start by naming the product. The skill assumes handover has already run.

1. **Confirm scope and pre-flight.** Skill checks for `Insights/Packs/[Product Name]/pack_content.json`. If missing, stop and tell the user to run `gtm-handover` first.
2. **Confirm launch shape.** Date, channels, audience cuts, regional variants.
3. **Answer questions in one batched round.** Roughly 6 to 10 minutes for all five sections.
4. **Review the draft.** File appears as `06_Marketing_Pack_v1.0.docx` in the product folder.
5. **Hand over.** Skill stamps the version, updates README, drafts a Slack-ready announce message.

You can stop after Phase 4 and pick up later.

## What you produce

```
Insights/Packs/[Product Name]/
├── pack_content.json            (read from handover, this skill adds marketing keys)
├── 06_Marketing_Pack_v1.0.docx
└── README.md                    (appended)
```

This skill adds the `marketing` block to `pack_content.json` (announcement, social, email_sequence, sales_note, campaign_brief subkeys). It does not modify keys owned by `gtm-handover` or `gtm-playbooks`.

Versioning. Match the version of `pack_content.json` produced by handover. If handover is `v1.0`, marketing ships as `v1.0`. Bump alongside handover when the narrative changes meaningfully. The Marketing Pack also has a `launch_date` field, which floats independently and gets updated each time the campaign reruns.

## The workflow

Six phases. Walk them in order.

### Phase 1. Pre-flight

Check for `Insights/Packs/[Product Name]/pack_content.json`. Three outcomes.

- **Missing.** Stop. Tell the user "Run `gtm-handover` first. The handover writes the narrative this skill reads from." Do not scaffold.
- **Present, no marketing block.** Treat as fresh marketing build.
- **Present with marketing block.** Treat as refresh. Diff what's there.

Exit when the file is present and you've decided fresh or refresh.

### Phase 2. Launch scope

Use `AskUserQuestion`.

- **Launch date.** YYYY-MM-DD or "TBC".
- **Channels.** Email, in-app, social, blog, sales outreach. multiSelect.
- **Audience cuts.** All customers, ICP segment only, region-specific, beta cohort. multiSelect.
- **Regional variants.** AU, US, EU, APAC, none. multiSelect.

Exit when launch shape is captured.

### Phase 3. Ingest

Pull what's already known about the launch and recent campaigns, in this order.

1. **From `pack_content.json`.** Narrative, ICP, value prop, proof, pricing summary. Already there. Don't re-ask.
2. **Confluence.** Search `PE` and the marketing space for prior launch announcements, brand voice notes, and recent campaign briefs. Use the Atlassian MCP.
3. **Jira.** Fetch the anchor epic and any linked stories. Capture launch-blocking dependencies and sign-off requirements.
4. **Local files.** List anything in `Insights/` mentioning this product, especially launch decks, hero imagery, customer quotes, and screen recordings.

Write a short summary back to the user. "Here's what I have for each marketing section from ingest. Before we draft, I need answers on [N] gaps."

Exit when the marketing keys in `pack_content.json` are either filled or marked `[GAP]`.

### Phase 4. Interview

One batched round, five sections.

1. **Launch announcement.** 150 to 200 words, ready for blog or in-product banner.
2. **Social posts.** Three short posts. LinkedIn, X, Instagram. Same message, native to each.
3. **Email sequence.** Three emails over two weeks. Tease, launch, follow-up.
4. **Sales note.** Short brief Sales sends to existing accounts in scope.
5. **Campaign brief.** Internal one-pager for the marketing team. Audience, message, channels, metrics, owner.

Mechanics that matter.

- Batch the questions. Use `AskUserQuestion` for choices like channel mix and tone. For copy direction, ask 2 to 4 prompts in a single message.
- Show what you already know first. Lead with what's already in `pack_content.json`. Don't re-litigate the value prop.
- Save after every section.

Question scripts live in `references/interview-questions.md`.

Exit when the marketing keys have zero `[GAP]` markers, or every remaining gap is explicitly accepted as `[TBC]`.

### Phase 5. Build

Run the bundled build script.

```bash
node ../gtm-handover/scripts/build_pack.js "Insights/Packs/[Product Name]/pack_content.json"
```

Regenerates `06_Marketing_Pack_v[X.Y].docx` from the JSON. Idempotent.

Exit when the file exists with the version number in its filename.

### Phase 6. Visual check and handover

Run `bash ../gtm-handover/scripts/preview_pack.sh "<pack folder>"` to convert the file to PDF and render JPEGs into `_preview/`. Use `Read` on at least page 1 and the social posts page.

Look for and fix.

- Text that overflows or wraps awkwardly.
- Empty or near-empty pages.
- Placeholder text that wasn't replaced. Square brackets that aren't `[TBC]`.
- Em dashes, semicolons, US spellings, or hedging that slipped through. The launch announcement is the highest-risk section.
- Social post character counts. LinkedIn 3000 max, X 280 max, Instagram 2200 max. Flag any that bust.
- Regional spelling drift. AU and EU are British English, US copy is the only place American spellings appear. Flag mismatches.

Then.

1. Append to `README.md` with marketing version, launch date, owner names, a one-line summary of what changed.
2. Confirm the version matches handover.
3. Write the announce message. Two to three sentences for Slack or email. Format.

   > **[Product] marketing pack [vX.Y] is ready.** Launching [date] across [channels]. Pack at [folder link]. Owner [Marketing lead]. Reviewed by [GTM partner].

Exit when the user has the announce message and confirms done.

## Bundled resources

Read on demand, not upfront.

This skill shares its references and scripts with `gtm-handover` (the upstream skill in the same plugin); paths are relative to this skill folder.

- `../gtm-handover/references/voice-rules.md`. Authoritative voice and writing rules. Read before drafting any prose.
- `../gtm-handover/references/templates.md`. Catalogue of the artefact templates and which JSON path feeds which section.
- `../gtm-handover/references/interview-questions.md`. Full question script.
- `../gtm-handover/references/content-schema.md`. Shape of `pack_content.json`, including the `marketing` block this skill owns.
- `../gtm-handover/references/handover-checklist.md`. Final QA checklist for Phase 6.
- `../gtm-handover/scripts/build_pack.js`. The shared pack engine; regenerates every artefact in the pack folder, including `06_Marketing_Pack` (`build_pack.py` is the Python fallback).
- `../gtm-handover/scripts/preview_pack.sh`. Renders JPEG previews for visual QA.

## Conventions

- **Voice.** Niel's rules in `references/voice-rules.md`. Non-negotiable.
- **Brand colours.** Primary `#673AB6`, dark `#5E35B1`, light `#F9F8FC`. Hard-coded in the build script.
- **Operator framing.** Marketing copy is the most public artifact. Every line reads as if a venue operator is the audience.
- **Numbers beat adjectives.** Especially in social posts. "Cuts order entry time by 30%" beats "much faster", and is also more shareable.
- **Only verified claims.** Every capability, performance, reliability or accessibility claim traces to Verified claims in the current QA market handoff (`${CLAUDE_PLUGIN_ROOT}/references/qa/market-handoff.md`), or to a cited source; every number too. Otherwise `[GAP]` or `[TBC]`. Known issues from the handoff go into support and onboarding material in customer language.
- **One pack per product, not per feature.**

## See also

- `gtm-handover`. Run before this skill. Produces the One-Pager, Deck, and the foundational keys in `pack_content.json` that this skill reads from.
- `gtm-playbooks`. Can run before, after, or in parallel with this skill. Produces Sales / AM / Onboarding playbooks for the same product.

## When this skill is the wrong tool

- The product narrative or ICP is not yet locked. Run `gtm-handover` first.
- Just rewriting the LinkedIn post. Edit `pack_content.json` directly and re-run the build.
- A standalone blog post unrelated to a product launch. Use a writing skill.
- Producing internal enablement. Use `gtm-playbooks`.
- Anything for a non-Oolio context. This skill assumes Oolio brand, templates, and segments.
