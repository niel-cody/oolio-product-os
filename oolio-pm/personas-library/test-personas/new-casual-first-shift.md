# New casual, first shift

> Thirty seconds, no training, a customer waiting.

All behaviour on this card is a **test assumption**, grounded in the linked personas' days in the life. Nothing here was recorded in a session yet.

## Links to

- [Crew member, QSR](../uat-panel/front-of-house/crew-member-qsr.md): trained "in a couple of short sessions" and learns on the floor; backs one item out carefully so he does not void the whole order (16:20); helps a guest at the kiosk (17:00); waves the shift manager over on a declined payment (18:40); on autopilot and relying entirely on the screen in the last hour (20:30); "If I have seen it once, I am fine. If it is hidden, I have no idea it is even there."
- [Bartender, frontline](../uat-panel/front-of-house/bartender-frontline.md): never more than 90 minutes' training on any POS; uses about 20% of it; a declined card is a multi-screen recovery with a queue watching (19:30); adding a loyalty number to an open tab means asking the shift leader (20:30); new menu items appear without notice.

## Goal today

Get the order in, take the money, serve the next person, without calling a manager.

## Mental model

The screen is the instructions. What is visible exists; what is behind a menu, a long-press or a settings icon does not.

## Came from

Possibly another venue's till, possibly nothing. No habits worth relying on, and none the build should assume.

## Fluency

Reactive. A digital native who gets a clear screen instantly and an unclear one not at all. Scans for a word or a picture that matches what the customer said; does not read sentences.

## Device and place

POS terminal, landscape touch (device matrix fallback 1280 × 800), standing at the counter or bar. mPOS on a phone (390 × 844) where the venue uses handhelds. Kiosk (portrait class) when helping a guest.

## Time pressure

About 30 seconds per task before the customer, the queue or the shift leader takes over. A hesitation is a queue.

## Access needs

Situational: standing, noise, glare, one hand busy, possibly wet hands behind a bar (hospitality conditions: *Glare, wet hands, gloves, noise, interruptions*, proposed).

## Breaks when

1. The action is not on the first screen: hidden behind a menu, a long-press or an icon with no word.
2. A payment fails and the screen does not say what to do next.
3. Fixing a small mistake (one item, a change of mind) needs a manager, or risks voiding the whole order.
4. The layout moved since last shift, or a new item appeared with no brief.
5. Two similar buttons sit close together and look the same.

## Stay-in-character rules

The tester may not:

- Open a menu, settings panel or overflow icon unless a word on screen points there.
- Long-press, swipe or hover to discover anything.
- Read help text longer than a line.
- Spend more than about 30 seconds on a task. At that point the casual calls the manager, which is scored as a Fail ("would ring support").
- Use knowledge of how the feature was built or configured.

## Typical findings this card surfaces

- Everyday actions hidden from a quickly trained user (crew member: "Hiding everyday actions behind menus").
- Error messages that say what failed but not what to do (pattern library: errors are located, explained and fixable in place).
- Target size and spacing on touch surfaces (accessibility standard: 2.5.8, and the proposed 44 px POS target).
- Recovery paths that need a manager (permissions at the edges).
- Visual change between shifts with no brief.

## Magic wand

Not recorded. To be captured in the first real session. (The linked personas ask for a screen that shows "what to press" and a 60-second brief for new items.)

## Provenance

| Field | Status | Source |
|---|---|---|
| Goal today | Test assumption | Crew member goals; bartender goals |
| Mental model | Test assumption | Crew member quote; bartender "if a feature is in the menu I never open, it does not exist" |
| Came from | Test assumption | Bartender bio (two prior hospitality jobs); crew member bio (first job) |
| Fluency | Test assumption | Both tech profiles (Reactive) |
| Device and place | Test assumption | Both tech profiles; device matrix |
| Time pressure | Test assumption | Chosen for testing; crew member 16:20 and 18:40, bartender 19:30 |
| Access needs | Test assumption | Hospitality conditions (proposed); bartender's glass washer and bar |
| Breaks when | Test assumption | Both frustrations lists |
| Stay-in-character rules | Test assumption | Chosen for testing |
| Magic wand | Not recorded | |

## Change log

- 2026-10-02. Initial version. All fields test assumptions. Claude, with Niel.
