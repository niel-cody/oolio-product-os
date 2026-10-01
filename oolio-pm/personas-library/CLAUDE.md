# How to use the persona library

This file is the operating guide for everyone, human or AI, who works inside the `personas/` folder. Read it before you add, edit, or convene anything here. `personas.md` is the human-readable index and the house rules. This file explains how the folder is built, why it is built that way, and how to extend it without breaking it.

The persona library is not a marketing artefact. It is the validation system Oolio uses to pressure-test every product decision before it is committed. The goal is simple. Improve what we build, at scale and at velocity, by making sure every decision is challenged from every angle that matters before it ships.

---

## The big idea

We do not validate product decisions with one opinion in one meeting. We convene a standing set of review bodies, each made of named lenses, and we make them argue. A decision that survives the argument is a better decision. A decision that only ever heard one voice was never tested.

There are three kinds of thing in this folder, and they do three different jobs.

1. **The Chair.** One elevated role that sits above every review body, chairs the master council, and turns argument into a decision record. The Chair is not a member of any single subcommittee. The Chair sits on all of them.
2. **The subcommittees.** Standing review panels, each made of lenses, each pointed at one face of the decision. Today there are three. There will be more.
3. **The reference sets.** Supporting material that the subcommittees read from, such as the organisation profiles and the framework documents.

Every feature, epic, or strategic call should be able to walk this system: the right subcommittees convene, each lens challenges the decision from its own angle, the clashes are surfaced, and the Chair writes the record.

---

## The structure

```
personas/
├── CLAUDE.md                       this file. how to use the folder.
├── personas.md                     the index and the house rules.
├── product-council-chair.md        the elevated Chair. sits on every subcommittee.
├── behavioural-alchemist.md        the elevated cross-cutting lens (Roy). convened on any subcommittee.
├── segments.md                     cross-cutting map. personas by segment and vertical.
│
├── _framework/                     shared reference for all subcommittees
│   ├── oolio-context.md            what Oolio is and what Oolio wants to be
│   ├── segmentation.md             the axes we segment on
│   └── persona-template.md         the canonical template for hospitality user personas
│
├── uat-panel/                      SUBCOMMITTEE 1: the Operator Council
│   └── ...                         hospitality user personas, grouped by role
│
├── design-council/                 SUBCOMMITTEE 2: the Design Council
│   └── ...                         expert design and research lenses
│
├── leadership-subcommittee/        SUBCOMMITTEE 3: the Leadership Subcommittee
│   ├── README.md                   purpose, membership, how to run a review
│   ├── _leadership-subcommittee-template.md
│   └── ...                         one file per executive and commercial lens
│
│                                   SUBCOMMITTEE 4: the STORM Subcommittee (research) is now
│                                   run by the storm-research skill. Its original Co-STORM
│                                   role files are archived in ../_archive/storm-subcommittee/.
│
└── _archive/                       retired personas, kept for reference
    └── organisations/              retired. business-level view now in segments.md
```

The plugin also keeps a top-level archive at `oolio-pm/_archive/` for retired skills, lenses, and templates beyond personas. The STORM Subcommittee's Co-STORM role files live there.

---

## The subcommittees, today

| Subcommittee | Folder | The question it answers | Made of |
|---|---|---|---|
| Operator Council | `uat-panel/` | Would our real users accept this, and does it survive a Friday night | Hospitality user personas |
| Design Council | `design-council/` | Is the design sound by expert principles | Expert design and research lenses |
| Leadership Subcommittee | `leadership-subcommittee/` | Should we invest in this, what risk are we taking, and can we sell, support and deliver it | Executive and commercial lenses |
| Quality Bench (not a council) | `quality-bench/` | Is the build right, and how would a good tester know | Testing lenses, used by the QA family |
| Test persona cards (not a council) | `test-personas/` | Who does the tester pretend to be when using the build | Behavioural cards on top of UAT panel personas |
| STORM Subcommittee | the `storm-research` skill | Have we researched this widely, from perspectives we did not think of, grounded in real sources | A five-lens, citation-verified research pipeline (role files archived) |

Three of these are review panels that test a decision. Each holds the floor on its own ground. The Operator Council holds operational reality. The Design Council holds design quality. The Leadership Subcommittee holds commercial and executive judgement.

The STORM Subcommittee is different in kind. It is a research engine, modelled on the Stanford OVAL STORM and Co-STORM method. It runs at the front of the loop, researches the topic, discovers the perspectives, grounds the evidence, and hands the Chair a cited briefing so the testing panels argue from evidence rather than assumption. It can be re-entered whenever a clash exposes an evidence gap. A serious decision is researched by STORM and then tested by the other three. STORM is now executed by the **`storm-research` skill**, not by role files in this folder; the original Co-STORM role files are archived in `../_archive/storm-subcommittee/`.

The Domain Expert Council (product, BA, data, implementation, architecture, support detail) is named in the framework and may be built next, as a further subcommittee, following the same pattern.

---

## The Chair sits above all of it

The Product Council Chair (`product-council-chair.md`) is deliberately not filed inside any subcommittee. The Chair is elevated. The Chair sits on every subcommittee, and when the subcommittees come together as a town hall or master council, the Chair is the adjudicator and writes the decision record.

This separation is the point. If the Chair were just another member of the Leadership Subcommittee, the role that resolves trade-offs across the whole system would be trapped inside one face of it. By lifting the Chair out, the role can do its actual job: run the process, force clarity, surface where lenses disagree, and convert discussion into a decision, a confidence rating, the PRD edits, and the escalation points.

When you convene any review, the Chair is always in the room.

---

## The Behavioural Alchemist travels with them

The Behavioural Alchemist (`behavioural-alchemist.md`), summoned as **Roy**, is the second role kept out of any single subcommittee, and for the same reason the Chair is. His remit, perceived value, framing, loyalty, pricing, positioning, and the felt experience of merchants, staff, and diners, lands on all three panels at once. File him inside Leadership and he could not challenge a Design Council clash about friction, or an Operator Council read of a Friday-night queue. So he sits here, elevated, and is convened into whichever panel a decision needs.

He is not the Chair, and does not adjudicate. The Chair converts argument into a decision. Roy is a provocateur and a lens: he keeps the credible irrational option alive long enough to be tested, insists perceived value is real value, and asks whether a cheap change in perception would beat an expensive change in reality. He is a **conditional** seat, not a default one, convened when a decision touches pricing, loyalty, positioning or naming, packaging, retention, or felt experience, so he does not turn every review into theatre. He is also a lens of the same kind as the Design Council, inspired by the published work of a real practitioner (Rory Sutherland) and never given invented quotes. He can be summoned on his own, outside any council, through the `behavioural-alchemist` skill.

---

## How to run a review

1. **Name the decision.** One sentence. What are we actually deciding.
2. **Define done.** Before anything is convened, write the success criteria. What must be true for this to be a good decision, stated so that someone else could check it. This is the goal the loop runs towards. A review with no defined done can never succeed, because nothing tells it when to stop.
3. **Name the surface.** Product, epic, migration, pricing change, strategic call.
4. **Convene the right subcommittees.** Not every decision needs all of them. A pure UX change may only need the Design Council and the Operator Council. A pricing or packaging call leans on the Leadership Subcommittee. A platform decision needs all of them, and most serious decisions are researched by STORM first.
5. **Convene the right lenses inside each subcommittee.** Each subcommittee README explains its own default and conditional membership. Do not run every lens on every decision. That is theatre and it produces a contradictory mess no squad can act on.
6. **Run each lens.** Read the lens file. Ask its challenge questions of the decision. Record where it passes and where it fails.
7. **Surface the clashes.** Where two lenses disagree, write the disagreement down. Do not paper over it. The clash is the value.
8. **The Chair adjudicates.** The Chair resolves each clash, states the recommendation, the trade-offs accepted, the confidence level, the PRD changes required, and whether human approval is needed.
9. **Check against done, and loop if not met.** The Chair tests the result against the success criteria from step 2. If any criterion is unmet, a clash is unresolved, or an evidence gap remains, the loop runs again: back to STORM for more evidence, or back to a panel for another pass. The review is not finished after one pass. It is finished when done is met.
10. **Verify, do not assert.** Do not take the Chair's word that done is met. Run a verification pass that checks each success criterion against the actual evidence and decision, ideally with a fresh lens or an independent check. Verified means shown, with the evidence, not claimed.
11. **Record it, then validate.** Only once done is met and verified is the decision recorded. That record is the validation artefact. The named human owner then validates it, moving it from Proposed to Validated.

---

## Done is defined, verified, and checked

This is the part that makes the system valid rather than performative. A council that argues once and stops has produced an opinion, not a validated decision. The loop only earns the word "validated" if it runs until it meets a goal it set in advance, and proves it.

Three things have to be true, in this order.

1. **Done is defined up front.** The success criteria are written at the start, in step 2, before any lens runs. They are the goal. They should be checkable, so that meeting them is a matter of evidence, not opinion. If we cannot say what done looks like, we are not ready to convene.
2. **The loop runs until done is met.** Each pass is checked against those criteria. An unmet criterion, an unresolved clash, or an open evidence gap sends the loop round again, re-entering STORM for evidence or a panel for another pass. The loop has a defined exit, and the exit is done, not exhaustion or the end of the meeting.
3. **Done is verified and checked, not asserted.** When the Chair believes done is met, that belief is tested. A verification pass checks each criterion against the real evidence and the actual decision, and the strongest form of this uses a fresh lens or an independent reviewer rather than the same voice that declared it done. Only a verified done is done.

The definition-of-done checklist a decision must satisfy before it leaves the loop:

- Every success criterion from step 2 is met, and the evidence for each is named.
- Every major clash is resolved, or consciously accepted and recorded as a trade-off.
- No open evidence gap remains that would change the decision. If one does, STORM is re-entered.
- Confidence is at or above the level set when done was defined.
- The verification pass has checked each criterion and signed it off.
- The human owner has everything they need to validate.

Until every line is true, the loop is still running. When every line is true, the decision is done, verified, and ready for human validation. This is non-negotiable. It is the difference between a decision we can stand behind and a confident guess.

---

## The lens model, and why these are not user personas

Two different things live in this folder and they must not be confused.

A **user persona** (the Operator Council, in `uat-panel/`) is a single, named, real-feeling hospitality operator we build for. It has an age, a venue, a day in the life under pressure. It answers "who are we building for".

A **lens** (the Design Council, the Leadership Subcommittee, and the STORM Subcommittee) is a point of view we test or research against. It is a role and a philosophy, not a biography. It answers "is this decision any good, and how do we know". The Design Council lenses are inspired by real, living practitioners and must never be given invented quotes. The Leadership Subcommittee lenses are executive and commercial roles (CPO, CFO, CRO, and so on), written as functions, not as named individuals. The STORM Subcommittee lenses are research roles drawn from the Stanford OVAL STORM and Co-STORM method, also written as functions.

When you add to the folder, know which kind of thing you are adding, and use the matching template.

---

## How this grows

This system is designed to scale beyond the subcommittees built today. The expected directions of growth are:

- **More subcommittees.** The Domain Expert Council is the next obvious one. Each new subcommittee gets its own folder, README, and template, and is added to `personas.md` and to the table above.
- **Verticals and industry types.** Hospitality is not one market. Pubs, fine dining, stadia, QSR, cafes, hotels, and retail-adjacent venues behave differently. We do not write a separate persona type per vertical. We add user personas to the UAT panel, tag each one in its Snapshot, and pull them through by vertical in `segments.md`.
- **Business and segment types.** Independent, small group, mid-market, enterprise. The segmentation framework (`_framework/segmentation.md`) names these axes and `segments.md` is the live map that links personas to them, shows the coverage gaps, and maps to the JPD business-segment field. A review can then convene the exact segment a decision targets.

The retired `organisations/` folder used to carry the business-level view. It was superseded by the owner and executive personas plus `segments.md`, and moved to `_archive/`. We do not maintain a parallel organisation-persona type.

The principle holds at every size. Name the decision, convene the lenses that matter, make them argue, let the Chair record the result. The structure is what lets us do this consistently, which is what lets us do it at scale and at velocity. That consistency is the differentiator.

---

## Rules for working in this folder

These sit on top of the house rules in `personas.md`. Read both.

1. **British English only. No em dashes. No buzzwords.** If a sentence could come out of a generic SaaS deck, rewrite it.
2. **Use the right template.** User personas use `_framework/persona-template.md`. Quality Bench lenses use `quality-bench/_quality-bench-template.md`; test persona cards use `test-personas/_test-persona-template.md`. Design Council lenses use `design-council/_design-council-template.md`. Leadership Subcommittee lenses use `leadership-subcommittee/_leadership-subcommittee-template.md`. (The STORM Subcommittee is now the `storm-research` skill, so it has no lens template here; its archived template is in `../_archive/storm-subcommittee/`.) Fill every section. Empty sections are not allowed.
3. **One file per lens or persona. Update, do not duplicate.** No v1, v2. Edit the file. Retire to `_archive/` with a note, never delete.
4. **The Chair stays elevated.** Do not file the Chair inside a subcommittee. The Chair sits on all of them.
5. **Lenses must disagree.** When you add a lens, name the gap it fills and the lens it argues with. A panel that all agrees is useless.
6. **Add to the index.** Any new file is added to `personas.md`, and any new subcommittee is added to the table in this file.
7. **No fabricated Oolio claims.** Do not invent features, integrations, partnerships, or numbers. If a fact is needed and is not in `_framework/oolio-context.md`, leave it out or flag it.

---

## Owner

Niel Cody (Product) owns the library and this operating model. Anyone can propose a lens, a subcommittee, an edit, or an archive. Approval sits with Product, with the relevant function lead for function-specific lenses.
