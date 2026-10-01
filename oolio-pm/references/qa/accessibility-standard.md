# The accessibility standard

**Status: proposed.** The floor (WCAG 2.2 AA) is the current W3C recommendation and is not in question. The raised targets per surface are a proposal from the QA Skill Family design and stay proposed until Niel and Design decide them. `accessibility-audit` cites a raised target as "Oolio proposed target", never as a failed requirement, until this line changes to agreed.

## Why 2.2, and why contrast stays on WCAG 2

- **WCAG 2.2 AA is the floor everywhere.** The generic `accessibility-review` skill targets 2.1, one version behind. 2.2 added criteria that bite Oolio directly:
  - **2.4.11 Focus Not Obscured (Minimum), AA.** Sticky footers, control bars and drawers hiding the focused field.
  - **2.5.7 Dragging Movements, AA.** Every drag needs a single-pointer alternative. Menu builders and reorderable lists are the obvious case.
  - **2.5.8 Target Size (Minimum), AA.** 24 by 24 CSS pixels, or enough spacing.
  - **3.2.6 Consistent Help, A.** Help in the same place across pages.
  - **3.3.7 Redundant Entry, A.** Do not ask for what the user already entered in the same process.
  - **3.3.8 Accessible Authentication (Minimum), AA.** No cognitive function test to log in, unless there is an alternative.
  - 4.1.1 Parsing is obsolete in 2.2 and is not tested.
- **WCAG 3 is a working draft** with no settled contrast method; completion is not expected for years. APCA is not part of WCAG 2.2 conformance. Contrast is measured with the WCAG 2 ratio; an APCA reading may be added as a note, never as a pass or fail.
- **AAA is selective.** W3C does not recommend AAA as a blanket policy because some criteria cannot be met for all content. Oolio adopts the AAA criteria a surface's conditions justify, below.

## Targets by surface (proposed)

| Surface | Floor | Raised targets | Why |
|---|---|---|---|
| Back office (web) | WCAG 2.2 AA | none by default | Desk use, mouse and keyboard |
| Online store, guest-facing | WCAG 2.2 AA | 2.5.5 Target Size (Enhanced): 44 by 44 CSS px on mobile | Public, any user, any device |
| POS, mPOS, kiosk | WCAG 2.2 AA | 1.4.6 Contrast (Enhanced) 7:1 for primary text and prices; 44 px minimum targets; no hover-only information | Glare, standing, speed, gloves, shared terminals |
| KDS, CDS | WCAG 2.2 AA | 7:1 contrast; glanceable at distance; colour never the only signal for state (already 1.4.1 at A, called out because urgency colours are the norm here) | Heat, distance, noise, colour-coded urgency |

## The three passes

Reported separately, so nobody mistakes an automated pass for conformance. Automated tools catch only part of the issues (published estimates vary widely); the rest need assisted and human checks.

**1. Automated.** axe-core rules (or equivalent) through the browser on every screen in scope, at each viewport in the device matrix that applies. Contrast computed on the token pairs actually rendered, not the design file.

**2. Assisted** (the model drives, with judgement):
- keyboard-only run of every task: logical order, visible focus, no traps, Escape closes what it opened, focus returns sensibly after a drawer or dialog closes, focus not obscured by sticky elements;
- accessible names and roles read from the accessibility tree; any control the agent cannot find by role and name is a finding (if the agent cannot, a screen reader cannot);
- target sizes measured;
- every drag checked for a single-pointer alternative;
- reflow at 320 CSS px for web surfaces; text resize to 200%;
- `prefers-reduced-motion` honoured;
- errors identified in text, linked to the field, and announced;
- status messages announced without moving focus (4.1.3);
- labels visible, never placeholder-as-label.

**3. Human-required** (listed, never claimed):
- a real screen reader run (VoiceOver on macOS and iOS, NVDA on Windows) on the core flows;
- cognitive load on the real task with a real user;
- anything inside a canvas or a custom-drawn surface;
- whether alt text and captions are meaningful, not merely present.

## Reporting

Findings cite the success criterion as oracle: `WCAG 2.2 2.5.7 Dragging Movements (AA)`. Each release gets an **accessibility conformance summary**: per criterion, Supports / Partially supports / Does not support / Not applicable / Not tested, in the shape of a VPAT or ACR so it can be reused when an enterprise or public tender asks. A summary built only from the automated pass must say so in its first line.
