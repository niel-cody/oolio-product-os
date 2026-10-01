---
name: design-conformance
description: Check that the built screen is what was designed, in the system's own components. Compares the live build, in order, against the Figma frame for the work, the component reference (is this the real ControlBar or a lookalike, are all states present, does the Select follow its rules), the pattern library (navigation in the shell, drawers versus modals, save versus publish, destructive actions, empty and error states), the design tokens, and the glossary. Tags every deviation deliberate, drift or system gap, so drift goes to engineering and gaps go to Design. Trigger on "does the build match the design", "check it against Figma", "design QA", "is this our component", "pass it through design", "check the copy against the glossary". Do NOT trigger to judge whether the design itself is good (design-council-review, built mode) or for WCAG checks (accessibility-audit).
---

# Design conformance: did we build what was designed

The mechanical version of "pass it through the design team". It does not ask whether the design is good; that judgement stays with the Design Council. It asks whether the build is the design, built from the system, using the product's words.

**The rule: every deviation gets a tag.** *Deliberate* (a decision or the Figma allows it), *drift* (the build moved from the design: engineering), or *system gap* (the design system has no answer: Design). A deviation without a tag is not finished, because the tag decides who fixes it.

House style: `${CLAUDE_PLUGIN_ROOT}/references/house-style.md`. Oracles, in `${CLAUDE_PLUGIN_ROOT}/references/qa/`: `component-reference.md`, `pattern-library.md`, `glossary.md`, `accessibility-standard.md` (contrast only), `device-matrix.md`, `browser-method.md`. Lenses: `${CLAUDE_PLUGIN_ROOT}/personas-library/quality-bench/` (component fidelity, system governance, inclusive components).

## Inputs

The build URL (or the screens in scope from the Test Basis) and the Figma frames linked from the epic or stories. No Figma frame: say so, and check against the component reference and pattern library alone.

## Workflow

### 1. Line up the three references

For each screen in scope: the Figma frame (Figma tools: `get_design_context`, `get_screenshot`, `get_variable_defs` for tokens), the component reference entries for the components on it, and the pattern rules that apply. Note anything with **Proposed** status: findings against it are Improvements or Decisions needed, never Bugs.

### 2. Compare, in order

Check the environment against the register, then on the build at each viewport class the surface needs:

1. **Against Figma:** layout, hierarchy, content, states shown in the frames (default, empty, loading, error, disabled, selected). Missing states are findings.
2. **Against the component reference:** is it the system component or a one-off that looks like it (inspect the rendered element and, where the repo is readable, the import); does each rule hold (run the entry's checks); are all states present.
3. **Against the pattern library:** navigation stays in the shell; editing a layer down opens the right-hand drawer; creation starts in a modal or drawer; save and publish are distinct and the build says which reaches tills; destructive actions are named and itemised; empty, loading and error states are human and distinct; status is a word plus colour.
4. **Tokens:** colour, spacing, type and radius against the token values in Figma; contrast on the token pairs actually rendered (WCAG 2 ratio).
5. **Copy:** every label, tooltip, message and empty state against the glossary and its copy rules. Two names for one thing across screens is a Product-oracle finding even where the glossary has not ruled.

### 3. Tag and report

Each deviation: the reference it breaks (cite the entry and rule number), deliberate, drift or system gap (look for the decision or Figma note before calling drift), severity by consequence to the user (a wrong component variant is usually P2; a save that silently publishes is P0 whatever the visual). Findings to `defect-writer` with source key `D`. System gaps are routed to Design and listed separately. A component with no reference entry is one System gap ("no entry for <component>"), checked against Figma only.

Return a conformance table per screen (reference, rule, result, tag) for the QA Review page.

## Must never

- Judge taste. "I'd have done it differently" is not a finding; a broken reference is.
- Treat a Proposed rule as an agreed one, or invent a component rule that is not in the reference.
- Send a system gap to engineering, or drift to Design.

## Guardrails

Trigger: on demand, or by `qa-mission` at Standard and Full. Reads: the build in allowed environments, Figma, Storybook, the repo read only, the reference pack. Autonomous: reading and comparing. Always pauses: any write. Escalation: a pattern breach on a high-consequence flow (save that publishes, unnamed destructive action) goes to the release owner. Autonomous writes (run-prefixed data) on PR previews only; shared hosts need approval (`environment-register.md`). Every escalation is drafted, never sent (`quality-model.md`). Vault scope: the Brain's work layers only, read only; never writes the vault.

## Definition of done

Every screen in scope compared against Figma, the component reference and the pattern library; tokens and copy checked; every deviation tagged deliberate, drift or system gap with its reference cited; proposed rules flagged as proposed; findings handed to `defect-writer`.
