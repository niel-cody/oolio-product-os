# hubspot-sweep — triage, scoring and attach (reference)

What to do with what the standing queries return.

## The discriminator: a need, not a fault

Everything the queries return is a customer having a bad day. Only some of it is product signal. One question separates them:

> Would this record still exist if the product did the job properly?

- **Yes, it is a need.** The product cannot do something the operator needs it to do, or can only do it in a way that costs them time. This is the seam. Keep it.
- **No, it is a fault or an errand.** A terminal is offline, a printer is unplugged, an invoice needs re-sending, a version needs upgrading, a login needs resetting. Support owns it. Drop it.

Two edges worth naming, because both get mis-sorted:

- **A fault that recurs is a need.** The third identical "menu board not showing" this month is not three incidents, it is one product problem. Faults become signal through repetition, so check the count before dropping one.
- **A request is not a problem.** "We want an API for rosters" is a solution. The problem underneath — they re-key staff hours into payroll every night — is what gets attached. Dig one level down before writing the Insight, the same discipline `feedback-to-idea` applies at intake.

## Weight

Weight is what the evidence is worth, and it drives both the impact rating and whether a candidate is worth attaching at all.

Raise it for:

- **Churn and offboarding.** A cancellation naming a capability is the strongest single record the portal produces. A customer has voted with the contract.
- **Independent accounts.** Three accounts asking separately beats one account asking three times, which is one voice and should be rated as one.
- **Independent brands.** The same capability requested on Bepoz, Idealpos and Oolio One is close to settled: it is a requirement, not a preference. Say so explicitly in the description, because that cross-brand pattern is the most decision-useful thing a sweep produces and it is invisible from any single queue.
- **Revenue and migration weight.** A multi-venue group, or an account mid-migration to Oolio One, carries more than a single site.

Lower it for: a single site, a preference stated without a cost, a request already solvable by configuration (say so, and route it back to support rather than the backlog).

Source tier is 1 under research-os — HubSpot direct and specific — but tier sets the ceiling, not the score. One ticket from one site is tier 1 evidence of one venue's opinion. Do not inflate a single record to 4 or 5 because its tier is high.

## Impact rating

The 1 to 5 scale from `${CLAUDE_PLUGIN_ROOT}/skills/signal-radar/references/insight-and-gap-format.md` applies unchanged. For CRM records specifically:

| Rating | What earns it |
|---|---|
| 5 | Named capability in a cancellation or an at-risk escalation on a weighty account, or the same need across three or more independent accounts including a churn case. |
| 4 | Several independent accounts, or one large group, with a cost they can state. Or a single churn record on a smaller account. |
| 3 | A clear, well-described need from one credible account. The default for a good `FEATURE_REQUEST` ticket. |
| 2 | A preference, or a need already met by configuration that was hard to find. Often a documentation or discoverability finding rather than a product one. |
| 1 | Weak or ambiguous. Usually better left off the idea than attached. |

Impact is **not an API field**. It travels as a label on the Insight or is set by hand in the UI. Never claim an Insight carries a rating it does not.

## Writing the Insight

One line saying what this evidence shows and how strong it is, written for **that idea's** problem. The same ticket attached to two ideas needs two descriptions.

Carry, in the description or the quote:

- The customer's own words where they said it well. The verbatim line is the most valuable part of the record.
- The account type and scale (a multi-venue group, a single cafe), not the contact's name.
- The brand queue it came from, when it is a legacy brand, framed as what it means for Oolio One: "Bepoz multi-venue group, mid-migration — this is a One requirement before they move."
- What the record does not tell you. A ticket says a customer asked; it rarely says how much it costs them.

`--url` is the HubSpot record URL and is mandatory. No followable source, no Insight: it goes in a Brain note instead.

### Privacy

The record link is the pointer to the person. The Insight is not. Never copy contact names, email addresses, phone numbers, card or bank details, or any other personal data into an Insight or a Brain page. Describe the account by type and scale. Anyone who needs the individual can follow the link, with HubSpot's own permissions in front of it.

## Attaching

The batch file, one object per idea:

```json
[
  {"idea": "OHSI-612",
   "description": "Multi-venue Bepoz group asked for GST per line on customer invoices; their accounts team re-keys totals to reconcile. Mid-migration, so this is a One requirement before they move.",
   "url": "https://app.hubspot.com/contacts/5205495/record/0-5/48607595825",
   "title": "Feature Request - Customer Invoice to show GST per Item",
   "quote": "Customer invoice needs to show GST per item, not just the total",
   "labels": "hubspot-sweep,impact-3,bepoz"}
]
```

Always `get` the target idea first and skip anything whose URL is already attached. Then `create --file`. Both commands and the schema traps are in `${CLAUDE_PLUGIN_ROOT}/skills/jpd-loop/references/jpd-insights-api.md`.

Label every Insight this skill creates `hubspot-sweep`. That is what makes the loop measurable later: which sweeps produced evidence that changed a decision.

## When the attach route is unavailable

The helper needs a token at `~/.jpd-insights-token.json` and network access to `api-private.atlassian.com`. Local sessions have both. Anthropic's cloud sandbox has neither, and a fresh container has no token file, so a scheduled cloud run will find `whoami` failing. This is expected, not a bug to debug.

In order:

1. **The helper.** Confirm with `whoami` before drafting a batch, so a failure is known at the start of the run rather than at the end.
2. **Chrome UI automation**, where a connected browser exists: open the idea, Insights tab, paste the URL so JPD unfurls the card, add the description, set the impact dots, Create. Read the tab first to avoid duplicates.
3. **Hand over the batch.** Report the mapping table **and the complete `create --file` JSON inline**, ready to paste, plus the one command that runs it. Say which route failed and why in one line. Do not describe this as a completed attach, and do not offer a Jira comment as a substitute: a comment is not an Insight.

Route 3 is a normal outcome for a scheduled cloud run, not a failure of the sweep. The sweep's work is the triage and the matching; the attach is a keystroke that can happen wherever the credentials live.
