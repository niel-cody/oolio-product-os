# Exploration: charters, SFDPOT, tours and session notes

Exploratory testing is simultaneous learning, test design and execution (Bach; Hendrickson, *Explore It!*). Done without structure it is wandering. Done with a charter, a timebox and notes it is the single best way to find what nobody wrote an AC for. `exploratory-qa` runs every session to this shape.

## The charter

One sentence, Hendrickson's form:

> **Explore** <target> **with** <resources, conditions, data> **to discover** <information>.

- Explore *price list schedules* with *overlapping slots and existing schedules* to discover *whether anything is destroyed*.
- Explore *publish* with *two managers editing the same menu in two tabs* to discover *which edit wins and whether the loser is told*.
- Explore *the product grid* with *a 5,000-product catalogue and a slow connection* to discover *where it stops being usable*.

Charters come from three places, in this order: the risk map (the highest-rated flows first), the hospitality conditions library ([hospitality-conditions.md](hospitality-conditions.md)), and the Familiarity oracle (where this area has failed before).

## The timebox

Sessions are 30, 60 or 90 minutes of testing. Smoke runs none; Standard runs two to four charters on the top-rated flows; Full runs a charter for every high-rated flow plus at least two condition charters. When a session finds something big, the charter ends and a new one is written for the new area, rather than drifting.

## SFDIPOT, to check what a session covered

Often written SFDPOT; the full mnemonic has seven dimensions, with Interfaces. After a set of sessions, check coverage against all seven. A dimension nobody touched on a high-risk flow is reported as a gap.

- **Structure.** What the product is made of: screens, fields, files, the components, the data model behind the screen.
- **Function.** What it does: every action, including the ones in menus, shortcuts and bulk operations.
- **Data.** What it processes: empty, one, many, huge, invalid, special characters, duplicates, data created elsewhere, data from a migration.
- **Interfaces.** How it connects: the UI, imports and exports, the API, the POS, integrations, notifications.
- **Platform.** What it depends on: browser, device, screen size, network, the services it calls.
- **Operations.** How it is used for real: the user's sequence, interruptions, repeated use, the shift pattern, permissions.
- **Time.** When things happen: concurrency, timeouts, midnight, the trading day, daylight saving, scheduling, sequence and speed.

## Tours, for when you need a starting move

- **Empty-data tour.** Every screen with nothing in it: no stores, no products, no price lists, no locations. Empty states are where blank renders and crashes hide.
- **Back-button tour.** Back, refresh and close at every step of every multi-step flow, especially mid-save and mid-publish.
- **Interruption tour.** Walk away mid-task, let the session expire, come back. Is work kept, lost, or silently half-saved?
- **Two-of-everything tour.** Two tabs, two users, two devices editing the same thing.
- **Boundary tour.** Longest name, largest number, zero, negative, the slot that crosses midnight.
- **Permission tour.** The same task as each role, and the task a role should not be able to do.
- **Copy tour.** Read every label, tooltip and message literally, as the literal-reader persona would. Contradictions between two pieces of copy are Product-oracle findings.

## Session notes (the evidence)

Every session writes a note in this shape; the note is the evidence, and findings link to it.

```
Charter:       Explore … with … to discover …
Build / env:   <PR or build>, <environment>, <account role>
Timebox:       60 min (actual 55)
Coverage:      S F D I P O T ticked, with one line each on what was touched
Notes:         timestamped observations, including what was tried and passed
Findings:      IDs handed to defect-writer
Questions:     things with no oracle, for a person
Issues:        what slowed or blocked testing (data, access, flaky environment)
Next charters: what this session suggests exploring next
```

A session that finds nothing still files its note. "Explored X with Y and found nothing" is information: it is what lets `qa-mission` say a risk was covered rather than assume it.
