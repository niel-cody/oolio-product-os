---
name: wiki-new
description: Stand up a new Product Domain (or a cross-cutting knowledge area) in the my_brain vault with a README-only front door and confirmed scope, following the simplified 2026-07 structure. Trigger when the user says "add a new domain", "create a Payments domain", "stand up a new wiki", "add a domain to the Brain", or names a capability area they want tracked separately. Confirms scope and boundaries before any material lands, and creates no empty scaffolding. Do NOT trigger to ingest a source into an existing domain (use wiki-ingest), to answer a question (use wiki-query), or to health-check the vault (use wiki-lint).
---

# Wiki New

Add a new domain consistently so it matches the rest of the vault. Do not guess the taxonomy: confirm
scope with Niel first. Create no empty folders, a stub domain is just a `README.md`.

## The law lives in the vault

Read `_system/operating-system.md §10` (Adding or simplifying a domain) and §2 (the knowledge
structure). Use an existing domain `README.md` (e.g. Insights or Market) as the structural template.
Portable shape: `${CLAUDE_PLUGIN_ROOT}/references/vault-model.md`.

## Procedure

1. **Confirm kind and scope.** Ask whether it is a **Product Domain** (a capability slice of Oolio
   One, living in `30 Knowledge/Product Domains/`) or a **cross-cutting** area (like Market). Confirm
   what belongs here and, explicitly, what belongs in sibling domains (draw the boundaries). Do not
   proceed until scope is clear. Reporting/analytics belongs in Insights; Loyalty inside Customer
   Engagement, so a new domain rarely overlaps those.
2. **Create the folder with a `README.md` only.** `30 Knowledge/Product Domains/<Domain>/README.md`
   (or the cross-cutting home). No `Sources/`, no content folders, no `Overview.md` yet: those appear
   on first ingest, when there is real material to hold. No empty scaffolding.
3. **Write the `README.md`** in the shape of the existing domain front doors: `type: overview`,
   `class: knowledge`, the universal frontmatter block, then Scope (belongs here / belongs elsewhere
   with boundaries), the competitors-canonical-in-Market note, the entity and concept types this
   domain will use, and a short "where new things go" section. Propose the entity/concept taxonomy and
   get Niel to confirm or adjust it.
4. **Wire it into the vault.** Add the domain to the map in `_system/operating-system.md §1` and to
   the domain list, and add boundary cross-links in any sibling `README` whose scope this one touches.
5. **Confirm before first ingest.** Summarise the new domain's scope and taxonomy and get a final OK.
   Competitors stay canonical in Market, never inside the new domain.

## Vault scope (the work/personal wall)

New domains are work knowledge only, created under `30 Knowledge`. This skill never touches
`20 Areas/Personal` or `10 Projects/Personal`.

## Done when

A new domain that is indistinguishable in structure from the existing ones (a single `README.md`
front door, no empty scaffolding), registered in `_system/operating-system.md`, with scope and taxonomy
confirmed by Niel.
