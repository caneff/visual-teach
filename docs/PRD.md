# visual-teach — PRD

Status: draft · 2026-06-19 · owner: caneff

The single front door. Decisions with lasting consequence are recorded as ADRs
(`docs/adr/`) and linked here, not restated. Domain terms live in `CONTEXT.md`.

---

## 1. Problem

`/teach` (Matt Pocock's skill, `mattpocock/skills`) produces lessons as
self-contained HTML files opened from `file://`. Its own charter says reusable
components belong in a workspace's `./assets/` and that "a shared stylesheet is the
first component every workspace earns" — **but no real workspace has one.** Every
lesson re-derives the same look and behavior inline.

Ground truth: `~/teach/data-studio/lessons/0001-*.html` is 255 lines, of which
**~107 lines of CSS + ~50 lines of JS are generic and duplicated in every lesson**
— palette, callouts, table, persisted checklist, quiz-with-feedback, print rules.
Authors (the `/teach` agent) rebuild this each time, and it drifts between lessons.

## 2. Users & use cases

- **Primary user:** someone already using `/teach` who wants richer, consistent
  lessons without `/teach` hand-rolling CSS/JS each time.
- **Author (the actor that writes lessons):** the `/teach` agent — or a standalone
  agent doing the Convert verb. Not a human hand-writing markup, though a human
  can.
- **Use cases:** (a) new lessons born rich during a `/teach` run; (b) retrofitting
  existing lessons to the shared blocks; (c) bulk-migrating a whole workspace.

## 3. Goals

1. Eliminate the duplicated ~150 lines/lesson — one shared stylesheet + script.
2. Make `/teach` lessons consistent and richer (real quiz feedback, persisted
   checklists, themed callouts) with **zero new authoring model** to learn.
3. Adopt-by-subtraction: a lesson adopts by *deleting* its inline CSS/JS and
   linking two assets.
4. Stay an **add-on** to `/teach` — never fork it, never reimplement its pedagogy.
5. No build step, no server, no dependency. Lessons keep opening from `file://`.

## 3a. Design principle — richness is the point

Minimalism applies to **plumbing** (no MCP, no build, no framework, no heavy
runtime) — **not** to the visual blocks. The blocks are the product; they should
be genuinely rich and beautiful, matching `/teach`'s "laziness OFF for
deliverables" charter. "Rebuild ~10 CSS blocks, not a 42MB engine" rejects the
heavyweight *runtime*, never visual quality — the two are separable (a rich CSS
diagram vocabulary is cheap and dependency-free). When in doubt on a visual block,
err toward expressive, not minimal.

## 4. Non-goals

- **Not** a lesson *format/schema/validator.** visual-teach is a passive component
  library (like Bootstrap), not a renderer. Unknown/malformed markup renders
  inert, never "invalid."
- **Not** a teaching engine. Authoring a course (mission, zone-of-proximal-dev,
  citations, retention science) stays 100% `/teach`'s job.
- **Not** the `@agent-native/core` renderer (~42MB React/Vite/MDX) — rebuilt as
  ~10 CSS blocks; see §10.
- **No** MCP, hosted service, or agent-feedback loop.
- **No** standalone authoring — invoked to author from scratch with no `/teach`
  installed, it points the user to install `/teach`.

## 5. Success criteria

- A `/teach` lesson using visual-teach drops its inline `<style>`/`<script>` to a
  small (≤~20-line) theme override + zero inline JS, linking the two assets.
- Quiz reveal + persisted checklist work from `file://` in a modern browser.
- Lessons stay readable and print correctly with **JS disabled** (progressive
  enhancement, not a JS-blank page).
- Composition actually happens in practice (see §7 + ADR 0002 evidence).
- A real existing lesson (`data-studio/0001`) converts cleanly with no content
  loss.

## 6. Solution overview

A workspace's `./assets/` gets three files (copied in, per **ADR 0001**):
`visual-teach.css`, `visual-teach.js`, `visual-teach.md` (authoring cheatsheet).
Lessons use documented `vt-*` classes + `data-*` attributes; `visual-teach.js`
scans on load and wires behavior. **Class-convention progressive enhancement** —
no framework, build, custom-element runtime, or MCP.

Why progressive enhancement over web components / MDX: lessons must be beautiful,
durable, and printable (the `/teach` charter turns laziness OFF for deliverables).
Class+CSS markup is fully styled with JS off; a custom-element/MDX lesson is blank
until JS runs. Graceful degradation is a requirement, not a nicety.

Distributed as a **skill** (`SKILL.md` + the three assets as its bundle). The skill
is an **add-on that composes with an unmodified `/teach`** — **ADR 0002**.

## 7. How it reaches `/teach` (the core risk)

There is **no programmatic guarantee** — `/teach` has `disable-model-invocation:
true`, which blocks every programmatic invocation path (Skill tool, subagent
preload, hooks, CLI, permissions — verified exhaustively, ADR 0002). Only a human
typing `/teach` starts it, and a wrapper skill is impossible.

Reliability comes from the **filesystem**, most-reliable first:

1. **Filesystem (primary).** Once the assets + cheatsheet sit in `./assets/`,
   `/teach` reuses them by its *own* charter ("read `./assets/` and reuse"). This
   is `/teach`'s instruction to itself, not our hope.
2. **Compose / auto-invoke (booster).** The model may auto-invoke visual-teach
   (it is model-invocable, not blocked) mid-`/teach` if the description matches.
3. **Explicit `/visual-teach` (certainty + cold-start seed).**

**Empirical evidence (5/5).** A `teach-test` copy (only the flag removed) run by
clean-context subagents on five fresh workspaces, neutral prompts that never
mentioned visual-teach: all five spontaneously seeded `./assets/` and authored
with `vt-*` blocks. Fresh-workspace auto-adoption is **high**, not low. Caveat:
faithful proxy, not the real flagged `/teach`; gold-standard check (a human
running real `/teach`) still pending. See ADR 0002.

**Cold start:** a brand-new workspace has an empty `./assets/`, so lesson 1 *can*
be born plain. Floor = **one `/visual-teach` per workspace** (seed first, or
convert after lesson 1), then channel 1 carries every later lesson. No zero-touch
path exists.

## 8. Scope — block set

Core ships only **universal** teaching blocks. Topic-specific widgets (audio
players, SQL sandboxes) and topic colors stay in the *workspace's* assets. Seam:
core = topic-agnostic, workspace = topic-specific.

**Inclusion bar (per §3a).** Every block is walked one at a time and must beat
what `/teach` hand-rolls today on **at least one axis**: visual richness,
**consistency** (a course reads as one course), DRY, **correctness once** (shared
tested JS vs per-lesson bugs), **accessibility once**, print/no-JS degradation,
author ergonomics (less to emit, more reliable), or themeability. A block is **cut
only if it adds nothing on any axis** — a pointless wrapper identical to writing
the HTML inline. Visually-plain blocks (callout, table) can fully earn their place
on consistency + a11y + DRY; they need not be flashier. The verbatim-extracted
blocks are starting points to *raise where it pays*, not finished. Walk + verdicts
tracked below.

**v1 (built, render-verified):** page shell (`vt-kicker`/`h1`/`vt-lede`/`vt-meta`/
`h2>vt-num`), prose (auto-themed), `vt-callout` (+tones info/insight/success/risk/
warn), table, `vt-pill`, `vt-checklist` (persisted, auto progress+reset),
`vt-quiz` (reveal + feedback), `vt-teacher`, `vt-sources`, print rules.

**v1 — diagram vocabulary (locked).** Not a wrapper class — a real
hand-composed CSS diagram system, tokenized to the 9 vars, degrades to styled HTML
(prints, no JS). Borrowed from visual-plan's proven `.diagram-*` set. Primitives:

- `.vt-diagram` — the panel/canvas
- `.vt-node` / `.vt-box` — labeled boxes/cards (+ emphasis variants)
- `.vt-flow` — row that auto-renders arrow connectors between children
  (the "Connector → Data source → Report" staple)
- `.vt-row` / `.vt-col` — lane / column layout
- `.vt-split` — before/after two-panel layout
- reuse `.vt-pill`

**mermaid** is an opt-in escape hatch for *computed* graphs (sequence, state, ER)
— one CDN `<script>`, only when a lesson needs real auto-layout. Not our code.

**Deferred:** the sketch/hand-drawn aesthetic (rough.js + Excalifont — a JS dep,
offer later as a diagrams-only opt-in); annotated-code; tabs; **runnable-code**;
**cross-lesson score tracking** (stretch); **checklist expand-to-reveal hints**
(v2 — concept approved, native `<details>` previewed, exact UI not settled).

### Block-walk verdicts (per inclusion bar)

| block | verdict | raise to |
| --- | --- | --- |
| diagram | KEEP + build rich | full CSS vocabulary (§8) + opt-in mermaid |
| quiz | KEEP + RAISE | per-option misconception feedback, always-on why-correct, a11y (buttons/keyboard/`aria-live`/focus), opt-in multi-select + try-again. Stretch: cross-lesson score. |
| checklist | KEEP + RAISE | progress *bar* (not bare count) + a11y (label assoc, keyboard, aria). Hints → v2. |
| callout | *pending* | |
| table | *pending* | |
| pill | *pending* | |
| page shell | *pending* | |
| teacher | *pending* | |
| footer/sources | *pending* | |
| prose base | *pending* | |

### Theming

Themeable skin, not a fixed identity. Color drives off **9 tokens** with
hardcoded fallbacks: `--vt-ink --vt-muted --vt-accent --vt-accent-fg --vt-rule
--vt-paper --vt-good --vt-bad --vt-warn`. Tints/hovers derived via `color-mix()`
(2023+ browsers). Token set is **append-only** — adding is free, renaming breaks,
so never rename. Topic colors → a `:root` override in the lesson `<head>`, not in
core CSS.

### Lesson shape

HTML *is* the source — no JSON/MDX/markdown intermediate. Author links the two
assets and uses `vt-*` blocks; `data-key` on a checklist replaces hand-picked
localStorage keys. (Full markup: `assets/visual-teach.md`.)

## 9. Invocation: the Convert verb

`/visual-teach` is visual-teach's **only** explicit verb (`CONTEXT.md`):

- **Lessons present** (`/visual-teach [file|all]`): retrofit — ensure assets,
  strip inline `<style>`/`<script>`, swap classes to `vt-*`, link assets, move
  topic colors to a `:root` override. Mechanical edit, no script. Needs no
  `/teach`.
- **No lessons (seed-only):** install the three assets, tell the user to run
  `/teach`.

Serves four jobs: cold-start seed, fallback when Compose misses, bulk migrator,
proof-of-concept (convert the real lessons).

## 10. The hard bet: runnable code (deferred)

No real lesson uses it yet; slot reserved to avoid a later rewrite. When built:
**client-side only, sandboxed `<iframe srcdoc>`** (works from `file://`, where Web
Workers are blocked in Chrome; isolated; static-hostable; no code-on-our-box). JS
runs directly; Python via Pyodide-from-CDN *if* ever needed. Not building a server
sandbox or multi-language runner.

## 11. Status & milestones

- [x] Research + decisions (`docs/visual-plan-analysis.md`, ADRs, `CONTEXT.md`)
- [x] Composition feasibility de-risked — 5/5 empirical (ADR 0002)
- [x] v1 prototype built: `SKILL.md` + `assets/visual-teach.{css,js,md}`
- [x] Render-verified: CSS tokens + `color-mix`, quiz reveal, checklist
      persistence all work from `file://`
- [ ] Build the diagram vocabulary (decided §8: nodes/flow/lanes/split + mermaid)
- [ ] Cheatsheet hardening: "tokens are not classes" (model misused `vt-ink`)
- [ ] Exercise Convert + seed-only end-to-end on `data-studio/0001`
- [ ] Gold-standard check: human runs real (flagged) `/teach` + visual-teach
- [ ] Decide installation/release path (how a user installs the skill)

## 12. Risks & open questions

1. ~~Diagram block in v1?~~ **Resolved → full CSS diagram vocabulary** (`.vt-diagram`
   /`.vt-node`/`.vt-flow`/`.vt-row`/`.vt-col`/`.vt-split`) + opt-in mermaid; sketch
   look deferred. See §8 + §3a.
2. **Auto-adoption in the real flagged `/teach`** — strong proxy evidence, not yet
   confirmed in a real session. Mitigated by the seed floor.
3. **Same-model/session-context** in the 5/5 test — real-world variance unknown.
4. **Dark mode** — deferred; tokens make it cheap later.
5. **Authors reach past the block set** (invented `vt-map`, misused token names) —
   inert, harmless, but informs which blocks to add next + cheatsheet wording.
6. **Release/distribution** of the skill itself — undecided.

## References

- ADR 0001 — copy assets into each workspace (`docs/adr/0001-*`)
- ADR 0002 — add-on that composes, not a fork (`docs/adr/0002-*`)
- `CONTEXT.md` — glossary (visual-teach, Lesson, Compose, Convert, …)
- `docs/visual-plan-analysis.md` — the research that motivated the split
