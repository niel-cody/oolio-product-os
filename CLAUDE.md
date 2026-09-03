# Maintaining oolio-product-os

Rules for anyone (human or AI) changing this repo. This is the **Oolio Product OS** (GitHub: `niel-cody/oolio-product-os`, private; moved there from `oolio-group` on 2026-07-30), the Product team's plugin collection for Cowork; its first plugin is **oolio-pm**. The plugin keeps its name through the repo rename on purpose: renaming it would break every installed `oolio-pm@…` reference and skill namespace for no user benefit. Read [README.md](README.md) for what it is and [PUBLISHING.md](PUBLISHING.md) for how it ships. House style everywhere: British English, no em dashes, no buzzwords.

## This repo is the single source of truth

All edits to the `oolio-pm` plugin — skills, personas, lenses, templates — are made **here**, in this repo, then shipped. This includes the persona library at `oolio-pm/personas-library/`, which is canonical. Do not edit the installed Cowork copy, and do not edit the older working copy at `~/Documents/Claude/personas/` (it is a legacy mirror; a change made there does not ship). If content needs to change, change it here and follow the four steps below.

## On every change — do all five, every time

1. **Make the change** under `oolio-pm/` (skills in `oolio-pm/skills/`, personas in `oolio-pm/personas-library/`, executables in the owning skill's `scripts/`). **Never add a directory at the plugin root that the plugins reference does not document** — a top-level `bin/` broke Cowork's marketplace sync outright on 2026-07-28, silently, while Claude Code kept working. Skill `description` fields have a **1024-character limit**; it is not enforced today but it is real, and the description is what routes a request to a skill, so trim prose rather than trigger phrases when one runs long.
2. **No version to bump.** The plugin is versioned by git commit: every push is automatically a new version, so edits reach the team without a bump. This is deliberate — there is **no `version` field** in `oolio-pm/.claude-plugin/plugin.json` or in the marketplace plugin entry. **Do not reintroduce one.** A plugin `version` pins the plugin, and Claude Code then serves updates only when the number changes, so a forgotten bump silently stops your edits from propagating (this was the old bug). The `metadata.version` at the top of `marketplace.json` versions the marketplace structure only; leave it unless a plugin is added, removed, or renamed.
3. **Add a CHANGELOG entry.** Update [CHANGELOG.md](CHANGELOG.md) with a new section for the version, newest first, saying what changed and why. This is not optional. A version bump without a changelog entry is an incomplete change.
4. **Mirror team-visible changes to the Product Operating System Confluence page.** The page (Niel's space, id `1175420929`, formerly titled "PM Skills") is the human-readable front door: it carries the skill count, the per-skill tables, and a plain-English "Skills changelog" section at the foot. When a change is team-visible — a new skill, a removed or renamed skill, a new capability, changed behaviour a user would notice — update the tables and add a dated entry to that section, written for a reader, not a maintainer (no file paths, no field IDs). Internal refactors, reference-file edits, and doc fixes do not need mirroring.
5. **Commit and push.** Both steps, so GitHub (and teammates' Cowork) actually get it.

## The brand is in `brand/`, and it is generated

Anything about how this looks or sounds is settled in [brand/](brand/README.md), not in the site. The mark, the palette, the three typefaces, the voice, and the tokens that produce `site/app/brand.css`.

- **Never edit `site/app/brand.css`.** Edit `brand/tokens/brand.tokens.json` and run `node brand/tokens/build.mjs`.
- `npm --prefix site run check` fails if the stylesheet has drifted from the tokens, **or if a retired colour is still in the site**. A stray old hex does not look broken, which is why it is a test rather than a habit.
- The palette has one rule worth knowing before you touch it: **gate amber means a person decides here.** It is for the review gates, the skills a person runs, and the primary call to action. Spending it on decoration spends the one thing the identity says.

## Archive, never delete

- When a skill, persona, lens, or template is superseded, **move it to `oolio-pm/_archive/`** rather than deleting it. Personas may also use the persona library's own `_archive/` per its `CLAUDE.md`.
- Record the move in `oolio-pm/_archive/README.md` with the date, the version, and what replaced it, and note it in the CHANGELOG.
- After archiving, **fix every reference** to the moved files so no live doc points at a dead path. Historical changelog entries are left as-is (they are a record of what was true then).

## The shared helper

`skills/jpd-loop/scripts/jpd-insight.mjs` writes and reads native JPD Insights over the Polaris GraphQL API. Five skills depend on it (`jpd-loop`, `signal-radar`, `add-insight`, `feedback-to-idea`, `discovery-wayfinder`), so treat it as load-bearing:

- **It needs credentials that are not in this repo and never should be**: an OAuth token at `~/.jpd-insights-token.json`, mode 600. A fresh machine needs a one-time `auth` run before any of those five skills can attach evidence. `.gitignore` guards against the file being committed; leave that guard in place.
- **It needs network access to `api-private.atlassian.com`**, which local sessions have and Anthropic's cloud sandbox does not. Skills fall back to Chrome automation there, by design.
- Usage, the schema traps, and the fallbacks live in `skills/jpd-loop/references/jpd-insights-api.md`. Change the helper and that file changes with it.
- Do not re-sync it from Atlassian's reference app; that sample's token refresh is broken.

## Keep it correct for sharing

- This repo is installed by teammates in Cowork. Before shipping, check the JSON is valid, the skill count in the README matches reality, and no documentation links are broken.
- Do not fabricate Oolio facts. If a fact is needed and is not already in the bundled `personas-library/_framework/oolio-context.md`, leave it out or flag it.
