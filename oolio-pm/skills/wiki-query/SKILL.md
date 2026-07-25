---
name: wiki-query
description: Answer a question against the my_brain vault with citations to its pages, reading the domain README and Overview first to locate the right pages, then offering to file durable answers back as a synthesis so explorations compound. Trigger when the user asks something to be answered from the Brain, the vault, or the wiki — "ask the Brain…", "what does the vault say about…", "query the Brain", "according to the Brain…", "what do we know about a competitor, feature, or metric" — or asks an Oolio product, competitor, or capability question while working in the vault. Do NOT trigger to ingest a new source (use wiki-ingest), to health-check the vault (use wiki-lint), or to stand up a new domain (use wiki-new).
---

# Wiki Query

Answer from the accumulated vault, not from scratch. The whole point of the Brain is that the
synthesis already exists: find it and cite it.

## The law lives in the vault

Read `_system/operating-system.md §5` (Query) for the conventions and honour provenance: every claim
traces to a vault page, which cites its own source. The portable shape of the vault is in
`${CLAUDE_PLUGIN_ROOT}/references/vault-model.md`.

## Procedure

1. **Find the right pages.** Start at the owning domain's `README.md` (scope and where things live),
   then its `Overview.md` (the catalogue), then drill into the named pages. For a cross-cutting or
   "everything about X" question, start at the canonical entity page: competitors live in
   `30 Knowledge/Market/Competitors/`. For a broad search, grep the markdown by topic and title,
   never by folder path alone, so a page that has moved folders is still found.
2. **Synthesise the answer with citations.** Cite the pages you used as `[[Page Name]]`; those pages
   carry the source provenance. Surface any `> [!warning]` contradictions or vendor-stated / unverified
   caveats rather than presenting them as settled fact. A page past its `review:` date is stale: still
   readable, but flag that it needs re-verifying.
3. **Don't fabricate.** If the vault does not support an answer, say so plainly and offer a web search
   to fill the gap, and then to ingest the result (via `wiki-ingest`) so the gap closes permanently.
4. **Offer to file it back.** If the answer is durable (a comparison, an analysis, a discovered
   connection), offer to save it as a `Syntheses/` page in the owning domain (correct `type: synthesis`
   / `class: knowledge` frontmatter, citations, `updated:` today) and reflect it in that domain's
   `Overview.md`, so the exploration compounds instead of vanishing into chat.
5. **Heavier deliverables** (a deck, a chart, a table) go in that domain's `Outputs/`; still capture
   the insight as a page.
6. **Log it.** Append `## [YYYY-MM-DD] query | <question>` to the domain's optional `log.md` when the
   query produced a filed-back page or an output.

## Vault scope (the work/personal wall)

Answer work questions from the work layers only. Never read or surface `20 Areas/Personal`,
`10 Projects/Personal`, or any personal meeting or person page, and never fold personal content into a
work answer. Full rule: `${CLAUDE_PLUGIN_ROOT}/references/vault-model.md`.

## Done when

A cited answer grounded in vault pages, caveats and staleness surfaced, and, when the answer is
durable, an offer (or action) to file it back so the Brain gets richer.
