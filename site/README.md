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
npm --prefix site run check:public -- http://127.0.0.1:3000   # needs a running server
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
| `/admin` | Who may use the site, and as what. Admins only | the `members` table |
| `/app/today` | Flightdeck: the ranked day, one snapshot | `fixtures/<date>.json` |
| `/app/week` | Flightdeck: the live calendar and where the room is | Outlook, read on every request |

## The brand

Colour, type and the mark are not decided here. They live in [`brand/`](../brand/README.md) and
arrive as [`app/brand.css`](app/brand.css), which is **generated** from
`brand/tokens/brand.tokens.json`. `globals.css` holds no colours at all now: it maps the brand's
vocabulary onto the one shadcn's components expect, so a component gets the brand without being
rewritten and the brand can move without touching a component.

Editing `app/brand.css` by hand is caught by `npm run check`, as is leaving a retired colour
anywhere in this folder.

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
- `app/brand.css` drifting from the brand tokens, or a retired palette value still in the site
- the hand-written skill count drifting in `marketplace.json`, `plugin.json`, either README,
  the catalogue, or `pm-compass`, in digits or in words
- a Flightdeck snapshot or a calendar read sitting anywhere it could be committed. Both carry
  real names, meeting titles, email subjects and customer venues; git history is permanent

Worth wiring into a pre-push hook or CI.

## What `check:public` catches

A separate check, because it needs a running server rather than just the files. It fetches the
public landing page and fails if anything gated appears in it: a skill name or command outside the
five the boundary reveals, a trigger phrase, an exclusion, a system from the tools map, or a flow
step's label or description.

It exists because [`lib/landing-sky.ts`](lib/landing-sky.ts) leaked in a way no amount of reading
the page would have shown. Star nodes carried `node.id` to the browser purely as a React key, and a
node id is the skill's name with hyphens in it, so all thirty-two shipped in the page source while
the rendered page displayed none of them. Reviewing the component would not have caught it; grepping
the rendered HTML did. So the test is the rendered HTML.

```bash
npm --prefix site run build
npx --prefix site next start -p 3111 &
npm --prefix site run check:public -- http://127.0.0.1:3111
```

Run it after any change to what `lib/landing-sky.ts` returns, or to what the landing page renders.

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
| `GRAPH_TENANT_ID`, `GRAPH_CLIENT_ID`, `GRAPH_CLIENT_SECRET`, `GRAPH_REFRESH_TOKEN` | The live calendar. Absent, `/app/week` falls back to the cache and says so |
| `FLIGHTDECK_TIMEZONE` | Optional; defaults to `Australia/Melbourne` |

Leave Vercel's **Sensitive** toggle **off** on the Supabase and allowlist variables. Sensitive
variables cannot be used in the Development environment, and none of those is a secret. The four
`GRAPH_*` values **are** secrets and should be marked Sensitive.

### Who may sign in, and as what

Access moved out of the environment on 2026-09-01. It used to be `FLIGHTDECK_ALLOWED_EMAILS`,
which meant granting somebody access was a Vercel edit and a redeploy, and there was nowhere to
record what they were allowed to do beyond in or out. It is now the `members` table in Supabase,
managed at [`/admin`](app/admin/page.tsx).

**Access is the presence of a row.** No row is no access, an empty table locks everybody out
rather than letting everybody in, and a failed lookup is treated as "no" rather than "yes". That
was the one property of the env allowlist worth keeping, and it is the one most easily lost.

| Role | Can reach |
|---|---|
| `viewer` | `/map`, `/skills`, `/changelog`, `/systems`, `/about` |
| `user` | the above, plus `/app/*` — Flightdeck and, later, their own integrations |
| `admin` | the above, plus `/admin` |

Roles are a Postgres enum declared weakest-first, so `role >= 'user'` is the ladder and cannot
be got backwards. [`lib/routes.ts`](lib/routes.ts) is the only table mapping paths to roles; the
gate, the navigation and the pages all read it, so a link can never appear that bounces.

Three things the database enforces, rather than the app:

- **RLS** lets you read your own row and admins read everyone. Only admins may write.
- **At least one admin must remain.** A deferred constraint trigger refuses the update or
  delete that would leave none, because demoting the last admin is one click with no undo from
  inside the app.
- **`last_seen_at` is written by a definer function**, not a plain update. RLS cannot restrict
  which columns a policy covers, so an "update your own row" policy would let anybody set their
  own role.

Add people before they first sign in: rows are keyed by email, and the Supabase account only
exists once they follow their first magic link, at which point a trigger links the two.

### Where the calendar comes from

`/app/week` recomputes availability on every request. It takes the diary from the first of
three sources that answers, and the page badge always says which one did:

| Badge | Source | Freshness | Needs |
|---|---|---|---|
| **LIVE** | Microsoft Graph, read per request | seconds | the Entra registration |
| **SYNCED** | the Supabase store | as good as the collector's last run | a Mac running the scheduled task |
| **CACHED** | `.calendar/events.json` | whenever it was last written | nothing |

That order **is** the switching mechanism. Today Graph is unconfigured, so the site runs on
the store; the day the four `GRAPH_*` variables are set it starts reading Outlook directly on
the next request, with no code change and nothing to redeploy but the environment. A source
that errors, or that nothing has ever written to, is skipped rather than allowed to render a
confidently empty week.

**The store is Supabase**, not Vercel Blob. It already exists and already holds the auth, so
this is one system rather than two; a calendar is a range query (`what overlaps Tuesday`)
rather than a blob to download and filter; row-level security scopes rows to the signed-in
person for free; and keeping the runs means the page can say how old the diary is. This
amends prerequisite 3 of the V1 scope doc, which predates the choice of Supabase for auth.

Two tables, `calendar_events` and `calendar_syncs`. Reads go through RLS on the signed-in
address; there are no write policies at all, so only the collector's service-role key can
change the calendar and a leaked publishable key cannot.

### The collector

Until Graph access exists, the only thing that can see the diary is a Claude session with the
Microsoft connector. So the collector is one: a scheduled task at
`~/.claude/scheduled-tasks/flightdeck-calendar-sync/`, running 07:12, 12:12 and 16:12 on
weekdays, which reads the next fortnight and pipes it into the sync script.

```
node scripts/calendar-sync.mjs --from 2026-08-03 --to 2026-08-17 --owner niel.cody@oolio.com < events.json
```

The script writes the local cache always, and Supabase when
`~/.flightdeck-collector.env` holds a service-role key. It upserts by Outlook occurrence id,
then deletes anything in the queried window it did not see this run — otherwise a cancelled
meeting stays on the page forever and the availability underneath it stays hidden.

Scheduled tasks run while the app is open, so on a laptop the diary is as fresh as the last
time you had it running; a Mac mini would make that continuous. Neither Supabase's `pg_cron`
nor Vercel Cron can do this job, because neither can reach the Microsoft connector — they
become useful only once Graph credentials exist, at which point a Vercel Cron hitting a
refresh route is the natural replacement for the Mac.

## House rules

The web app lives entirely in this folder. `oolio-pm/` never gets a `package.json`, and
`scripts/package-plugin.sh` only zips the plugin's contents, so teammates installing the plugin
never see any of this.

The map's drawing code in [`lib/map-engine.js`](lib/map-engine.js) is deliberately imperative SVG
rather than React components. It was carried over unchanged from the original single-page version,
and rewriting it is how a design people like quietly drifts.
