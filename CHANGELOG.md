# Changelog

All notable changes to the **oolio-pm** plugin, newest first. The plugin is versioned **by git commit** (there is no `version` field in the manifests, by design), so new entries are dated rather than numbered. Every change updates this file (see [CLAUDE.md](CLAUDE.md)). Entries below that carry version numbers are the historical record from before the switch.

## 2026-07-27 — The systems map: how data moves between the tools (32 skills)

The Systems page has been a placeholder since the site became an app. It is now the second real map, and it answers a different question from the first. The lifecycle map shows how the **work** moves, skill to skill. This one shows what it moves **through**: thirteen systems, eighteen flows between them, and six routes you can trace end to end.

- **A different shape on purpose.** Signal enters on the left (Granola, Slack, Microsoft 365, HubSpot, Apify, the open web, PostHog, Figma), everything crosses through the Product OS in the middle, work lands in the systems of record on the right (JPD, Jira, Confluence, GitHub), and the Brain runs underneath the whole thing as the floor rather than a peer. The layout enforces the rule that matters: nothing on the left ever touches anything on the right directly. Every wire goes through the middle, which is what stops thirteen tools becoming thirteen conventions.
- **Click anything.** A system opens a panel giving its cadence, whether we only read it or read and write it, exactly what we read and what we write, and every skill that touches it. A route traces its path across the map with the steps written out beside it, the same interaction the lifecycle map already uses.
- **The skill-to-system links are derived, not drawn.** `generate.mjs` now reads everything each skill says, its `SKILL.md` and its reference files, and matches it against per-system patterns. Confluence reading "22 skills" is counted, not typed, so a new skill that talks to HubSpot raises HubSpot's number on the next build with nobody remembering to edit anything. Granola and GitHub honestly read "INGEST": no skill names them, because the nightly ingest and the vault's autosync move them.
- **The judgement calls sit in `site/systems.config.json`**, the same split the lifecycle map uses. Cadence and scope are taken from the Brain's `_system/Sources.md`, which is the actual ingestion contract, rather than from memory. Nothing on the page is a guess about how we work.
- **`--check` grew again**: a route step with no wire to draw, a wire naming a system that does not exist, a band that is not a declared kind, and a match pattern that no skill mentions are all now build-time problems. The last one is a warning rather than a failure, because a renamed tool and a typo look identical from here.
- The paths list and step rows moved from the lifecycle map's stylesheet into `globals.css`, since two pages now share them.

## 2026-07-26 — The map becomes an app: navigation, skills index, changelog (32 skills)

A single page could carry the map and nothing else. Everything a newcomer actually needs around it — what this is, what every skill does, what changed, how the tools connect — had nowhere to live. So the site is now a real app with navigation, built on Next.js, Tailwind and shadcn, and fully responsive. The zero-dependency rule that was right for one static page was the wrong rule for this, and was dropped deliberately rather than defended.

- **Five pages, and three of them are pure renders of data we already generate.** Home is the About copy as a landing page, closing on "Learn it once.", plus how to install the plugin. The Map is unchanged. Skills is every skill grouped by lifecycle stage and searchable, which is `docs/skills-catalogue.md` finally maintaining itself. Changelog renders this file, so shipping a skill updates the site. Systems is a placeholder for the connectors map.
- **The map was ported, not rewritten.** Its SVG drawing code moved wholesale into `site/lib/map-engine.js` and still runs imperatively inside a component, because reimplementing it as React components is how a design people like quietly drifts. The palette became the app's theme tokens, so shadcn inherits the existing design instead of imposing its own, and the app uses the map's own typefaces.
- **Marketplace-shaped, not oolio-pm-shaped.** The generator now reads `marketplace.json` and walks every plugin it lists. `oolio-pm` is the first plugin rather than the only one: a second team's plugin appears on the site automatically, with its skills flagged as unplaced until someone maps them. Two plugins shipping the same skill id is now a drift failure.
- **Responsive, including the map.** The map is 2,760px wide because that width is what makes it legible, so small screens get the real map plus pinch-zoom and drag rather than a shrunken useless one, opening zoomed to the first stage. A phone in landscape is close to the map's own aspect ratio, so landscape gets the full screen. Navigation collapses to a sheet.
- **`--check` grew with the site**: it now also catches two plugins claiming one skill id, and fails the build with an explicit message if it cannot see the repo from `site/`, which is the shape a misconfigured Vercel root directory takes.
- **The plugin is untouched.** All web machinery lives in `site/`. `oolio-pm/` has no `package.json`, and `scripts/package-plugin.sh` only zips the plugin's contents, so teammates installing it never see any of this. The old single-page template is archived, not deleted, in `site/_archive/`.
- Known and not fixed: `npm audit` reports 12 high findings in `site/`, all one advisory (`brace-expansion`) reachable only through ESLint's own dependencies. It is dev-only lint tooling, never shipped to the browser, and the only clean fix is ESLint 10, which `eslint-config-next` does not support yet. Pinning it forward was tried and breaks ESLint outright.

## 2026-07-26 — An About for the map: what this is, and who it is for (32 skills)

The map answered "how does this work" well (click a flow, read the path) and answered "what is this and why does it exist" not at all. A first-time viewer sees an infrastructure diagram and draws one of two wrong conclusions: that it is automated and nobody is driving, or that it is an aspirational slide rather than skills a teammate can install today. Both are expensive. An About button now sits under the title and opens a modal that settles it in about forty seconds of reading.

- **Copy lives in `map.config.json`** under `about`, alongside the flows, because it is editorial in exactly the same way. The template renders it; nothing is hardcoded.
- **Evergreen by rule.** The copy may not name a skill, a count, or a date. `{skills}` interpolates the live number at build time, the same source the footer uses, so the one number in the text cannot go stale. Anything needing an edit when the skills change belongs in the generated data instead. The rule is written into the config so the next person keeps it.
- **The argument it makes**: this is our way of working made readable and executable, not a diagram of intentions; the discipline is written down so the standard stops depending on who is having a good week; and the product manager is the point, not the thing being replaced. Closes on the team line, **"Learn it once."**
- **No theme change.** The pill and modal reuse the existing tokens only: `--panel`, `--line`, the legend's 10px radius and backdrop blur, JetBrains Mono caps for labels, Space Grotesk for body. No new colour, no new font, no layout change. Escape, backdrop click and ✕ all close it; focus moves to the close button on open and back to the pill on close.

## 2026-07-26 — The Product OS map, generated from the OS itself (32 skills)

The interactive lifecycle map of the **Oolio Product OS** now builds itself from `oolio-pm/skills/` instead of being hand-maintained alongside it. It is named for what it shows: not a diagram of some skills, but how the operating system runs end to end. The hand-built v1 page proved the problem within a day of being made: it showed 27 skills and was missing all five Brain skills the moment they shipped. A map that has to be remembered is a map that goes stale, so the page is now a **view of the skills**, regenerated on every push.

- **New `site/` folder**: a zero-dependency Node generator (`build.mjs`), the editorial overlay (`map.config.json`), and the HTML shell (`template/index.html`, the SVG engine from the v1 page, unchanged in look). Output is `site/dist/`, already covered by `.gitignore`. No framework, no package.json, no dependencies: this stays a markdown repo with a build script in it. Root `vercel.json` points Vercel at `node site/build.mjs`.
- **Two inputs, cleanly split.** Everything derivable comes from the skills: which exist, their names, and their real `description` (now the hover tooltip on each node). Everything editorial — lifecycle column, executor type, connections, gates, loops, the sidebar flows — lives in `map.config.json`. Skill frontmatter stays lean, per `references/skill-standard.md`; no `map:` block was added to any SKILL.md.
- **Never silently missing.** A skill with no overlay entry renders in a red "⚠ Unplaced" column rather than vanishing. Verified by adding a throwaway skill and watching it appear.
- **`--check` mode** fails on drift: unplaced skills, dead overlay entries, connections or flow steps pointing at nothing, and the hand-written skill count disagreeing with reality in `marketplace.json`, `plugin.json`, either README, the catalogue, or `pm-compass` (digits or words). Worth a pre-push hook once the map is live.
- **The five Brain skills are on the map**, in a new "Brain" column between Signals and Intake, with `my_brain` itself as a node: the research skills write into it via `wiki-ingest`, and `wiki-query` reads back out into intake and discovery. New sixth flow, "The Brain Compounds", tells that story end to end.
- **Three broken flow steps fixed, two of them pre-existing in v1.** The engine silently skipped flow steps that had no matching connection, so "JPD Loop — Idea to Decision" and "Ship & Learn Loop" both rendered with invisible gaps. The validator now catches that. Flows can also traverse loop wires, not just forward edges, so "Ship & Learn Loop" actually lights the shipped-metrics-to-new-ideas loop that is its whole point.
- **Canvas sizes itself to the data**, so adding a column or a loop can no longer crop the map (the v1 viewBox was fixed at 2600×1180).
- **The last per-skill `version` field is gone.** The build surfaced `version: 0.3.0` on `jpd-loop`, the only one left across all 32 skills (swept live, in-progress and archived to confirm). Removed, because the plugin versions by commit and a per-skill number pins nothing and misleads readers into thinking it does. `--check` now **fails** on a `version` field rather than warning, so it cannot come back quietly. The `v0.3.0` in `_archive/README.md` is a plugin version in a historical record and is correctly left alone.

## 2026-07-25 — The Brain skills packaged into the OS; "Oolio Brain" references migrated to my_brain (32 skills)

The vault the research skills read and write was renamed and restructured (the old "Oolio Brain" is now `my_brain`, a single git-backed PARA vault with a `_system/` engine, eleven Product Domains, a Metadata Standard, and a work/personal wall). Two things had fallen out of step: the five Brain-maintenance skills lived in a separate, unshipped `oolio-brain` plugin built pre-migration against the retired multi-wiki model, and the oolio-pm prose still called the vault "Oolio Brain". Both fixed, and the skills now ship with the OS.

- **Five Brain skills rebuilt and folded into `oolio-pm`** (not a second plugin — one plugin the team installs and pulls as a unit, no distribution or version-skew tax). `wiki-query`, `wiki-ingest`, `wiki-new`, `wiki-lint`, `wiki-status` now live in `oolio-pm/skills/` and carry the `oolio-pm:` namespace. Each is a thin runbook pointing at the vault's own `_system/operating-system.md` and `_system/Metadata Standard.md` as the law; the portable vault shape is a new shared reference, `oolio-pm/references/vault-model.md`.
- **Rebuilt to the current model, not ported.** The old skills assumed per-wiki `CLAUDE.md`/`index.md`/`Raw/`/`Wiki/{Sources,Entities,Concepts,Syntheses}` folders and four domains; `operating-system.md §2` retired all of that. The rebuilds use the simplified 2026-07 structure (a domain is a `README` + `Overview` + folders that appear only when filled), the `type` + `class` frontmatter contract, the eleven-domain list, competitors canonical in `30 Knowledge/Market/Competitors/`, and the hard work/personal wall (`20 Areas/Personal` and `10 Projects/Personal` NO-GO). `wiki-lint` gained the new checks the standard added: missing `class`, past `review` date, and `class`-backfill-from-`type`. `wiki-new` no longer writes a per-domain `CLAUDE.md` or pre-creates empty scaffolding.
- **Namespace unified.** Folding the skills in turned every cross-reference from `oolio-brain:wiki-query` into `oolio-pm:wiki-query` — one namespace, nothing cross-plugin-coupled. Updated in `signal-radar` (SKILL + signal-sources.md), `jpd-loop` (SKILL + evidence-sources.md), and `research-os.md`.
- **"Oolio Brain" → "the Brain" / `my_brain` across the prose.** The proper noun was stale, not the structure (`research-os.md` already used the new `30 Knowledge/...` paths). Corrected every running reference in `signal-radar`, `competitor-watch`, `jpd-loop`, `storm-research`, `research-os.md`, and both READMEs; the vault is named `my_brain`, the concept is "the Brain". Historical CHANGELOG entries left as-is (a record of what was true then).
- **Counts and catalogues.** 27 → **32**. Updated both manifest descriptions, `oolio-pm/README.md` (new "The Brain" section), and `docs/skills-catalogue.md` (new Stage 7). The marketplace `metadata.version` is unchanged: no plugin was added, removed, or renamed (the skills joined the existing plugin). Team-visible (five new skills a user can trigger), so the Product Operating System Confluence page needs the same tables/changelog update.

## 2026-07-25 — Horizon trimmed to Now/Next/Later; Commitment spelling fixed

Follow-up to the model update below, syncing the skills to two further live-board changes Niel made the same day (Jira already at target, verified against OHSI metadata — skills-only edit).

- **Horizon (`customfield_11744`) is now a clean roadmap timeframe: `Now` / `Next` / `Later` only.** The former `Under consideration`, `Shipped` and `Not planned` options were removed — those states are carried by status (the OHSI funnel), not Horizon. The three fields now have three non-overlapping jobs: status = where the idea sits, Horizon = when we pull it in, Commitment = how firm the intent is.
- **Commitment (`customfield_11931`) options corrected in Jira** to `Will Do` / `Aim to do` / `Stretch` (the earlier `Strech` typo is gone). The skills now send the clean strings.
- **Files:** `jpd-idea-groomer` (field_standards.md Horizon + Commitment blocks and write-back note; SKILL.md Horizon/Commitment table rows, proposal block, strategic-context bullet; atlassian_mcp.md trap note) and `steering-pack` (added a Commitment column to the pack table). The epic-titler "Horizon" codename example and the gtm "horizontal" matches were correctly left alone. No skill added or removed (27). Reader-facing Confluence already described Horizon as Now/Next/Later, so no page edit was needed.

## 2026-07-25 — JPD model update: the field standard catches up to the live board

The live JPD board moved on, and the skills that write to it had drifted. Swept every JPD-related skill to the 2026+ model, verified field-by-field against the live OHSI board (issue type `Idea`, 10071) rather than trusting the handoff brief alone.

- **The field changes.** Delivery Size → **Size** (`customfield_11557`), consolidated from seven pipe-suffixed tiers to four plain options: Sand / Pebble / Rock / Boulder. Strategic Pillar → **Pillar** (`customfield_11552`, options unchanged) on the idea side only. **Category** (`customfield_11711`) is now a required product-grouping field, replacing the retired **Product Area** (`customfield_11561`, confirmed off the create screen — do not write it). Two new required fields: **Theme** (`customfield_10088`, single-select, this year's strategic frame) and **Commitment** (`customfield_11931`, single-select, Now-quarter only). Horizon and Migration-Relevance-as-platform-picker were already correct.
- **Verified live, two live-board surprises baked in.** Theme landed on `customfield_10088` — the same ID the brief named for the Initiative "Strategic Pillar" — so the standard now spells out, in three places, that the JPD skills only ever write Theme (10088) and Pillar (11552) on Ideas and never any epic/initiative pillar field (no skill referenced 10088, so there was no collision to fix, only a trap to document). And Commitment's live options carry typos — `Will Do`, `Aim to do`, `Strech` — so the skills send those literal strings; Jira enforces spelling.
- **Reversed a now-wrong instruction.** The old `field_standards.md` said "never write `customfield_11711`" (it was the Requests-intake Category). Under the new model 11711 is the required grouping field the groomer sets on every idea. Corrected in `field_standards.md`, `atlassian_mcp.md`, and the groomer table.
- **Skills changed.** `jpd-idea-groomer` (SKILL.md frontmatter, audit axes, output template, field table, and all three reference files — the enforcement arm), `steering-pack` (capture list and pack table now report by Pillar / Theme / Size / Horizon), `jpd-title-standard` and `signal-radar` (evidence-read field names). `jpd-loop`, `feedback-to-idea`, `add-insight` and the rest defer to the groomer's `field_standards.md` and needed no field edits. The epic skills (`jira-epic-groomer`, `jira-epic-titler`) were deliberately left untouched: they only reference JPD ideas to exclude them, and must not touch the separate Initiative pillar field.
- No skill added or removed — count stays **27**. Team-visible (grooming behaviour a user notices), so the Product Operating System Confluence page and the JPD Field Standards page are mirrored.

## 2026-07-24 — Roy, the Behavioural Alchemist: a cross-cutting lens and a skill (27 skills)

Added Roy, the Behavioural Alchemist, a virtual teammate who reads decisions through behavioural economics and consumer psychology (inspired by the published work of Rory Sutherland, never impersonating him, never given invented quotes). He fills a real gap: every existing lens is rational in its own way, and the collection had no voice for perceived value, the experienced problem, or the disproportionate intervention.

- **Built as a combination, not one or the other.** Roy is both a persona-library lens and a standalone skill, because he needs to do two jobs. Inside the Virtual Product Council he is a lens the panels test against; on his own he is a workshop you can summon over a price, a loyalty scheme, or a piece of positioning.
- **An elevated, cross-cutting lens.** `personas-library/behavioural-alchemist.md` is filed at the library root, a sibling to the Chair, not inside any one subcommittee, for the same reason the Chair is elevated: his remit (perceived value, pricing, loyalty, positioning, felt experience) lands on all three testing panels at once, and filing him in one would stop him challenging the others. He is a **conditional** seat, not a default one, so reviews do not become theatre. He is written to clash on purpose: with the CFO on "expensive versus valuable", the Data and Analytics Lead on "measurable versus what matters", and Norman and Nielsen on when friction is a fault and when it is the point.
- **Wired into the council.** Registered as a conditional seat in the Leadership Subcommittee README, a cross-cutting contextual lens in the Design Council README and its assignment guidance, and an experienced-problem lens alongside the Operator Council. `convene-vpc` now decides at panel-scoping whether to convene him, on the triggers pricing / loyalty / positioning / packaging / retention / felt experience. The operating guide (`CLAUDE.md`) and the index (`personas.md`) explain the second elevated role and add "Roy" to the invocation vocabulary.
- **One skill, ten modes, not ten skills.** `behavioural-alchemist` runs his Working Method and Default Response Format, mode-switched (Behavioural Review, Alchemy Workshop, Loyalty Architect, Product Reframing, Contrarian Review, Experience Theatre, Pricing Psychology, Executive Provocation, Experiment Designer, Narrative Alchemist), rather than fragmenting him across the catalogue. The skill reads the canonical lens file so the two never drift. Triggers include "ask Roy", "what would Roy say", "behavioural review", "pricing psychology", and "reframe this feature".
- **Ethics built in.** Both the lens and the skill refuse dark patterns (deceptive scarcity, hidden charges, obstructive cancellation, misleading social proof, interface tricks) and separate a verified source from a paraphrased principle from an inference. Behavioural intelligence, not behavioural exploitation.
- Skill count 26 → **27**. `pm-compass` (router row plus the count), `oolio-pm/README.md`, the skills catalogue (Stage 3), and both manifest descriptions updated; the stale counts in the marketplace description (25) and pm-compass body (25) corrected in the same pass, and `drive` added to the marketplace description where it had been missed. Product Operating System Confluence page mirrored (new skill, team-visible).

## 2026-07-24 — New skill: drive, the generalist driver (26 skills)

Every skill so far is a specialist: groom this idea, run this council, write this PRD. There was no front door for the opposite shape, a raw, half-formed, voice-dictated request where the user does not yet know which skill they need, or whether a skill is even the point. `drive` fills that gap.

- **What it does.** Takes the user's most recent rambling message as raw thinking (not a spec), works out the real outcome behind it, turns that into an execution contract (objective, done-when criteria, constraints, verification, stopping condition), separates what they want from the solution they happened to suggest, picks a proportionate operating mode, does the actual work with whatever files, connectors, and tools are available, verifies against the completion criteria, and hands back the finished result with a Completed / Outputs / Verified / Remaining-limitation close. It executes rather than advising, and it does not hand back a tidied-up version of the request.
- **Why it belongs here.** With the repo reframed as the Product OS, the collection covers the whole of what a PM does, not just discovery. `drive` is the "turn my thinking into momentum without making me a prompt engineer first" front door; where `pm-compass` routes you to the right skill, `drive` drives the task itself. It pairs with the compass under Start here.
- **Design.** Lean, principle-led SKILL.md (the why, not heavy MUSTs) plus one reference file, `references/completion-criteria.md`, holding the per-deliverable "done when" checklists (document, presentation, research, product work, spreadsheet, file organisation, connector actions) so the core stays light and the model pulls the matching checklist on demand. Manual invocation is `/drive`; it also self-triggers when a message reads as raw thinking aimed at a real outcome. Environment-agnostic (no repo, terminal, or test assumptions), built for Cowork and general knowledge work.
- **Evaluated before shipping.** Run against seven realistic scenarios (product ramble, deck revision, research-and-recommend, "the latest report" file analysis, a trivial request, a dangerous file reorg, and a missing-file task). All seven passed: it produced real deliverables rather than advice, inspected files before assuming, picked the latest report over an older one and a newer-but-draft one, refused to invent figures or delete versions on a guess, stopped at every permission boundary, and reported honestly when a dependency was missing. No revision pass was needed.
- Skill count 25 → **26**. README, `oolio-pm/README.md`, the skills catalogue, and the plugin manifest description updated, and the Product Operating System Confluence page mirrored to match (new skill, team-visible). Shipped as GitHub Release `v0.11.0` (the Cowork upload zip).

## 2026-07-20 — The repo becomes the Oolio Product OS

The collection outgrew its name: with the research house, the councils, the GTM suite, the discovery maps, and the brain conventions, "PM plugin" undersold what teammates are actually installing. Renamed before wider sharing rather than after, while the audience is still small.

- **Repo renamed** `oolio-pm-plugin` → **`oolio-product-os`** (human name: Oolio Product OS). GitHub redirects the old URLs. The marketplace identity in `marketplace.json` follows the repo name (the 0.9.1 lesson), `metadata.version` bumped to 3.0.0 per the maintenance rule.
- **The `oolio-pm` plugin keeps its name, deliberately.** Renaming the plugin would break every installed `oolio-pm@…` reference and every skill namespace for zero user benefit. The framing: the Product OS is the collection; oolio-pm is its first plugin.
- **The Confluence front door renamed** "PM Skills" → "Product Operating System" (same page id, Confluence redirects the old title's links).
- README, PUBLISHING.md, CLAUDE.md, pm-compass, and the vault's registers updated to the new names. Historical CHANGELOG entries are left as written, per the archive rule. Teammates installed under the old marketplace slug should remove it and add `oolio-group/oolio-product-os` fresh; the old slug keeps working via redirect but registers as a separate marketplace.
- The local working folder keeps its historical name (`~/Documents/Claude/Code/oolio-pm-plugins`); noted in the README layout, as before.

## 2026-07-20 — New reference: jira-teams, the team assignment map

Skills that create or triage Jira work (issues, epics, initiatives, ideas, incidents, orphan tasks) had no shared way to set the Team field correctly: the field stores an Atlassian team ID (a UUID), not a name. `references/jira-teams.md` is now the canonical map: eleven teams with their IDs, what each team actually owns (often wider than the name suggests, so the rule is match on domain, not name), routing hints, and the guard that a skill leaves the field unset and flags it rather than guessing.

- Known gaps recorded in the file rather than papered over: the list is not exhaustive, and there are no leads, members or team-to-project mappings yet. Two flags raised at first publish were resolved by Niel the same day: Oolio Pay is MEL 2 (the duplicate MEL 3 was a numbering slip), and the prefixes are confirmed home bases (MEL Melbourne, IN India, VN Vietnam; hybrid-location teams such as DATA and eComm carry no geo prefix).
- A summary register mirrors it in the vault at `_system/Jira Register/Jira Teams.md`, beside the project register, with the vault README linking the two ("projects say where a ticket lives, teams say who owns it").
- Skill count unchanged (a reference, not a skill). Not mirrored to the PM Skills page (internal reference, per the mirroring rule).

## 2026-07-20 — PM Skills Confluence page gains a plain-English changelog; mirroring becomes a maintenance step

The PM Skills page (the team-facing front door, Niel's space) now ends with a "Skills changelog" section: the full history condensed into dated, human-readable entries with the skill count at each point, so teammates can see what arrived when without opening GitHub. The repo CHANGELOG remains the technical record; the page entry is the reader's version.

- The page was also brought current in the same pass: 25 skills, `add-insight` and `discovery-wayfinder` in the intake table, two roadmap items flipped to Shipped (wayfinder; native JPD evidence cards), and the install note corrected to reflect PUBLISHING.md (auto-update is the Claude Code path; Cowork has the zip fallback).
- **CLAUDE.md** gains a step: team-visible changes (new/renamed skills, new capabilities, behaviour a user would notice) are mirrored to the page's tables and changelog section; internal refactors are not.

## 2026-07-20 — New skill: add-insight (the evidence-first attach)

The morning's route flip made native Insights creatable; this closes the workflow gap it exposed. Every existing path starts from an idea (`signal-radar` idea mode) or from customer signal (`feedback-to-idea`); nothing started from the evidence itself — "here's something useful I found, which ideas does it belong to?" — with multi-idea attach.

- **`add-insight`** (new, twenty-fifth skill) — hand it one piece of evidence (a URL, an article, a HubSpot ticket or deal, a quote, a stat, a mid-session find) and it establishes the real source URL and reliability tier, finds every backlog idea the evidence genuinely supports (or fit-checks the keys you name — including parked and killed ideas, which fresh evidence resurfaces), proposes a mapping with a per-idea tailored description and per-idea impact rating, takes one batch approval, creates the native Insights via the jpd-insights-api routes (duplicate check first), and mirrors the lines to Brain. Deliberately small: one item per run, no gathering, no grooming, no council; evidence that fits no idea routes to `feedback-to-idea` as intake rather than being force-fitted. Guardrails: no link means no Insight, no undifferentiated copy-paste across ideas, social caps apply.
- **`pm-compass`** — routing table gains rows for `add-insight` and `discovery-wayfinder` (the latter was missed at its launch), and the body's stale "Twenty-three skills" corrected.
- **`signal-radar`** — trigger spec gains a do-NOT route to `add-insight` for single already-found items.
- README, plugin.json, marketplace.json, the skills catalogue, and the vault's Skills Catalogue updated: twenty-four skills → twenty-five.

## 2026-07-20 — Native JPD Insight creation: the standard flips from paste-list to attach-natively

Atlassian confirmed (June 2026) that native Polaris Insights are creatable via their public GraphQL API, and published an official AI skill with the full recipe; validated on 19 July against their reference repo and community confirmation. The Atlassian MCP connector still cannot do it, and the Anthropic cloud sandbox cannot reach the API endpoints, so the standard is route-based. Every skill that previously said "native Insights aren't creatable from here" is updated.

- **`jpd-loop/references/jpd-insights-api.md`** (new reference) — the full recipe: route decision (Route A Polaris GraphQL API for local sessions with network access, needing a one-time 3LO OAuth app; Route B Chrome UI automation of the Insights tab for cloud sessions with the user's browser connected; Route C paste-ready list as last resort), token handling, the `createPolarisInsight` mutation with the verified payload schema and its gotchas (`CreatePolarisInsightInput` not `PolarisCreateInsightInput`, the mandatory `X-ExperimentalApi: polaris-v0` header, `quotes`/`quotesItem` snippet format, mandatory `context.icon`), the read query, and a common-errors table.
- **`jpd-loop`** — write-back step 3 flips from "hand the human a paste-ready list" to "create the native Insights on the idea", with the paste list demoted to fallback. `references/insights-and-citations.md` rewritten from "important limitation" to the three creation routes; the standard is now that every strong piece of evidence gets attached as a native Insight, with the Description block and DISC page mirroring it.
- **`signal-radar`** — Mode A step 5 now presents the drafted list for one batch approval, then creates the Insights natively (duplicate check first), with paste-ready as fallback; description and definition of done updated. The "must never" boundary clarified: an Insight is an evidence attachment, not an issue edit.
- **`feedback-to-idea`** — the "existing idea covers it" path now creates the Insight natively where a route allows instead of always handing over a paste line.
- **`discovery-wayfinder/references/jira-modelling.md`** — the Known API gaps note corrected: Insights are now creatable (links panel and idea-type creation remain UI-only).

Skill count unchanged (a reference file, not a new skill). Open item: Route A needs Niel's one-time 3LO OAuth app before local sessions can use the API directly.

## 2026-07-19 — New skill: discovery-wayfinder (promoted from skills-in-progress)

The first skill to graduate through the `skills-in-progress/` lifecycle: `discovery-wayfinder`, adapted from Matt Pocock's Wayfinder, built from the handoff brief and promoted the same day after the required adversarial review and dry-run.

- **`discovery-wayfinder`** (new, twenty-fourth skill) — charts a product discovery theme too big for one session ("what does labour cost control mean for us") as a shared Jira map of decision tickets, worked one at a time until the way is clear. Preserves the source's five disciplines: plan-don't-do, the map as index, fog of war, HITL/AFK ticket types with grilling as the default, and claim-by-assignment with a hard one-decision-per-session rule. Routes research to `storm-research`/`signal-radar` (narrow factual lookups run as a plain cited subagent), evidence to `signal-radar`/`competitor-watch`, judgement calls to `grill-me`, prototypes to Figma explorations, and its output to `feedback-to-idea`/`jpd-idea-groomer`/`jpd-loop`. It never runs the council.
- **Jira modelling decided with Niel** (after researching current JPD capability): maps and tickets live in OHSI as dedicated JPD idea types (**Discovery** for maps, **Decision** for tickets), not as Ideas, so the mandatory Idea guards (`issuetype = Idea` + archived filter) exclude them from every existing sweep with zero changes elsewhere. Blocking uses native `Blocks` links; membership uses a `map-<key>` label plus a `Relates` link; JPD connection fields (Premium) are an optional display layer only. Mechanics and the one-time type setup in `references/jira-modelling.md`. Until the two idea types exist in OHSI (UI-only to create), the skill runs in proposal mode and writes nothing to Jira.
- **Adversarial review pass** found and fixed one blocker (charting steps contradicted the setup gate; now an explicit type check and proposal mode) and five should-fixes, including closing the retype-to-research loophole in the one-decision rule and a claim-release rule.
- **Dry-run on a real theme** (labour cost control, chosen with Niel): fourteen overlapping Exploring ideas charted into a seven-ticket map with one research ticket resolved AFK with cited findings. Record at `docs/wayfinder-dry-run-2026-07-19.md`; the charted map is ready to create once the idea types exist.
- The handoff brief moved to `_archive/discovery-wayfinder-HANDOFF.md` per the archive rule; `skills-in-progress/` is empty again, and its README now records the graduation.
- README, plugin.json, marketplace.json, the skills catalogue, and the vault's Skills Catalogue updated: twenty-three skills → twenty-four.

## 2026-07-19 — skills-in-progress opens with the discovery-wayfinder handoff

First occupant of the `oolio-pm/skills-in-progress/` lifecycle directory: `discovery-wayfinder/HANDOFF.md`, a self-contained design brief for building the skill in a fresh session. It captures the source concepts from Matt Pocock's Wayfinder (plan-don't-do, the map as index, fog of war, HITL/AFK ticket types, one decision per session), the Oolio adaptation (discovery themes charted as Jira maps of decision tickets, typed tickets routed to storm-research/signal-radar/grill-me, output feeding the existing intake and loop skills), the open Jira-modelling decisions to grill Niel on, and the promotion bar. A `skills-in-progress/README.md` documents the folder's rules. Skill count unchanged (nothing here ships until promoted).

## 2026-07-19 — Skill craft iteration: pm-compass, the skill standard, lifecycle statuses, vault alignment

An iteration on how the skills themselves are built, drawing on a deep review of Matt Pocock's skills repo (the `writing-great-skills` discipline, the `ask-matt` router, directory-based lifecycle, engine/wrapper composition) and on direct access to the real brain vault (`my_brain`), whose conventions the research skills now match exactly.

- **`pm-compass`** (new, twenty-third skill) — the router and front door, modelled on ask-matt: describe the task in plain English, get the one skill (or short chain) that fits and the hand-off in a sentence; gives newcomers the two-minute picture. Routes only; never does the destination skill's work. With twenty-three skills, discoverability is the biggest adoption barrier, and the compass is the answer that scales.
- **`references/skill-standard.md`** (new) — the house authoring standard: description-as-trigger-spec with do-NOT routing, progressive disclosure, the no-op test (cut any sentence that changes no behaviour), leading words (compact pre-trained concepts over invented process), phrase-the-positive, engine/wrapper composition, and the operator guardrail block including the vault's work/personal wall.
- **Lifecycle statuses, not versions** — skills now carry a status (In progress / New / Stable / Archived) expressed by directory and recorded in the catalogues, mirroring the promote-and-harden pattern. Deliberately no per-skill version numbers: the plugin versions by commit, and per-skill pins are precisely the mechanism that caused the historical stale-update bug. `skills-in-progress/` is the designated home for unshipped skills when the first one appears.
- **Vault alignment** — research-os and the dossier standard now name the real brain: competitor dossiers are the canonical pages at `30 Knowledge/Market/Competitors/<Name>` with the vault's entity frontmatter (type/tags/created/updated/sources/status), evidence captures go to `Sources/` as `type: source`, trends are Market-level syntheses, and the gap ledger lives in `01 Command Centre`. Vault rules bind: globally unique Title Case titles, mandatory provenance, supersession never deletes, vendor-claim caveats, and the operator wall (`20 Areas/Personal` and `10 Projects/Personal` are NO-GO for every skill, always). Existing vault dossiers are extended toward the standard when touched, never blanked. The vault's own Skills Catalogue page was brought current (nineteen → twenty-three, with statuses).
- **Deliberately not adopted (yet):** `disable-model-invocation` on the heavy orchestrators. It would cut context load, but our Cowork users invoke skills by describing the task in natural language, which model invocation makes possible; breaking that costs more than the tokens save. Recorded in skill-standard.md with the revisit condition.
- **Planned work now has a visible home** — the catalogue lists the grilling engine split, a discovery wayfinder (decision-ticket maps with fog-of-war scoping), `setup-oolio` workspace config, and the operator producers, each becoming a CHANGELOG entry when it lands.
- README, plugin.json, marketplace.json, and the skills catalogue updated: twenty-two skills → twenty-three.

## 2026-07-19 — The research house: competitor-watch, win-loss, research-os

Builds the standing research function on top of the morning's signal-radar. Grounded in a five-agent research pass (competitive-intelligence programme practice, review/community mining and the Apify Actor landscape, research-ops and insight-repository design, a live July 2026 POS landscape scan, and an adversarial critique of the existing stack). The critique's core findings, all addressed here: everything was one-shot with no recurring operation, no per-competitor memory, no change detection, no win/loss mining, an underspecified gap scan, and Brain compounding as one skill's private habit rather than a system property.

- **`references/research-os.md`** (new, shared) — the operating model every research skill now follows: the Brain page taxonomy (competitor dossiers, trend pages, atomic insights, append-only evidence logs, a gap ledger), last-verified/review-by dating with verified/contested/stale statuses, the canonical source-reliability tiers, the per-signal cadence table (pricing weekly, reviews quarterly, trigger events within the week), the routing pipe (signal → evidence → insight → JPD → council → shipped), a measurement scoreboard, and the agent/human division of labour.
- **`competitor-watch`** (new skill) — the standing competitive-intelligence function, four modes: dossier (one living, dated, supersede-don't-stack page per competitor in Brain), sweep (weekly delta pass over a tiered watchlist, significance-scored, reporting only changes), deep-dive (review/community weakness mining), battlecard (one-page Fact-Impact-Act cards with verified-as-of dating and honest strengths). References ship with a seeded July 2026 watchlist (Toast's AU entry, Zeller's free AI-first POS, Lightspeed's orphaned ANZ base, TouchBistro's distressed sale to Constellation), a dossier standard, a mining playbook with verified pinned Apify Actors per source (chosen because Apify's runtime Actor search proved non-repeatable), and a battlecard standard. Oolio counter-claims on battlecards must trace to bundled context or a connected source, never invention.
- **`win-loss`** (new skill) — monthly HubSpot closed-lost and churn mining. Treats rep-entered loss reasons as hypotheses (published buyer research finds them wrong more often than right), cross-examines deal metadata (time-in-stage, engagement drop-off, competitor named in notes vs the tag), codes every loss on four drivers with a corroborated/rep-reported-only flag, enforces pattern thresholds (5+ deals) before reporting, drafts buyer-interview guides for the human, and routes gaps to `feedback-to-idea` and competitor patterns to the dossiers.
- **`signal-radar` upgraded** — gap-scan mode gets a concrete recipe (90-day default window, two-independent-source minimum per candidate, per-tier competitor coverage, HubSpot standing queries, a saturation stopping rule, and a delivery-project check so work already being built is not proposed as a gap); Apify usage now pins Actors from the shared mining playbook; Brain sync now follows research-os and writes the actual Insight lines, not just a run summary; monitored gap candidates land on the gap ledger with review-by dates so sweeps give them a heartbeat.
- **Campaign mining, claim-vs-reality, and the independents scan** — competitor marketing is treated as free demand research: sweeps and deep-dives mine tier-1 competitors' public social campaigns, normalise engagement against each account's own baseline, and route outliers as desirability evidence for matching ideas (tier 5, capped, demand-not-execution by construction). Every loudly marketed claim can get a claim-vs-reality verdict (holds / oversold / vapour) tested against the competitor's own reviews and docs, feeding both battlecard landmines and our validation. A quarterly emerging-independents scan captures the sharp ideas small players market before they show up on anyone's threat list.
- **Seam fixes (small, additive)** — `jpd-loop` step 3 now consumes existing dossiers and radar Insight lists before gathering fresh evidence; `storm-research` queries Brain before its lenses run and syncs verified durable findings back after; `feedback-to-idea` offers a Brain ingest when intake signal carries durable market knowledge.
- README, plugin.json, marketplace.json, and the skills catalogue updated: twenty skills → twenty-two.

## 2026-07-19 — New skill: signal-radar

Closes the market/social research gap: until now nothing in the plugin pulled HubSpot themes, web trends, or social signal in to strengthen a JPD idea or find what the backlog is missing, and nothing persisted research so it compounded across runs instead of repeating.

- **`signal-radar`** (new, twentieth skill) — two modes. Idea mode takes a JPD key, gathers cited evidence from HubSpot, the web, and social media (via Apify Actors), and hands over a paste-ready Insight list in the same format `jpd-loop` uses, so the two are interchangeable. Gap-scan mode takes no key: snapshots the whole OHSI backlog, scans HubSpot ticket themes, web/competitor trends, and social signal, cross-checks every candidate against the backlog (including Not Now/Rejected ideas, not just open ones) and against Oolio Brain, then hands approved candidates to `feedback-to-idea` rather than drafting them itself.
- **Brain-first, Brain-last.** Every run queries `oolio-brain:wiki-query` before researching (don't repeat settled knowledge) and writes findings back via `wiki-new`/`wiki-ingest` after (so the next run starts ahead). This is the "keep my data in sync" half of the skill and the reason gap-scans get cheaper over time instead of staying flat cost.
- **Deliberately narrow write surface.** signal-radar never creates or edits a Jira issue or field itself; it hands off to `jpd-idea-groomer` / `feedback-to-idea` / `jpd-loop`, which already own that logic and its field-standard guards. Keeps one source of truth for backlog writes instead of a second copy drifting in a new skill.
- **Social-evidence impact cap.** A single scraped social post or review caps at 2/5 impact, aggregated corroborated social signal caps at 4/5 — HubSpot-direct and Brain-vetted evidence remain the only sources that can hit 5/5. Full reliability tiers in `references/signal-sources.md`.
- Additive cross-links only, no behaviour change to either: `jpd-loop`'s `evidence-sources.md` now points to signal-radar as the optional deeper social/HubSpot-theme pass; `feedback-to-idea` now accepts an approved signal-radar gap candidate as an intake input (still runs its own de-dupe sweep, never skips it).
- README, plugin.json, marketplace.json, and `docs/skills-catalogue.md` updated: nineteen skills → twenty.

## 2026-07-14 — Commit-based versioning; repo-URL install restored

Fixes the root cause of edits not reaching the team. The plugin no longer carries a `version` field in either `oolio-pm/.claude-plugin/plugin.json` or the `marketplace.json` plugin entry, so **every commit is a new version** and updates propagate without a manual bump. This also removes the duplicate version pin (it was set in both files; the plugin spec warns against that, as `plugin.json` silently wins and stale numbers block updates).

- **README.md and PUBLISHING.md rewritten** to make repo-URL install the supported path, with a team `settings.json` snippet that sets `"autoUpdate": true` (private marketplaces do not auto-update otherwise). The release zip is retained only as a Cowork fallback, pending a clean re-add test in Cowork.
- **CLAUDE.md** maintenance rule updated: no version to bump; do not reintroduce a `version` field.
- No skill content changed.

## 0.10.1 — 2026-07-13

Packaging fix: the release zip now installs. No plugin content changed from 0.10.0.

- **`scripts/package-plugin.sh` zipped the wrong root.** It ran `zip -r … oolio-pm`, which wraps everything under a top-level `oolio-pm/` folder, putting `plugin.json` at `oolio-pm/.claude-plugin/plugin.json` and skills at `oolio-pm/skills/…`. Cowork's local upload (and the Claude plugin loader) expect `.claude-plugin/plugin.json` and `skills/` at the **archive root**. Result: the v0.10.0 zip uploaded, showed the plugin name and toggle, but reported "This plugin doesn't have any skills or agents." This bug affected every script-built zip since v0.9.5; the last install that worked (v0.9.3) was zipped by hand before the script existed, with the contents already at root.
- **Fix:** the script now zips the *contents* of `oolio-pm/` from inside the directory, so the archive root is the plugin root, and asserts `.claude-plugin/plugin.json` is at the root before finishing (fails loudly otherwise).
- The v0.10.0 release zip is superseded; install from the v0.10.1 release.

## 0.10.0 — 2026-07-13

JPD operating-model alignment (EVITA-87 + EVITA-88, one release): the skills catch up with the live instance and every backlog sweep gets guard rails. Decisions recorded on EVITA-77 plus Niel's 13 Jul rulings. Middle-number bump because the release adds new abilities (Horizon proposal, stage-gating, customer connection, new steering-pack sections), per the versioning rule above.

- **field_standards.md**: new "Canonical statuses and mandatory JQL guards" section — the 2026-07-13 workflow merge (Planning + Ready for Engineering → `Ready for delivery`, lowercase d), two mandatory guards for every OHSI query (`issuetype = Idea` + the `Idea archived` filter), and the VPC-verdict → exit-status mapping. cf11553 documented under its new name **Investment Type**; **Horizon** (cf11744) added with the skills-propose/Steering-decides rule; **Escalate** corrected to `1`/`0` writes; **Likes** (cf11710) protected as the public-portal voting field; **Revisit on** (`customfield_11811`, Polaris date, verified attached) documented for the targeted Not Now bubble-up; interval fields marked verified-unwritable; new dynamic-fields blind-spot section; delivery-linking standard (`Polaris work item link` from Ready for delivery onward).
- **Archived guard verified live and corrected.** Both JQL spellings proposed in the runbook (`"Idea archived[Select List (single choice)]"`, `"Idea archived[Dropdown]"`) match nothing in this instance, and a bare `!= Yes` also excludes ideas with the field empty (every non-archived idea), silently returning zero results. The shipped guard is the tested form `(cf[10835] IS EMPTY OR cf[10835] != Yes)`, verified 2026-07-13: it returns the live backlog and excludes exactly the 43 archived ideas.
- **jpd-idea-groomer**: Category → Investment Type throughout; Horizon added to the audit axes, quick-reference table and proposed-fields output (propose-only, Steering owns the value); stage-gating recorded — the full standard applies from Exploring, Captured only needs title + sketch + Source (EVITA-80 ruling). examples.md updated to match. No Steering Score — ruled Won't Do (EVITA-81). Grill amendments: Escalate documented as `1`/`0` (never `true`/`false`) consistently with field_standards.md, and the proposed-fields template now presents Migration Relevance as the legacy-product picker, not Yes/No. atlassian_mcp.md's "Category" trap note updated to the Investment Type name.
- **jpd-loop**: de-dupe sweep carries the mandatory guards; Environment section records the post-Decision exit mapping; step 7 gains an offer to create the implements link when a delivery epic already exists; field-map.md gains canonical statuses, the Escalate 1/0 rule, the Revisit on pointer, and the verified-interval verdict on VPC Last Run; insights-and-citations.md rewritten — native Insight creation is now possible via the Polaris GraphQL API (Atlassian AI-clients guidance, May 2026) but only from a local runtime, so paste-ready lists remain the loop's workflow pending EVITA-86.
- **feedback-to-idea**: guards on the de-dupe sweep; new customer-connection step (`Discovery - Connected` links; Customer records only for recurring/strategic accounts; customer-name labels banned).
- **steering-pack**: guards; Horizon + Delivery link? columns; missing-delivery-link = fitness failure; new "Back from the freezer" and "Shipped 90-day checks due" sections.
- **jpd-title-standard**: guards on the bulk-audit JQL; the evidence-first field list updated to the Investment Type name.

## 0.9.5 — 2026-07-09

Distribution: the release zip is now the official install path; the Cowork marketplace path is retired until Anthropic fixes their cache.

- All recovery steps for the marketplace cache are exhausted: both slugs are burnt (`oolio-pm-plugin` frozen at 0.3.3, `oolio-pm-plugins` at 0.5.0), the Update button does nothing, and remove-and-re-add resolves to the same stale record. Nothing pushed to GitHub changes what the marketplace serves.
- Every release is now packaged as `oolio-pm-vX.Y.Z.zip` and attached to a GitHub Release, so anyone can grab the exact current version from the releases page and install it via Cowork's local plugin upload (the path proven working in the v0.9.3 test).
- Added `scripts/package-plugin.sh` to build the zip (it refuses to package on a version mismatch between the two manifests). README and PUBLISHING.md rewritten to make the zip the primary path and warn away from the marketplace option.
- Trade-off accepted: zip installs do not auto-update, so each release is announced and re-uploaded. When Anthropic fixes the cache, the marketplace path can come back.

## 0.9.4 — 2026-07-09

Fix: two skills had unparseable YAML frontmatter and were shipping with empty metadata.

- A fresh `claude plugin validate --strict` pass (run against the current official plugin docs) failed on `convene-vpc` and `storm-research`. Both descriptions were single-line unquoted YAML scalars containing a colon followed by a space ("This is the orchestrator: it runs…", "Runs a 4-phase pipeline: five expert lenses…"), which YAML cannot parse. At runtime the whole frontmatter block was silently dropped, so those two skills loaded with no name and no trigger description, breaking auto-invocation.
- Converted both descriptions to the `>-` folded block style already used by grill-my-prd and jpd-loop. Text unchanged. The full plugin now passes `claude plugin validate --strict` with zero errors.

## 0.9.3 — 2026-07-07

Fix: plugin description brought under Cowork's 500-character validation cap.

- Niel's local zip-upload test surfaced a real validation failure: "Plugin description must be at most 500 characters." The plugin.json description was 600 characters, and notably had been over the cap since at least v0.5.0 (552 characters), so the breach predates the audit build-out; the marketplace install path simply never enforced it, while the local-upload path does.
- Rewrote the description to 394 characters and aligned marketplace.json to the same text.
- Practical consequence: **local zip upload is now a working distribution path** that bypasses the stuck server-side marketplace cache entirely. Download the repo zip from GitHub, upload the `oolio-pm` folder via Cowork's Settings → Plugins → Add → Upload local plugin.

## 0.9.2 — 2026-07-07

Docs: the Cowork stale-cache issue is now documented for teammates.

- New evidence narrowed the diagnosis: Cowork's backend caches one snapshot per source slug, taken when the marketplace is first added, and never refreshes it (the singular slug is frozen at 0.3.3 from the rename day; the plural slug at 0.5.0 from the day it was first tried). The scheduled re-sync assumed earlier does not happen.
- Added a "Known issue — Cowork can serve a stale version" section to PUBLISHING.md with the check (CHANGELOG on GitHub is the truth) and the recovery steps (Update button, then the unused slug, then Anthropic support), and a pointer in the README install section.
- The durable fix sits with Anthropic's backend; a bug report is being raised. Nothing in this repo can force their cache to refresh.

## 0.9.1 — 2026-07-07

Cache-bust: marketplace identity renamed to unstick Cowork's stale sync.

- Niel reinstalled the plugin in Cowork and received v0.3.3 with nine skills — exactly the version at which the GitHub repo was renamed from `oolio-pm-plugins` to `oolio-pm-plugin` (2026-07-01). GitHub serves v0.9.0 correctly at HEAD, so the evidence points at Cowork's server-side marketplace cache having frozen at the rename, with remove/re-add resolving back to the same stale record.
- **Renamed the marketplace itself** in `marketplace.json` from `oolio-pm-plugins` to `oolio-pm-plugin` (now matching the repo), bumping `metadata.version` to 2.0.0 per the maintenance rule. If Cowork keys its cache by marketplace name, adding the marketplace afresh now creates a new record and syncs from scratch.
- Refreshed both manifest descriptions and the plugin keywords, which still described the eleven-skill era; they now describe the full nineteen-skill toolkit.
- Anyone who installed under the old marketplace identity should remove the old marketplace entry in Cowork and add `oolio-group/oolio-pm-plugin` fresh.

## 0.9.0 — 2026-07-06

Persona library expansion: seven new UAT personas, one leadership seat, two design lenses. Shipped via pull request rather than direct to main.

- **Stadia trio** (the vertical segments.md held open for swiftpos's market, all at one invented benchmark stadium so the account is coherent): Michael "Mick" Torrance (catering director, contract-caterer P&L), Danielle "Dani" Hartigan (venue operations manager, event-day F&B), Josh Bennett (concourse bar supervisor, event-day frontline). Stadium kitchen/BOH deliberately left open.
- **Mid-market back of house closed**: Sofia Marchetti, kitchen operations director of a 14-venue casual-dining group. The coverage grid no longer has an empty cell.
- **Enterprise buyer side part-closed**: Devinder "Dev" Chandra, IT and systems manager (the enterprise deal gate: security, PCI scope, change control), filed at the same invented estate as the enterprise COO. Lucy Tran, finance manager and bookkeeper of a six-venue group (month-end close, payout reconciliation, tips and GST), filed in back-of-house beside the stock controller as head-office cost-and-control.
- **First US persona**: Danielle "Dee" Alvarez, GM of a high-volume Austin smokehouse: tip pooling, sales tax, card-first payments, aggregator dominance. Exists to test whether AU/UK-shaped assumptions travel. (Nickname set to Dee to avoid colliding with Dani Hartigan; nicknames are the invoke-by-name handle.)
- **New Leadership Subcommittee seat (conditional)**: Payments Risk Lead, the fraud/chargeback/settlement/PCI/onboarding-risk lens previously spread across CFO, Security, and Legal. Convened when a decision touches money movement, payment flows, refunds, settlement, or Oolio Pay.
- **Two new Design Council lenses**: Edward Tufte (data and evidence display: dashboards, reporting, information density under pressure) and Ben Shneiderman (human-centred AI and control: comprehensible, predictable, controllable automation). Assignment matrix gains Dashboards-and-analytics and AI-suggestions rows, BackOffice reporting now carries Tufte, and the standing rule "always include Shneiderman on anything that recommends, drafts, or acts on the operator's behalf" is added. Both lenses build only on published work, no invented quotes, per the panel rule.
- **Integration**: personas.md, segments.md (all four views), uat-panel/design-council/leadership READMEs, and both council skills updated; lens counts corrected (twelve to fourteen, sixteen to seventeen). segments.md View 4 is also now **reconciled against the live JPD Applicable Segments picklist** (fetched 2026-07-06) with an explicit mapping rule, closing the reconcile-later note from 2026-06-24.

## 0.8.0 — 2026-07-06

Three new skills closing the intake, prioritisation, and measurement gaps. Nineteen skills total.

- **New skill `feedback-to-idea`.** The intake end of discovery: raw customer/support/sales signal in (pasted feedback, Slack thread, HubSpot ticket, support trend), a well-formed JPD idea out — or, more often, the signal attached to an existing idea, because the skill de-dupes against the whole backlog before ever creating. Carries quotes verbatim, sets signal strength from actual evidence (never inflated), reuses jpd-idea-groomer's canonical field standards, supports bulk sweeps, and hands off to jpd-loop.
- **New skill `steering-pack`.** Builds the Steering/roadmap review pack over a backlog slice: objective fitness checks (title standard, field completeness), VPC verdicts and rubric scores, a per-idea "ask" (an item with no ask does not belong in the pack), a recommended discussion order, and a not-fit list with owners. Published to Confluence append-only, summarised in chat. Reports and orders; the room decides.
- **New skill `metrics-review`.** Closes the loop the PRD opened: launch validation against the PRD's own success metrics, or a recurring product review, from real data (PostHog MCP first, other connectors or user-supplied numbers marked as such). Every figure traces to a source and window; metrics whose measurement dependency does not exist are reported as Unmeasurable with an owner, never substituted with a vanity proxy.
- Repo hygiene: untracked `.claude/settings.json` (machine-specific session permissions, not plugin content) and added `.claude/` to `.gitignore`.

## 0.7.0 — 2026-07-06

Five new skills and a product-context scaffold: the definition and launch stages of the PM lifecycle join the toolkit. Sixteen skills total.

- **New skill `write-prd`.** Writes an Oolio PRD from a groomed JPD idea, brief, or problem statement and publishes it to Confluence. The format (`references/prd-format.md`) was extracted from the live FY27 Customer Engagement PRDs, not invented: header block with status lozenges, In one line, Governing principle (functional/technical/commercial ownership split), What/Why/Who with named library personas, Scope, Non-goals, Key requirements, Dependencies, Success metrics with measurement dependencies, Open questions with decision owners. Hands off to grill-my-prd and convene-vpc, completing the write → grill → council → deliver loop.
- **Ported `grill-my-prd`** from Niel's personal skill library: the PRD-specialised sibling of grill-me that records the grilling as a versioned child page and badged, non-destructive in-place PRD amendments, with its two fixed-format references. Persona-library path now resolves via the plugin root.
- **Ported the GTM suite** from Niel's personal library and the Insights project: `gtm-handover` (One-Pager + Supporting Deck, and the `pack_content.json` narrative source of truth), `gtm-playbooks` (Sales / AM / Onboarding DOCX playbooks), and `gtm-marketing` (Marketing Pack: announcement, social, email sequence, sales note, campaign brief). The current-generation SKILL.mds are backed by the proven shared pack engine (`build_pack.js`/`.py`, preview and QA scripts, references, and the pack template) consolidated under `gtm-handover`, which the two downstream skills reference relatively. The deprecated `oolio-gtm-pack` single-pack skill was not ported; its engine lives on under gtm-handover.
- **Added `oolio-pm/products/`**: one product brief per Oolio product as the facts skills may rely on, with a template and rules (dated review stamps, no fabrication, public-repo hygiene). Scaffolded empty; briefs land as product owners supply them. Leo1 is a flagged candidate with no source material in the system yet.
- Updated the plugin README with the new skill groups (Definition and specs, Launch and GTM, Product context) and the root layout diagram.

## 0.6.0 — 2026-07-06

Quality pass across the existing skills, from the toolkit audit.

- **Rebuilt `grill-me` from a ten-line stub into a full skill**: operating rules (one question at a time, recommendation attached to every question, evidence before asking, graceful handling of missing connectors), a decision-tree map with branch prioritisation by uncertainty times impact, a stop rule, a written grilling record as the deliverable, and a definition of done. The spirit is unchanged; the behaviour is now specified instead of improvised.
- **Added a shared references folder at the plugin root** (`oolio-pm/references/`): `house-style.md` (the full writing rules the skills previously each carried a fragment of) and `council-review-output.md` (a standalone output template shared by the three council sub-skills, which previously described their output only in prose). The three council skills now point at the template for standalone runs.
- **Unified the title rules.** `jpd-idea-groomer`'s Summary Rules now defer to the JPD Title Standard as canonical (a JPD summary is its title) and align on the 65-character cap; the groomer previously said ~80, which conflicted with `jpd-title-standard`.
- `jira-epic-groomer`: the persona shorthand list now points at the bundled persona library for depth instead of standing alone.
- `convene-vpc`: the domain-panel handoff to `storm-research` is now concrete (name the replacement lenses explicitly, drawn from the persona library, per STORM's Phase 1 panel-swap note).
- `jpd-loop`: added partial-failure guidance for the five-output write-back (finish what can run, report exactly what landed and what did not, never leave a partial run looking complete).
- `storm-research`: the report path now has a fallback (scratchpad or ask) and always states the absolute path in chat.

## 0.5.1 — 2026-07-06

Fixes from the full toolkit audit: missing reference files, stale docs, licence.

- **Created the three `jpd-idea-groomer` reference files the skill has pointed at since 0.1.0 but which never existed**: `references/field_standards.md` (canonical field IDs and option labels, pulled from live Jira field metadata on 2026-07-06, including the real divergences from the Confluence wording such as `Product optimisation`, `FOH Staff`, the pipe-suffixed Delivery Size labels, and the second "Category" field to avoid), `references/examples.md` (strong/weak summary and description pairs across the typical idea shapes, plus field-setting examples), and `references/atlassian_mcp.md` (tool call shapes, write-back patterns, failure isolation, and traps).
- Updated `oolio-pm/README.md` "What's inside" to list all eleven skills; `grill-me` and `jpd-title-standard` had been missing since 0.4.0/0.5.0. Fixed PUBLISHING.md's stale "all nine skills" line to defer to the README.
- Fixed the root README layout diagram: the local folder is `oolio-pm-plugins` while the GitHub repo is `oolio-group/oolio-pm-plugin`; the diagram now says so instead of using the wrong name. The skill count in the diagram now defers to `oolio-pm/README.md` so it cannot go stale again.
- Added a LICENSE: public visibility is for install convenience, not a licence to reuse; all rights reserved to Oolio Group.
- Documented `metadata.version` in CLAUDE.md: it versions the marketplace itself and is only bumped when the marketplace structure changes, not on plugin releases.

## 0.5.0 — 2026-07-02

New skill: `jpd-title-standard`.

- Added `skills/jpd-title-standard/`, a JPD idea-title groomer that enforces Oolio's JPD Title Standard: max 65 characters (target 40–55), sentence case, capability- or verb-led with a clear outcome, no emoji, no bracket/pipe prefixes, no trailing punctuation. Works on pasted text with no Jira access, on a single idea by key/URL, or in bulk via JQL. Draft-only by default.
- Bundled `scripts/check_titles.py`, the objective per-rule validator the skill runs on its own proposals. Left the source skill's dev-time `evals/` folder out to match the plugin's convention (no other skill ships evals).
- Complements `jpd-idea-groomer` (full field/description grooming) and `jira-epic-titler` (epics); the skill hands off to those where relevant.
- Brings the plugin to eleven skills.

## 0.4.0 — 2026-07-01

New skill: `grill-me`.

- Added `skills/grill-me/`, a stress-test skill that interviews you relentlessly about a plan, decision, PRD, or design one question at a time, walking each branch of the decision tree and recommending an answer for each. Triggers on "grill me" or a request to pressure-test thinking.
- Adapted the source skill's closing line for this plugin: it resolves questions from context already given, the bundled personas and Oolio context, or a connected source (Confluence, Jira, Slack, HubSpot) before asking.
- Brings the plugin to ten skills.

## 0.3.4 — 2026-07-01

Governance: this repo is the single source of truth.

- Declared in `CLAUDE.md` that all plugin edits (skills, personas, lenses, templates) are made in this repo and shipped from here; the bundled `oolio-pm/personas-library/` is canonical.
- Put a redirect banner on the legacy working copy at `~/Documents/Claude/personas/` so edits are not made there by mistake.

## 0.3.3 — 2026-07-01

Docs: repo renamed and made public.

- The GitHub repo was renamed `oolio-pm-plugins` → `oolio-pm-plugin` (singular) and set to public. Updated the install URL to the singular name and dropped the org-access prerequisite in the README and PUBLISHING, since a public repo installs without GitHub org membership.
- Noted in the README that the repo is intentionally public and bundles Oolio-internal material.

## 0.3.2 — 2026-07-01

Fix: marketplace manifest location.

- Moved `marketplace.json` to `.claude-plugin/marketplace.json`. Cowork looks for the marketplace manifest at `.claude-plugin/marketplace.json`; at the repo root it was not detected ("This repository isn't a marketplace"). This is what lets teammates add the marketplace.
- Updated the README, PUBLISHING, and CLAUDE maintenance rules to point at the new path.

## 0.3.1 — 2026-07-01

Housekeeping and governance.

- Archived the STORM Subcommittee's five Co-STORM role files (plus its README and template) to `oolio-pm/_archive/`. They were superseded by the `storm-research` skill in 0.3.0. The STORM Subcommittee remains a named council body; only its execution moved. All council docs (`personas.md`, the persona-library `CLAUDE.md`, `vpc-concept.md`) now point to the skill.
- Added this CHANGELOG and a repo `CLAUDE.md` carrying the maintenance rules (bump the version and log every change; archive, never delete).
- Established `oolio-pm/_archive/` as the plugin's archive area, with its own README and the "archive with a dated reason" rule.

## 0.3.0 — 2026-07-01

`storm-research` upgraded to a verified HTML + Confluence research engine.

- Replaced the skill's engine with the five-lens, citation-verified pipeline: Practitioner / Academic / Skeptic / Economist / Historian → contradiction map → synthesized HTML report → adversarial peer review + primary-source verification.
- Phase 0 now asks for the topic and the Confluence destination. New Phase 5 publishes the verified report to Confluence as a faithful native rendering (panels, status lozenges, tables); the local HTML file stays the canonical artefact.
- Preserved council integration through a "council mode": keeps the jpd-loop recording contract (key decisions only), routes recording through the Chair's Decision Log instead of a standalone page, and supports a domain-panel swap so Economist/Historian are not forced onto internal decisions.
- Bundled `report-template.html` with the skill. `convene-vpc` step 4 now calls `storm-research` in council mode.

## 0.2.0 — 2026-06-30

Standard VPC decision-record format.

- Added `skills/convene-vpc/references/decision-record-format.md` as the canonical decision-record output format: fixed section order, status lozenge vocabulary, register ID scheme, and the per-persona / per-lens / per-seat breakdown.
- Wired `convene-vpc`'s output step and the Chair file to it, so there is one format spec rather than two that can drift.
- Docs (2026-06-30, no version change): added a Cowork install guide to the README for Oolio teammates, and corrected the stale repo path and push note in PUBLISHING.md.

## 0.1.0 — 2026-06-29

First release of the `oolio-pm-plugins` marketplace and the `oolio-pm` plugin.

- Nine skills: `convene-vpc` (plus the `operator-council-review`, `design-council-review`, `leadership-subcommittee-review`, and `storm-research` subcommittees), `jpd-loop`, `jpd-idea-groomer`, `jira-epic-groomer`, and `jira-epic-titler`.
- Bundled persona-library snapshot: the Operator Council (UAT panel), Design Council, Leadership Subcommittee, STORM Subcommittee, the Product Council Chair, segments, and the framework reference set.
