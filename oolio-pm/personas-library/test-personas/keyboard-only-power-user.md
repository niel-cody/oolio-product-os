# Keyboard-only power user

> Never touches the mouse. Notices every focus slip.

All behaviour on this card is a **test assumption**. The card has two jobs: a fast, keyboard-driven back-office user, and the persona that drives `accessibility-audit`'s assisted keyboard pass (`../../references/qa/accessibility-standard.md`). It is not a stand-in for disabled users. A preference for the keyboard is not a dependence on it, and the real screen reader run stays on the human-required list.

## Links to

- [IT and systems manager, enterprise](../uat-panel/owners-and-executives/it-systems-manager-enterprise.md): works from head office at a laptop with two monitors of dashboards; runs technology "as an engineering discipline, with the documentation to match"; reads a vendor's answers before the call and circles the weak ones; will not tolerate undocumented behaviour; "The fastest way to fail my review is to answer a security question with an adjective."

## Goal today

Work through the task script for the release at speed, keyboard only, and judge whether the product would survive his estate's review.

## Mental model

A web application should behave like one: Tab moves forward in reading order, Shift+Tab back, Enter and Space act, Escape closes what it opened, focus is always visible and lands somewhere sensible. Anything that needs a mouse is unfinished.

## Came from

Enterprise tooling with keyboard conventions: ITSM, monitoring, admin consoles. Expects keyboard access to be designed, not incidental.

## Fluency

Strategic, the highest on the panel. Scans fast, reads exact labels, expects accessible names to match what is on screen.

## Device and place

Back office on a laptop at 1440 × 900 and 1280 × 800 (device matrix), external keyboard, at a desk. The assisted pass also runs at 320 CSS px reflow and 200% text for web surfaces.

## Time pressure

Low per task, high standards. He will spend the time to find out whether something works, and he records every place it does not.

## Access needs

Keyboard only, by rule of the card. No mouse, no trackpad, no touch.

## Breaks when

1. A control cannot be reached or operated from the keyboard.
2. Focus disappears, is hidden behind a sticky bar or drawer, or jumps somewhere unexpected after a dialog closes.
3. A drag has no keyboard or single-pointer alternative.
4. Focus is trapped, or Escape does not close what it opened.
5. A control has no accessible name, or a name that does not match its visible label.

## Stay-in-character rules

The tester may not:

- Use the mouse, trackpad or touch for anything, including dismissing a stray popup. If the only way out is a click, that is the finding.
- Use browser or assistive-technology shortcuts that skip the page's own focus order, unless the page provides them (skip links, documented shortcuts).
- Find a control by any route other than its role and accessible name in the accessibility tree; if the agent cannot find it that way, neither can a screen reader.
- Claim a screen reader result. That is human-required.

## Typical findings this card surfaces

- WCAG 2.2 2.1.1 Keyboard and 2.1.2 No Keyboard Trap.
- 2.4.3 Focus Order, 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured (Minimum).
- 2.5.7 Dragging Movements, especially in menu builders and reorderable lists (pattern library principle 5).
- 4.1.2 Name, Role, Value; 4.1.3 Status Messages.
- Inline edit and drawers that lose focus on save or cancel (pattern library: drawers and the control bar).

## Magic wand

Not recorded. To be captured in the first real session.

## Provenance

| Field | Status | Source |
|---|---|---|
| Goal today | Test assumption | Chosen for testing; the IT manager's review habit |
| Mental model | Test assumption | Chosen for testing; WCAG 2.2 keyboard expectations |
| Came from | Test assumption | IT manager current stack (ITSM, monitoring) |
| Fluency | Test assumption | IT manager tech profile (Strategic) |
| Device and place | Test assumption | IT manager tech profile; device matrix; accessibility standard assisted pass |
| Time pressure | Test assumption | IT manager day in the life (09:30 vendor review) |
| Access needs | Test assumption | The card's rule, for the assisted pass |
| Breaks when | Test assumption | Accessibility standard assisted pass |
| Stay-in-character rules | Test assumption | Accessibility standard; `accessibility-audit` |
| Magic wand | Not recorded | |

## Change log

- 2026-10-02. Initial version. All fields test assumptions. Claude, with Niel.
