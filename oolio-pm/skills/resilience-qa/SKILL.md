---
name: resilience-qa
description: Test whether a build survives a real service, the Q4 question. Times key interactions against the Doherty threshold (about 400 ms for anything an operator waits on), runs against scale fixtures (thousands of products, many price lists times variants, a 40-venue group), simulates network loss and recovery mid-save and mid-publish, tests concurrent edits by two managers, and for POS-side work checks offline mode, the offline-versus-no-network states and sync-back. Trigger on "will it survive Friday night", "performance check", "is it fast enough", "what happens if the network drops", "test offline mode", "concurrent edits", "does it scale to a big group", "resilience test". Do NOT trigger for infrastructure load testing or security testing (engineering and the security lead own those) or for edge cases at normal load (exploratory-qa).
---

# Resilience QA: survives a real service

If a system fails under real operational pressure, it is not acceptable. The other specialists test the build on a quiet afternoon with a small catalogue and a good connection. This one tests it the way a venue uses it: at scale, under time pressure, with the network misbehaving and two people editing at once.

**The rule: measure, don't feel.** "It felt slow" is not a finding. A timed interaction against a stated threshold, on a stated fixture and network profile, is.

House style: `${CLAUDE_PLUGIN_ROOT}/references/house-style.md`. Method, in `${CLAUDE_PLUGIN_ROOT}/references/qa/`: `hospitality-conditions.md` (the Network, Scale, Time and People sections), `device-matrix.md`, `browser-method.md`, `environment-register.md`. Lens: `${CLAUDE_PLUGIN_ROOT}/personas-library/quality-bench/` (stability under failure).

## Preconditions (say which are missing)

This skill needs what most environments do not have yet: **scale fixtures** (a test org with a large catalogue, many price lists and variants, many venues), an environment where throttling and offline can be simulated, and for POS work a device or simulator. Check each first. A missing precondition is not worked around with a smaller test that is then reported as a pass: it is listed as **Not tested, fixture missing**, and the gap goes in the verdict.

## Workflow

### 1. Pick the scenarios

From the risk map's high-consequence flows and the hospitality conditions: the interactions an operator waits on during service (open a menu, save, publish, search the catalogue, load a report), the scale cases that apply, the network cases (drop mid-save, mid-publish; slow 3G-class profile; recovery), the concurrency cases (two tabs, two users, same object), and for POS-side work the offline list (what must work offline, what must be blocked with clear copy, what syncs back and in what order).

### 2. Time it

For each interaction, measure from the user's action to a usable result (not to the spinner), at least five times, on the stated fixture and network profile, and report the median and the worst. Thresholds: about 400 ms for direct feedback on anything an operator waits on mid-task (the Doherty threshold), visible progress for anything longer, and nothing that blocks the operator without saying what it is doing. Over threshold on a high-frequency flow is P2; a freeze or lost input on a service-time flow is P1.

### 3. Break it

Drop the network at the moment of save and publish, then restore it: is the work kept, lost, or half-saved, and does the screen say which? Edit the same object in two sessions: which wins, and is the loser told? For POS: confirm the offline state copy matches the actual state, the blocked actions say why, and orders made offline sync back complete and in order. Half-saved state with no warning is P0 if it can put the wrong thing live.

### 4. Report

Findings to `defect-writer` with source key `R`, each with the fixture, network profile, measurements and evidence. Timing findings resting on one sample are *Seen once*. Return the timing table, the failure-scenario results, and the preconditions that were missing, for the QA Review page.

## Must never

- Run load against shared or production environments, or generate traffic that could raise a real incident.
- Report a pass from a smaller fixture than the scenario names.
- Claim infrastructure capacity; that is engineering's load testing.

## Guardrails

Trigger: on demand, or by `qa-mission` at Full where fixtures exist. Reads: the build in allowed environments. Autonomous: timed runs and failure simulation in allowed environments with run-prefixed data. Always pauses: creating large fixtures in shared environments, any traffic that could reach alerting, any write outside the allow-list. Escalation: data loss on failure goes to the release owner as P0. Autonomous writes (run-prefixed data) on PR previews only; shared hosts need approval (`environment-register.md`). Every escalation is drafted, never sent (`quality-model.md`). Vault scope: the Brain's work layers only, read only; never writes the vault.

## Definition of done

Preconditions checked and gaps listed; every scenario timed (median and worst, five samples) or marked not tested with the reason; network, concurrency and (for POS) offline cases run; findings with fixture and profile handed to `defect-writer`.
