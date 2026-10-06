# Office patterns the mockups must follow

How Office (the back office) composes a screen, as the backoffice `writing-ui-code` and `writing-ui-copy` skills and the design repo state it on 6 October 2026. Reference material: it makes no demands of its own, the skill does. **Re-read the sources every run** (step 2 of the workflow) and update this file when they move; the system is live and this page is a snapshot.

## Drawers

- **SideDrawer** (code): 600px wide, on the right edge, over a dimmed backdrop. The header puts `subtitle` **above** `title`. Tabs render as a **MenuBar** below the header. Footer buttons are **right-aligned**, in the order given; there is no left slot.
- A **record drawer** opens at the record's own URL nested under the list, with the tab in the URL.
- A **create drawer** is one form: Name first and focused; tabs only for a grid or a long group. After Create, stay on the list and toast.
- **No stacked overlays**, except a confirmation. Create and duplicate open from the page, never from inside a drawer.

## Overlays and confirmations

- Only `ModalConfirmation`, and only for what cannot be undone or loses work.
- **Unsaved changes** offers three actions: Keep Editing, Discard, Save & Continue.
- **Scrim** is `rgba(0,0,0,0.8)` with a 6px backdrop blur. Modals and drawers carry `shadow-elevated2`. Radius 8px for drawers and modals.

## Fields and failure

- A field the viewer cannot edit is `disabled`, never a read-only lookalike.
- A failed read shows an error with Try Again, never an empty state.

## Copy

- Title Case for labels, buttons, tabs and titles. Sentence case with a full stop for messages, toasts and empty states.
- Times in a drawer as `01 Oct 2026, 09:41:07 AM`, in the record's or the location's time zone, with the zone named.
- Never lorem ipsum. Realistic Oolio data: venue names, report names, people, dates that make sense together.

## Status and colour

- Status uses the semantic tokens only: positive, neutral, focus, negative. Colour is never the only signal; a word or icon carries the meaning too.

## Typography

- Inter only (Inter Variable in the UI Library). Sizes 12, 14, 16, 18, 22, 24. Line height 1.4x.

## Where to read the live version

- `~/Documents/GitHub/design` (oolio-group/design): `packages/react-components/src/components/` for the component list, each component's `*.types.ts` for props, `DESIGN.md` for tokens (frontmatter is the source of truth). Version 3.1.12 on 6 October 2026.
- `~/Documents/GitHub/backoffice`: `.agents/skills/writing-ui-code`, `.agents/skills/writing-ui-copy`, `docs/projects/native-settings/`. The newest drawer, create and details patterns are on Saketh's `saketh/feat/native-settings` branches.
