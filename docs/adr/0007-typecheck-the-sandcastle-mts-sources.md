# All TypeScript lives in `.sandcastle/`; `npm run typecheck` strict-checks it with `tsc --noEmit`

Status: accepted

The repo's only TypeScript is the `.sandcastle/*.mts` orchestration sources; the
rest of the codebase is plain JS and lesson HTML and will stay that way. So
`npm run typecheck` — long a stub (`echo 'No TypeScript — skipping'`) wired into
both CI and the husky pre-commit hook — has a single, stable job: type-check
those `.mts` files. The wiring already existed; only the script body was empty.

## Decisions

- **Strict, not loose.** `strict: true`. A probe over the sources found only 10
  errors total: 8 import-extension complaints (one config flag), 1 `.mjs`-interop
  warning (one config flag), and **1 genuine latent bug** — `main.mts` assigned
  sandcastle's `{ sha: string }[]` run result to a `string[]`. Strict is the only
  mode that catches the class of bug this task exists to catch, and it costs
  almost nothing here.

- **The config lives with the code: `.sandcastle/tsconfig.json`**, `include:
["*.mts"]`. No root `tsconfig.json`, no defensive `exclude` — nothing outside
  `.sandcastle/` is or will be TypeScript, so a co-located config keeps the scope
  self-evident and the repo root clean. The script is `tsc -p
.sandcastle/tsconfig.json` with `noEmit` and the rest set in the config.

- **`allowJs: true` for the one `.mjs` import.** `sandbox-identity.mts` imports
  `mintInstallationToken` from the plain-JS `mint-gh-token.mjs`. `allowJs` lets
  tsc read it for inferred types (no `checkJs`, so its body isn't strict-checked)
  rather than converting it or papering over the import with `@ts-expect-error`.
  `allowImportingTsExtensions` (legal under `noEmit`) handles the `.mts`-suffixed
  relative imports.

- **The real bug is fixed by deletion, not by a type patch.** The `commits` field
  it flowed into is dead — written into the per-issue result objects but never
  read (the consumer destructures only `{ issue, kind }`). The strict error is
  removed by deleting `implementCommits` and the `commits:` field from the result
  objects, not by re-typing or `.map(c => c.sha)`. Less code, no behavior change.

- **Tooling as caret devDeps.** `typescript` and `@types/node` (the sources use
  `node:` builtins) join `devDependencies` with `^` ranges, matching the repo
  convention. A future TS-minor that surfaces new errors is real signal, handled
  then — not a reason to pin.

- **Runs in both CI and pre-commit, unchanged.** Both already call
  `npm run typecheck`; making the script real lights up both. A cold `tsc` over
  these files is ~1–2s, negligible next to the vitest run pre-commit already does,
  and catching type errors before the commit beats a CI round-trip.
