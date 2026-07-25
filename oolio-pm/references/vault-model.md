# The vault model — how my_brain is shaped

The portable summary of the vault these skills maintain. It exists so the five skills stay thin: the
procedure lives in each `SKILL.md`, the shape lives here, and the law lives in the vault itself.

## The law wins, always

The canonical rules are files **inside the vault**, not in this plugin. Read them first; they win
wherever this summary and they disagree, and they carry detail this file compresses:

- **`_system/operating-system.md`** — the knowledge engine: object model, detection, routing, operations, privacy. The librarian's manual.
- **`_system/Metadata Standard.md`** — the frontmatter contract: `type`, `class`, the universal field block, the graph colours.
- **`STRUCTURE.md`** — the folder rulebook and the work/personal wall.
- **`CLAUDE.md`** (vault root) — who Niel is, house style, the map.
- Each domain's **`README.md`** extends the engine with that domain's own scope and boundaries.

If a rule here ever conflicts with those, follow the vault and tell Niel. When you cannot open the
vault (a session with no access to it), this file is the fallback shape.

## What the vault is

One PARA-style Obsidian vault, git-backed as `niel-cody/my_brain`, opened at `~/my_brain`. It is the
convergence of three things into one store: the Foundry data model (typed, provenanced markdown), the
work knowledge engine, and Niel's personal brain. Not RAG: sources are read once, distilled, and
**integrated** into the wiki, so the synthesis already reflects everything read.

```
my_brain/
  CLAUDE.md · Home.md · STRUCTURE.md
  00 Inbox/            capture front door; the ingest drops "unsure, review me" items here
  01 Command Centre/   rollups: Open Actions, Open Decisions, Executive Asks, Gap Ledger
  02 Daily Briefs/     one brief per weekday                              [operator]
  10 Projects/         Oolio/ · Personal/   (each project links a Jira epic)
  20 Areas/            Oolio/ · Personal/   ongoing responsibilities
  30 Knowledge/        the knowledge engine
      Product Domains/ the eleven capability wikis (below)
      Market/          competitors (canonical) + the Oolio One platform view
  40 Meetings/  41 Decisions/  42 Actions/  50 People/  60 Templates/  70 Assets/  80 Archive/
  _system/             operating-system.md, Metadata Standard.md, Sources.md, Runbooks/, master, modes
```

**The eleven Product Domains:** Customer Engagement, Insights, Inventory, Menu and Pricing, POS,
Ordering, Back Office, Payments, Integrations, Legacy Migration, Platform Admin. (Reporting/analytics
lives in Insights; Loyalty lives inside Customer Engagement.)

## The knowledge structure (simplified, 2026-07)

The old model wrapped every page in `Wiki/` and split it into `Sources/Entities/Concepts/Syntheses`
folders. **That is retired.** The logic stays (typed, provenanced, integrated pages); the folders got
simpler. Two principles: front-matter carries the type, folders carry the human category; and no empty
scaffolding, a folder exists only when it holds a page.

A domain (a Product Domain or Market) looks like this. Only `README.md` is required; the rest appear
when there is something to put in them:

```
<Domain>/
  README.md      front door: scope, boundaries, where new things go. The domain's own manual.
  Overview.md    the start-here page: the distilled synthesis / catalogue of the domain
  Sources/       input documents and their provenance summaries (drop new source material here)
  <content>/     pages grouped by human category:
                   Market:         Competitors/  Syntheses/
                   Product domain: Capabilities/  Concepts/  Syntheses/
  Outputs/       generated deliverables (decks, charts, briefs); the insight also gets a page
  log.md         optional: append-only ingest/query/lint record
```

There are **no per-domain `CLAUDE.md` files** any more and no per-domain `index.md`: the domain
`README.md` is the front door, the `Overview.md` is the catalogue, and `_system/operating-system.md`
holds the rules once for the whole vault.

## Frontmatter — mandatory, `type` + `class`

Every markdown page carries YAML frontmatter. A page without it is invisible to retrieval. `type` is
the fine Foundry shape; `class` is the coarse graph colour that rolls up from it.

**Knowledge pages** (`30 Knowledge/`):

```yaml
type: source | entity | concept | synthesis | overview
class: knowledge
title: Canonical Page Name
tags: [domain/<domain>, <topic>]
created: YYYY-MM-DD
updated: YYYY-MM-DD
review: YYYY-MM-DD          # optional: when to re-check for staleness
sources: ["[[Source Summary Page]]"]
status: stub | active | stable
```

`type` → `class` rollup (write `class` explicitly; when the two disagree, `type` is the truth and
`class` is stale): `source|entity|concept|synthesis|overview` → `knowledge` · `area|runbook|template|manual`
→ `system` · `asset|output` → `asset` · `project` → `project` · `decision` → `decision` ·
`meeting|person|brief|log|index` → `record` (grey, uncoloured). Full contract and the universal block
(`priority`, `owner`, `review`, hub notes) are in `_system/Metadata Standard.md`.

## The non-negotiables

- **Provenance.** Every operational page names its `source`; every knowledge claim cites its source inline as `([[Source Page]])`. No orphan claims.
- **Supersession never deletes.** Replace a claim and move the old one to a dated history note on the same page; mark a superseded decision `superseded` and cross-link both. The archive is `80 Archive/`.
- **Contradictions are flagged, not overwritten.** Add a `> [!warning] Contradiction` callout naming both sources and their dates. Mark vendor-stated competitor claims unverified.
- **Filenames are `Title Case With Spaces.md`** and page titles are globally unique across the vault (disambiguate collisions, e.g. `Square (Competitor)`). Wikilinks `[[Page Name]]` resolve vault-wide and survive a page moving folders.

## Routing — where a thing goes

- **Capability knowledge** → its Product Domain (each domain's `README` defines scope and boundaries).
- **A competitor** → `30 Knowledge/Market/Competitors/` (one canonical page). Canonical in Market, contextual in the domain: the domain gets a competitive synthesis that links the canonical page, never a duplicate competitor page.
- **The platform view** → `Market/Oolio One.md`. **Market context** (segments, pricing norms, trends) → Market.
- **A source document** → the owning domain's `Sources/`.
- **Operational objects** (meetings, decisions, actions, people) → their layer (`40`–`50`, `41`, `42`), linked into the pages they touch. Actions are inline `- [ ]` checkboxes, not pages.
- **Ambiguous** → file in the most plausible home and flag it, or drop it in `00 Inbox/`. Wrong-but-visible beats silently-lost.

## The work/personal wall (hard privacy rule)

The vault holds Niel's personal life as well as work. Any skill run on the vault may read and write
**only the work layers**. NO-GO, always: `20 Areas/Personal`, `10 Projects/Personal`, and any personal
meeting or person page. Work signal only. No HR, compensation, performance, health, or personal
content, even when it appears in a source: skip it and do not summarise. Full boundary in
`STRUCTURE.md §4` and `operating-system.md §8`.

## Bookkeeping

- Bump `updated:` on every page you touch.
- Keep the domain `README`/`Overview` catalogue current as pages are added.
- Append to the domain's optional `log.md`: `## [YYYY-MM-DD] <op> | <subject>` plus 1 to 3 lines.
- Commit messages: `ingest: <source>` · `ingest: YYYY-MM-DD daily` · `lint: <scope>` · `query: <subject>` · `new: <Domain>`.
- Keep the tree clean: no `.DS_Store`, no stray files at layer roots, no v1/v2 duplicates, no empty folders.
- If a convention keeps causing friction, propose an edit to `_system/operating-system.md` (or the domain `README`) rather than working around it silently. Niel approves schema changes.
