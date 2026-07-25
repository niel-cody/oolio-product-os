---
name: wiki-status
description: Produce a status snapshot of the my_brain vault — per-domain page counts by type, recent activity from the logs and git, stub domains, orphans, pages missing class or past their review date, and gaps worth filling. Trigger when the user says "Brain status", "vault status", "what's in the Brain", "show me the state of the vault", "what's been ingested lately", or wants an at-a-glance overview before deciding what to work on. Read-only. Do NOT trigger for a deep correctness pass (use wiki-lint), to ingest a source (use wiki-ingest), or to answer a question (use wiki-query).
---

# Wiki Status

Give a fast, accurate read on the state of the vault so Niel can decide where to spend effort.
Read-only by default: report, don't edit.

## Procedure

1. **Inventory each domain.** For every Product Domain and Market, note whether `README.md` and
   `Overview.md` exist and count pages by `type` (source, entity/capability, concept, synthesis).
   Shell tools are the fast path: list the domain folders, grep frontmatter `type:`. A domain with
   only a `README` is a stub.
2. **Recent activity.** Pull the last few entries from each `log.md` (`grep "^## \[" log.md | tail -5`)
   and, where useful, the recent vault commits (`git log --oneline -10`), to show what has been
   ingested, queried, or linted lately.
3. **Maturity and gaps.** Surface, concisely: pages with `status: stub`, pages flagged with open
   questions or `> [!warning]` callouts, pages missing `class` or past their `review:` date, domains
   that are still empty shells, and concepts mentioned across sources but lacking a page. This is a
   pointer to work, not a full lint.
4. **Present a compact snapshot.** A short per-domain table (counts + last activity) and a brief
   "suggested next moves" list (e.g. "Payments has no sources yet", "3 stubs in Market awaiting
   backfill", "the Toast page has an unverified claim to confirm").

## Vault scope

Report on the work layers of `30 Knowledge` only. Never inventory or surface `20 Areas/Personal`,
`10 Projects/Personal`, or any personal page. The vault shape and the full wall rule are in
`${CLAUDE_PLUGIN_ROOT}/references/vault-model.md`.

## Done when

A one-screen snapshot Niel can act on: what exists, what changed recently, and what is worth doing
next. Offer to kick off any suggested move (an ingest, a lint, a query) directly.

## Note

For a deep correctness pass (contradictions, broken links, stale claims, frontmatter backfill), use
**wiki-lint** instead. This skill is the quick overview.
