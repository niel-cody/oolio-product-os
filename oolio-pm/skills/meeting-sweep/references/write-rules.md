# Write rules: the additive contract

Loaded by `meeting-sweep` before any outward write (step 6). Every rule here exists because the
failure it prevents is silent: a duplicated comment, a truncated Confluence page, a ticket assigned
to someone who never agreed to it. Read it before the first call of a run, not after the first
failure.

## The citation stamp

Every outward write this skill makes ends with one line, verbatim:

```
Source: Granola meeting "<Meeting Title>", <YYYY-MM-DD> (meeting <granola-id>)
```

It does three jobs at once: a reader knows where the note came from, a future sweep can detect its
own past work, and nobody has to guess whether a comment was written by a person or by the sweep.
The stamp is not optional, and its wording is not paraphrased, because the idempotency check below
matches on it.

## Idempotency

The sweep is meant to be re-runnable. Before every write:

1. **Meetings.** A meeting whose `granola_id` already appears in a `40 Meetings/` page frontmatter
   has been swept. Skip it unless the user explicitly asks for a re-sweep.
2. **Jira comments.** Fetch the issue's existing comments and search for `meeting <granola-id>`. A
   hit means this meeting already commented here. Skip, and say so in the close-out.
3. **Jira tasks.** Search the target project for the action's wording and for the stamp before
   creating. A near-duplicate found is shown to the user rather than created alongside.
4. **Confluence.** Fetch the page's footer comments (and the body, if appending) and search for the
   stamp before adding.

A re-run of an already-swept day should produce a close-out that says "nothing new" and write
nothing at all. If it writes anything, the stamp or the check is broken; report that rather than
carrying on.

## Confluence: add, never remove

**Default to a comment.** `createConfluenceFooterComment` is the right tool for almost everything
this skill has to say about a page: it cannot damage the page, it is visible, and it is trivially
reversible. `createConfluenceInlineComment` is better when the note attaches to a specific passage,
but it needs an exact text match on the page; if the match fails, fall back to a footer comment
rather than retrying with approximated text.

**Appending to the body is the exception, and it has a trap.** `updateConfluencePage` replaces the
entire body. Sending a section on its own deletes the page. So:

1. `getConfluencePage` with the body included. Note the body representation and the version number.
2. Build the new body as **the original body, unchanged, byte for byte, plus** your appended
   section, in the same representation.
3. Before sending, verify the original body is a substring of the new body. If it is not, abort the
   row and report it. This check is the whole safeguard; do not skip it because the diff "looks
   right".
4. Send the update with the incremented version.

The appended section carries a heading with the date, the note, and the citation stamp:

```
## Meeting note, YYYY-MM-DD
<what the meeting decided or added, in two or three lines>
Source: Granola meeting "<Meeting Title>", <YYYY-MM-DD> (meeting <granola-id>)
```

**Contradictions get flagged, not fixed.** Where a meeting contradicts what a page says, add a
comment naming both, the page's claim and the meeting's, with dates. Do not edit the claim. The page
has an owner and the sweep is not it.

**Never** delete a page, remove a section, edit an existing paragraph, change a title, move a page,
or resolve someone else's comment.

## Jira: comment freely, create carefully, transition never

- **Comments** via `addCommentToJiraIssue`. Quote what was said, name who said it where the meeting
  named them, state what it means for the issue, and stamp it. Keep it to a few lines: a comment
  that reproduces the meeting notes is not read.
- **New tasks** via `createJiraIssue`. Check the project's issue types and required fields with
  `getJiraProjectIssueTypesMetadata` before the first create of a run, because a required field
  missing fails the call and the retry wastes the batch approval. Set the summary as the action in
  the meeting's own terms, the description with the evidence quote and the stamp, the assignee only
  where the meeting named an owner (resolve with `lookupJiraAccountId`), and the due date only where
  the meeting set one.
- **EVITA** takes Niel's own actions, one ticket per action, no batching of several actions into one
  ticket.
- **A team's project** takes work only where the meeting agreed the work exists, routed by
  `${CLAUDE_PLUGIN_ROOT}/references/jira-teams.md`. Where no team fits cleanly, leave the Team field
  unset and flag it; a wrong team buries the work in the wrong standup.
- **`editJiraIssue`** is for fields the sweep is adding to an empty state, never for replacing a
  value someone set. Never touch a description. An epic description that needs work goes to
  `jira-epic-groomer`.
- **Transitions, closes, reassignments and priority changes** are not batch-approvable. Propose them
  in the close-out and let Niel do them, or ask for that one row on its own.
- **Links** between issues (`createIssueLink`) are additive and safe; use them where a meeting
  connected two pieces of work.

## Hand-offs

Three routes leave this skill entirely, and the reason is de-duplication: each owns a backlog sweep
this skill would otherwise have to reimplement and would eventually get wrong.

| Hand to | With | Because it owns |
|---|---|---|
| `feedback-to-idea` | The quote, the customer, the date, the meeting citation | The whole-backlog de-dupe that stops a duplicate idea |
| `add-insight` | The evidence, its source, the target idea if known | The native JPD Insight write and the impact rubric |
| `wiki-ingest` | The meeting page as the source | Domain integration, contradiction callouts, the catalogue update |
| `jira-epic-groomer` | The epic key and what changed | The What / Why / Who standard |

Hand over the material and the citation; do not pre-write the artefact for them.

## When something is unavailable

- **No Granola access.** Stop and say so. There is no fallback: the run has no input.
- **No Atlassian access.** File everything to the Brain, then hand back the outward batch as a
  paste-ready list (one block per write, with its target) so nothing is lost.
- **No vault access.** Do not run the outward half. Filing is the durable record; writes without it
  leave comments in Jira that nothing traces back to. Say what is missing and stop.
- **A single write fails.** Complete the remaining rows, then report which landed and which did not,
  with the error and the payload. Do not retry blind; check the required fields or the body
  representation first.
