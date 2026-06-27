# visual-teach

A component library for teaching lessons: a Base spine
([CSS](./skills/visual-teach/assets/base/base.css) + [JS](./skills/visual-teach/assets/base/base.js))
plus a collection of self-contained, copyable components that give lesson HTML a
consistent look and interactive behavior. A lesson links Base and only the
components it uses. Think Bootstrap for lessons, not a renderer or a framework.

It does not own a lesson format, a schema, or any pedagogy. That is the job of
the upstream [`/teach`](https://github.com/mattpocock/skills) skill
(`mattpocock/skills`). visual-teach seeds reusable components into the workspace
and then steps back; `/teach` authors the lessons.

## Install

Install the skill into your coding agent with the [`skills`](https://skills.sh) CLI:

```sh
npx skills add caneff/visual-teach
```

That copies the skill — its `SKILL.md` and bundled `assets/` — into your agent's
skills directory (`.claude/skills/visual-teach/` for Claude Code, and the
equivalent for other agents). Nothing else in this repo ships: the demos, tests,
and docs stay here for reading, not for installing. Once installed, `/teach` (or
any lesson author) has the `vt-*` blocks on hand, and the skill seeds its assets
into each new lesson workspace.

## See it

- [**Adoption gallery**](https://caneff.github.io/visual-teach/demo/adoption-demos/index.html) — a
  side-by-side gallery: six subjects (git rebase, flexbox, TLS, regex, Bayes,
  music), each taught twice from the same spec. The left lesson was generated
  without visual-teach, the right one with it.
- [**Component showcase**](https://caneff.github.io/visual-teach/demo/showcase.html) — every component on one page,
  auto-generated from the per-component demos.

## What you get

Ready-made interactive blocks, so lessons don't hand-roll CSS or JS each time:

- [**Quizzes**](https://caneff.github.io/visual-teach/demo/showcase.html#component-quiz) with per-option feedback
- [**Checklists**](https://caneff.github.io/visual-teach/demo/showcase.html#component-checklist) that remember their state across reloads
- [**Code blocks**](https://caneff.github.io/visual-teach/demo/showcase.html#component-code) with copy buttons and syntax highlighting
- [**Callouts**](https://caneff.github.io/visual-teach/demo/showcase.html#component-callout), [**tables**](https://caneff.github.io/visual-teach/demo/showcase.html#component-table), and a [**diagram vocabulary**](https://caneff.github.io/visual-teach/demo/showcase.html#component-diagram) for visual explanations
- [**Math**](https://caneff.github.io/visual-teach/demo/showcase.html#component-math) rendering, all themeable to light and dark

See the [**full showcase**](https://caneff.github.io/visual-teach/demo/showcase.html) for every component on one page.

## Skills

| Skill                  | Role                                                                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `skills/visual-teach/` | **This skill.** `SKILL.md` + `assets/`; the unit `npx skills add` installs. Invoked before `/teach` so lessons have rich `vt-*` blocks. |

## Usage

Install the skill (see [Install](#install)). Once it's in, `/teach` seeds the
assets and authors lessons with `vt-*` blocks — no manual wiring.

## Tests

```sh
npm test   # vitest run: quiz, checklist, code block, mermaid,
           # css classes, and asset-isolation behavior
```
