# Testing standards

Living rules for the `tests/` suite. See `docs/adr/0011-test-behavior-not-source.md`
for the decision that produced them.

## Rules

1. **Test behavior, not source text.** Tests assert what code _does_, not what a
   file _says_. No grepping `.css`, `.md`, or `SKILL.md` for phrases. If the only
   assertion is that a string appears in a doc, the test owns nothing.

2. **A test owns an invariant or it is deleted.** If a behavior-preserving refactor
   breaks a test, the test owned nothing — delete it. Prose change-detectors and
   migration-artifact checks (file-was-deleted, script-was-removed) are the two
   canonical failure modes. Neither survives this rule.

3. **No prose change-detectors.** Do not assert that a specific sentence or regex
   appears in a documentation file. Prose belongs to reviewers and is free to
   evolve without breaking tests.

4. **Test each concern in its layer:**
   - **Behavior** → jsdom (vitest + JSDOM). This is the default for component JS.
   - **Static CSS** → stylelint (`npm run lint`). Do not grep `.css` in tests.
   - **Rendering / visual** → Playwright screenshot (browser-based).
   - **Accessibility** → axe-in-browser (not a jsdom approximation).
