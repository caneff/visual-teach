# Copy visual-teach assets into each workspace, don't share one install

Status: accepted

A `/teach` workspace (one topic folder like `~/teach/data-studio`) gets its own
copy of `visual-teach.css` + `visual-teach.js` in its `./assets/`, linked with a
relative path (`../assets/visual-teach.css`). We chose this over a single
machine-global install that all workspaces link by absolute path.

Why: a lesson is a durable, self-contained artifact that users reread, zip, and
share — it must keep working when moved, which a relative link to a co-located
copy guarantees and an absolute `file://` path to a global install does not.
Absolute `file://` links are especially brittle here (WSL: a Windows browser
opening Linux paths), and the workspace already owns its theme overrides, so it
should own the assets they apply to. The accepted cost is drift — a core fix
doesn't reach old workspaces until re-copied — which is cheap because teaching
content has no auto-update expectation and the token/`color-mix` design means
core CSS rarely changes.
