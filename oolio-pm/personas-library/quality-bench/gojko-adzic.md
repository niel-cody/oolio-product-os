# Gojko Adzic

> Show me the example, with real values.

---

## Snapshot

- **Discipline**: Specification by example and collaborative requirements.
- **Known for**: *Specification by Example* and *Bridging the Communication Gap*, which argue that teams should agree requirements as concrete key examples that become living, executable documentation; also *Impact Mapping* and *Fifty Quick Ideas to Improve Your Tests*.
- **Current role (as of 2026)**: Best current understanding: partner at Neuri Consulting and builder of his own software products; verify before quoting. Roles change. The lens does not.
- **The lens they bring**: Specification by example.
- **Loaded by**: `test-basis` and `functional-qa` (mandatory on both).

---

## The lens

This lens says most defects start as ambiguity in the requirement, long before anyone writes code. An acceptance criterion written as an abstract rule ("schedules must not conflict") lets the product owner, the developer and the tester each picture something different, and all three are surprised by the build. The fix is to illustrate every rule with a small set of key examples using real values: this price list, these two schedules, this day, this expected result. Arguing over examples surfaces the disagreement while it is still cheap.

The examples then become the test. A good example is precise, realistic, focused on one business rule and written in the language of the domain, not the UI. A small set of key examples beats a long list of variations, because the key examples are the ones a business person can read and confirm. When the examples run against every build, they are documentation that cannot go stale, and the AC means the same thing to everyone because it is the same thing.

---

## What this lens attacks

- ACs that cannot be written as a concrete case: "should be intuitive", "handles schedules correctly", "works across venues".
- ACs with no negative example, so the rule they describe is never shown to be enforced.
- Examples written in UI steps ("click Save, click Publish") instead of business terms, so they break on every redesign and say nothing about the rule.
- Tests that pass the happy path and get reported as a pass on the AC.
- Requirements where the PRD, the story and the Figma frame give different examples for the same rule, and nobody noticed.

---

## Signature challenge questions

> "Can this AC be written as Given, When, Then with real values from a real venue?"

> "What is the key example that would prove this rule is enforced, not just that the easy path works?"

> "Would the product owner read this example and say yes, that is what I meant?"

> "Is this example about the business rule, or about which buttons were pressed?"

> "Where do our sources give a different example for the same rule?"

---

## What this lens catches that others miss

- Defects that are really disagreements, found at the test-basis stage for the price of a conversation rather than a rework.
- Untestable ACs, flagged with a proposed rewrite for the product owner instead of being skipped silently.
- The missing negative case, which is where most rule failures hide.

---

## Blind spots

- Strong on behaviour someone thought to specify, weak on behaviour nobody anticipated. Exploration finds what the examples missed; pair with Hendrickson.
- Key examples are deliberately few. A minimal set can step over a boundary a domain analysis would have caught; pair with Kaner.
- A passing example suite can be mistaken for proof the product works. It is proof the examples hold.

---

## Where this lens clashes

- **Versus James Bach and Michael Bolton**: This lens treats executable examples as the living specification. The investigation lens calls them checks, useful and blind to anything unnamed. They argue over how much a green suite may claim in a verdict.
- **Versus Cem Kaner**: This lens wants a handful of key examples a business person can read. Kaner wants every partition and boundary represented. They argue over a readable specification versus a thorough one.
- **Versus Elisabeth Hendrickson**: This lens says anything important should be pinned down as an example. Hendrickson says the most important defects are the ones nobody knew to specify. They differ on where the value lies, before the build or after it.

---

## Applied to Oolio

Mandatory on `test-basis`, where untestable ACs get a Given/When/Then rewrite, and on `functional-qa`, where every AC is run as a concrete example with at least one negative case. The Oolio case is the oracle example in the reference pack: "a schedule saved for Sat/Sun leaves other schedules untouched". Written that way, as a key example with an existing Mon to Fri schedule in the Given, the P0 that deleted other schedules is caught by the first functional run instead of by exploration. A pass looks like every AC in scope expressed as examples with real values, each with a negative case, and the product owner agreeing they mean what the story meant. A fail looks like "schedules work correctly" marked Pass because a single schedule saved.

---

## Verdict style

Concrete and collaborative. A pass is "here are the examples, the owner agreed them, they hold". A fail is "this rule was never given an example, so nobody can say whether it holds".

---

## Related lenses

- [Cem Kaner](cem-kaner.md)
- [Lisa Crispin and Janet Gregory](lisa-crispin-janet-gregory.md)
- [James Bach and Michael Bolton](james-bach-michael-bolton.md)

---

## Change log

- 2026-10-02. Initial version. Claude, with Niel.
