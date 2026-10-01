# The pattern library

Layout and interaction rules the build is checked against by `design-conformance`, and that `persona-uat` uses to explain why a persona got stuck. Consolidated from the Menu Management design principles, the UX Laws toolkit, the Products App quarter plan and the decision log. Each rule carries its source and status. **Decided and principle-level rules are oracles; Proposed rules are cited as proposals.** Where sources conflict, the conflict is listed, not resolved.

## The house law: Frequency × Consequence sets prominence

Source: *UX Laws Toolkit, Critique Lenses* (5 Sep 2026). Status: house law.

| | Low consequence | High consequence |
|---|---|---|
| **High frequency** | Optimise for speed | Fast, with safeguards |
| **Low frequency** | Progressive disclosure | Deliberate confirmation |

Prefer error prevention over error messages: make the scope obvious before the act, rather than "Are you sure?" after it.

## The twelve principles (Menu Management)

Source: *Design Principles, Menu Management* (29 Aug 2026). Status: principles. They were written for menus; rules 2, 3, 6, 7, 8, 11 and 12 apply across Back Office and are tested everywhere.

1. **One menu, many destinations.** Destinations are publish targets; differences are overrides on the item, never a second copy.
2. **State before action.** Every screen says what is live and where before offering a change.
3. **Publishing is a reviewed event, not a save.** Counted, described and attributable ("Publish 7 changes to 3 channels"), with a review list and per-change deselect.
4. **Preview by destination, not by screen width.** POS terminal, mPOS, Kiosk, Online, aggregators.
5. **Structure is edited in a mode, not by accident.** A declared arrange mode; **every drag has a keyboard and menu equivalent** (this is also WCAG 2.2 2.5.7).
6. **Bulk edit defaults to changing nothing.** "Keep current value"; the confirmation names the blast radius.
7. **Every change is reversible, and the reversal is visible.** Structural undo, named versions, a recycle surface with days left.
8. **Defaults over settings.** A product never arrives selling at $0.00, tax free, in zero locations.
9. **Time is a layer on the menu, not a separate product.**
10. **Imports arrive as proposals, not as data.**
11. **Errors are located, explained and fixable in place.** Never a generic failure banner; never an API reason left unrendered.
12. **Density is legible, and colour is never the only signal.** Scannable at 300 items; status is a word plus colour; prices right-aligned and tabular; 4.5:1 contrast.

Anti-patterns named with them, each a finding when seen: a save button that publishes to live tills; publishing with no count and no diff; always-on drag in a dense priced table; a global Simple/Advanced toggle; a generic "Publish failed" banner; blocking empty states (an operator with no menu should see routes out: import, template, start blank); colour-only status.

**AI rules** (same source): AI must not write a price without human confirmation, publish, change availability or a schedule on its own, act proactively on a live menu, or assert allergen, dietary or nutritional facts. Any build that lets it is a P0 candidate.

## Navigation

Navigation stays in the sidebar and header. Modals, drawers and prompts are fair game; the shell is not. Source: the October box-off "one logic" rules and the Menu Management experience pages. Status: agreed.

## Drawers and modals

- **Editing a layer down opens a right-hand side drawer, not a modal.** Forms that need it use tabs inside the drawer. Low-frequency, high-consequence confirmations stay as modals. Source: Products App quarter plan, principle 6 and workstream 14 (agreed 25 Sep 2026). The drawer's own rules (width, save and cancel, nesting, unsaved changes) are still to be written by Design; until they are, test against the reference implementation (combos and option groups).
- **Creating an entity starts in a modal or a side drawer, never a full page**, with three exits: edit more, create next, or close. Side drawer for complex entities (products), modal for fewer than about five required inputs. Source: decision, 28 Sep 2026.
- **Dependencies are created in place, through a modal** (category, product group, printer profile, option group, reporting group). Source: box-off rule 3.
- **Tension to report, not resolve:** the quarter plan says drawers replace modals for editing; the creation decision and box-off keep modals for simple creates and in-place dependencies. Read together they are consistent (edit in drawers, create small things in modals); anything that fits neither is Decision needed.

## Lists, grids and the control bar

- **Lists are the Oolio data grid**: the tree, saved and shared views, filters and inline edit. **Inline edit has an explicit Save; nothing reorders under the cursor.** Every list screen uses the same control bar, grid, saved views and inline edit. Source: box-off rule 1 and T11.
- **The primary action is always the green split button.** Source: the rule in the control bar epic.
- **Row click opens; clicking a name does not start inline rename.** Source: fixed on Menus, still a finding on Price Lists (UAT item 49).
- **One rule for every dropdown** for Select all and search, within a builder. The threshold is unconfirmed. Source: UAT item 7. See the Select entry in `component-reference.md` (proposed).
- The control bar's edited-view cluster (Save, Save as new, Reset) is a **proposal** awaiting Niel's validation.

## Save and publish

- **Save and publish are always distinct, and the build says which one reaches tills.** If a save goes to tills, the button says so ("Save and send to POS"). Source: principle 3, anti-pattern 1, PR-1095 finding U4.
- **One state per layout, one route to live**: Draft, Live, Changes not live; the blast radius shown before going live ("Goes to <store> on 3 POS terminals"). Source: U4 fix.
- **Publish on every layout type, plus a Publish menu action** that pushes all of a menu's layouts at once. Source: decision UAT Q4, 30 Sep 2026 (the latest in a history that changed on 10 Jun, 12 Jun, 9 Jul and 30 Sep; test against the latest and cite it).
- **The price list on publish loads from the publish record, never a default.** Source: U14 and UAT items 36 and 37.

## Destructive actions

- **Destructive actions are named and itemised**: "This will replace 3 schedules", with the list. Nothing disappears without the user being told. Source: the price list schedule test's operator model.
- **Archive and delete:** ship both; archive is forced once a product has associations (decision). The layout detail is a **proposal** (9 Sep): Archive neutral and far from Save; Delete red and only once archived; type-to-confirm only for deleting a product with sales history or bulk delete; a 30-day bin; restore from the bin returns to Archived, not Active; every transition audited.
- **Confirmation follows Frequency × Consequence.** Resetting a low-consequence view state needs no confirmation; discarding a whole menu's unsaved work does.

## Empty, loading and error states

- **Empty is never blank.** It says why it is empty and offers routes out. Loading, empty and broken must look different. Source: principle 11, anti-pattern on blocking empty states, and the price list schedule test (step 3 rendered blank with no stores).
- **Say what is true, not a wrong option**: "No kiosks at this store" rather than offering a channel that does not apply. Source: U15.
- **Session expiry keeps pending changes** and routes through sign-in. Source: U3.
- **Unsaved changes are caught** with Save, Discard or Dismiss on leaving. Source: existing behaviour on layout switches; regressions are findings.

## Adding to it

A new rule needs a source and a status. When a Decision needed on a pattern is ruled, the ruling lands here with its date. Rules proven by repeated findings are proposed to Design through the learning loop.
