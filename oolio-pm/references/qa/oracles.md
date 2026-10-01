# Oracles

An oracle is the principle or source by which you recognise a problem (Bach and Bolton, Rapid Software Testing). Without one, "this is wrong" is taste. Every finding the family writes names its oracle in the `oracle` field of the [finding schema](finding-schema.md).

## The oracle types, strongest first

| Type | Cite as | Example (illustrative shapes, not real records) |
|---|---|---|
| **Acceptance criterion** | `AC <story key>#<n>` | `AC <KEY-123>#3`: "a schedule saved for Sat/Sun leaves other schedules untouched" |
| **Logged decision** | decision title and date, with link | "<decision title>, decided <date>", linked to the decision page |
| **Statute or standard** | `WCAG 2.2 <SC number> <name> (<level>)` | `WCAG 2.2 2.5.7 Dragging Movements (AA)` |
| **Component reference** | `component-reference: <component> rule <n>` | `component-reference: Select rule 2` |
| **Pattern rule** | `pattern-library: <pattern>` | `pattern-library: save versus publish` |
| **Glossary** | `glossary: <term>` | `glossary: Variant (not Sell Unit)` |
| **PRD claim** | PRD title, section, and link | "<PRD title>, Success metrics, headline metric" |
| **Figma frame** | file, frame name, link | the frame linked from the epic |
| **Design principle** | principle name and source page | a Menu Management design principle |
| **Comparable product** | product and the behaviour, with source | the incumbent system the persona came from |
| **User expectation** | the test persona card and the line it rests on | `test-persona: dave-pub-manager, "came from"` (the field the expectation rests on) |
| **The product itself** | the two places the product disagrees with itself | the tooltip says one thing, the publish screen another |

A finding may carry several oracles. Cite the strongest one first.

## HICCUPPS, the checklist for gathering them

`test-basis` walks this list to build the oracle set before testing starts; `exploratory-qa` uses it during a session to recognise a problem when it sees one.

- **History.** The product's own past behaviour. Did this work differently last release? Regression is the classic History oracle.
- **Image.** What the company wants to be seen as. Would this embarrass Oolio in front of an operator?
- **Comparable products.** Competitors and the systems operators migrate from. Behaviour a migrating user depends on is a strong oracle even when no AC mentions it.
- **Claims.** The PRD, the epic, the help text, the release note, the sales deck, the in-product copy. Anything we have said the product does.
- **User expectations.** What a reasonable user of this persona expects. Grounded in a test persona card, never in the tester's own preference.
- **Product.** Internal consistency. Two screens naming the same thing differently, two flows doing the same job differently.
- **Purpose.** What the feature is for. A flow that technically works and defeats its own purpose fails here.
- **Statutes and standards.** WCAG, tax and surcharge rules, privacy law, payment scheme rules. Cite the standard; where the legal reading is not obvious, raise a Decision needed for Legal rather than ruling.
- **Familiarity** (the F in HICCUPPS(F)). The product repeats a problem we have seen before. Check the incident history and earlier reviews.

## The source hierarchy, for when oracles disagree

Sources disagree constantly: the PRD says one thing, a later meeting decided another, the Figma shows a third, and the build does a fourth. `test-basis` finds these **before** testing. It never resolves them; it dates each source and hands the conflict to a person.

To present a conflict, list every source with its date and owner, in this default order of authority, and say which one the build follows:

1. A logged decision (newest wins over older decisions on the same point).
2. The acceptance criteria on the story in the release.
3. The Figma frame linked from the story or epic.
4. The PRD.
5. Meeting notes and chat that were never turned into a decision.

The order is a default for presenting the evidence, not a ruling. The rule is: **surface and date, never settle.** A conflict on a high-consequence flow stops the run until a person rules; a conflict elsewhere is tested against the newest source and reported as a Decision needed.

## When a source is silent

Often there is no conflict because only one source speaks, and it says nothing about an outcome that matters ("the system resolves the conflict", with no rule for how). Silence on a high-consequence outcome is treated exactly like a conflict: a Decision needed, and it stops the run on that flow until a person rules. Silence elsewhere is tested against the nearest pattern rule or principle and reported as a Decision needed.

## When there is no oracle

Write it up as type **Decision needed**, with the observation, why it might matter, and the question a person must answer ("Is it intended that an empty Order Types field means all order types?"). It is never a Bug. Once answered, the answer becomes an oracle (ideally a logged decision) and the item is re-tested against it.
