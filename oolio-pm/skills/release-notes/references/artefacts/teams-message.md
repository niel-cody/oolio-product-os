# Teams message

Internal. Product, sales, account management, support and onboarding. 300 to 600 words. Posted to the product's internal channel through the Microsoft 365 connector, after approval, by a person's say-so; never through a webhook (Office 365 connectors retired May 2026).

The Teams message carries everything the business needs to not be surprised: the why, every theme including the invisible ones that matter internally, the incidents that came with it, what is not shipped, and the next two releases.

## File header

The file in the Brain opens with a header the message itself does not carry:

```
# Teams message: <Product> release, <D Month YYYY>

Release: <KEY> "<version name>" (version <id>), <n> items, released <D Mon YYYY>, <status summary>.
Also carried: <incidents, if any>.
Audience: internal Oolio. Links out to the customer-facing page.

---
```

## Structure

```
**<Product> release | <D Month>**

<The why. One to three short paragraphs. The first sentence is the claim.>

**<Theme 1, as an operator outcome>**

<What it does, in the operator's terms. What it does not cover yet.>

**<Theme 2>**

...

**<Fixes, if any, under a heading that says what they fix>**

<One line each.>

**The incidents that came with it**            (only if there were any)

<Each named with its customer and its outcome, because the audience is internal. Anything not actually resolved is called out as such.>

**Next up, and roughly when**

From now on every release names the next two, with the dates we are working to. Scope moves and dates move, that is the nature of it, but nobody should find out what is coming on the day it arrives.

**<D Month>, <what it is for>.** <One or two sentences from the items in that version.>

**<D Month>, <what it is for>.** <Same.>

Both dates are subject to change. If one moves, it gets said here rather than sliding quietly.

Full notes: <customer page URL, or [LINK TO HUBSPOT PAGE] until it exists>
```

## Rules

- Jira keys and customer names are allowed here, because the reader is internal. Use them where they help someone find the thing; not in the themes.
- A not-shipped item that is in the version gets one line under its theme: "<Item> is in the version but not released; it is not on the customer page."
- A feature-flagged item gets: "<Item> is deployed behind a flag and not visible to customers yet."
- The incidents block repeats nothing from a screenshot. Each status is read from Jira at the time of writing.
- Sign off with the person's name only if they asked for it. The default is no sign-off; the channel knows who posts.
