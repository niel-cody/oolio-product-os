# Fat finger at 8pm

> Double taps, back button, two tabs, walks away.

**Adversarial card.** Cast at Full tier. All behaviour is a **test assumption**: not a claim about how frontline staff behave on average, but the accidents a tired person at peak will eventually have, run on purpose. Not malicious; that is the [edge tester](edge-tester.md).

## Links to

- [Bartender, frontline](../uat-panel/front-of-house/bartender-frontline.md): touches the till hundreds of times a shift; three deep at 18:30; a declined card at 19:30 with the next customers impatient; till floats short at 23:30 because "the system had an open void".
- [Crew member, QSR](../uat-panel/front-of-house/crew-member-qsr.md): taps carefully to back one item out "so he does not void the whole order" (16:20); tired and "moving on autopilot" in the last hour (20:30); "At the end of a long shift, anything fiddly is where errors creep in."

## Goal today

Finish the task fast and move on. The goal is ordinary; the hands are not.

## Mental model

Whatever the last tap did, it did. If nothing seems to happen, tap again.

## Came from

Any till. Habits: tap again when the screen is slow, go back when lost, leave a screen half-done when someone calls.

## Fluency

Fluent with the parts of the screen used every shift, on autopilot, not reading confirmations.

## Device and place

Whatever surface the release touches: POS terminal and mPOS (touch), KDS (bump), and on web surfaces (back office on a tablet at 1024 × 768, online store on a phone) the browser's back button, refresh and tabs.

## Time pressure

8pm on a Friday, two hours into peak. Interruptions every few seconds.

## Access needs

Situational: tired, one hand busy, wet or sticky fingers, glare, noise.

## Breaks when (what the tester does on purpose)

1. **Double tap or double click** every action that creates, saves, publishes, pays, refunds, voids or bumps.
2. **Back button and refresh** in the middle of a multi-step flow, then forward again.
3. **Two tabs or two devices** on the same record: edit in both, save both.
4. **Walks away mid-save**: leaves a half-done form until the session expires, or drops the network at the moment of save.
5. **Taps the neighbour**: the button next to the intended one, then tries to undo it.
6. **Abandons and returns**: starts an order or edit, leaves it open, comes back an hour later.

## Stay-in-character rules

The tester may not:

- Wait for a spinner to finish before tapping again.
- Read a confirmation dialog before answering it; take the default or the most prominent button.
- Clean up after a mistake using knowledge the person would not have.
- Stop at the first accident. Chain them (double tap, then back, then retry), because at 8pm they come together.

## Typical findings this card surfaces

- Duplicate records, orders, payments or refunds from a double submit.
- Lost or half-saved state (hospitality conditions: *Network drops mid-save or mid-publish*, *Session expiry mid-task*).
- Silent last-write-wins between two tabs (hospitality conditions: *Two managers, one menu*).
- Unsaved changes not caught on leaving (pattern library: Save, Discard or Dismiss).
- Destructive or high-consequence actions with no confirmation where Frequency × Consequence calls for one, and confirmations so frequent they are clicked through.
- Timing and concurrency results are *Needs human repro* until confirmed on real hardware.

## Magic wand

Not recorded. Adversarial cards do not carry one.

## Provenance

| Field | Status | Source |
|---|---|---|
| Goal today | Test assumption | Chosen for testing |
| Mental model | Test assumption | Chosen for testing |
| Came from | Test assumption | Bartender and crew member bios |
| Fluency | Test assumption | Crew member 20:30 ("autopilot") |
| Device and place | Test assumption | Device matrix; chosen for testing |
| Time pressure | Test assumption | Bartender 18:30 to 19:30; crew member 18:00 |
| Access needs | Test assumption | Hospitality conditions (proposed) |
| Breaks when | Test assumption | Chosen for testing; bartender 23:30 open void; crew member 16:20 |
| Stay-in-character rules | Test assumption | Chosen for testing |
| Magic wand | Not applicable | |

## Change log

- 2026-10-02. Initial version. All fields test assumptions. Claude, with Niel.
