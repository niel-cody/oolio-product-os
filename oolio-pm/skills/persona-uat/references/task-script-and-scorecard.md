# Task script and scorecard

The shapes `persona-uat` writes and `uat-session-kit` reuses with real people, so synthetic and real results can be compared line for line.

## The question bank

The seven stages of Niel's usability question bank. The full bank is not written down in one place yet; the stages and the questions recorded from the PR-1095 session are below. Extend it here as questions prove useful.

| Stage | What it tests | Questions recorded |
|---|---|---|
| **Create** | Can they start the thing from nothing | |
| **Structure** | Can they give it shape (pages, sections, groups) | "How would you know which page you're currently editing?" |
| **Populate** | Can they put the right things in the right place | |
| **Design** | Can they make it look the way they want | |
| **Modify** | Can they change and rename without breaking things | "How would you move several things at once?" The menu versus layout versus page question |
| **Recover** | Can they fix a mistake | |
| **Publish** | Can they make it live and know it is live | "You're happy with it. What would you do now?" |

## The script

```
Task script: <feature>, <date>, for <cards>
Starting state: <org, data present, flag state, device class>
Briefing: none. "Please do the following as you would at your venue. Think aloud."

1. <task in the operator's words>
   Success when: <observable end state>
   Oracle: <AC, decision or principle>
   Watch for: <the pause or wrong turn we predict>
2. …
```

Rules: tasks are in the operator's words, never the UI's labels; each has an observable success condition; the last task is always the route to live ("You're happy with it. What would you do now?"), because whether a user can tell what is live is the most common failure.

## The scorecard

```
| # | Task | <Persona A> | <Persona B> | <Persona C> | What decided it |
| 1 | Create a dinner menu | Pass | Pass, with hesitation | Pass | Venues vs Stores read differently by the ops lead |
| 3 | Add products | Fail (added food to the Drinks page) | Pass | Pass | A new page silently became the active page |
```

The scale:

| Result | Meaning |
|---|---|
| **Pass** | Completed, no hesitation worth noting |
| **Pass, with hesitation** | Completed after a pause, a wrong turn recovered, or a question (note which: hesitates, confused, annoyed, questions) |
| **Pass, with help** | Completed only by breaking character or with a hint; counted as Partial in totals |
| **Partial** | Part of the task done, or done wrong without noticing |
| **Fail** | Gave up, would ring support, or did the wrong thing believing it right (say which) |
| **Not attempted** | Task did not apply to this persona or surface, with why |

The PR-1095 session used a richer free-text vocabulary (pass annoyed, pass with a trap, struggles); keep the nuance in "what decided it" and the structured result in the cell, so results can be counted across releases.

## The report

1. **What this is and is not** (always first): a walkthrough in character by an AI, a hypothesis for real sessions, not evidence of real behaviour.
2. The cast, and who was left out.
3. The scorecard.
4. Findings, ranked, each with the task and persona.
5. Magic wand per persona.
6. Predictions for the real session.
7. Errors logged (facts only, with any PR-environment caveat).
8. Test data left behind.
