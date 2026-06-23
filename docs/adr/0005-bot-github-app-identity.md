# Use a GitHub App for Sandcastle bot identity

Status: accepted

## Context

Sandcastle agents push commits, open PRs, and label issues. Those actions
currently appear under the human maintainer's GitHub account, making it
impossible to distinguish automated bot work from manual changes in the
audit trail, notifications, and commit attribution.

Three options exist for a dedicated bot identity:

1. **Personal Access Token (PAT) on a second "bot" account** — ToS-grey,
   requires consuming a seat, risks account suspension for violating the
   one-account-per-person policy.
2. **Classic PAT on the main account with a bot-named committer** — commits
   attribute to the real user; no UI separation.
3. **GitHub App** — ToS-clean, seat-free, renders actions as
   `<app-slug>[bot]` in all GitHub surfaces (commits, PR comments, issue
   labels). Installation tokens are short-lived (≤1 hour) and scoped to
   exactly the permissions granted at install time.

## Decision

Use a **GitHub App** installed on this repository as the Sandcastle bot
identity. App credentials (`APP_ID`, `PRIVATE_KEY`, `INSTALLATION_ID`) are
stored as environment variables outside the repo (local `.env` / CI secrets)
and exchanged for a short-lived installation token at run time.

The token-minting script lives at `.sandcastle/mint-gh-token.mjs`. It uses
only Node.js built-in `crypto` (no extra dependencies) to sign the required
RS256 JWT and call the GitHub installations API.

## Consequences

- `.sandcastle/mint-gh-token.mjs` — new script; exports `buildJwt` and
  `loadCredentials` for unit testing.
- `.env.example` — template for the three required env vars.
- `.sandcastle/bot-setup.md` — one-time setup guide (create App, install,
  find IDs, store secrets, mint token, verify identity).
- `tests/bot-token.test.mjs` — 10 unit tests covering JWT structure and
  credential loading/validation.
- Wiring the token into Sandcastle sandbox runs is deferred to a later slice
  (issue #119 acceptance criteria explicitly exclude "no code wiring into the
  sandboxes yet").
