# Component map: the Figma twins

The UI Library components the mockups are built from, as resolved in the Insights file on 6 October 2026. **Resolve by name each run, then by key.** Keys change when the library is republished, so a key here is a hint for last run's file, not a promise. Keys are shown as prefixes; the full key is whatever `search_design_system` returns for the name today.

## Precedence

1. The Office component in code (`@oolio-group/design-ui-react`).
2. Its Figma library twin (team library "UI Library", key prefix `lk-4dd15dc2`).
3. A pattern already on the target file (the shell in use, row components, naming).
4. A local component on the target page, inside a frame named `Components · <page>`, built from library parts and **logged as a design-system gap** in the report.

## The map (Insights file)

| Need | Figma component | Key or id (prefix) | Notes |
|---|---|---|---|
| Page shell | Screen (Layout=Full, Form, Inline-Panel) | set in file `2284:16038` | Import by key fails; instance it from the in-file set by node id. Content goes into the `Form` slot |
| Navigation | Drawer/Platform, Tab=Insights | `87504dc5` | Group link texts are plain text, override them; hide unused groups |
| Search and Create | Control Bar, Layout=No Lenses | set `af7a15e1` | Toggle Search, Create, Show, Filters with booleans |
| Grid | Data Grid/Cell (Header, Text, Sticker, Icon, Subtitled) | set `73f8a533` | Make local `Header/System/<Screen>` and `Row/System/<Screen>` components from cells, as on the Grids page |
| Paging | Pagination, Type=Default | set `7441dedab` | |
| Fields | Select, Input | sets `40b941fc`, `bcfa4223` | Text layers named Title and Value; Input has Label and Icon booleans to switch off |
| Section heading | Section Title, Variant=Default | set `653bc414` | |
| Tabs and filters | Segment Control (Two, Three) | set `29e5075c` | The mockup used this; the coded drawer uses MenuBar, so prefer the Screen's Menu Bar once a drawer twin exists |
| Status | Stickers/Status | set `f6ca30e2` | Binds only Brand/Primary; recolour by rebinding the fill to States/Positive, Negative, Focus, Neutral |
| Timeline | Timeline Item | `318ead13` | Has a Content slot for expanded detail. The Timeline component is fixed at three items, so stack items in a frame |
| Notice | Message/Text, Variant=Icon | set `d8cfa606` | Switch off Action |
| Empty and failed | Empty (List, Feature, Search) | set `59c2e2c8` | |
| Confirmations | Confirmation | `d5fd4bbe` | Title colour defaults green; rebind for negative or focus |
| Toast | Notification/Toast | set `73b08a83` | |
| Footer | Screen Footer | `983d869e` | L1, L2, R3, R2, R1 Button/Text instances |
| Buttons | Button/Text, Button/Icon | sets `3f37f66a`, `1149f9ba` | |
| Drawer | **none in the library** | | Build a 600px frame from library parts; log the gap. Swap to the library SideDrawer once it exists |

## Variables and styles

- **Tokens:** Text/Text, Text/Text Light, Text/Placeholder, Containers/Elevation 0 to 3, Containers/Border, States/*, Brand/Primary, Icons/*.
- **Primitives:** Text/Size/*, Gap/*.
- **Effect style:** Shadow - Elevated 2.
- Dark mode is not usable from the library yet: switching Tokens to Dark flips text to white and leaves surfaces and grid cells light. Build light only and say so.

## Known gaps to raise with Design

Logged on the 6 October run and still open. The skill lists them in every report until the library closes them; asking Design is Niel's call.

1. A **SideDrawer** component (600px, subtitle above title, MenuBar tabs, right-aligned footer), so the skill stops building local drawers.
2. A **colour variant on Stickers/Status**, so status needs no manual fill rebinding.
3. **Working Dark token values** for surfaces and grid cells.
