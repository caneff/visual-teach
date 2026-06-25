# AGENTS.md

Agent instructions for the visual-teach repo. See `docs/PRD.md` for the project
spec, `CONTEXT.md` for the glossary, and `docs/adr/` for decisions.

## Component catalog is machine-enforced

`npm run showcase` globs `assets/components/*/demo.html` and asserts every
registered component has a demo before writing `demo/showcase.html`. The
pre-commit hook runs it automatically and stages the result, so the committed
showcase is always fresh. When you add a new component, adding its
`demo.html` is the only sync step required — the machine does the rest.

## Agent skills

### Issue tracker

Issues tracked as GitHub issues via the `gh` CLI; external PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage labels, default vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Testing standards

See `TESTING_STANDARDS.md`. Rule summary: test behavior in jsdom; CSS correctness via stylelint; no prose change-detectors; no source-grep tests.
