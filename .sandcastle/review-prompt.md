# TASK

Review the code changes on branch `{{BRANCH}}` and improve code clarity, consistency, and maintainability while preserving exact functionality.

# CONTEXT

## Branch diff

!`git diff {{TARGET_BRANCH}}...{{BRANCH}}`

## Commits on this branch

!`git log {{TARGET_BRANCH}}..{{BRANCH}} --oneline`

# REVIEW PROCESS

1. **Understand the change**: Read the diff and commits above to understand the intent.

2. **Analyze for improvements**: Look for opportunities to:
   - Reduce unnecessary complexity and nesting
   - Eliminate redundant code and abstractions
   - Improve readability through clear variable and function names
   - Consolidate related logic
   - Remove unnecessary comments that describe obvious code
   - Avoid nested ternary operators - prefer switch statements or if/else chains
   - Choose clarity over brevity - explicit code is often better than overly compact code

3. **Check correctness**:
   - Does the implementation match the intent? Are edge cases handled?
   - Are new/changed behaviours covered by tests?
   - Are there unsafe casts, `any` types, or unchecked assumptions?
   - Does the change introduce injection vulnerabilities, credential leaks, or other security issues?

4. **Maintain balance**: Avoid over-simplification that could:
   - Reduce code clarity or maintainability
   - Create overly clever solutions that are hard to understand
   - Combine too many concerns into single functions or components
   - Remove helpful abstractions that improve code organization
   - Make the code harder to debug or extend

5. **Apply project standards**: Follow the coding standards defined in @.sandcastle/CODING_STANDARDS.md

6. **Preserve functionality**: Never change what the code does - only how it does it. All original features, outputs, and behaviors must remain intact.

# GATES (always run, even if you change nothing)

These are pass/fail checks independent of any refactor. Run them every review.

Tests and type checking are enforced mechanically by CI
(`.github/workflows/ci.yml`) on the PR, so they are not your job to babysit. You
still run `npm run test` / `npm run typecheck` after any refactor _you_ commit
(see EXECUTION), but the authoritative green gate is CI.

1. **Visual proof is present and real.** This repo is visual, so a code change to
   `assets/` should carry proof. A pure docs/tooling change with no `assets/`
   diff may legitimately have none. Check `.sandcastle/proof/issue-<id>/`:
   - `PROOF.md` exists. If it claims "no visual change" but the diff touches
     `assets/visual-teach.{css,js}` or a `vt-*` block, that is wrong — flag it and
     have proof produced (see `.sandcastle/proof-protocol.md`).
   - `before.png` and `after.png` both exist and are **not identical**
     (`cmp -s before.png after.png` must report a difference). Identical shots
     mean the before was taken after the change; reject and regenerate.

# EXECUTION

If you find improvements to make:

1. Make the changes directly on this branch
2. Run tests and type checking to ensure nothing is broken
3. Commit describing the refinements

If the code is already clean and well-structured, make no refactor commit — but
the GATES above still run regardless.

Once complete, output <promise>COMPLETE</promise>.
