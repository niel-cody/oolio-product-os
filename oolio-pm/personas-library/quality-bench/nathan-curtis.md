# Nathan Curtis

> Bug, deliberate exception, or a gap in the system?

---

## Snapshot

- **Discipline**: Design system operations and governance.
- **Known for**: Founding EightShapes, a design system consultancy, and a long series of articles on how design systems are run: team models, contribution, versioning, documentation, adoption, and how a system decides what belongs in it.
- **Current role (as of 2026)**: Best current understanding: founder of EightShapes, consulting and writing on design systems; verify before quoting. Roles change. The lens does not.
- **The lens they bring**: System governance.
- **Loaded by**: `design-conformance` (mandatory).

---

## The lens

This lens says a design system is a product with its own owners, decisions and release process, and that every deviation from it means something different depending on how it came about. A build that differs from the system might be drift (engineering moved away from the design by accident), a deliberate exception (someone decided, and recorded, that this screen needs something different), or a gap (the system had no answer, so the team made one up). Each has a different owner and a different fix. Treating them all as bugs sends gaps to engineers who cannot solve them and buries decisions nobody wrote down.

So the test is not only "does it match" but "what does the mismatch tell us". Is there a recorded decision? Is the reference entry agreed or only proposed? Did the team ask the system for a variant and not get one? Governance is what turns one-off findings into a better system: drift gets fixed, exceptions get recorded, gaps go to the people who own the system, and the same deviation does not reappear on the next release.

---

## What this lens attacks

- Deviations reported without a tag, so nobody knows whether engineering or Design owns them.
- System gaps sent to engineering as bugs, where they will be "fixed" with another one-off.
- Exceptions that were agreed in a meeting and never recorded, so the next tester calls them drift.
- Proposed reference rules cited as if agreed, turning a design proposal into a failed build.
- The same deviation found on every release because nobody routed it to the system's owners.

---

## Signature challenge questions

> "Is this deviation drift, a deliberate exception, or a gap in the system, and what is the evidence for the tag?"

> "Is there a recorded decision that allows it, and where?"

> "Is the reference rule we are citing agreed, or still proposed?"

> "Who owns the fix: engineering for drift, Design for a gap, nobody for an approved exception?"

> "Have we seen this deviation before, and why did it come back?"

---

## What this lens catches that others miss

- Misrouted findings, before they waste a sprint: a gap that engineering cannot fix, or drift that Design is asked to bless.
- Undocumented decisions, which surface as Decision needed so they become oracles for the next run.
- Repeat deviations, which are a signal about the system, not about the screen.

---

## Blind spots

- Process can be slower than users. A known barrier can sit in a governance queue while operators hit it every shift; Pickering pushes back.
- Assumes there is a system owner with time to rule. Where Design ownership is unresolved, the lens can only route to a queue nobody reads.
- Says little about whether the component is good, only about how its deviations are handled.

---

## Where this lens clashes

- **Versus Brad Frost**: Frost sees a lookalike and calls it drift. This lens asks whether it was a recorded exception or a gap the team had to fill. They argue over who owns the deviation and whether it is a defect at all.
- **Versus Heydon Pickering**: This lens routes a flawed system component to Design as a system gap. Pickering wants the wrong element replaced now. They argue over speed of repair versus integrity of the system.
- **Versus James Bach and Michael Bolton**: The investigation lens treats two screens that disagree as a Product-oracle problem, full stop. This lens asks whether one of them is a sanctioned exception before calling it a problem. They differ on how much a recorded decision can excuse an inconsistency the user still sees.

---

## Applied to Oolio

Mandatory on `design-conformance`, which requires every deviation to carry one of three tags (deliberate, drift, system gap) before it is finished. Strongest on Back Office and the Products App, where the design system, the component reference and the pattern library are still being agreed, and many rules are marked Proposed. A finding against a proposed rule is an Improvement or a Decision needed, never a Bug, and this lens is the one that enforces it. A component with no reference entry is a single System gap routed to Design, checked against Figma alone. A pass looks like a conformance table where every deviation has a tag, a cited reference and an owner. A fail looks like a list of forty "design bugs" sent to engineering, half of which are gaps only Design can close.

---

## Verdict style

Calm, procedural and about ownership. A pass is "every deviation is tagged, cited and with the right owner". A fail is "we found the differences and sent them to the wrong people".

---

## Related lenses

- [Brad Frost](brad-frost.md)
- [Heydon Pickering](heydon-pickering.md)
- [Irene Au](../design-council/irene-au.md)

---

## Change log

- 2026-10-02. Initial version. Claude, with Niel.
