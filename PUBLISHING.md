# Publishing the Oolio PM plugin — step by step

The whole workflow for editing the **oolio-pm** plugin and getting a new version to your team. You do not need to write code.

GitHub repo (the home of this collection): **`oolio-group/oolio-product-os`** (public). Use exactly that URL everywhere. The repo's earlier names (`oolio-pm-plugin`, `oolio-pm-plugins`) redirect here but each registers as a *separate* marketplace, so never mix them.

> **How distribution works.** The plugin is versioned **by git commit** — there are no version numbers in the manifests, on purpose. Every push to `main` is a new version. Anyone installed from the repo URL with auto-update on gets your change on their next session, with nothing to bump and nothing to re-download by hand. This is the officially recommended setup for an actively-edited internal plugin.

---

## A. One-time setup

### A1. The repo is already published

`oolio-group/oolio-product-os` is live and public, so teammates can install without GitHub org access. Nothing to do here unless you are moving the repo.

### A2. Teammates install once (either surface)

**Claude Code (CLI):**

```
/plugin marketplace add oolio-group/oolio-product-os
/plugin install oolio-pm@oolio-product-os
```

**Or, for auto-registration and auto-updates**, add this to Claude Code `settings.json`:

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

`"autoUpdate": true` matters: for private marketplaces auto-update is **off** unless you switch it on, which is why updates felt stuck before.

**Cowork and Claude Desktop:** **Customize** in the left sidebar → **Plugins** → Browse plugins, or upload a plugin file directly. Read section D before choosing: in Cowork the zip upload is the working path, not the marketplace.

---

## B. Each time you ship a change (repeat this)

### Step 1 — Edit the content
Tell me what to change, e.g. *"Edit the jpd-loop skill in oolio-pm: change X."* I edit the real file under `oolio-pm/skills/…`.

### Step 2 — Add a CHANGELOG entry
Ask me to log it. I add a dated entry to [CHANGELOG.md](CHANGELOG.md), newest first, saying what changed and why. **There is no version number to bump** — commit-based versioning handles that. (Do not add a `version` field back to the manifests; it would re-break update propagation. See [CLAUDE.md](CLAUDE.md).)

### Step 3 — Commit and push
Ask me to *"ship it"* (I commit and push), or use GitHub Desktop: type a summary, **Commit to main**, **Push origin**.

That's it. On the next session, everyone on auto-update has the change. No release, no zip, no announcement needed.

---

## C. How anyone installs or updates it

- **Install:** section A2.
- **Update:** automatic if you added the settings snippet with `"autoUpdate": true`. To force it now: `/plugin update oolio-pm@oolio-product-os` (CLI), or in Cowork re-open the plugin and update.

---

## D. Cowork note and the zip fallback

Cowork is a separate surface from Claude Code, and its marketplace sync **freezes per slug**: once a slug stops updating it does not recover, and re-adding the same slug inherits the freeze. This is Anthropic-side and there is nothing to fix in this repo.

**This is now observed, not suspected.** Three slugs have frozen: `oolio-pm-plugin`, `oolio-pm-plugins`, and (on 2026-07-28) `oolio-product-os`, the last with a valid newer commit sitting on `main` and the UI reporting "Failed to update marketplace". The plugin content was verified clean at the time: valid manifests, 32 skills parsing, no symlinks, 1.4 MB. Do not spend time debugging this again.

**So in Cowork, the zip is the path, not the fallback:**
1. Ask me to *"cut the release zip."* I run `scripts/package-plugin.sh` (it builds `dist/oolio-pm.zip` with the plugin root at the archive root).
2. Cowork → **Customize** (left sidebar) → **Plugins** → remove the existing entry under Local uploads, then add the zip. Removing first matters: uploading over a registration whose sync is already stuck is how slugs get burnt.
3. Re-uploading a newer zip replaces the old version. This path has no auto-update, so you re-upload on each change.

Claude Code is unaffected and does auto-update properly. Keep using the marketplace path there.

---

## Notes

- GitHub access is set up on Niel's Mac (`gh` authenticated), so Cowork/Claude Code can commit and push directly when asked. GitHub Desktop is the buttons-only alternative. Do not run both on the same change.
- The repo is intentionally **public** so teammates install without org access. It bundles Oolio-internal material, so keep anything genuinely sensitive out of it.
