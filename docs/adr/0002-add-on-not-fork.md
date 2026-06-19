# visual-teach is an add-on that composes with /teach, not a fork or standalone tool

Status: accepted

`/teach` is a third-party skill (`mattpocock/skills`) we don't own. visual-teach
ships as its own model-invocable skill that bundles the assets and composes with
an unmodified `/teach` in the agent's context at author time — the same way two
skills loaded together combine. We do **not** edit `/teach`'s files, and we do
**not** reimplement its pedagogy (mission, zone-of-proximal-development,
citations, retention science).

When `/teach` is not installed, visual-teach has no standalone authoring: it
points the user to install `/teach` first and stops. We accept being useless
without `/teach` in exchange for a single clean identity ("enrich `/teach`
lessons") and never maintaining a second, weaker teaching brain. Composition is
not guaranteed — it relies on the model choosing to invoke visual-teach during a
`/teach` run — so the user can also invoke `/visual-teach` explicitly as
belt-and-suspenders.

Considered and rejected:
- **Fork/modify `/teach`** — can't, it's someone else's repo; and it would couple
  us to their internals.
- **Standalone authoring skill** — would duplicate `/teach`'s pedagogy and ship a
  worse course; the whole point is to avoid that fork.
- **A wrapper skill that programmatically invokes both `/teach` and
  visual-teach** — *tested and impossible.* `/teach` has
  `disable-model-invocation: true`, and `Skill(teach)` returns "Skill teach
  cannot be used with Skill tool due to disable-model-invocation". The flag is a
  hard invocation blocker on EVERY programmatic path, verified against the docs:
  Skill tool (tested), subagent `skills:` preload (docs: "You cannot preload
  skills that set `disable-model-invocation: true`"), hooks, CLI flags,
  `settings.json`/`Skill()` permission, @-mention, and auto-load mechanisms — all
  blocked. Only a human typing `/teach` starts it. Do not re-investigate; this
  was checked exhaustively.

Consequence — there is **no hard guarantee** of composition, and the most
reliable channel is NOT skill auto-invocation but the **filesystem**:

1. **Filesystem channel (primary, reliable).** `/teach`'s own charter instructs
   it to "read `./assets/` and build from the components already there" and that
   "a shared stylesheet is the first component every workspace earns." So once
   `visual-teach.css`/`.js` + an `assets/visual-teach.md` cheatsheet sit in the
   workspace's `./assets/`, `/teach` reuses them by its *own* rule — no skill
   invocation needed. The conventions reach `/teach` through files it already
   reads, not through fragile skill-composition.
2. **Auto-invoke (secondary booster).** The user runs `/teach`; the model *may*
   also auto-invoke visual-teach (model-invocable, not blocked) if its
   `description`/`when_to_use` matches — keyword-first, within the 1536-char
   limit. Helpful but unguaranteed.
3. **Explicit `/visual-teach` (certainty + cold-start seed).** The user runs it
   to seed `./assets/` or convert lessons.

**Cold start:** a brand-new workspace has an empty `./assets/`, so the *first*
lesson *can* be born plain. The floor is **one `/visual-teach` per workspace** —
seed before the first lesson, or convert after it — which populates `./assets/`
and switches channel 1 on permanently. There is no zero-touch path, because
`/teach` cannot be driven programmatically. Do not attempt a wrapper; verified
impossible across all channels.

**Empirical result (5/5).** Tested with a local `teach-test` (a copy of `teach`
with only `disable-model-invocation` removed, so a clean-context subagent could
run its real instructions) + the visual-teach prototype installed. Five fresh
empty workspaces, neutral prompts that named `teach-test` but never mentioned
visual-teach. In all five, the model *spontaneously* copied the assets into
`./assets/`, linked them, and authored with `vt-*` blocks (inline `<style>`
reduced to a small theme override, zero inline `<script>`). So fresh-workspace
auto-adoption is HIGH, not low — `/teach`'s own "reuse is default / a shared
stylesheet is the first component" instinct pulls toward an available component
library. Caveats: same model/session-context across trials; it is a faithful
*proxy* (the removed flag cannot affect authoring), the gold-standard check being
a human running real `/teach` + visual-teach in one fresh session. The seed-floor
remains the guaranteed fallback for the rare miss.
