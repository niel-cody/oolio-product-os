# jpd-loop — Insights & citations (reference)

Read this for loop step 3 (validation) and step 7 (write-back). This is how the loop turns evidence into **JPD Insights** that validate — or challenge — an idea.

## What a JPD Insight is
A JPD idea supports **Insights**: small evidence cards attached to the idea. Each Insight has:
- a **description** (what the evidence says, in a sentence or two),
- a **web link** (the source — competitor page, customer thread, analytics, research, another idea),
- an **impact rating 1–5** (how strongly this evidence bears on the decision).

Insights are how we make the verdict defensible: every meaningful claim in the VPC summary should trace to an Insight, and Insights should include evidence **for and against**.

## Impact rating rubric (1–5)
- **5** — decisive: on its own this could flip the decision (e.g. a hard regulatory blocker, a top competitor already owns this and wins on it, a major customer churns without it).
- **4** — strong: clearly moves desirability/feasibility/viability.
- **3** — moderate: relevant supporting or cautioning signal.
- **2** — weak: minor or indirect.
- **1** — context only: useful background, low decision weight.

## Method
1. Gather evidence per `evidence-sources.md` (internal first, then web/competitors).
2. Keep both **supporting** and **disconfirming** evidence — aim for a balanced set, not a case built only to confirm.
3. For each strong item, draft an Insight: one-line description + the real source URL + an impact rating with a one-line reason.
4. Feed these to the council (they argue from the evidence, not assumption). The rubric scores (Desirability/Feasibility/Viability/Strategic Fit) should reflect the Insights.

## Recording Insights — how (updated Jul 2026)
**Standard: every strong piece of evidence found for an idea gets attached as a native Insight on that idea** — not just listed in the description. The Atlassian MCP connector cannot write Insights and will offer a comment instead; a comment is not an Insight.

1. **The helper (default).** `node ${CLAUDE_PLUGIN_ROOT}/skills/jpd-loop/scripts/jpd-insight.mjs` — `get` the idea to check for duplicates, then `create` (one Insight) or `create --file` (a batch). Auth is already set up and refreshes itself. Full usage in `references/jpd-insights-api.md`.
2. **Chrome UI automation** (cloud sessions, which cannot reach the API host): open the idea → Insights tab → paste the source URL into the link field (JPD unfurls it into a card) → set description and impact dots → Create. Uses the user's logged-in JPD session.
3. **Paste-ready list (fallback only)**: if neither works, record the evidence in the idea Description append block and DISC page as before, and hand the human a ready-to-paste list (description · link · impact each), saying why the helper failed.

Note that impact is not settable through the API — it exists only in the UI. Impact ratings drafted for the council travel as labels on the card and in the written record; do not claim a created Insight carries an impact rating.

Regardless of route, ALSO record the Insights as cited evidence in the **idea Description** append block and the **DISC decision-record page** — the native Insights and the written record must match.

## Citation discipline (hard rules)
- **Every Insight has a real, working source link.** No link → not an Insight, at most a note.
- **Never fabricate or guess a URL.** If you can't find a source, say so.
- Quote or paraphrase faithfully; don't overstate what a source says.
- Prefer primary sources; date-stamp anything time-sensitive (prices, competitor features).
