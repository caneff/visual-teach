# visual-teach is an add-on that composes with /teach, not a fork or standalone tool

Status: accepted

`/teach` is a third-party skill (`mattpocock/skills`) we don't own. visual-teach
ships as its own model-invocable skill that bundles the assets and composes with
an unmodified `/teach`. We do **not** edit `/teach`'s files and do **not**
reimplement its pedagogy. No `/teach` installed → visual-teach has nothing to
enrich and points the user to install it.

Considered and rejected:
- **Fork/modify `/teach`** — it's someone else's repo; would couple us to their
  internals.
- **Standalone authoring skill** — would duplicate `/teach`'s pedagogy and ship a
  worse course.
- **A wrapper that programmatically invokes both** — *verified impossible.*
  `/teach` sets `disable-model-invocation: true`, which blocks every programmatic
  path (Skill tool, subagent preload, hooks, CLI, settings, @-mention). Only a
  human typing `/teach` starts it. Do not re-investigate.

## The load-bearing finding: the channel is the filesystem

Because no code can drive `/teach`, conventions reach it through **files it
already reads**, not skill composition. `/teach`'s charter says to "read
`./assets/` and build from the components already there." So once
`visual-teach.{css,js,md}` sit in the workspace's `./assets/`, `/teach` reuses
them by its own rule — no invocation needed.

**Cold start:** a brand-new workspace has empty `./assets/`, so the floor is **one
`/visual-teach` per workspace** to seed the files; after that the filesystem
channel is on permanently. There is no zero-touch path.

Empirically, adoption is high even without seeding: in 5/5 fresh workspaces (using
a local `teach-test` proxy — `/teach` minus the invocation flag) the model
spontaneously copied the assets in and authored with `vt-*` blocks, pulled by
`/teach`'s own "reuse is default" instinct. The seed-floor is the guaranteed
fallback for a miss.
