# Figma gotchas learnt on the run

What the Plugin API and the Figma MCP did on 6 October 2026 that the documentation does not say. Reference material; each line saved an hour once.

- `importComponentSetByKeyAsync` on the Screen set fails with "not found". `getNodeByIdAsync('2284:16038')` on the in-file remote set works. Instance the shell from the in-file set by node id.
- Children can be appended to a slot inside an instance (the Screen `Form` slot, the Timeline Item slot). Nodes created there get instance-style ids (`I...;...`), so find them afterwards by traversal, not by the id returned at creation.
- `findOne(x => x.name === 'Title')` can match a frame. Filter on `x.type === 'TEXT'` before setting `characters`.
- A failed `use_figma` script rolls back the whole script, clones included. Keep scripts small and return every mutated id.
- Clone a finished frame to make each state; the clone keeps its instances linked, so a library republish reaches every state.
- Screenshot asset URLs are blocked by the proxy. Use `node.screenshot()` inside `use_figma` instead of the asset link.
- Switching Tokens to Dark is not a dark mode: text flips, surfaces and cells stay light. Build light only.
- Annotations need their categories to exist in the file first. Read them with `figma.annotations.getAnnotationCategoriesAsync()`, match by label case-insensitively, and create any of the five that are missing (Design violet, Content orange, Interaction blue, Accessibility pink, Development green). Leave other categories alone.
- Setting `node.annotations` replaces the array. Read existing annotations first and keep anything a person wrote.
- Comments cannot be written through the Plugin API. They go in through Claude in Chrome, placed by hand like a person would (see `annotation-style.md`).
- Load fonts before writing text. Every visible text node must be Inter; the library's face is Inter Variable.
