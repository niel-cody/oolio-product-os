# Driving a build: the browser method

How every specialist that touches a running build drives it, captures evidence and knows when not to trust itself. Applies to `functional-qa`, `exploratory-qa`, `design-conformance`, `accessibility-audit`, `persona-uat`, `resilience-qa`, and the councils in built mode.

## Before the first click

1. **Check the environment against the register.** The URL must match an allowed pattern in [environment-register.md](environment-register.md). If it does not, or it could be production, stop and ask. No exceptions for "just reading": reading production with a privileged account can still trigger writes (autosave, view tracking, locks).
2. **Use a test account for the role under test.** If the run needs a person's real login, SSO, or MFA, pause and ask the person to sign in themselves in the browser; never type a password.
3. **Record the build.** PR number or build ID, commit if shown, flag state, environment, account role, browser, viewport. Every finding inherits these.
4. **Set up data deliberately.** Create what the test needs, named with the run ID prefix (`QA-R1-…`) so it is findable and removable. Never edit data the register marks as shared or seeded for others.

## Driving

- **Role and name first.** Find controls through the accessibility tree (Playwright MCP or the browser tool's page read): `button "Publish"`, `combobox "Order type"`. Fall back to text, then to coordinates from a screenshot, in that order. **A control that can only be reached by coordinates is an accessibility finding** (WCAG 4.1.2 Name, Role, Value), because a screen reader cannot reach it either.
- **Screenshots second.** Take one at each verdict point and for every finding, not at every step.
- **Read the console and network** at every finding and at the end of each flow. A 4xx or 5xx behind a screen that looks fine is a finding.
- **Wait for state, not for time.** Wait for the element, the network idle or the toast, not a fixed sleep. A test that only passes with a long sleep has found a performance finding.

## When not to trust yourself

Synthetic interaction is unreliable at the edges. The Menus 2.0 UAT run saw a tree-to-grid drag "scramble the page", and the most likely cause was the harness, not the app.

- Any finding that depends on **drag, hover, precise timing, animation or gesture** is labelled *Needs human repro*, whatever was seen, and cannot be reported as a confirmed P0.
- Before calling any P0 or P1, **reproduce from a clean start** (fresh load, fresh data) at least twice.
- If a result changes between identical runs, report it as **flaky** with both outcomes; flakiness in the product is itself a finding, flakiness in the harness is noted under "Issues" and not reported as a product bug.

## Cleaning up

At the end of a run, delete or archive what the run created, if the register says that is allowed, and list what was left behind and why. Never delete anything the run did not create.

## The repo

The repo is evidence, read only. Read the diff, routes, flags and tests. Never commit, branch, push, open a PR or comment on one without explicit approval; proposed tests and Playwright specs are handed to engineers as drafts in the report.
