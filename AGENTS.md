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

### Visual snapshots (Playwright)

The `visual` CI check screenshots each component (and the base demo) and diffs
against committed baselines in `tests/visual-snapshots/`. Any change that alters
rendered output — adding/removing a component, changing base layout, anything
that shifts page height or pixels — makes this check fail with a screenshot diff.
That is expected: it means the baseline is stale, not that the code is wrong.

To refresh: `npm run docker:regen-baselines`, then commit the changed `*.png`.
Always regenerate in the pinned Playwright container (that's what the script
does) — local fonts render differently and would fail CI. The script self-cleans
`test-results/`/`playwright-report/` first (they can be left root-owned by a
prior container run and otherwise block the regen with EACCES). Review the diff
images under `test-results/` before committing to confirm the change is intended.
