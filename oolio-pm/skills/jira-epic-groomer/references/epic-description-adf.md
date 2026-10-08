# The epic description in ADF

The groomed description is pushed as an Atlassian Document Format (ADF) document through `editJiraIssue` with `contentFormat: adf`. Markdown cannot express the three nodes the standard depends on: `taskList` (the tick boxes), `decisionList` (the decision items) and `expand` (the collapsed history). This file is the skeleton to build from, the markers to check after the push, and the fallback if Jira rejects a node.

## Skeleton

Replace the text and dates. Keep the node types and attributes exactly as shown. Every `taskList`, `taskItem`, `decisionList` and `decisionItem` needs a `localId`: any short unique string works (a 12-character lowercase hex value is the Atlassian convention). Jira does not generate them for you.

```json
{
  "version": 1,
  "type": "doc",
  "content": [
    { "type": "heading", "attrs": { "level": 3 }, "content": [{ "type": "text", "text": "What" }] },
    { "type": "paragraph", "content": [{ "type": "text", "text": "One to three sentences. What ships and where it lives." }] },
    { "type": "paragraph", "content": [{ "type": "text", "text": "One italic line for facts with no Jira field, if any.", "marks": [{ "type": "em" }] }] },

    { "type": "heading", "attrs": { "level": 3 }, "content": [{ "type": "text", "text": "Why" }] },
    { "type": "paragraph", "content": [{ "type": "text", "text": "Two to four sentences. The pain, the cost of not doing it, the hard date if there is one." }] },

    { "type": "heading", "attrs": { "level": 3 }, "content": [{ "type": "text", "text": "Who it's for" }] },
    { "type": "bulletList", "content": [
      { "type": "listItem", "content": [{ "type": "paragraph", "content": [
        { "type": "text", "text": "Venue managers", "marks": [{ "type": "strong" }] },
        { "type": "text", "text": " set up the week's specials once, between services." }
      ] }] },
      { "type": "listItem", "content": [{ "type": "paragraph", "content": [
        { "type": "text", "text": "Diners", "marks": [{ "type": "strong" }] },
        { "type": "text", "text": " see the special while it's on, never one that has finished." }
      ] }] }
    ] },

    { "type": "heading", "attrs": { "level": 3 }, "content": [{ "type": "text", "text": "Definition of done" }] },
    { "type": "taskList", "attrs": { "localId": "dod000000001" }, "content": [
      { "type": "taskItem", "attrs": { "localId": "dod000000002", "state": "TODO" }, "content": [
        { "type": "text", "text": "An outcome a person can verify in the build." }
      ] },
      { "type": "taskItem", "attrs": { "localId": "dod000000003", "state": "DONE" }, "content": [
        { "type": "text", "text": "A verified outcome (verified 14 Oct, QA Review)." }
      ] }
    ] },

    { "type": "heading", "attrs": { "level": 3 }, "content": [{ "type": "text", "text": "Decisions" }] },
    { "type": "decisionList", "attrs": { "localId": "dec000000001" }, "content": [
      { "type": "decisionItem", "attrs": { "localId": "dec000000002", "state": "DECIDED" }, "content": [
        { "type": "text", "text": "9 Oct: the newest decision, one line. The why in a clause." }
      ] },
      { "type": "decisionItem", "attrs": { "localId": "dec000000003", "state": "DECIDED" }, "content": [
        { "type": "text", "text": "8 Oct: a decision that was later reversed.", "marks": [{ "type": "strike" }] }
      ] }
    ] },

    { "type": "expand", "attrs": { "title": "Earlier notes" }, "content": [
      { "type": "paragraph", "content": [
        { "type": "text", "text": "9 October 2026 (Niel):", "marks": [{ "type": "em" }] },
        { "type": "text", "text": " the old paragraph, verbatim, with its " },
        { "type": "text", "text": "strikethroughs", "marks": [{ "type": "strike" }] },
        { "type": "text", "text": " kept." }
      ] }
    ] }
  ]
}
```

### Inline details

- **Issue keys.** Jira turns a bare key into a link on render, so plain text `PAPP-1098` is enough. To force the issue card, use `{ "type": "inlineCard", "attrs": { "url": "https://oolio.atlassian.net/browse/PAPP-1098" } }` in place of the text node.
- **Task and decision items are inline-only.** Their `content` is text nodes with marks. No paragraphs inside them.
- **States.** `taskItem.state` is `TODO` or `DONE`. `decisionItem.state` is `DECIDED` (use it; `UNDECIDED` is for open questions, which the standard keeps out of the epic).
- **The expand** can hold paragraphs, lists, task and decision lists and tables. Move old content in as its own nodes rather than flattening it to one paragraph where the source had structure.
- **Omit the expand** when there is no earlier history to keep. An empty expand is rejected.

## Verifying after the push

`getJiraIssue` returns the description as markdown even when ADF is requested, so the markdown view cannot prove the nodes survived. Ask for `expand: renderedFields` and read `renderedFields.description`, which is Jira's HTML render:

| Node | Survived when the render shows | Flattened when it shows |
| --- | --- | --- |
| `decisionItem` | A list item that starts with `<>` (the renderer's marker for a decision) | A plain `<li>` with no marker |
| `taskItem` | A checkbox control, or a task-list class on the list | A plain `<li>` |
| `expand` | A collapsible block with the title "Earlier notes" | A bold "Earlier notes" paragraph followed by loose paragraphs |

The `<>` decision marker was observed on PAPP-860 on 9 October 2026. The tick-box and expand renders are expected, not yet observed through the connector; on the first run that pushes them, record what the render actually shows here so the next run has a known marker.

## Fallback

If Jira rejects the document or flattens a node, push the same content as markdown and tell the user which nodes did not survive:

```
### What
...
### Why
...
### Who it's for
* **Persona** job to be done.
### Definition of done
* [ ] Outcome a person can verify.
### Decisions
* 9 Oct: decision. Why.
* ~~8 Oct: reversed decision.~~

**Earlier notes**

_9 October 2026 (Niel):_ the old paragraph, verbatim.
```

The fallback keeps the order and the content. What it loses is the tick that a person can click, the decision marker and the collapse, so the report must say the description is in the fallback shape and should be converted when the connector allows it.
