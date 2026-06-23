### #112

No visual change (docs/tooling only).

Renamed `teach-test` → `teach-base` across the repo:

- Created `.claude/skills/teach-base/SKILL.md` (new skill directory, frozen A/B control)
- Updated `.claude/skills/teach-course/SKILL.md` (all 9 `teach-test` references)
- Updated `docs/ab-comparison-methodology.md`, `docs/PRD.md`, `docs/adr/0002-*`, `docs/adr/0003-*`
- Added `teach-base` glossary entry to `CONTEXT.md`
- 6 new contract tests in `tests/course-methodology.test.mjs` (222 total, was 216)
