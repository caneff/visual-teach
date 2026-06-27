# visual-teach

A component library for teaching lessons: a Base spine
([CSS](./skills/visual-teach/assets/base/base.css) + [JS](./skills/visual-teach/assets/base/base.js))
plus self-contained, copyable components that give lesson HTML a consistent look
and interactive behavior. A lesson links only what it uses, and it's a plain HTML
file: open it straight from disk and it runs offline, with no build step and no
server. Bootstrap for lessons, not a renderer or a framework.

It owns no lesson format, schema, or pedagogy. That is the upstream
[`/teach`](https://github.com/mattpocock/skills) skill's job. visual-teach seeds
the components; `/teach` authors the lessons.

## Install

Add it to your coding agent with the [`skills`](https://skills.sh) CLI:

```sh
npx skills add caneff/visual-teach
```

That drops the skill (`SKILL.md` + `assets/`) into your agent's skills
directory. Nothing else here ships. The demos, tests, and docs stay for reading.

## See it

- [**Adoption gallery**](https://caneff.github.io/visual-teach/demo/adoption-demos/index.html):
  six subjects (git rebase, flexbox, TLS, regex, Bayes, music), each taught twice
  from the same spec. The left lesson was generated without visual-teach, the
  right one with it.
- [**Component showcase**](https://caneff.github.io/visual-teach/demo/showcase.html):
  every component on one page, auto-generated from the per-component demos.

## What you get

Ready-made interactive blocks, so lessons don't hand-roll CSS or JS each time:

- [**Quizzes**](https://caneff.github.io/visual-teach/demo/showcase.html#component-quiz) with per-option feedback
- [**Checklists**](https://caneff.github.io/visual-teach/demo/showcase.html#component-checklist) that remember their state across reloads
- [**Code blocks**](https://caneff.github.io/visual-teach/demo/showcase.html#component-code) with copy buttons and syntax highlighting
- [**Callouts**](https://caneff.github.io/visual-teach/demo/showcase.html#component-callout), [**tables**](https://caneff.github.io/visual-teach/demo/showcase.html#component-table), and a [**diagram vocabulary**](https://caneff.github.io/visual-teach/demo/showcase.html#component-diagram) for visual explanations
- [**Math**](https://caneff.github.io/visual-teach/demo/showcase.html#component-math) rendering, all themeable to light and dark

See the [**full showcase**](https://caneff.github.io/visual-teach/demo/showcase.html) for every component on one page.

## Skills

**`/visual-teach`** — this skill. `SKILL.md` + `assets/`; the unit `npx skills add`
installs. Invoked before `/teach` so lessons have rich `vt-*` blocks.

## Usage

Install the skill (see [Install](#install)). Once it's in, `/teach` seeds the
assets and authors lessons with `vt-*` blocks, so you never wire them by hand.

## Tests

```sh
npm test   # vitest run: quiz, checklist, code block, mermaid,
           # css classes, and asset-isolation behavior
```
