---
name: story-mockups
description: Build review-ready Figma mockups from a PRD and its Jira stories, using only Oolio Office components. One Section per story, every state the stories imply (empty, loading, failed, confirmations, toasts), native annotations in the five house categories, and every open question posted as a Figma comment. A fast first pass for product and engineering to review, then the designer fine-tunes. Trigger on "mock up these stories", "build the screens for <epic>", "turn this PRD into Figma", "high-speed mockups", "what would this look like", or a PRD or story keys handed over with a Figma link. Do NOT trigger to judge whether a design is good (design-council-review), to check a built screen against its design (design-conformance), or for polished design or design-system changes (those go to Design).
---

# Story mockups: from stories to screens people can argue with

A high-speed first pass. It turns a PRD and its stories into Figma screens built from the real Oolio components, so product and engineering can review and comment on something concrete, and the designer starts from a page instead of a blank one. It is not polished design and must never pretend to be: anything it cannot settle from the sources becomes a comment, never a guess on the canvas.

**The rule: components, not drawings.** Every element is an Office component in code, its Figma library twin, or a pattern already on the target file. A raw primitive where a component exists, or a hardcoded colour or size where a variable exists, is a defect in the mockup. When nothing exists, build a local component from library parts and log it as a design-system gap.

Proven once by hand on 6 October 2026: stories OR-2824 to OR-2827 under OR-1903 (scheduled reports) became 13 frames, 4 sections, 51 annotations and 10 comments in the Insights Figma file. This skill is that run, written down.

References, all under `${CLAUDE_PLUGIN_ROOT}/skills/story-mockups/references/`: `office-patterns.md` (how Office screens are composed), `component-map.md` (the Figma twins and their keys), `figma-gotchas.md` (what the Plugin API does when you are not looking), `annotation-style.md` (annotations, comments, title blocks, posting in Chrome). House style: `${CLAUDE_PLUGIN_ROOT}/references/house-style.md`. Load the Figma plugin's `figma-use` skill before any `use_figma` call when it is available; it carries the Plugin API rules.

## Inputs

A Confluence PRD (page id or URL) and/or a Jira epic or story keys; the target Figma file and page; optionally a screenshot of the live screen. The default target is a page per epic inside the product's own Figma file, named after the epic. Ask for the page if none is given; a separate review file is only on request.

## Workflow

### 0. Preflight

Confirm the Atlassian and Figma connections, and the design repo (`oolio-group/design`, default `~/Documents/GitHub/design`) and backoffice repo (default `~/Documents/GitHub/backoffice`) on this machine. Ask once for anything missing, then carry on with what is there and say in the report what was skipped. Without the repos the Figma library is the only source of component truth, and the report says so.

### 1. Read the work

Pull every story (description, acceptance criteria) and the PRD. The PRD wins on conflict; the conflict becomes a comment. Write a **screen inventory**: for each story, the primary screen plus every state it implies (read-only, create, empty, could not load, loading, confirmations, toasts, unsaved changes, no permission). Map every acceptance criterion to a frame; anything not shown goes on the **not visualised** list, which ships with the report.

### 2. Refresh the design system, every run

The system moves and keys change when the library is republished, so nothing here is cached. `git pull` read-only on both repos and record the design-ui-react version. List `packages/react-components/src/components/`, read the `*.types.ts` of every component you will use, re-read `DESIGN.md` (its frontmatter is the token source of truth), and re-read the backoffice `writing-ui-code` and `writing-ui-copy` skills and `docs/projects/native-settings/`. Diff what you find against `office-patterns.md` and `component-map.md`; anything changed goes in the run notes and, after the run, into those files.

### 3. Inspect the target file

Pages, the shell component, existing screens, libraries added. Build the component map by walking an existing screen's instances first (that is authoritative for this file), then `search_design_system` scoped to the UI Library for the rest. Resolve by name, then by key.

### 4. Build

The base screen in the file's shell (Insights: the Screen component, Layout Full, Drawer/Platform on the right tab, content in the Form slot), with realistic Oolio data and never lorem ipsum. Each further state is a **clone of the closest finished frame** with only the difference changed: tab state, body, footer, overlay. Precedence when choosing a part: the Office component in code, its library twin, a pattern already on the file, a local component logged as a gap. Follow `office-patterns.md` for drawers, create, overlays, copy, times, status and scrim.

### 5. Organise

One Section per story, titled `<KEY> · <story title>`, frames left to right in the order a user meets them. A 600px left margin and wide gaps, so annotations have room. A title block per section carrying the annotation key, and a heading above every frame.

### 6. Annotate and comment

Per `annotation-style.md`: five categories, statements only, bold element name first, the primary frame of each story in full and the other frames only where they differ. Questions, gaps, scope doubts and every difference between the mockup and the coded component become comments with a recommended answer, one issue each. Post them through Claude in Chrome; if it is not connected, hand the list over in chat and say plainly that nothing was posted.

### 7. Verify and report

Every text node in Inter; no placeholder text left (Title, Label, Value, Button, Lorem); a screenshot of each section; annotations counted by category. The report lists frames per story, acceptance criteria not visualised, local components and why, known differences from the coded components, comments posted or handed over, and the Figma link. Write a short run record to the Brain and link it from the proposal or story page. Offer to add the Figma link to the epic; never write to Jira without a yes.

## Must never

- Guess a behaviour to fill a gap. An unconfirmed behaviour is a comment, not an annotation with "confirm" on the end.
- Draw a primitive where a component exists, or trust last run's component keys.
- Build dark mode from the UI Library while its Dark tokens leave surfaces light. Build light only and flag it.
- Call the output a design. It is a mockup for review.

## Guardrails

Trigger: on demand. Reads: Jira, Confluence, the design and backoffice repos read only, the target Figma file and the UI Library. Writes: the target Figma page only (frames, annotations, comments) and a run record in the Brain's work layers; never the design system, never the Personal layers. Always pauses: any Jira write, creating a new Figma file, touching any page other than the target. Escalation: a PRD-versus-story conflict on a high-consequence flow goes to the PRD owner as a comment and in the report.

## Definition of done

Every story has a Section and every acceptance criterion is on a frame or on the not-visualised list; every frame is Office components or library twins, with any local component listed and its reason; no placeholder text, all text in Inter, colours and sizes bound to variables; title block and headings present and nothing overlaps; annotations in the five categories with no question among them; the comment list posted or handed over with what was not posted; known differences from the coded components listed; the run recorded in the Brain.
