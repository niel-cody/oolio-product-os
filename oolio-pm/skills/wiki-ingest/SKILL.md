---
name: wiki-ingest
description: Ingest a source into the my_brain vault — read it, distill it, and integrate it across the owning domain's Capability, Concept, Synthesis and Overview pages while writing a provenance-carrying source summary and updating the domain catalogue and log. Trigger when the user drops a file in a domain's Sources/ folder and says "ingest this", "add this to the Brain", "file this in the vault", or names a source to process. Routes to the correct Product Domain or the cross-cutting Market area, and handles competitor content via the canonical-in-Market rule. Do NOT trigger to answer a question (use wiki-query), to health-check the vault (use wiki-lint), or to stand up a new domain (use wiki-new).
---

# Wiki Ingest

Integrate one source into the vault so the knowledge compounds. This is NOT re-indexing: distill the
source once and weave it into the existing pages, so the synthesis already reflects it.

## The law lives in the vault

Before writing, read `_system/operating-system.md §5` (Ingest on demand), §3 (the object model and
frontmatter), and the target domain's `README.md` (scope, entity/concept types, boundaries). Those win
if this procedure conflicts with them; tell Niel when they do. Portable shape and the frontmatter
contract: `${CLAUDE_PLUGIN_ROOT}/references/vault-model.md`.

## Procedure

1. **Locate the source.** Usually a file the user just added to a domain's `Sources/` folder. If they
   pasted text or gave a URL, save it into the correct `Sources/` folder first as the source of record
   (preserve the original).
2. **Route to a domain.** Infer it from the domain `README` scopes: the eleven Product Domains
   (Customer Engagement, Insights, Inventory, Menu and Pricing, POS, Ordering, Back Office, Payments,
   Integrations, Legacy Migration, Platform Admin) or cross-cutting Market. If the domain is a stub
   with only a `README`, this first ingest also adds `Overview.md` and the content folders the material
   needs. If ambiguous, ask. A source may touch several domains: pick the primary, cross-link the rest.
3. **Read the source fully.** If it references images, read the text first, then view the key images.
4. **Surface takeaways FIRST.** Give Niel 2 to 5 dense bullets of what you will keep, and wait for a
   steer before writing. Do not skip this checkpoint unless told to batch.
5. **Write the source summary** in `<Domain>/Sources/<Source Title>.md` with `type: source`,
   `class: knowledge`, provenance (`source:` and the URL/date), key takeaways, entities touched,
   notable claims, and contradictions or open questions.
6. **Integrate across the domain.** Create or update every affected page: `Capabilities/`, `Concepts/`,
   `Syntheses/`, and `Overview.md`. A single source typically touches several pages. Add `[[wikilinks]]`
   generously and cite every claim inline as `([[Source Page]])`. Keep page titles globally unique.
7. **Handle competitors via Market.** Never create a competitor entity page inside a Product Domain.
   Update or create the canonical page in `Market/Competitors/<Name>.md`, then capture the
   domain-specific angle in `<Domain>/Syntheses/Competitive Positioning — <Domain>.md` linking the
   Market page. Mark vendor-stated competitor claims unverified.
8. **Flag contradictions, don't overwrite.** When a claim conflicts with an existing page, add a
   `> [!warning] Contradiction` callout naming both sources and dates, and reflect the tension in the
   synthesis. Supersede in place: move the old claim to a dated history note, never stack two unmarked.
9. **Update the catalogue.** Reflect new and changed pages in the domain's `Overview.md` (and `README`
   if the shape changed). Append `## [YYYY-MM-DD] ingest | <Source Title>` to the domain's `log.md`
   with 1 to 3 lines listing pages touched and any flags.
10. **Bump `updated:`** frontmatter on every page you changed, and set `class` to match `type` on any
    page you create. Use today's date (check via shell if unsure). Commit as `ingest: <Source Title>`.

## Operator guardrail block

- **Trigger** — on-demand (a source dropped in `Sources/`), or as the ingest step of a scheduled run.
- **Reads** — the named source, the target domain's pages, Market. Web search only to confirm a claim.
- **Vault scope** — writes the work layers of `30 Knowledge` only. `20 Areas/Personal` and
  `10 Projects/Personal` are NO-GO, always. No HR, compensation, performance, health, or personal
  content, even when present in a source: skip and do not summarise (`operating-system.md §8`).
- **Human-in-the-loop** — the step-4 takeaways checkpoint before writing, unless told to batch.
- **Escalation** — when routing is genuinely ambiguous, file to the most plausible domain and flag it,
  or drop a note in `00 Inbox/`, rather than guessing silently.

## Done when

The source is summarised with provenance, every affected page reflects it, competitors are canonical in
Market with a linking synthesis in the domain, contradictions are flagged not overwritten, and the
`Overview.md` and `log.md` are current. Report a short summary of pages touched and any flags.

## Notes

- Default to one source at a time with Niel in the loop. Batch only when asked, with lighter check-ins.
- If a recurring friction appears (a missing entity type, a fuzzy boundary), propose an edit to the
  domain `README` or `_system/operating-system.md` rather than working around it silently.
