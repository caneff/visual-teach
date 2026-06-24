# visual-teach coding standards

Standards for the **shipped** component library under `assets/` — the CSS/JS/HTML
that runs in users' workspaces over `file://`. The Sandcastle dev-tooling has its
own standards in `.sandcastle/CODING_STANDARDS.md`; this file never speaks to `.mts`.

These are the project-specific rules a generic reviewer would miss — the footguns a
linter can't see. They are not a restatement of general clean-code advice.

## Rules

1. **Never add `type="module"` to the `base.js` or any component `<script>`.**
   They are plain UMD/IIFE scripts. `type="module"` makes the browser load them
   under CORS, which is blocked over `file://` — silently disabling every
   interactive block (quizzes, checklists, theme toggle, copy buttons) with no
   visible error. The primary delivery mode is `file://`, so this kills the page.

2. **Consume the 9 `--vt-*` base tokens; never hardcode a color.** Components read
   `var(--vt-ink)`, `var(--vt-accent)`, etc. Dark mode works _because_ it overrides
   only those 9 tokens — a hardcoded hex value is invisible to that override and
   breaks dark mode. Derived tints belong in `base.css`, not inlined per component.

3. **Mix derived tints in `oklch`, not `srgb`.** Mixing a color toward `--vt-paper`
   in srgb desaturates fast and reads grey; oklch preserves chroma so soft fills
   stay clean pastels. Match the existing `color-mix(in oklch, …)` form in
   `base.css`.

4. **demo-as-doc: every component ships and maintains a `demo.html`.** The demo is
   both the rendered proof and the authoritative usage reference — there is no
   separate prose doc. A new or changed component without an updated `demo.html` is
   incomplete.

5. **Render inert, never throw.** A component facing unknown or malformed markup
   must degrade silently — never error, never show "invalid." Guard required
   children with the `ensure(block, [selectors])` idiom from `base.js`: it warns
   `visual-teach: <block> missing required <sel> — left inert` and bails. Markup is
   a convention, not a contract; visual-teach validates nothing.

6. **Announce interactive state through a live region, not visuals alone.** Quiz
   verdicts, checklist progress, and similar state changes go through the
   `announce(liveRegion, text)` helper (an aria-live region), not just a color or
   glyph. Visual-only feedback is invisible to assistive tech.

7. **`vt-`-prefix is load-bearing; component JS is self-contained.** Every component
   class is `vt-`-prefixed — `blockLabel()` in `base.js` identifies a block by
   scanning `classList` for its `vt-` class, so the prefix is wiring, not cosmetics.
   Each component's JS is a self-contained, copyable unit: helpers duplicated across
   components (e.g. `quiz.js`'s local `_ensure`/`_announce`/`_verdict`) are
   **intentional** — copyability is the point. Do **not** consolidate them into a
   shared import; that breaks the component model.
