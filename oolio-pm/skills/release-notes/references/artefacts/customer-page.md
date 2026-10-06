# Customer page copy (HubSpot)

Customers and partners. 400 to 700 words. Supplied as copy, not as a built page: the person or the HubSpot connector builds it, unpublished, and a person publishes it.

No Jira keys, no internal names, no customer names, no reproduction steps. Second person throughout.

## File header

```
# HubSpot page copy: <Product>, <D Month YYYY>

Audience: customers and partners. No Jira keys, no internal names, no customer names.
Source: <KEY> release "<version name>" (version <id>), released <D Mon YYYY>.
```

## Page meta

```
- Page name (internal): Platform update - <Product> - <Subject> - <Month YYYY>
- Slug: platform-updates/<product>-<subject>-<month>-<year>
- HTML title: <Product> update: <claim in six words or fewer> | Oolio
- Meta description: <One sentence, under 160 characters, stating the outcome. No em dash.>
```

## Structure

```
## Hero

**Eyebrow:** Platform update | <D Month YYYY>
**H1:** <The claim. Four to eight words. Full stops allowed.>
**Standfirst:** <One sentence, second person, the outcome.>

## Why we did this

<Two to four short paragraphs. The shape from method.md, in the customer's terms. No ticket language.>

## What has changed

**H3:** <Theme 1 as an outcome>
<Two or three short paragraphs. What you can do now. What it does not cover yet.>

**H3:** <Theme 2>
...

## <Fixes block, headed by what it fixes>          (only if there are fixes worth a customer's attention)

<One or two paragraphs. Never a bulleted ticket list.>

## What is coming next

We will always show you the next two releases and the dates we are working to. Scope and dates can change, and when they do we will say so here.

**<D Month>: <what it is for>**
<One or two sentences.>

**<D Month>: <what it is for>**
<One or two sentences.>

Both are subject to change.

## Closing

**H2:** <A claim or an invitation. "Something not adding up?" has worked.>
<Two sentences. Most of what is on this page started with a customer who noticed. Contact your account manager or raise it through the help centre.>

**CTA:** Visit the help centre
```

## Rules

- A not-shipped item does not exist on this page.
- A feature-flagged item does not exist on this page.
- "Back Office only for now" and its kind stay in. The edge of each theme is the sentence that buys trust for the rest.
- If the product is Ngara, the candour paragraph belongs here as well as in Teams: it will sometimes be wrong, and it is the least capable it will ever be. Flag the borrowed line on handover.
- The page is one entry in a per-product "Platform updates" series. The slug pattern keeps them together; do not invent a new prefix.
