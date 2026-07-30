# The Product OS site

Live at **[oolio-product-os.vercel.app](https://oolio-product-os.vercel.app)**.

The front door to the **Oolio Product OS**: what it is, every skill it ships, how the work moves
end to end, and what changed. A Next.js app, rebuilt on every push, so the site is a **view of the
OS** rather than a second thing to keep in step with it.

```bash
npm --prefix site install
npm --prefix site run dev      # http://localhost:3000
npm --prefix site run check    # validate only; non-zero exit if the site has drifted
npm --prefix site run build
```

`dev` and `build` regenerate the data first, so the site cannot render a stale view of the repo.

## The pages

| Page | What it is | Where it comes from |
|---|---|---|
| `/` | What the OS is and who it is for, and how to install it | `map.config.json` under `about` |
| `/map` | The lifecycle map: skills, gates, loops, flows | the skills, plus the editorial overlay |
| `/skills` | Every skill, grouped by lifecycle stage, searchable | the skills themselves |
| `/changelog` | What changed, newest first | `CHANGELOG.md` at the repo root |
| `/systems` | How the tools connect. Not built yet | placeholder |

## The two inputs

**The marketplace and its plugins** are the source of truth for everything derivable: which plugins
exist, which skills they ship, and each skill's real `description` (which becomes the hover tooltip
on its node and the summary on the Skills page). None of that is repeated anywhere, so it cannot
drift. `oolio-pm` is the first plugin, not the only one: add a second to `marketplace.json` and its
skills appear here on the next build.

**`map.config.json`** is the editorial overlay, and holds only judgement calls: which lifecycle
column a skill belongs to, who runs it, what it feeds, the review gates, the loops, the flows in the
sidebar, and the About copy. Skill frontmatter stays lean, per
[`references/skill-standard.md`](../oolio-pm/references/skill-standard.md).

## Adding a skill

Add it to a plugin's `skills/` folder as usual. Nothing else is required for it to appear: the
generator discovers it and renders it in a red **⚠ Unplaced** column, so a new skill is never
silently missing. Then give it an entry in `map.config.json` to place it properly:

```json
"my-new-skill": {
  "label": "My New Skill", "note": "what it does, in five words",
  "badge": "CLAUDE·JIRA", "type": "ai", "stage": "Grooming", "row": 2,
  "feeds": ["write-prd", { "to": "jpd-loop", "label": "optional wire label" }]
}
```

`stage` is one of the column names at the top of the config. `row` is the vertical slot in that
column, and may be fractional to pack a crowded column (the Brain column uses 0.8 steps).
`type` is `ai`, `orch`, `human`, `signal` or `output`, which sets the colour and the legend entry.

## What `check` catches

It fails, rather than quietly producing a site that looks fine but lies:

- a skill with no overlay entry, or an overlay entry whose skill no longer exists
- two plugins shipping the same skill id, which the map cannot disambiguate
- a `feeds`, gate, loop or flow step pointing at something that is not on the map
- a flow whose consecutive steps have no connection to draw, so the path would render with
  invisible gaps
- a per-skill `version` field, which the skill standard forbids
- the hand-written skill count drifting in `marketplace.json`, `plugin.json`, either README,
  the catalogue, or `pm-compass`, in digits or in words

Worth wiring into a pre-push hook or CI.

## Deploying

Vercel, from this repo, **on every push to `main`**. The Git integration was connected on
2026-07-31, once the repo moved to Niel's account and he could grant the Vercel GitHub App himself.
Before that the project was CLI-upload only and pushes never reached the live URL, which is why the
site sat four days stale without anyone noticing. There is no deploy workflow in `.github/`; if you
find one, it is a leftover and Git integration supersedes it.

Two project settings matter:

- **Root Directory** = `site`. Leaving it empty does not fail loudly: Vercel builds from the repo
  root, finds no `package.json`, emits an empty deployment in under a second, and reports it
  **READY**. Every route then 404s on a green deploy. This happened on the first git-triggered
  build, 2026-07-31.
- **Include source files outside of the Root Directory** = **on**, because the generator reads the
  plugins, the marketplace manifest and `CHANGELOG.md`, all of which live a level up. With it off
  the build fails immediately and says so, rather than shipping a site with no skills on it.
- **Skip deployments when there are no changes to the root directory or its dependencies** =
  **off**. Vercel switches this on by itself the moment Root Directory gets a value, and here it is
  wrong: the build's inputs deliberately live *outside* the root, so a commit touching only
  `CHANGELOG.md` or a skill under `oolio-pm/` would be skipped and the published site would quietly
  keep serving the old content. It also fails confusingly, looking like a hung deploy rather than a
  skipped one. Every push builds; that is the intent, not an oversight.

### Environment variables

Flightdeck (`/app/*`) reads these at runtime, so a deploy without them builds green and then throws
on every dashboard request. Set in Vercel under Settings → Environment Variables, for all three
environments. Template in [`.env.example`](.env.example).

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public by design |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public by design; **not** the service-role key, which this app never uses |
| `FLIGHTDECK_ALLOWED_EMAILS` | Who may sign in. Empty denies everyone, deliberately |
| `FLIGHTDECK_ALLOWED_DOMAINS` | Optional; defaults to `oolio.com` |

Leave Vercel's **Sensitive** toggle **off** on these. Sensitive variables cannot be used in the
Development environment, and none of these is a secret.

Supabase must also know where to send people back to: **Authentication → URL Configuration**, Site
URL `https://oolio-product-os.vercel.app` plus that origin's `/auth/callback` in Redirect URLs. A new
Supabase project defaults its Site URL to localhost, so magic links from production go nowhere until
this is changed.

## House rules

The web app lives entirely in this folder. `oolio-pm/` never gets a `package.json`, and
`scripts/package-plugin.sh` only zips the plugin's contents, so teammates installing the plugin
never see any of this.

The map's drawing code in [`lib/map-engine.js`](lib/map-engine.js) is deliberately imperative SVG
rather than React components. It was carried over unchanged from the original single-page version,
and rewriting it is how a design people like quietly drifts.
