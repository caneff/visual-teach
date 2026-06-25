# Test behavior, not source text

Status: accepted

## Context

The test suite accumulated two classes of tests that provide no real coverage:

**Prose change-detectors** — assertions that a specific sentence, phrase, or regex
appears in a `.md`, `SKILL.md`, or ADR file. These test that a document was written
a certain way, not that any code behaves correctly. They are change-detector
anti-patterns: they fail on innocuous rewording, pass when the prose is present but
the behavior is wrong, and own no invariant.

**Migration-artifact checks** — assertions that a file has been deleted, a script
removed, or a directory no longer exists. Once the migration lands, these can never
fail again; they are dead weight that reads as live coverage and must be re-deleted
after any future divergence.

A deep-research verdict on test strategy confirmed: test JS behavior in jsdom; use
stylelint for static CSS correctness; use Playwright/axe for rendering and
accessibility. Source-grep and prose tests are change-detector anti-patterns.

## Decision

Delete all prose change-detector tests and migration-artifact tests. Do not replace
them — the behavior they pretended to protect is either owned by a reviewer (don't
resurrect the fork), enforced by tooling (stylelint, tsc), or simply not a behavior
at all.

Encode this decision in `TESTING_STANDARDS.md` so the anti-patterns don't regrow.

Tests deleted in PR 189 (per this ADR):

- `tests/owned-fork.test.mjs` — 100% prose assertions (no add-on framing, glossary
  entries, ADR status) + one migration check (probe-adoption.sh removed).
- `tests/course-methodology.test.mjs` — probe-methodology wording, ADR prose,
  teach-base string-greps including the baseline-purity no-vt-\*/seeds-no-assets
  greps (process guards the frozen control, not a string test).
- `tests/thin-separation.test.mjs` — migration-artifact existence/absence (teach dir
  gone, patch exists, scripts deleted, pkg no-sync-script) + doc-prose.

## Consequences

- The deleted test files owned no behavior invariant; the suite loses no real
  coverage.
- Future PRs that add prose change-detectors or migration-artifact checks fail code
  review per `TESTING_STANDARDS.md`.
- CSS correctness is covered by stylelint (`npm run lint`), not by grepping
  `.css` files in tests.
- Rendering correctness and accessibility belong in browser-based tests
  (Playwright, axe), not jsdom.
