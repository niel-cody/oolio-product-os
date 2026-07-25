---
name: storm-research
description: >-
  Use when someone asks to run Storm Research, use the storm-research skill, run
  the STORM method on a topic, says "storm research this" / "storm report on X"
  / "give me a STORM briefing on X", or wants a multi-perspective,
  citation-verified research briefing delivered as a clean HTML report and,
  optionally, a Confluence page. Also the research engine the Virtual Product
  Council calls before its panels argue. Runs a 4-phase pipeline: five expert
  lenses (Practitioner, Academic, Skeptic, Economist, Historian) ->
  contradiction map -> synthesized HTML report -> adversarial peer review +
  primary-source verification, then publishes. Best where multiple viewpoints
  and fact-checked claims matter; overkill for a simple factual lookup.
argument-hint: "[topic to research]"
---

# Storm Research

## What this does

Turns one topic into a verified, multi-perspective briefing. It simulates five expert lenses on the topic, maps where they contradict each other, synthesizes everything into a single self-contained HTML report, then adversarially peer-reviews its own output and verifies every citation against its primary source before delivering. The output is one HTML file with no blind spots and no unchecked claims, and, when asked, a matching Confluence page.

Run the full pipeline end to end. Do not shortcut a phase. This is heavier than a quick web lookup; that is the point.

## Two ways this runs

1. **Standalone** (someone asks for a briefing on a topic). Full pipeline. You ask for the topic and the Confluence destination, produce the HTML report, and publish a Confluence page (Phase 5).
2. **Council mode** (invoked by `convene-vpc` or `jpd-loop` as the front-of-loop research engine). Same research pipeline, but you do **not** publish a standalone page or issue a verdict. You hand grounded understanding back to the Chair, who records it on the PRD's Decision Log by the Confluence write protocol. See "Council mode" below before running.

## Portability

The HTML half is self-contained: it depends only on the `Agent` tool with the built-in `general-purpose` agent, `Write`, web search/fetch inside those agents, and `report-template.html` in this folder. The Confluence half (Phase 5) uses the connected Atlassian/Confluence tools; if no Confluence connector is available, deliver the HTML and say the Confluence step was skipped.

## The Brain (when available)

Where the Brain wiki skills (`oolio-pm:wiki-query` and siblings) are available: query the Brain before Phase 1 for what we already hold on the topic (competitor dossiers, trend pages, prior insights) and hand relevant findings to the lens agents as context, so they extend our knowledge rather than rediscovering it. After Phase 4 verification, sync the durable, report-independent findings (verified claims about the market, a competitor, a trend) to Brain per `${CLAUDE_PLUGIN_ROOT}/references/research-os.md` — the report is the deliverable, but the verified claims should outlive it. Skip both silently if Brain is not connected.

## Phase 0: Scope the topic and the destination

1. If `$ARGUMENTS` has the topic, use it. Otherwise ask what to research.
2. State your interpretation of the topic in one line and proceed. Only ask a clarifying question if the topic is genuinely ambiguous in a way that changes the research. Default to proceeding.
3. Identify the **reader's role** so the actionable section can target it. Infer it from the topic and any stated context; if unclear, ask in one line, or default to "a practitioner or decision-maker in this field."
4. **Ask the Confluence destination** (standalone runs only): where should the page go, or which page to update. Accept either a **space + parent page** to create a new child under, or an **existing page** (title or URL) to update. If the user wants the HTML only, skip Confluence. In council mode, do not ask: the destination is the PRD's Decision Log and the Chair handles recording.
5. Derive a kebab-case `topic-slug` from the topic for the filename.
6. Tell the user the pipeline is running (5 lenses, then verify, then publish). One line.

## Phase 1: Five expert lenses (parallel agents)

Spawn **five `general-purpose` agents in a single message** so they run concurrently. Each gets the SAME topic framing plus its own lens. Use these exact prompts, substituting `{TOPIC}` and a one-line `{TOPIC_FRAME}` (your Phase 0 interpretation):

**1. THE PRACTITIONER** — `You are THE PRACTITIONER for: {TOPIC} ({TOPIC_FRAME}). You work with this daily. Do real web research (prioritize recent sources, case studies, practitioner threads, operator data). Surface the GAP between what hands-on operators know and what academics/pundits miss, and the practical realities (workflow friction, what actually works, where it breaks) that get ignored. Return EXACTLY: 1) CORE POSITION in 2 sentences. 2) STRONGEST EVIDENCE, 3-5 bullets each with a concrete data point/case/named source + URL. 3) THE ONE THING only a practitioner would say. Cite real sources with URLs. Under 400 words.`

**2. THE ACADEMIC** — `You are THE ACADEMIC for: {TOPIC} ({TOPIC_FRAME}). You care about peer-reviewed evidence and effect sizes, not anecdotes. Do real web research (peer-reviewed studies, arXiv, university and research-institute reports, journals). Answer: what does the rigorous evidence ACTUALLY say vs popular belief, and where does it CONTRADICT the hype. Return EXACTLY: 1) CORE POSITION in 2 sentences. 2) STRONGEST EVIDENCE, 3-5 bullets each tied to a named study/report + URL with the actual finding/effect size. 3) THE ONE THING only an academic would say. Flag where evidence is thin or contested, and note peer-review status (published vs preprint). Under 400 words.`

**3. THE SKEPTIC** — `You are THE SKEPTIC for: {TOPIC} ({TOPIC_FRAME}). You think the mainstream view is overstated or wrong. Build the STRONGEST steelman bear case. Do real web research for backlash, failures, contradicting data, policy/regulatory changes, debunkings. Answer: the strongest counterargument, and what proponents conveniently ignore. Return EXACTLY: 1) CORE POSITION in 2 sentences. 2) STRONGEST EVIDENCE, 3-5 bullets each with a concrete source + URL. 3) THE ONE THING only a skeptic would say. Be rigorous, not contrarian for sport. Cite real sources with URLs. Under 400 words.`

**4. THE ECONOMIST** — `You are THE ECONOMIST for: {TOPIC} ({TOPIC_FRAME}). You follow the money. Do real web research for revenues, valuations, market size, funding flows, unit economics, incentives. Answer: who profits from the current narrative, and what financial incentives shape the research and hype. Return EXACTLY: 1) CORE POSITION in 2 sentences. 2) STRONGEST EVIDENCE, 3-5 bullets each with a real number (revenue/valuation/market size/funding) + named source + URL. 3) THE ONE THING only an economist would say (the follow-the-money insight). Cite real figures with URLs. Under 400 words.`

**5. THE HISTORIAN** — `You are THE HISTORIAN for: {TOPIC} ({TOPIC_FRAME}). You have seen disruption cycles before and look for patterns. Do real web research for genuine historical parallels (prior technologies, manias, market shifts). Answer: what parallels actually fit, and what we learn from how they played out (who won, who lost, what stabilized). Return EXACTLY: 1) CORE POSITION in 2 sentences. 2) STRONGEST EVIDENCE, 3-5 bullets each a specific historical case with dates/outcomes + a source URL. 3) THE ONE THING only a historian would say (the pattern no one else surfaces). Cite sources with URLs. Under 400 words.`

When all five return, post a 2-3 line note in chat: which way they converge, and the sharpest disagreement. Keep raw briefs out of chat (the agents already returned them).

**Swapping the panel (council mode, or domain topics).** The five lenses above are the default and fit broad market, technology, and strategy topics. When `convene-vpc` supplies a domain panel, or the topic is a specific internal product decision where Economist/Historian add little, replace one or more lenses with the relevant Oolio lenses from the persona library (`${CLAUDE_PLUGIN_ROOT}/personas-library/` — the Operator Council, Design Council, and Leadership Subcommittee) and ground the framing in `${CLAUDE_PLUGIN_ROOT}/personas-library/_framework/oolio-context.md`. Keep five lenses, keep them adversarial, and keep the exact return shape.

## Phase 2: Map the contradictions

Working only from the five briefs, determine (do this inline, no agents):

1. **Direct conflicts** — where two or more lenses claim opposite things. Name the specific clashing claims, not just topics.
2. **Strongest vs weakest evidence** — which lens is best-supported (rank: peer-reviewed causal > official data > anecdote/analogy) and which is weakest, with why.
3. **The resolving question** — the single empirical question that would settle the biggest contradiction.
4. **Universal agreement** — what every lens confirms, even opponents. This is the likely-true load-bearing finding.
5. **The blind spot** — what NO lens addressed. This becomes the "missing 6th lens" and feeds the Frontier Question.

This map is not a separate deliverable. It is the raw material for the report's findings (supports/challenges), hidden connection, 6th-lens box, and frontier question.

## Phase 3: Synthesize the HTML report

1. Read `report-template.html` in this skill folder. Clone it; do not rebuild the CSS.
2. Fill every section. Mapping from the phases:
   - **60-second summary** — decision-maker-grade, nuance not headline. Lead with the settled fact, then the contested interpretation.
   - **5 key findings, ranked by reliability** — most important things now known, highest reliability first. Each carries a 1-10 confidence score (set in Phase 4) and Supported-by / Challenged-by chips drawn from the contradiction map.
   - **Hidden connection** — the non-obvious link from Phase 2 that only appears across all five lenses.
   - **Key assumption / missing 6th lens** — the blind spot from Phase 2, framed as the lens that could change the conclusions.
   - **Actionable insight** — 3-6 specific moves for the reader's role identified in Phase 0. Specific, not abstract.
   - **Claim safety guide** — assert / caveat / avoid, populated after Phase 4 verification.
   - **Frontier question** — the one question that would change everything.
   - **References** — every citation with a verification-status tag (set in Phase 4).
3. Write to `storm-reports/{topic-slug}-briefing.html` (relative to the current working directory; create the folder if needed). If the working directory is unclear or not a sensible home for reports (for example a system folder), use the session's scratchpad or ask the user where to save, and always state the absolute path in chat so the file is findable afterwards.

## Phase 4: Adversarial peer review + verification (do not skip)

This is what separates Storm Research from a normal report. Run it before delivering.

**4a. Self-review (inline).** Score each of the 5 findings 1-10 for reliability and justify. Identify the weakest link and what would verify it. Run a bias check (which lens dominated the synthesis, what got underweighted). Name the missing 6th perspective. Assign an honest overall grade.

**4b. Verify every citation (parallel agents).** Spawn `general-purpose` agents in one message, one per distinct citation cluster (group related claims; ~4-6 agents). Each agent prompt:

`Independently verify a citation against its PRIMARY source. Be skeptical; do not trust secondary blog summaries. CLAIM: {claim + cited figure + named source}. Find the actual primary source. Confirm or correct: exact title/authors/venue/year/URL, the real figure or effect size as published, sample/method and any author-stated limits, and peer-review status (published vs preprint). For any contested claim, find the strongest credible counter-source. Return: VERDICT = CONFIRMED / PARTIALLY CONFIRMED (list corrections) / UNVERIFIED / FALSE, then the corrected one-line citation, then 2-4 bullets of specifics with the primary URL. Under 280 words.`

**4c. Apply corrections.** Edit the report:
- Fix any wrong figures, titles, dates, or mischaracterizations.
- Downgrade confidence scores where evidence turned out thin; demote preprints and contested claims into the "Contested signal" sidebar.
- Re-attribute single-survey or commissioned stats honestly.
- Fill the verification banner (`X fabricated, Y corrected, Z demoted`) and the per-citation status tags.
- Populate the claim safety guide from the verdicts.

## Phase 5: Publish to Confluence

Skip this in council mode (the Chair records to the Decision Log instead). Otherwise, turn the verified report into a Confluence page that mirrors it. Confluence cannot run the template's custom CSS, gradients, or Google Fonts, so this is a faithful **native** rendering, not a pixel copy. Map the report's sections to Confluence's own elements:

- **Title:** `Storm Research: {Topic}`.
- **Verification banner** → an `info` panel at the top carrying the tally (`N citations checked, X fabricated, Y corrected, Z demoted`) and the date.
- **60-second summary** → an `info` panel; bold the single most important sentence.
- **Five findings** → an `h2` per finding (`1. {title}`), each opening with a **status lozenge** for reliability and the score, then the body, then "Supported by" / "Challenged by" / "Corrected" as status lozenges. Reliability colour: High = Blue, Medium-High = Green, Medium = Yellow, Low = Red.
- **Contested signal** → a `warning` panel.
- **Hidden connection** → a `note` panel, ending with the one-line payoff in bold.
- **Key assumption / missing 6th lens** → a `note` panel.
- **Actionable insight** → a numbered list, each move bold then the how.
- **Claim safety guide** → three panels: Safe = `tip`, Caveat = `note`, Avoid = `warning`.
- **Frontier question** → an `info` panel with the question in bold.
- **References** → a bullet list, each line led by a status lozenge (Confirmed = Green, Corrected/Partial = Yellow, Contested/Demoted = Red) and a real link to the primary source.

Then write the page, non-destructively:

- **New page:** create it under the parent or in the space the user named, using the Confluence create-page tool.
- **Update an existing page:** fetch the current body first. Do not blind-overwrite. If the user wants the briefing to replace the page, show what is there and confirm before writing; otherwise create a dated child page under it, or append a new dated `## Storm Research — {date}` section, keeping all existing content. Never call a delete operation on page content.
- The local HTML file stays the canonical artefact. The Confluence page mirrors it. Give the user the page URL.

## Council mode (when convene-vpc or jpd-loop calls this)

Same Phases 0-4, but:

- **No standalone page, no verdict.** Skip Phase 5. Do not edit the PRD or write any Confluence page yourself. Hand grounded understanding to the Chair, who records it on the PRD's child Decision Log by the non-destructive Confluence write protocol (never delete, mark and date edits, locked decisions as a decision list). If a later clash reveals an evidence gap, you can be re-entered.
- **Recording contract (inside jpd-loop).** Return the result as **key decisions only** — 1-3 DECIDED/UNDECIDED items, each with a one-line *why* — suitable for direct rendering into the DISC page's Confluence decision component. Do not emit or persist a full lens-by-lens transcript; the briefing plus these key decisions are the record.
- **Use the domain panel.** Prefer Oolio lenses and `oolio-context.md` over the generic five where the decision is internal, per the panel-swap note in Phase 1.

## Output

1. Final deliverable: `storm-reports/{topic-slug}-briefing.html` (the v2, post-verification version), plus the Confluence page where Phase 5 ran.
2. Open the HTML for the user with the platform's default opener: macOS `open <path>`, Linux `xdg-open <path>`, Windows `start "" <path>`. If the OS is unclear, just give the path.
3. In chat, give: the file path, the Confluence page URL (if published), the verification tally (`N/N checked, X fabricated, Y corrected, Z demoted`), the one universal finding, the frontier question, and the claim safety summary (what is safe to assert vs avoid). Keep it tight.

## Notes & guardrails

- **Real research only.** Every lens and every citation must trace to a real, fetched source. No invented studies, numbers, or URLs. If a figure can't be verified, demote or cut it; never paper over it.
- **The panel is author-built.** Always disclose this in the report. Agreement across lenses is a strong hypothesis, not independent proof. Do not present convergence as consensus of the field.
- **Verification is mandatory.** A report delivered without Phase 4 is not a Storm Research report. The verification banner must be truthful.
- **Reliability = evidence quality, not confidence.** Score on the source hierarchy: peer-reviewed causal > official policy/financial data > single commissioned survey > analogy > preprint.
- **Confluence is non-destructive.** When updating an existing page, never overwrite without confirmation and never delete existing content. Default to a dated child page or an appended section.
- **Target the reader, not a default person.** The actionable insight and claim safety guide speak to the role identified in Phase 0. Keep them generic if no role is given.
- **Cost.** This spawns ~9-11 agents per run. That is expected. Do not fan out wider than five lenses or one verifier per citation cluster.
- **Design.** Clean white and professional (Montserrat / Roboto Mono, blue accent). Keep the template CSS verbatim. Do not swap in a different visual style.
- **Provenance.** The HTML pipeline is adapted from the public Storm Research skill built on Stanford OVAL's STORM and Co-STORM method; the council integration and Confluence publishing are Oolio additions.
