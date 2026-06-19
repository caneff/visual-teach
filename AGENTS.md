# AGENTS.md

Agent instructions for the visual-teach repo. See `docs/PRD.md` for the project
spec, `CONTEXT.md` for the glossary, and `docs/adr/` for decisions.

## Agent skills

### Issue tracker

Issues tracked as GitHub issues via the `gh` CLI; external PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage labels, default vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
