# Oolio Product OS

The Product team's operating system for Cowork and Claude Code: the plugin collection (marketplace) that carries our skills. Other Oolio teams keep their own collections; this one belongs to Product. The human-readable front door is the **Product Operating System** page on Confluence; this repo is the source of truth it describes.

**The site:** [oolio-product-os.vercel.app](https://oolio-product-os.vercel.app) is the front door: what the OS is, every skill, the lifecycle map, and the changelog. Generated from the skills themselves, so it cannot fall behind. See [site/](site/README.md).

**The brand:** [brand/](brand/README.md) holds the ink set, the typography, the mark and the voice. The house is **Pixie Dust Industries** and the product is the **Product OS**; the direction is Risograph, three ink drums on uncoated stock. It is the source rather than a description of one: `brand/tokens/brand.tokens.json` generates the site's stylesheet, and a build fails if the two disagree.

## Plugins

- **oolio-pm** — the PM toolkit, signal to shipped: feedback intake into JPD, idea grooming, research and competitive intelligence, the Virtual Product Council, PRD writing and grilling, Jira hygiene, Steering packs, the GTM suite, and metrics review. Skill list and count in [oolio-pm/README.md](oolio-pm/README.md); the catalogue with stages in [docs/skills-catalogue.md](docs/skills-catalogue.md). Self-contained.

## Install (for Oolio teammates)

The plugin is versioned by commit, so there are no version numbers to chase. Use exactly one URL: **`niel-cody/oolio-product-os`**. The repo's earlier locations and names (`oolio-group/oolio-product-os`, `oolio-pm-plugin`, `oolio-pm-plugins`) redirect here, but each registers as a *separate* marketplace, so do not mix them: remove any old entry before adding this one.

**The repo is private, so you need access before any of this works.** Ask Niel to add you as a collaborator on `niel-cody/oolio-product-os`, accept the GitHub invitation, and make sure the `gh` CLI or your Git credentials are signed in as that same GitHub account. Being in the `oolio-group` org no longer grants anything, because the repo no longer lives there.

**In Claude Code you install once and updates arrive on their own.** In Cowork, try the marketplace first and keep the zip as the fallback: its sync was broken by a packaging mistake on our side until 2026-07-28, and whether it can reach a private personal repo is untested. See [PUBLISHING.md](PUBLISHING.md) section D.

**Claude Code (CLI):**

```
/plugin marketplace add niel-cody/oolio-product-os
/plugin install oolio-pm@oolio-product-os
```

**Team auto-install (settings.json).** Add this to your Claude Code settings and the plugin registers, enables, and **auto-updates** with no further steps. `"autoUpdate": true` is not optional here: for a private marketplace it is off unless you switch it on.

```json
{
  "extraKnownMarketplaces": {
    "oolio-product-os": {
      "source": { "source": "github", "repo": "niel-cody/oolio-product-os" },
      "autoUpdate": true
    }
  },
  "enabledPlugins": { "oolio-pm@oolio-product-os": true }
}
```

**Cowork and Claude Desktop:** **Customize** in the left sidebar → **Plugins**. The GitHub marketplace path is worth trying; if it fails to sync, ask Niel for the current `oolio-pm.zip` and upload it there instead. The zip has no auto-update, so you re-upload on each change. Plugins you upload are stored locally on your own machine.

The skills then appear in your skill list (for example, ask "convene the VPC"). The current content is always whatever is on `main`; [CHANGELOG.md](CHANGELOG.md) records what changed.

## Layout

```
oolio-pm-plugins/           local folder name (historical); the GitHub repo is niel-cody/oolio-product-os
├── .claude-plugin/
│   └── marketplace.json    the marketplace manifest Cowork reads (must live here)
├── README.md
├── CHANGELOG.md            what changed in each version
├── CLAUDE.md               maintenance rules (commit-based versioning, log changes, archive)
├── PUBLISHING.md           how to edit, version, and publish (read this)
├── LICENSE                 usage terms (private repo, Oolio-internal material)
├── brand/                  the brand: the ink set, the mark, the voice, and the tokens the site is built from
├── site/                   the Product OS site: Next.js, generated from the skills, on Vercel
└── oolio-pm/               the plugin
    ├── .claude-plugin/plugin.json
    ├── personas-library/   bundled persona-library snapshot
    ├── products/           product context briefs (facts skills may rely on)
    ├── references/         shared references (house style, council output template)
    ├── _archive/           retired skills, lenses, and templates (kept for reference)
    └── skills/             the skills (count in oolio-pm/README.md)
```

## Updating

See **PUBLISHING.md** for the full step-by-step. In short: edit the skill under `oolio-pm/skills/`, add a **CHANGELOG.md** entry, then commit and push. There is no version to bump, every commit is a new version, so installs with auto-update pick the change up on their next session. Maintenance rules are in **CLAUDE.md**.

## Notes

- This repository is **private** (made private 2026-07-29, moved to `niel-cody` 2026-07-30). Access is per-person: Niel adds collaborators. It bundles Oolio-internal material (personas, context, strategy), so keep anything genuinely sensitive out of it even so.
- The repo is private but the site is not: Vercel serves a private repo to a public URL, so treat anything the site renders as published.
- Must be hosted on github.com for Cowork to sync from it.
