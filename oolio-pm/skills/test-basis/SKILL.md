---
name: test-basis
description: Build the Test Basis for a release, epic or PR before anyone tests it. Gathers every source that says what the build should be (PRD, stories and ACs, decisions, meetings, Figma, the diff), finds where they disagree, flags untestable ACs with Given/When/Then rewrites, checks every success metric can be measured, rates each flow Frequency × Consequence, and maps the blast radius. Trigger on "build the test basis", "what should we test", "is this spec testable", "line up the sources", "are the sources consistent", "is this measurable", "risk map for <release>", or a release key with "before we test". The first step of every qa-mission run. Never resolves a conflict; dates it and hands it to a person. Do NOT trigger to run tests (functional-qa, exploratory-qa), to grill the PRD (grill-my-prd), a general test strategy (engineering:testing-strategy), or the full QA run (qa-mission).
---

# Test basis, the oracle builder

The most valuable skill in the QA family and the one everything else consumes. Before a single click, it assembles everything that says what this release should be, and finds where those sources disagree. The best findings from September's manual QA came from contradiction, not clicking: a tooltip that said one thing, a decision that said another, a publish screen that misreported what was live. Lining the sources up first finds those for the price of reading.

**The rule: surface and date, never settle.** A conflict is presented with every source, its date and owner. A person rules. A conflict on a high-consequence flow stops the run.

House style: `${CLAUDE_PLUGIN_ROOT}/references/house-style.md`. Family rules and oracles: `${CLAUDE_PLUGIN_ROOT}/references/qa/README.md`, `oracles.md`, `risk-model.md`, `measurability.md`, `test-design-techniques.md`.

## Inputs

An epic key, a fix version, a PR or preview URL, a feature flag, or a PRD link. Ask for the one missing piece that changes the scope (usually the epic or the PR); infer the rest by following links.

## Workflow

### 1. Scope

Name what is in and out: the stories in the release, the flag that gates it, the environments it is on, the surfaces it touches (check `device-matrix.md`). State what is explicitly out (other stories on the same epic, other flags).

### 2. Gather the sources (read only)

Follow links outward from the input, and record each source with its date and owner:

- **Jira:** the epic, every story in scope, their ACs, comments, linked issues, and open bugs in the area (Atlassian tools).
- **Confluence:** the PRD, its grill page and decision log, earlier QA runs on the epic.
- **Decisions and meetings:** the decision log; meeting notes (Granola) and the team's project pages that mention the epic. The Brain (`my_brain`) may be read for context on the work side only; `20 Areas/Personal` and `10 Projects/Personal` are never read.
- **Figma:** the frames linked from the epic and stories (Figma tools, `get_design_context` / `get_screenshot`).
- **Code, read only:** the PR diff, routes, flags, and what consumes the changed code (`code-qa` does the deep read; here, list the consumers).
- **The reference pack:** glossary, pattern library, component reference, accessibility standard, and `hospitality-conditions.md`, whose [evidence] entries often decide a risk rating (a known past failure in the same area raises Consequence).

Walk HICCUPPS (`oracles.md`) to check no oracle type was skipped. A source you could not reach is listed under **Sources not read**, with why.

### 3. Extract claims

Every testable statement, each with its source: what the build must do (ACs), must not do (non-goals, decisions), must say (copy, glossary), must look like (Figma, component reference) and must measure (success metrics). One line each, cited.

### 4. Find the conflicts

Compare claims about the same thing across sources. Treat **silence on a high-consequence outcome** (one source, no rule for what happens) the same as a conflict (`oracles.md`, "When a source is silent"). Each conflict lists: the point, every source's version with date and owner, which version the build follows (if known), the default authority order from `oracles.md`, and the question a person must answer. Mark each conflict High consequence or not, using step 6.

### 5. Testability and measurability

- **Untestable ACs:** any AC that cannot be written as a concrete example. Give a Given/When/Then rewrite with real values (`test-design-techniques.md`). Missing negative cases count.
- **No PRD, no metric, no ACs.** No PRD, or a PRD with no success metric: one Instrumentation gap at P1 ("no success metric to measure"). A story in scope with no ACs: one Decision needed per story, High consequence if its flow is. Missing is never a silent pass.
- **Measurability:** one row per PRD success metric through the chain in `measurability.md` (metric, behaviour, event, exists?, query, baseline, segments, dependency, verdict). Use PostHog where connected to check events exist. A gap is an **Instrumentation gap** finding.

### 6. Risk map and blast radius

Rate every flow in scope Frequency × Consequence with cited evidence (`risk-model.md`), and list what consumes changed shared code. Recommend the tier.

### 7. Hand back

Write findings (conflicts as Decision needed, untestable ACs as proposed AC rewrites for the story's PO, metric gaps as Instrumentation gap; never tickets at this stage, per `routing.md`) in the finding schema with source key `B`, and pass them to `defect-writer`. Present the Test Basis page in the format in [references/test-basis-format.md](references/test-basis-format.md), conflicts first.

If any conflict or silence is on a high-consequence flow, end with: **Stopped: <n> decisions needed before testing**, and the list. Offer to re-run once ruled.

## Must never

- Rule on a conflict, or pick a source silently. Present and date; a person decides.
- Invent an AC, a metric, or a decision. Missing is reported as missing.
- Write to Jira, Confluence or the repo. It drafts; `defect-writer` routes; a person approves.
- Read the personal side of the Brain.

## Guardrails

Trigger: on demand, or as step 1 of `qa-mission`. Reads: Jira, Confluence, Figma, Granola, PostHog, the repo read only, the Brain's work layers. Autonomous: reading and drafting the page. Always pauses: any write. Escalation: a high-consequence conflict stops the run and goes to the release owner. Autonomous writes (run-prefixed data) on PR previews only; shared hosts need approval (`environment-register.md`). Every escalation is drafted, never sent (`quality-model.md`). Vault scope: the Brain's work layers only, read only; never writes the vault.

## Definition of done

Every story in scope has its ACs extracted and each judged testable or rewritten; every success metric has a measurability row; every flow has a risk rating with evidence; conflicts listed with dated sources and a question each; sources not read are named; a tier is recommended; findings are in schema with oracles.
