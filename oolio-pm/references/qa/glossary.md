# The glossary

Product vocabulary the build's copy is checked against. Each entry carries its source and status, because Oolio's vocabulary is mid-migration and several terms are still being settled. **Only an Agreed or Decided entry is an oracle for a Bug.** A Position or Draft entry is cited as such and its findings are Improvements or Decisions needed.

Sources are pages in the Brain (`my_brain`), named so a reader can find them; read them for the full reasoning.

## Product entities

Source: *Product Entity Naming Standard* (22 Sep 2026, status: position).

| Concept | Use | Not | Status |
|---|---|---|---|
| A thing a venue sells | **Product** | item, SKU, catalogue item | Position |
| One of the forms a product is sold in | **Variant** | Variant Product, variation, child, child product, size, sub-item | Position, and "Keep Variant" is decided (do not rename Variants to Sizes) |
| The axis variants differ on | **Variant Group** | attribute, option set | Position |
| A container of selectable things | **Option Group** | modifier group, selection group, collection | Position |
| A member that changes what the kitchen does | **Modifier** | option (as a member), add-on | Position |
| A member that is itself a product | **Combo Choice** | combo item, product option | Position |
| The parent of variants, in the product grid | **Product** (the grid labels the parent row Product and its children Variants) | n/a | Decided 23 Sep 2026 for the grid. **Conflict:** the naming standard calls it Variant Parent. Treat "Variant Parent" versus "Product" as Decision needed anywhere other than the grid |

The shelf test, for telling a variant from a modifier: if the choice changes what you take off the shelf, it is a variant; if it changes what the kitchen does to it, it is a modifier.

## Availability

Source: *Product Availability Taxonomy* (status: draft, awaiting Niel's validation).

| Use | Not | Note |
|---|---|---|
| **Locations** (where a product can be sold) | Availability, when it means locations | Land the Locations rename before the new Availability field |
| **Availability** (live state, with a reason: Out of stock, 86'd, Off period) | Sold out or 86 as separate settings | "86" stays as the POS verb |
| **Menu item** | Selling, Sellable | |
| **Lifecycle status** (Active, Archived) | Active on the product record | |
| Channel is **not** a product setting | Channel as a product setting | Products go on menus; menus publish to channels |

Display copy example kept: "Available at 3 of 12 locations" as a section header.

## Menus and layouts

Sources: Menus 2.0 UAT decisions (30 Sep 2026), PR-1095 usability session.

| Use | Not | Status |
|---|---|---|
| **Button colour** (POS), **Card colour** (Online) | Custom Color | Decided (UAT Q3) |
| **POS Name** (edited on POS and mPOS), **Display Name** (edited on Online and Kiosk); the product name itself is read-only on a tile | n/a | Decided (UAT Q2) |
| Layout types: **POS, mPOS, Kiosk, Online Store**, in one consistent order | Mixed orders between screens | Order is a finding today (U13); the canonical order is not decided |
| **Location** across Back Office | Venue in one screen and Location in another | A real tester flagged the mismatch (UAT item 53). Which term wins is Decision needed; the finding is the inconsistency |

## Other surfaces

| Use | Not | Source |
|---|---|---|
| **Interval** (Trading Monitor time grain) | Granularity | Decided 19 Jun 2026 |

## Copy rules every screen is checked against

These rest on the Menu Management design principles and on findings already ruled, so they are oracles:

- **Errors are words, not codes.** A raw status ("Request failed: 401") is a finding (principle 11).
- **No placeholder copy in a shipped screen** ("Value" as a field's only label).
- **Counters must not read as progress** when they are not ("Save (7/8)").
- **Disabled controls say why.**
- **Grammar in system messages** ("All 1 rows have been selected!" is a finding).
- **Status is a word plus a colour, never colour alone** (principle 12).

## Not decided (report as Decision needed, never as a Bug)

- **Locale of product UI copy.** Release notes are written in Australian English; no rule for the product UI exists. Inconsistent spelling within one screen is still a Product-oracle finding.
- **Capitalisation of product UI copy.** No rule exists. Inconsistency within a screen or between sibling screens is a Product-oracle finding ("Linked Categories Of Page").
- **Variant Parent versus Product** outside the grid (above).

## Adding to it

A new entry needs a source (a decision, a standard, or a ruled finding) and a status. When a Decision needed is ruled, the ruling is added here with its date, and the next run tests against it.
