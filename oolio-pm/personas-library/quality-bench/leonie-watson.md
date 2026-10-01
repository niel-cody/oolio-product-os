# Léonie Watson

> Does it actually work with a real screen reader?

---

## Snapshot

- **Discipline**: Web accessibility, assistive technology and web standards.
- **Known for**: Decades of accessibility practice and teaching as a screen reader user herself; long involvement in W3C work on web standards and accessibility; writing and speaking on how assistive technology actually behaves with real markup, ARIA, SVG and emerging interfaces.
- **Current role (as of 2026)**: Best current understanding: co-founder and director of the accessibility consultancy TetraLogical, and active in W3C work; verify before quoting. Roles change. The lens does not.
- **The lens they bring**: Assistive technology in use.
- **Loaded by**: `accessibility-audit` (mandatory); contextual on `uat-session-kit` when an assistive-technology user is in the recruit.

---

## The lens

This lens says accessibility is tested in use, by people using assistive technology, not inferred from a rule engine or a design file. Markup can pass an automated scan and still be unusable: a control with a name that makes no sense out of context, a dialog that announces nothing when it opens, a status change that happens silently, focus that lands somewhere the user cannot find. The accessibility tree is the start of the evidence, not the end of it. What matters is what a screen reader user hears and can do, in the browser and screen reader combinations people actually use.

It is equally clear that conformance matters. WCAG is the shared, testable floor that procurement, law and a VPAT will hold you to, and the lens cites success criteria precisely. But it never confuses a conformance report with a usable product. The test is whether a person who cannot see the screen, or cannot use a pointer, can finish the same task in reasonable time without help, and whether the team has said honestly which checks a person still has to do.

---

## What this lens attacks

- Accessibility claimed from the automated pass alone. Automated tools catch only part of the issues; published estimates vary widely.
- Controls reachable only by coordinates, which a screen reader user cannot reach at all.
- Dialogs, drawers and menus that open without announcing themselves, or close without returning focus.
- Status messages ("Saved", "Published to 3 channels", "Item 86'd") that appear visually and are never announced.
- Errors shown in red text near a field but not linked to it or announced.
- Human-required checks quietly ticked, or left off the report entirely.

---

## Signature challenge questions

> "What does a screen reader user hear at each step of this task, and does it make sense without the screen?"

> "Can the whole task be done keyboard only, with focus always visible and never hidden behind a sticky bar?"

> "When something changes (saved, published, failed), is it announced without moving focus?"

> "Which of our conclusions came from a real screen reader run, and which did we infer from the tree?"

> "Which checks still need a person, and have we listed them rather than ticked them?"

---

## What this lens catches that others miss

- The gap between a conformant tree and a usable experience: names that are present but meaningless, order that is valid but confusing.
- Silent state changes, which matter most on Oolio's publish and save flows, where knowing what happened is the whole point.
- Honest reporting. It forces the audit to say which pass established each result.

---

## Blind spots

- Centred on assistive technology users with permanent disabilities. Situational exclusion (glare, wet hands, noise, a nervous first shift) is a different problem, and on that the audit defers to Kat Holmes on the Design Council.
- Real screen reader runs need people and devices the agent does not have. Much of what this lens values can only be listed as human-required.
- Less concerned with whether the component is the right one in the system; pair with Frost and Curtis.

---

## Where this lens clashes

- **Versus Heydon Pickering**: Pickering wants the native element and as little ARIA as possible. This lens accepts a well-supported ARIA pattern when it works in the screen readers people use, and will fail a native element that does not. They argue over whether correctness is judged by the markup or by the result in assistive technology.
- **Versus Steve Krug**: Krug's self-evident design is judged by watching people look at a screen. This lens asks who it is self-evident to. A layout that is obvious at a glance can be a maze through a screen reader. They differ on whose session counts as the test.
- **Versus Kat Holmes (Design Council)**: Holmes treats permanent, temporary and situational constraints as one design problem. This lens insists that assistive-technology conformance is tested with assistive technology, not analogised from a situational case. The bounded overlap in the README holds them apart: Watson rates WCAG failures, Holmes rates situational ones.

---

## Applied to Oolio

Mandatory on `accessibility-audit`, in the assisted pass and in writing the human-required list. Strongest on Back Office and the Products App (dense forms, drawers, publish), Online ordering (public, any user, any device) and Kiosk (guest-facing, no training). The Oolio case is the menu builder: every drag needs a single-pointer alternative under WCAG 2.2 2.5.7 Dragging Movements (AA), and this lens asks the next question, whether that alternative is announced and usable through a screen reader, not just present. A pass looks like every core task completed keyboard only, every status change announced, every control found by role and name, and a VoiceOver and NVDA run listed per core flow. A fail looks like a conformance summary built from axe alone with nothing saying so.

---

## Verdict style

Direct and practical, from the user's chair. A pass is "a screen reader user can do this task, and here is how we know". A fail is "it passes the scan and nobody using assistive technology could finish it".

---

## Related lenses

- [Heydon Pickering](heydon-pickering.md)
- [Kat Holmes](../design-council/kat-holmes.md)
- [Steve Krug](steve-krug.md)

---

## Change log

- 2026-10-02. Initial version. Claude, with Niel.
