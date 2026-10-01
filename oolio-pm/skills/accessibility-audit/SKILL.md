---
name: accessibility-audit
description: Audit a live build against WCAG 2.2 AA and Oolio's surface targets (POS, kiosk, KDS, back office, online) in three passes reported separately: automated (axe-core rules, contrast on rendered colours), assisted (keyboard-only run of every task, focus not obscured, names and roles from the accessibility tree, target sizes, a single-pointer alternative for every drag, reflow, errors linked to fields) and the human-required list (real screen reader, cognitive load). Produces findings against the success criterion and a VPAT-shaped summary. Trigger on "accessibility audit", "is this accessible", "WCAG check", "keyboard test this", "check contrast", "can everyone use it", "we need an ACR or VPAT". Do NOT trigger for a mockup with no build (design-council-review, or design:accessibility-review, which targets WCAG 2.1) or design-system checks (design-conformance).
---

# Accessibility audit: can everyone use it

Three passes, reported separately, so nobody mistakes an automated pass for conformance. Automated tools catch only part of the issues; keyboard, focus and assistive-technology checks catch the rest. The floor is **WCAG 2.2 AA**, one version ahead of the generic plugin's 2.1, and 2.2's new criteria bite Oolio directly: every drag in a menu builder needs a single-pointer alternative (2.5.7), and sticky control bars and drawers must not hide the focused field (2.4.11).

**The rule: claim only what was checked.** An audit built only from the automated pass says so in its first line. Human-required checks are listed, never ticked.

House style: `${CLAUDE_PLUGIN_ROOT}/references/house-style.md`. Standard and method: `${CLAUDE_PLUGIN_ROOT}/references/qa/accessibility-standard.md` (the floor, the proposed surface targets, the three passes, the summary), `device-matrix.md`, `browser-method.md`, `component-reference.md` (per-component accessibility rules). Lenses: `${CLAUDE_PLUGIN_ROOT}/personas-library/quality-bench/` (assistive technology in use, inclusive components); the Design Council's Kat Holmes lens on situational exclusion. The keyboard-only test persona card (`${CLAUDE_PLUGIN_ROOT}/personas-library/test-personas/`) drives the assisted pass.

## Workflow

### 1. Scope

The screens and tasks in scope (from the Test Basis, or the user), the surface of each (sets the target from the standard; raised targets are cited as **proposed** until agreed), and the viewports from the device matrix. Check the environment against the register.

### 2. Automated pass

Run axe-core rules (or equivalent) on every screen and state in scope, including opened drawers, dialogs and menus, at each viewport. Compute contrast on the colour pairs actually rendered (WCAG 2 ratio; an APCA reading may be added as a note only). De-duplicate repeated violations into one finding per component.

### 3. Assisted pass

Run every task keyboard only, in character as the keyboard-only persona, and check: logical focus order; visible focus at 3:1; no traps; Escape closes what it opened and focus returns; focus never hidden behind sticky bars or drawers (2.4.11); every control reachable by role and accessible name in the tree (if the agent cannot find it, neither can a screen reader); target sizes measured (2.5.8; the surface target where raised); every drag has a single-pointer alternative (2.5.7); reflow at 320 px and 200% text for web surfaces; reduced motion honoured; errors identified in text, linked to the field and announced; status messages announced without moving focus (4.1.3); no placeholder-as-label; help in a consistent place (3.2.6); no redundant entry within a process (3.3.7); authentication without a cognitive test (3.3.8).

### 4. Human-required list

List, per core flow, what needs a person: a VoiceOver and NVDA run; cognitive load with a real user; canvas or custom-drawn surfaces; whether alt text and captions are meaningful. Offer the checklist to `uat-session-kit` if real sessions are planned.

### 5. Report

Findings to `defect-writer` with source key `A`, oracle as `WCAG 2.2 <SC> <name> (<level>)`, severity per the standard's mapping (a level A failure on a core flow is at least P1; anything fully blocking an assistive-technology user on a core flow is P1). Return the **conformance summary** (per criterion: Supports, Partially supports, Does not support, Not applicable, Not tested; which pass established it) for the QA Review page, reusable for a VPAT or ACR.

## Must never

- Report conformance from the automated pass alone, or tick a human-required check.
- Cite a proposed surface target as a WCAG failure.
- Use APCA as a pass or fail.

## Guardrails

Trigger: on demand, or by `qa-mission` (automated at every tier, assisted from Standard). Reads: the build in allowed environments, the reference pack. Autonomous: running the passes. Always pauses: any write. Escalation: a keyboard trap or blocked core task goes to the release owner as P1. Autonomous writes (run-prefixed data) on PR previews only; shared hosts need approval (`environment-register.md`). Every escalation is drafted, never sent (`quality-model.md`). Vault scope: the Brain's work layers only, read only; never writes the vault.

## Definition of done

Three passes reported separately; every finding cites its success criterion; surface targets applied and marked proposed where they are; the human-required list written per core flow; the conformance summary produced with its basis stated; findings handed to `defect-writer`.
