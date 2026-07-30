# Publishing the Oolio PM plugin — step by step

The whole workflow for editing the **oolio-pm** plugin and getting a new version to your team. You do not need to write code.

GitHub repo (the home of this collection): **`niel-cody/oolio-product-os`** (private). Use exactly that URL everywhere. The repo's earlier locations and names (`oolio-group/oolio-product-os`, `oolio-pm-plugin`, `oolio-pm-plugins`) redirect here but each registers as a *separate* marketplace, so never mix them.

> **How distribution works.** The plugin is versioned **by git commit** — there are no version numbers in the manifests, on purpose. Every push to `main` is a new version. Anyone installed from the repo URL with auto-update on gets your change on their next session, with nothing to bump and nothing to re-download by hand. This is the officially recommended setup for an actively-edited internal plugin.

---

## A. One-time setup

### A1. Give the teammate access first

`niel-cody/oolio-product-os` is **private**, and it sits in Niel's personal account rather than the `oolio-group` org, so org membership grants nothing. Every step below fails with a sync or clone error until the person has been added.

For each teammate: GitHub → the repo → **Settings → Collaborators → Add people** → their GitHub account → **Read** is enough. They then accept the emailed invitation. Check they are signed in to `gh` (or their Git credential helper) as that same GitHub account, not a different one, or the marketplace add still fails.

Removing someone is the same screen, and it takes their install offline on their next update.

### A2. Teammates install once (either surface)

**Claude Code (CLI):**

```
/plugin marketplace add niel-cody/oolio-product-os
/plugin install oolio-pm@oolio-product-os
```

**Or, for auto-registration and auto-updates**, add this to Claude Code `settings.json`:

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

`"autoUpdate": true` matters: for private marketplaces auto-update is **off** unless you switch it on, which is why updates felt stuck before. This marketplace is private, so it applies to everyone.

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

## D. Cowork, and the zip

**History, so nobody re-debugs it.** Cowork's "Marketplace sync failed. Check the repository URL and try again." cost most of a day and produced three wrong theories in a row: a per-slug cache freeze, an org-ownership problem, and a missing GitHub App. All three were wrong. On **2026-07-28** a four-tree bisect found the real cause: a `bin/` directory at the plugin root, which is not a documented plugin location. Moving the helper into `skills/jpd-loop/scripts/` fixed the sync, and the same commit that had failed then synced. See the CHANGELOG entry for that date and the rule now in [CLAUDE.md](CLAUDE.md) step 1.

**So the marketplace path in Cowork is not known-broken any more.** Earlier versions of this section said it was; that was written before the bisect and was wrong.

**What is untested is whether Cowork can sync this repo now that it is private and personal.** That is a genuinely open question, not a known failure: Cowork needs credentials that reach `niel-cody/oolio-product-os`, and we have not confirmed it has them. Try the marketplace path first. If it fails, do not start debugging the manifest, and above all do not go looking for another `bin/`-style cause: check the access question first, then fall back to the zip.

**The zip, which always works:**
1. Ask me to *"cut the release zip."* I run `scripts/package-plugin.sh` (it builds `dist/oolio-pm.zip` with the plugin root at the archive root). Since the repo went private, **GitHub Release assets are no longer anonymously downloadable** — a teammate needs collaborator access to fetch one, so hand the file over directly if they do not have it.
2. Cowork → **Customize** (left sidebar) → **Plugins** → remove the existing entry under Local uploads, then add the zip. Removing first matters: uploading over a registration whose sync is already stuck is how slugs get burnt.
3. Re-uploading a newer zip replaces the old version. This path has no auto-update, so you re-upload on each change.

Claude Code is unaffected throughout and auto-updates properly. Keep using the marketplace path there.

---

## Notes

- GitHub access is set up on Niel's Mac (`gh` authenticated), so Cowork/Claude Code can commit and push directly when asked. GitHub Desktop is the buttons-only alternative. Do not run both on the same change.
- The repo is **private** and lives in Niel's personal account. Access is per-person collaborator invites (section A1), not org membership. It bundles Oolio-internal material, so keep anything genuinely sensitive out of it even so.
- **The site is still public.** Vercel serves this private repo to `oolio-product-os.vercel.app`, so anything the generator renders is published to the open web regardless of the repo's visibility.
- **GitHub App installations scoped to "public repositories only" lost access** when the repo went private, and again on the move to a personal account. If an integration stops firing, re-grant it against `niel-cody/oolio-product-os` rather than debugging the workflow.
