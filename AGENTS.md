# AGENTS.md

Agent instructions for the visual-teach repo. See `docs/PRD.md` for the project
spec, `CONTEXT.md` for the glossary, and `docs/adr/` for decisions.

## Keep the cheatsheet in sync

`assets/visual-teach.md` is the authoring cheatsheet — the single source of
truth for which `vt-*` blocks exist and how to use them. When you add, rename,
or change the markup of a block in `assets/visual-teach.css` or
`assets/visual-teach.js`, update the cheatsheet in the **same change**. A block
that ships without a cheatsheet entry doesn't exist as far as lesson authors are
concerned.

## Agent skills

### Issue tracker

Issues tracked as GitHub issues via the `gh` CLI; external PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage labels, default vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
