# The component reference

Per-component rules the build is checked against. This is what turns "check the design" into "check the Select against rule 4".

**Status and ownership.** The recommendation in the QA Skill Family proposal is that the canonical component rules live with the components (the design repo and Storybook) and that this file is a snapshot. Until Design agrees and the source exists, this file holds the entry template and the entries written so far, each with its status. **An entry is only an oracle once its status is Agreed.** A Proposed entry is cited as "proposed rule" and its findings are typed Improvement or Decision needed, never Bug.

When `design-conformance` meets a component with no entry, it does not invent rules: it checks the build against the Figma frame and the general standards (WCAG, the pattern library), reports a **System gap** ("no component reference entry for <component>"), and moves on. Entries are added one component at a time, as each is touched.

## The entry template

```
## <Component>

Status:        Proposed | Agreed (by <who>, <date>)
Source:        Storybook link · design repo path · Figma UI Library link (each with date checked)
Use it for:    the job it does; and what to use instead when it is the wrong tool
Anatomy:       the parts, by name
States:        default, hover, focus-visible, active, selected, disabled, read-only, error, loading, empty
Behaviour:     the rules, numbered, so findings can cite "rule n"
Content:       ordering, capitalisation, truncation, empty text, glossary terms it must use
Accessibility: role, name, keyboard model, focus indicator, target size by surface
Checks:        what the skill does on the rendered page to test each rule
Known deviations: deliberate exceptions, each with the decision that allows it
```

## Select (dropdown, listbox, combobox)

Status: **Proposed** (from the QA Skill Family proposal, 2026-10-01; awaiting Design).
Source: to be linked to the Storybook entry and the design repo component once confirmed.

**Use it for:** choosing one option from a known list. Use radio buttons instead when there are five or fewer options and the choice is important enough to show them all; use a searchable combobox past about 50 options.

**Behaviour, option order:**
1. **Inherent order wins.** If the options have a natural sequence, use it: sizes (Small, Regular, Large), days of the week starting Monday, times, courses in order of service (Entrée, Main, Dessert), price tiers.
2. **Otherwise alphabetical**, case-insensitive, ignoring a leading "The".
3. **A recommended default may pin to the top**, visibly separated, never mixed into the sort.
4. **Past about 15 options, add type-ahead search**; past about 50, use a searchable combobox. (The Menus 2.0 UAT asked for one rule for every dropdown on Select all and search, with a threshold of possibly 10; the number is unconfirmed.)
5. **Never order by creation date or ID**, which is what an unsorted API response gives you.

**States:** default, hover, focus-visible, open, selected, disabled, read-only, error, loading, empty (with text that says why it is empty and what to do).

**Accessibility:** combobox or listbox role with an accessible name; a visible label, never the placeholder as label; arrow keys, Home and End, type-ahead, Enter to select, Escape to close without changing the value; focus indicator at 3:1 against adjacent colours (WCAG 2.2 1.4.11); target at least 24 px (2.5.8), 44 px on touch surfaces per the [accessibility standard](accessibility-standard.md).

**Checks the skill runs:**
- open every Select in scope and read the rendered option list;
- decide whether the options have an inherent order; if so, check they follow it; if not, check alphabetical order;
- flag any list that is neither inherently nor alphabetically ordered (cite rule 1 or 2), and any list that looks like creation order (rule 5);
- flag lists over 15 options with no search (rule 4);
- check the pinned default, if any, is separated (rule 3);
- tab to it, open it, move with the arrows, select, Escape; check focus visibility at each step;
- read its accessible name from the tree.

**Why alphabetical is not the whole rule.** Alphabetical is right most of the time and wrong in exactly the places hospitality cares about: a size list sorted Large, Regular, Small, or a course list sorted Dessert, Entrée, Main, is alphabetical and wrong.

**Observed against it so far (for regression):** the price list dropdown on publish was not alphabetical and defaulted to the first list (PR-1095 U14); unselected options carried misleading submenu chevrons (U13).

## ControlBar

Status: **Partly agreed.** The component and the primary-action rule are agreed; the edited-view cluster is a proposal awaiting Niel's validation.
Source: Storybook `storybook.oolio.dev`, Components / ControlBar / Complex; the design repo `packages/react-components/src/components/ControlBar` and `SelectView`; the package `@oolio-group/design-ui-react`; the control bar epic. Checked 2026-09-24.

**Use it for:** the bar above every list screen (Products, Menus, Price Lists, Option Groups, Image Library): views, search, filters, lenses and the primary action. Any list screen without it, or with a lookalike, is a deviation.

**Behaviour:**
1. **Built on the standard Oolio ControlBar component**, not a local copy (agreed; also decided for Trading Monitor).
2. **The primary action is the green split button** (agreed).
3. **The view selector (`SelectView`) is the first lens**, showing `View: <name>`.
4. **Dirty state is the screen's job.** ControlBar itself does not react to unsaved changes; the screen must pass its edited state, and an edited view shows `(edited)` with the dot. A screen that lets a view change without marking it edited fails this rule.
5. **What counts as the view:** filters and their values, column set, order and widths, sort, grouping, the Show lens, and whether the tree is shown. Not search text and not row selection. (Proposal.)
6. **Edited-view actions** Save, Save as new and Reset, beside the view name. (Proposal.)
7. **View row actions** (Rename, Set default, Delete) are gated by permission (owner, edit, view) and view type (user, shared, system); a user must not be offered an action their permission does not allow.

**Checks the skill runs:** confirm each list screen renders the standard component (compare against the Storybook story); change a filter and confirm the edited marker appears; confirm the primary action is the green split button; open the view menu as each permission level available; check keyboard reach to every control.

## The next entries to write

In priority order for the Products App, because they carry its highest-consequence flows: **data grid** (the Oolio data grid: tree, saved and shared views, filters, inline edit with an explicit Save, nothing reordering under the cursor), **side drawer** (the right-hand drawer in the native kit; its rules are being written by Design), and **the publish flow**. Each is written with Design, against Storybook and the design repo, and marked Agreed only when Design signs it off.
