---
name: write-prd
description: Write an Oolio PRD from a groomed JPD idea, a brief, or a problem statement, in Oolio's high-level PRD format, grounded in the bundled persona library and product context, and publish it to Confluence. Trigger PROACTIVELY when the user says "write a PRD", "draft the PRD for [feature]", "turn OHSI-XX into a PRD", "PRD this idea", "draft the spec", or hands over a groomed JPD idea, epic, or brief and asks for the product requirements document. Do NOT trigger for reviewing or pressure-testing an existing PRD (use grill-my-prd or convene-vpc), for JPD idea grooming (use jpd-idea-groomer), or for epic descriptions (use jira-epic-groomer).
---

# Write PRD

Turn a validated idea into an Oolio PRD: the high-level, decision-oriented document the team grills, the council reviews, and delivery builds from. The PRD states what and why at the capability level, names its personas, declares its non-goals, and leaves technical ownership where it belongs. It is the upstream artefact of the whole loop: write-prd, then `grill-my-prd`, then `convene-vpc`, then delivery epics via `jira-epic-groomer`, then `gtm-handover` at launch.

House style: British English, no em dashes, no buzzwords (`${CLAUDE_PLUGIN_ROOT}/references/house-style.md`). The format is defined in `references/prd-format.md`; read it before drafting. It was extracted from Oolio's live PRDs, not invented.

## Inputs accepted

- A **JPD idea key or URL** (`OHSI-72`, a Polaris link). The best input: a groomed idea already carries the problem, hypothesis, success metrics, personas, and segments. Fetch it with the Atlassian tools (`getJiraIssue`, `fields: ["*all"]`) and read its comments and linked insights for evidence.
- A **Confluence brief or research page**. Fetch and read it.
- A **plain description** in chat. Workable, but expect to ask more.

If the idea has not been through grooming or the VPC, say so and offer `jpd-idea-groomer` or `jpd-loop` first. A PRD written from an unvalidated idea inherits its weaknesses; proceed only if the user confirms.

## Grounding, before drafting

1. **Personas.** Read the personas the idea names from `${CLAUDE_PLUGIN_ROOT}/personas-library/` and write the Who section with their real names and realities (Mel, not "the user"). If the idea's Primary Persona field names a JPD persona (Venue Owner, Multi-site Operator), map it to the matching library personas.
2. **Oolio context.** `${CLAUDE_PLUGIN_ROOT}/personas-library/_framework/oolio-context.md` for the company frame; `segments.md` for segment realities.
3. **Product context.** If `${CLAUDE_PLUGIN_ROOT}/products/` contains a brief for the product this PRD belongs to, read it and stay consistent with it. If the product has no brief, flag the gap to the user; do not invent product facts.
4. **Neighbouring PRDs.** Search Confluence for sibling PRDs in the same product area (CQL on title ~ "PRD" in the target space) and read the closest one or two. Consistency with siblings matters: shared dependencies, shared vocabulary, cross-references.
5. **Evidence.** Carry over cited evidence from the JPD idea's insights and any VPC decision record. Never fabricate customer claims, numbers, or integrations.

## Workflow

### 1. Confirm the frame

Before writing, state and confirm in a few lines: the one-line description, the primary personas, what kind of PRD this is (usually a functional-requirements PRD, with technical decisions owned by the Principal Engineer/CTO and commercial decisions owned by leadership), and the target financial year. This is the Governing principle section in embryo, and it prevents the most expensive rewrite.

### 2. Draft

Write the full PRD per `references/prd-format.md`. The bar for each section is in that file. The three tests before showing anything:

- Could a director read the header block and one-line and know what this is and whether it matters to them?
- Is every requirement stated at the capability level, with implementation left to the owners named in the Governing principle?
- Does every open question name its decision owner?

### 3. Review with the user

Present the draft in chat (or as a file if long). Iterate until the user is happy. Do not publish an unreviewed PRD.

### 4. Publish to Confluence

Ask for the space and parent page if not given (product-area spaces are the norm; the user knows where siblings live). Create a **new page**, never overwrite an existing one, titled `PRD — <Subject>` (Niel's current convention; the older `<Subject> | PRD` form also exists and both are recognised downstream). Set it as a live page where supported. Give the user the URL.

### 5. Hand to the loop

Offer the next step: `grill-my-prd` to pressure-test it (it will hang a versioned decision record under the page you just created), then `convene-vpc` for the council; once the stories exist, `story-mockups` turns them into Figma screens for review. Note the JPD idea should be linked to the PRD page (paste the URL into the idea's Links panel by hand; the connector cannot create that link).

## What this skill does not do

- It does not review or amend an existing PRD (grill-my-prd, convene-vpc).
- It does not write delivery detail: acceptance criteria, API contracts, UX flows, and story breakdowns belong in delivery Jira, Swagger, and Figma.
- It does not decide technical or commercial questions. It frames them, assigns owners, and lists them as open questions.

## Definition of done

- Every section of the format present or consciously omitted (some PRDs need no Funding model; none can skip What, Why, Who, Non-goals, Success metrics, Open questions).
- Personas are named library personas, not roles or "users".
- Success metrics measure behaviour or business movement, with the measurement dependency named if one exists, so each can pass the measurability chain `test-basis` will run before launch (`${CLAUDE_PLUGIN_ROOT}/references/qa/measurability.md`).
- Non-goals are real exclusions someone might otherwise assume were in scope.
- Every open question has a named decision owner.
- Published to Confluence in the right space, URL handed over, next step offered.

## References

- `references/prd-format.md` — the Oolio PRD format: header block, section order, the bar for each section, and a worked skeleton. Extracted from live Oolio PRDs (the FY27 Customer Engagement set). Read before drafting.
