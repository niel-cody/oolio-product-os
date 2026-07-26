# Oolio Product OS

The Product team's operating system for Cowork and Claude Code: the plugin collection (marketplace) that carries our skills. Other Oolio teams keep their own collections; this one belongs to Product. The human-readable front door is the **Product Operating System** page on Confluence; this repo is the source of truth it describes.

**The map:** [oolio-product-os.vercel.app](https://oolio-product-os.vercel.app) shows how the OS runs end to end, generated from the skills themselves. See [site/](site/).

## Plugins

- **oolio-pm** — the PM toolkit, signal to shipped: feedback intake into JPD, idea grooming, research and competitive intelligence, the Virtual Product Council, PRD writing and grilling, Jira hygiene, Steering packs, the GTM suite, and metrics review. Skill list and count in [oolio-pm/README.md](oolio-pm/README.md); the catalogue with stages in [docs/skills-catalogue.md](docs/skills-catalogue.md). Self-contained.

## Install (for Oolio teammates)

Install straight from the repo URL. You install once and get updates automatically, because the plugin is versioned by commit (no version numbers to chase). Use exactly one URL: **`oolio-group/oolio-product-os`**. The repo's earlier names (`oolio-pm-plugin`, `oolio-pm-plugins`) redirect here, but each name registers as a *separate* marketplace, so do not mix them: remove any old entry before adding this one.

**Claude Code (CLI):**

```
/plugin marketplace add oolio-group/oolio-product-os
/plugin install oolio-pm@oolio-product-os
```

**Team auto-install (settings.json).** Add this to your Claude Code settings and the plugin registers, enables, and **auto-updates** with no further steps:

```json
{
  "extraKnownMarketplaces": {
    "oolio-product-os": {
      "source": { "source": "github", "repo": "oolio-group/oolio-product-os" },
      "autoUpdate": true
    }
  },
  "enabledPlugins": { "oolio-pm@oolio-product-os": true }
}
```

**Cowork:** Settings → Plugins → Add plugin → GitHub, and enter `oolio-group/oolio-product-os`. Install **oolio-pm**. If Cowork serves an old version (a known backend cache issue in mid-2026), fall back to the release zip, see [PUBLISHING.md](PUBLISHING.md).

The skills then appear in your skill list (for example, ask "convene the VPC"). The current content is always whatever is on `main`; [CHANGELOG.md](CHANGELOG.md) records what changed.

## Layout

```
oolio-pm-plugins/           local folder name (historical); the GitHub repo is oolio-group/oolio-product-os
├── .claude-plugin/
│   └── marketplace.json    the marketplace manifest Cowork reads (must live here)
├── README.md
├── CHANGELOG.md            what changed in each version
├── CLAUDE.md               maintenance rules (commit-based versioning, log changes, archive)
├── PUBLISHING.md           how to edit, version, and publish (read this)
├── LICENSE                 usage terms (public repo, internal material)
├── site/                   the Product OS map: generated from the skills, published on Vercel
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

- This repository is intentionally **public** so teammates can install it without GitHub org access. It bundles Oolio-internal material (personas, context, strategy), so keep anything genuinely sensitive out of it.
- Must be hosted on github.com for Cowork to sync from it.
