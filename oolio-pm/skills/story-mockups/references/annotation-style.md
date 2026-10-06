# Annotation and comment house style

The rules for everything written onto a mockup page: annotations, comments, title blocks and headings. They are the house `figma-annotate` rules, carried here so the plugin stands alone; where that skill is installed it says the same thing. British English, no em dashes (commas, colons, brackets or a full stop), no buzzwords, lead with the point, short sentences.

## The one distinction: annotation or comment

- An **annotation** is a statement that stays true after review: what an element is, what it shows, what happens, a rule the build follows.
- A **comment** is anything that needs an answer, a decision or a fix from a person. A comment can be resolved; an annotation cannot, which is why a question never goes in an annotation.

Quick test: a sentence that ends in a question mark, contains "confirm", "TBC" or "should it", or needs someone to decide, is a comment. A mockup slip where the intended behaviour is already known is stated as a Development rule instead.

## The five categories

Use exactly these. Read the file's categories first, match by label, create any that are missing with these colours.

| Category | Colour | Use it for |
|---|---|---|
| Design | violet | Visual rules: states (selected, disabled), spacing or sizing intent, colour meaning, variants, responsive behaviour |
| Content | orange | What an element shows, where the data comes from, copy rules, dynamic values, empty and error text |
| Interaction | blue | What the user does and what happens: clicks, drawers and dialogs opening, keyboard, undo |
| Accessibility | pink | Focus order, keyboard access, labels for icon buttons, contrast, colour not being the only signal |
| Development | green | Confirmed build rules: validation, limits, persistence, scope boundaries, decided edge cases |

## Writing annotations

- Start with a bold element name: `**Delivery log tab**`. Then one to four short lines, or a short bullet list. Say what it is or does, not how it looks.
- One idea per annotation; split rather than cram. Two or three on one node is fine; more means annotate the children.
- The **primary frame** of each story gets the full set: navigation, each create action, a representative row and its menu, special states, each panel, the grid, tabs, the footer. **Other frames** get only what differs, plus one short "Same as <primary>" note where a reader might wonder. Each dialog or drawer gets one Interaction annotation covering how it opens, what each control does and how it closes, plus Content, Design or Development only where they add something.
- Aim for 30 to 50 annotations on a large page. Fewer and it will not stand alone; many more and nobody reads it. Do not repeat a sentence across frames.
- Batch about ten nodes per `use_figma` call, keyed by node id, and return every mutated id.

## Room to breathe

Annotations pin to the side of their node and overlap when frames are packed. Space before annotating: a left margin of 600 to 800 before the first frame, 500 to 800 between a screen and its drawers and dialogs, about 900 between rows, about 500 above the first row for the title block. Resize the Section to fit plus about 300 right and bottom. Move the Section's direct children only; never restructure a frame to make space.

## Title block and headings

Plain text in Inter, not components. The **Section title block** at the top left: title in Bold 64, then a Regular 32 body at 140% line height, fixed width about 1900, saying in two or three sentences what the Section is and how to read it, then the key: "Design = visual rules. Content = what an element shows. Interaction = what the user does and what happens. Accessibility = inclusive use. Development = confirmed build rules. Questions are comments." A **heading above every frame**, about 190 above it: name in Bold 40, a one-line description in Regular 20 saying only what makes this frame different. Colours: near-black `{r:0.1,g:0.1,b:0.12}` for titles, grey `{r:0.38,g:0.38,b:0.42}` for body.

## Comments

Build the list before touching the browser, as a table: number, frame (top-level node id), element in plain words, type, message. Lead with the point; give every question a recommended answer; one issue per comment so each resolves on its own; prefix the type so the panel scans: `[Question]`, `[Fix]`, `[Scope]`. Code-versus-mockup differences (for example Segment Control standing in for MenuBar tabs) are `[Fix]` comments naming the coded behaviour. Show the list in chat before posting, so anything can be struck or reworded.

**Posting in Chrome.** The Plugin API has no comments, so they go in through Claude in Chrome: open a new tab (never the user's own Figma tab), navigate to the file URL with the frame's node id so Figma zooms to fit, press `c` for comment mode, click the element itself, type the message, Enter to post, screenshot to confirm, Escape, next. If Figma asks to sign in, stop and ask the user to sign in in that window. If a post fails twice, skip it and list it as not posted. Never click Resolve or Delete. Close the tab when done.

**Fallback.** If Chrome is not connected or Figma will not load, hand the finished list over in chat and say plainly that the comments were not posted. Never put questions into annotations instead.

## Definition of done for the page

Every frame has a heading and every Section a title block and key; nothing overlaps; all five categories exist and every annotation uses one; no annotation contains a question, "confirm" or "TBC"; every open question, inconsistency and scope doubt is on the comment list and posted, or handed over with a note of what was not posted.
