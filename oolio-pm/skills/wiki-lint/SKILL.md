---
name: wiki-lint
description: Health-check the my_brain vault for contradictions, stale claims, orphan pages, missing cross-references, missing or wrong frontmatter (including missing class or a past review date), competitor-pattern violations, and data gaps. Trigger when the user says "lint", "lint the Brain", "lint Insights", "health-check the vault", "audit the Brain", or "check the vault for issues". Proposes fixes and new questions to investigate, changes only on approval, and logs the pass. Do NOT trigger for a quick overview snapshot (use wiki-status), to ingest a source (use wiki-ingest), or to answer a question (use wiki-query).
---

# Wiki Lint

Keep the vault healthy as it grows. Find problems, propose fixes, change nothing without approval.

## The law lives in the vault

Read `_system/operating-system.md §5` (Lint) and §3 (the object model), and `_system/Metadata
Standard.md §2` (the `type` → `class` rollup) before judging anything. Scope the lint to the domain(s)
Niel names; default to the whole of `30 Knowledge` if unspecified. Portable reference:
`${CLAUDE_PLUGIN_ROOT}/references/vault-model.md`.

## What to scan for

1. **Contradictions** — claims that conflict across pages, or a newer source that supersedes an older claim without a `> [!warning] Contradiction` callout.
2. **Stale claims** — facts a later source has overtaken (check `log.md` order and source dates), and any page past its `review:` date.
3. **Orphan pages** — pages with no inbound `[[wikilinks]]`. Find by listing titles never linked from another page.
4. **Missing concept pages** — themes recurring across several sources but lacking their own `Concepts/` page.
5. **Missing cross-references** — related pages that should link each other but don't; entity pages that don't cite their backing source.
6. **Competitor-pattern violations** — a competitor page living inside a Product Domain instead of canonically in `Market/Competitors/`; a domain synthesis that duplicates competitor facts instead of linking the Market page.
7. **Broken links and non-unique titles** — `[[wikilinks]]` with no matching page; duplicate titles that make vault-wide links ambiguous.
8. **Frontmatter hygiene** — pages missing `type`, `class`, `title`, `created`, `updated`, `status`, or (for knowledge) `sources`; a `class` that disagrees with `type` (`type` wins, `class` is stale); stale `updated:` dates; empty folders or pages with no frontmatter at all.
9. **Operational drift** — actions ticked in the source but still open in `42 Actions`/`Open Actions`; decisions that read as superseded but aren't marked.
10. **Data gaps** — open questions in source pages that a quick web search could close.

## Procedure

1. Build a picture of the target domain: read its `README` and `Overview`, then skim pages and
   `log.md`. Use shell tools for the mechanical checks (grep for `[[...]]` to find orphans and broken
   links, list titles for collisions, grep frontmatter for missing `class`/`type`).
2. Produce a findings report grouped by the categories above, each item naming the specific pages.
3. Propose concrete fixes, plus a short list of **new questions to investigate** and **sources to
   find**: the lint should generate forward work, not just cleanup.
4. Make only the changes Niel approves. Backfill `class` from `type` per the Metadata Standard, bump
   `updated:` on edited pages, and flag (not overwrite) contradictions.
5. Append `## [YYYY-MM-DD] lint | <scope>` to each affected `log.md` summarising what was found and
   fixed. Commit as `lint: <scope>`.

## Vault scope (the work/personal wall)

Lint the work layers only. `20 Areas/Personal`, `10 Projects/Personal`, and personal meeting/person
pages are NO-GO, always: do not scan, report, or touch them.

## Done when

A clear findings report delivered, approved fixes applied, `class` backfilled where missing, and the
pass logged. If a convention keeps causing problems, propose a schema edit to
`_system/operating-system.md` or the domain `README`.
