# The session pack

## Recruit criteria

```
Release / epic:      <…>
Who we need:         <personas from the UAT panel, by role and segment>
Mix:                 single site and multi-venue · POS-heavy · migrating from <system> · <surfaces in scope>
Must have:           <e.g. builds their own menus today>
Must not have:       <e.g. seen this build before, works at Oolio>
Screening questions: <three to five>
Sessions:            <n> × <45–60> min, remote or in venue
```

## Facilitator sheet

Opening (read as written): "Thanks for doing this. We're testing the software, not you, so nothing you do is wrong. Please do each task as you would at your venue and think aloud as you go. I can't help or explain while you work, because we need to see where the product doesn't explain itself."

The facilitator may: read the task, repeat it, ask "what are you looking for?", "what would you expect to happen?", "what would you do now?". The facilitator may not: explain a label, point at the screen, say whether something worked, or rescue a stuck participant before they say they would give up or ring support.

After each task: the Single Ease Question, "Overall, how easy or difficult was this task?" (1 very difficult to 7 very easy).

At the end: the ten-item System Usability Scale; then "What one thing would you change?" (the magic-wand question).

## Observer grid

One per participant.

```
| # | Task | Predicted (from persona-uat) | Result | Time | SEQ | Moment (timestamp) | Hit / miss |
```

Observers note behaviour first (where they clicked, how long they paused, what they said they were looking for), interpretation second.

## Measures

| Measure | How | Use |
|---|---|---|
| Task success | The scorecard scale per task | Did it work |
| Time on task | Start of task to success or giving up | Where it is slow |
| SEQ | 1 to 7 after each task | Which tasks feel hard, even when completed |
| SUS | Standard ten items, scored 0 to 100 | Comparable across releases; around 68 is the commonly cited average |
| Prediction rate | Real P1+ findings predicted by persona-uat ÷ all real P1+ findings | Whether synthetic UAT earns its keep |

## The register header for a consolidation

```
Sources: UA = session 1 (<role>, <venue type>, <date>) · UB = session 2 … · S = persona-uat run <id>
Totals: <n> findings → <m> after de-dupe · task success <x>% · median SUS <y>
Prediction rate: <hits>/<real P1+> (<%>), partial <n>, false alarms <n>
```
