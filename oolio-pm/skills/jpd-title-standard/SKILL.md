---
name: jpd-title-standard
description: Groom Jira Product Discovery (JPD) idea titles to Oolio's JPD Title Standard — max 65 characters (target 40–55), sentence case, capability- or verb-led with a clear outcome, no emoji, no bracket prefixes like [Feedback] or [PIB], no trailing punctuation. Trigger PROACTIVELY when the user pastes one or more JPD keys (OHSI-XX, IDEA-XX, DISC-XX), a Polaris/JPD URL, or raw idea titles and asks to "fix the title", "standardise titles", "apply the title standard", "shorten the title", "clean up titles", "audit titles", or complains titles truncate on the Tree/Requests page. Also trigger for bulk runs ("standardise all titles in the project") and when the user mentions the JPD Title Standard or Tree card truncation. Works on pasted text with no Jira access, on single ideas, or in bulk via JQL. Do NOT trigger for Jira epics (use jira-epic-titler), for full JPD field/description grooming (use jpd-idea-groomer), or for stories/tasks/bugs.
---

# JPD Title Standard

Groom JPD idea titles so they read cleanly everywhere they surface: the Oolio Tree Requests page (tree.oolio.com/requests), JPD list and board views, Slack links, and Steering exports. A title is a **label colleagues scan in under three seconds** — it must say what the capability is and why it matters, inside a strict length budget.

The length budget exists because of real rendering limits, not taste: Tree request cards truncate titles at roughly **58–62 characters** on desktop two-column layout and around **40 on mobile**. JPD board cards and Slack unfurls are similarly tight. A title that truncates loses exactly the part that carries the outcome.

This skill handles **titles only**. If the description or custom fields need work, hand off to `jpd-idea-groomer`. If the ticket is an epic, hand off to `jira-epic-titler`.

**Evidence first — never trust the current title.** The existing title is a claim, not the truth. Ideas drift: the description, custom fields, linked insights, and comments often describe something sharper (or different) than what the title says. Whenever you have Jira access, read the full idea — description, Source, Primary/Secondary Personas, Category, Pillar, Theme, Investment Type, labels, and recent comments — and derive the title from that evidence. If the evidence contradicts the current title, say so in the audit; the rewrite should reflect what the idea actually is, not a polished version of a wrong label.

**Draft-only by default.** Always present current → proposed and get approval before writing to Jira. If the user explicitly says "just fix them", write back without the confirm step. Titles are public to the whole business via Tree, so they should not churn silently.

---

## The Standard

```
[Capability or Action] + [Outcome / Value]
```

Two accepted shapes:

- **Capability-led** (default, feature-shaped work): `Bulk image deletion to speed up content cleanup`
- **Verb-led** (operational or improvement work): `Show current store context for multi-location orgs`

### Hard rules

1. **Max 65 characters. Target 40–55.** Count characters, don't estimate — run `scripts/check_titles.py` or count explicitly. 40–55 survives every surface untruncated; 56–65 is acceptable when the extra words genuinely earn their place; over 65 always fails.
2. **No emoji.** 🎟️ and 🐛 eat card space and break sorting/search. Source and type belong in fields.
3. **No bracket or pipe prefixes.** `[Feedback]`, `[PIB]`, `[Feeback | PIB]` are metadata, not title. Strip them and propose moving the information to labels or the Source field (e.g. labels `source-feedback`, `source-pib`).
4. **Sentence case.** Capitalise the first word and proper nouns/product names only (POS, OOM, Online Store, Oolio Tag, QR). Not Title Case — that's the epic standard, not the JPD one.
5. **No trailing punctuation.** No full stops, no exclamation marks.
6. **State a change, not a noun.** "Cash Up Process" and "Catering Feedback" are topics, not ideas. Every title needs a verb or a capability plus an outcome.
7. **No user-story syntax, no codenames, no engineering implementation language.** "As a manager I want…", "Project Falcon", "Refactor cart service" all fail. Translate infra work into the business-facing capability it enables.
8. **Outcome must be real.** If the description doesn't support an outcome claim, don't invent one — use the capability alone, or ask the user. `…for better operations` is filler.

### Length trade-off guidance

When a title runs long, cut in this order: filler qualifiers ("a way to", "ability to", "feature to"), redundant product context already implied by the category, then the outcome clause — the capability is the last thing to lose. If cutting the outcome makes the title a bare noun, rework the phrasing instead of truncating.

---

## Workflow

Pick the mode from what the user gives you.

### Mode A — Pasted titles (no Jira access needed)

The user pastes one or more titles as text. For a single title give 2 options with one-line reasoning; for a list, produce the audit table (below) with one recommended rewrite per title. Never stall because Jira isn't connected — pasted text is enough to fix formatting problems (emoji, prefixes, case, length).

But formatting is only half the job. When a pasted title is vague or a bare noun and you have no description to ground the rewrite, don't fabricate an outcome — flag it, and if the Atlassian MCP is available offer to pull the full idea so the rewrite reflects the actual scope. If keys are pasted alongside titles, prefer fetching over guessing.

### Mode B — Single idea by key/URL

1. Fetch the idea via the Atlassian MCP (cloudId `oolio.atlassian.net`):
   ```
   mcp__atlassian__getJiraIssue
     issueIdOrKey: <KEY>
     responseContentFormat: markdown
   ```
2. Confirm it's a JPD idea (project is a Product Discovery project, e.g. OHSI). If it's an Epic → `jira-epic-titler`. If they want fields/description done too → offer `jpd-idea-groomer`.
3. Read the whole idea, not just the summary: the description's Problem/Opportunity gives the outcome language; Primary Persona and Category give the "who/where" nouns; Source and Customer Signal tell you whether a stripped prefix should become a label; comments and linked insights sometimes reveal the scope has changed since the title was written. The title you propose must match this evidence — if the evidence and the current title disagree, the evidence wins, and the audit should note the drift.
4. Audit the current title against the hard rules AND against the evidence, propose 2 options, recommend one.
5. On approval:
   ```
   mcp__atlassian__editJiraIssue
     issueIdOrKey: <KEY>
     fields: { "summary": "<chosen title>" }
   ```
   If a prefix was stripped, also propose the label edit (e.g. add `source-pib`) in the same confirmation.

### Mode C — Bulk audit

1. Pull titles (always with the two mandatory guards from the groomer's field_standards.md — `issuetype = Idea` plus the archived filter — so Customer records and archived ideas stay out of the audit):
   ```
   mcp__atlassian__searchJiraIssuesUsingJql
     jql: project = <JPD-PROJECT> AND issuetype = Idea AND <archived guard> ORDER BY created DESC
     fields: ["summary", "status", "labels"]
   ```
2. Run every title through `scripts/check_titles.py` to get objective pass/fail per rule.
3. For failures, fetch each failing idea and read its description and fields before rewriting — the rewrite comes from the evidence, never from the old title alone. Batch the fetches (or dispatch a subagent for large sets). A title that passes the format checks can still be wrong if it no longer matches its idea; spot-check passes too when time allows.
4. Present the audit table sorted worst-first. Get approval — the user may approve all, some, or edit individual rewrites.
5. Write back one `editJiraIssue` per approved change. Report a summary count when done.

---

## Output templates

**Single title:**

```
### Current
<title>  (<N> chars)

### Audit
- <rules broken, one line each>

### Proposed
1. <title>  (<N> chars) — <why>
2. <title>  (<N> chars) — <why>

Recommend **1** — <one line>.
```

**Bulk audit table:**

```
| Key | Current (chars) | Issues | Proposed (chars) |
|-----|-----------------|--------|------------------|
```

Include a final line: `X of Y titles pass as-is; Z need changes.`

---

## Worked examples (real Tree titles)

| Current | Problems | Rewrite |
|---|---|---|
| 🎟️ [Feeback | PIB] Have the online store load faster | emoji, prefix, typo, vague verb phrase (53 chars of which 15 are noise) | `Faster Online Store loading for guest ordering` (46) + labels `source-feedback`, `source-pib` |
| Cash Up Process | bare noun, no change stated (15) | `Single cash-up flow to reconcile all POS devices at once` (57) — outcome from the description |
| Category-level loyalty earning rules for scalable program setup | 64 chars, truncates on cards | `Category-level loyalty rules for scalable setup` (47) |
| 🐛 [PIB] Accurate Closure Messaging for QR Dine-In and Pickup States | emoji, prefix, Title Case, 68 chars | `Accurate closure messaging for QR dine-in and pickup` (53) + label `source-pib` |
| Add a way to remove the phone number from the receipt | filler "Add a way to" (54) | `Optional phone number on receipts for customer privacy` (55) |
| Catering Feedback | bare noun, empty scope (17) | Don't invent scope — read the description; if it's empty, flag the idea back to the user instead of rewriting blind |

Note the last row: when the source material gives you nothing, say so. A confidently invented title is worse than a flagged gap.

---

## Validation before presenting

Every proposed title must pass all of:

- ≤65 chars (verified by count, not eyeball) and ideally 40–55
- No emoji, brackets, pipes, trailing punctuation
- Sentence case with proper nouns intact
- Names a capability or action AND (where supported by evidence) an outcome
- Understandable by a non-technical Oolio colleague scanning the Tree page
- Still searchable — keep the domain nouns people would search for (loyalty, combo, receipt, QR)

Run `python scripts/check_titles.py` on your own proposals before showing them — it catches length and formatting slips instantly and prints per-rule results. Any failure: fix before presenting, don't present with caveats.
