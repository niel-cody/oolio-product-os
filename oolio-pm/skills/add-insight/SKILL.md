---
name: add-insight
description: >-
  Attach a single piece of evidence to the JPD backlog as native Insights,
  on one idea or several. Trigger when the user hands over one finding —
  a URL, an article, a HubSpot ticket or deal, a quote, a stat, a
  screenshot description, something spotted mid-session — and says "attach
  this as an insight", "add this to OHSI-X (and OHSI-Y)", "this supports
  that idea about X", "where does this belong on the backlog", "file this
  against the relevant ideas", or "make this an insight". Works
  evidence-first: given targets it attaches after a fit check; given none
  it sweeps the backlog for every idea the evidence genuinely supports and
  proposes the mapping. Do NOT trigger for gathering evidence about an
  idea or scanning for gaps (use `signal-radar`), for raw customer
  feedback that may need a new idea (use `feedback-to-idea`), or for the
  full grooming loop (use `jpd-loop`).
---

# Add insight

The evidence-first attach. The other research skills start from an idea (`signal-radar` idea mode) or from customer signal (`feedback-to-idea`); this one starts from the evidence itself — one useful thing, found anywhere — and lands it on every idea it strengthens, as native JPD Insights. Small by design: one piece of evidence per run, no gathering, no grooming, no council.

## Environment (Oolio)

cloudId `98b2c73a-4f2e-4b23-aca7-dbc5b45b1e24`; project **OHSI — Oolio One Ideas** (`10052`). Any backlog query carries the two mandatory guards from `${CLAUDE_PLUGIN_ROOT}/skills/jpd-idea-groomer/references/field_standards.md` (`issuetype = Idea` + the archived filter).

## The run

1. **Take the evidence.** One item: a URL, a pasted quote or stat, a HubSpot ticket/deal reference, a finding from earlier in the session. Establish the real source URL — no URL that a reader can follow means no Insight (offer a Brain note instead). Rate the source's reliability tier per `${CLAUDE_PLUGIN_ROOT}/skills/signal-radar/references/insight-and-gap-format.md`, including the social-evidence impact caps.
2. **Find the ideas.** If the user named keys, load them and check fit honestly — say so if the evidence does not actually support one. If no keys given, sweep OHSI (both guards, all statuses) on the evidence's nouns and synonyms plus a semantic pass; parked or killed ideas count, since fresh evidence is exactly what resurfaces them. Cap the proposal at the ideas the evidence *genuinely* supports — attaching one article to eight ideas dilutes it to noise; two or three strong fits beat a broadcast.
3. **Propose the mapping.** One table: idea key and summary · tailored one-line Insight description (written for *that* idea's problem, not copy-pasted across rows) · impact 1–5 with a one-line reason (impact may differ per idea — the same stat can be decisive for one idea and background for another). Evidence that supports no existing idea is not force-fitted: offer `feedback-to-idea` instead, since an uncovered problem is intake, not attachment.
4. **One approval for the batch**, then create the native Insights with the helper: `node ${CLAUDE_PLUGIN_ROOT}/bin/jpd-insight.mjs get <KEY>` on each target first to skip duplicates, then `create --file` with one object per idea so each carries its own tailored description. Usage and fallbacks in `${CLAUDE_PLUGIN_ROOT}/skills/jpd-loop/references/jpd-insights-api.md`.
5. **Mirror to Brain.** Per research-os: the Insight lines (description · link · impact · tier) recorded against the relevant Brain page — `wiki-ingest` onto the existing dossier, trend, or evidence page it belongs to; a short evidence note if none exists. Skip the ceremony of a full evidence log; this is one item, not a research run.

## This skill must never

- Gather further evidence, groom fields, create or transition an idea, or run the council — route to `signal-radar`, `jpd-idea-groomer`, `feedback-to-idea`, or `jpd-loop`.
- Fabricate or guess a source link, or attach evidence whose source it cannot cite.
- Attach the same undifferentiated description to every idea, or stretch one item across ideas it only vaguely touches.
- Create a duplicate of an Insight already on the idea.
- Rate social-only evidence above the caps in insight-and-gap-format.md.

## Definition of done

The evidence has a real source URL and a tier; the fitting ideas were found (or the given ones fit-checked); the mapping was approved once; native Insights exist on each idea (or the paste-ready fallback was handed over with the reason); the Insight lines are mirrored in Brain.
