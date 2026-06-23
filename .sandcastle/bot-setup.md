# Sandcastle bot GitHub App — one-time setup

This guide creates a GitHub App that Sandcastle uses as its bot identity.
Actions (commits, PR comments, issue labels) attributed to the App render
as `sandcastle-bot[bot]` in GitHub's UI instead of your personal account.

---

## Step 1 — Create the GitHub App

1. Go to **Settings → Developer settings → GitHub Apps → New GitHub App**
   (direct link: `https://github.com/settings/apps/new`)

2. Fill in the form:
   | Field | Value |
   |---|---|
   | GitHub App name | `sandcastle-bot` (or any unique name) |
   | Homepage URL | URL of this repository |
   | Webhook | **Disable** (uncheck "Active") |

3. **Permissions** — set Repository permissions:
   | Permission | Access |
   |---|---|
   | Contents | Read & write |
   | Pull requests | Read & write |
   | Issues | Read & write |
   | Metadata | Read (required, auto-set) |

4. **Where can this GitHub App be installed?** → "Only on this account"

5. Click **Create GitHub App**.

---

## Step 2 — Generate a private key

On the App's settings page (the one you land on after creation):

1. Scroll to **Private keys** → **Generate a private key**.
2. A `.pem` file downloads automatically — keep it secret.

Note the **App ID** shown near the top of the page (a small integer like `1234567`).

---

## Step 3 — Install the App on the repository

1. In the App's settings page, click **Install App** in the left sidebar.
2. Click **Install** next to your account.
3. Choose **Only select repositories** → pick this repo → **Install**.

---

## Step 4 — Find the Installation ID

```bash
gh api /repos/<owner>/<repo>/installation --jq '.id'
```

This returns a number like `12345678` — that's `GITHUB_APP_INSTALLATION_ID`.

---

## Step 5 — Store the credentials

### Local development

Copy `.env.example` to `.env` and fill in the three values:

```bash
cp .env.example .env
# Edit .env:
#   GITHUB_APP_ID=<app-id>
#   GITHUB_APP_PRIVATE_KEY="$(cat /path/to/downloaded.pem)"
#   GITHUB_APP_INSTALLATION_ID=<installation-id>
```

`.env` is gitignored — it will not be committed.

### CI (GitHub Actions)

Add three repository secrets at **Settings → Secrets and variables → Actions**:

| Secret name                  | Value                                               |
| ---------------------------- | --------------------------------------------------- |
| `GITHUB_APP_ID`              | numeric App ID                                      |
| `GITHUB_APP_PRIVATE_KEY`     | full PEM content (multi-line is fine in GH secrets) |
| `GITHUB_APP_INSTALLATION_ID` | numeric Installation ID                             |

---

## Step 6 — Mint a token (one-liner)

With the three env vars set, mint a short-lived (~1 hour) installation token:

```bash
export GITHUB_TOKEN=$(node .sandcastle/mint-gh-token.mjs)
```

Verify the identity:

```bash
gh api user --jq '.login'
# → sandcastle-bot[bot]   (not the maintainer's login)
```

Use `$GITHUB_TOKEN` anywhere `gh` or `git` needs to authenticate as the bot.

---

## Notes

- Tokens expire in ~1 hour. Re-run the one-liner to refresh.
- The App consumes no seat and is ToS-clean (preferred over a PAT on a
  second account). See `docs/adr/0005-bot-github-app-identity.md` for context.
