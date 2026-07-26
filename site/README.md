# The skills map

The visual front door to the Product OS: every skill in `oolio-pm/skills/`, where it sits in the
lifecycle, what feeds what, and the curated end-to-end flows. Published on Vercel, rebuilt on every
push, so the map is a **view of the skills**, not a second thing to keep in step with them.

```bash
node site/build.mjs          # write site/dist/index.html
node site/build.mjs --check  # validate only; non-zero exit if the map has drifted
```

Zero dependencies, deliberately. This stays a markdown repo with a build script in it, not a web
project. Open `site/dist/index.html` in a browser to preview.

## The two inputs

**`oolio-pm/skills/`** is the source of truth for everything derivable: which skills exist, what
each one is called, and its real `description` (which becomes the hover tooltip on its node). None
of that is repeated anywhere else, so it cannot drift.

**`map.config.json`** is the editorial overlay, and only holds judgement calls: which lifecycle
column a skill belongs to, who runs it, what it feeds, the review gates, the loops, and the flows
in the sidebar. Those are authored, not derived. Skill frontmatter stays lean, per
[`references/skill-standard.md`](../oolio-pm/references/skill-standard.md).

## Adding a skill

Add it to `oolio-pm/skills/` as usual. Nothing else is required for it to appear: the generator
discovers it and renders it in a red **⚠ Unplaced** column, so a new skill is never silently
missing from the map. Then give it an entry in `map.config.json` to place it properly:

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

## What `--check` catches

It fails, rather than quietly producing a map that looks fine but lies:

- a skill with no overlay entry, or an overlay entry whose skill folder is gone
- a `feeds`, gate, loop or flow step pointing at something that is not on the map
- a flow whose consecutive steps have no connection to draw, so the path would render with
  invisible gaps
- the hand-written skill count drifting in `marketplace.json`, `plugin.json`, either README,
  the catalogue, or `pm-compass`, in digits or in words

Worth wiring into a pre-push hook or CI once the map is live.
