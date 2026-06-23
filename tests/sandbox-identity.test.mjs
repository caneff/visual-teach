import { test, expect, beforeEach, afterEach } from "vitest";

// Dynamic import so we can reload with different env state.
// vitest re-executes the module each import() call when env changes.
// We test the pure function by manipulating process.env before importing.

const botVars = [
  "SANDCASTLE_BOT_GH_TOKEN",
  "SANDCASTLE_BOT_GIT_NAME",
  "SANDCASTLE_BOT_GIT_EMAIL",
];

let savedEnv;
beforeEach(() => {
  savedEnv = {};
  for (const v of botVars) {
    savedEnv[v] = process.env[v];
    delete process.env[v];
  }
});
afterEach(() => {
  for (const v of botVars) {
    if (savedEnv[v] === undefined) delete process.env[v];
    else process.env[v] = savedEnv[v];
  }
});

// Import once; the helper reads process.env at call time, not at module load.
const { sandboxIdentity } = await import("../.sandcastle/sandbox-identity.mts");

// ── no-op branch: bot vars unset ─────────────────────────────────────────────

test("sandbox-identity: no-op when bot vars unset — env is empty", () => {
  const id = sandboxIdentity();
  expect(id.env).toEqual({});
});

test("sandbox-identity: no-op when bot vars unset — gitConfigCommands is empty", () => {
  const id = sandboxIdentity();
  expect(id.gitConfigCommands).toEqual([]);
});

// ── identity branch: all bot vars set ────────────────────────────────────────

test("sandbox-identity: GH_TOKEN present when token var set", () => {
  process.env.SANDCASTLE_BOT_GH_TOKEN = "ghp_test_token";
  process.env.SANDCASTLE_BOT_GIT_NAME = "Sandcastle Bot";
  process.env.SANDCASTLE_BOT_GIT_EMAIL = "bot@example.com";

  const id = sandboxIdentity();
  expect(id.env.GH_TOKEN).toBe("ghp_test_token");
});

test("sandbox-identity: gitConfigCommands include user.name command when name set", () => {
  process.env.SANDCASTLE_BOT_GH_TOKEN = "ghp_test_token";
  process.env.SANDCASTLE_BOT_GIT_NAME = "Sandcastle Bot";
  process.env.SANDCASTLE_BOT_GIT_EMAIL = "bot@example.com";

  const id = sandboxIdentity();
  const cmds = id.gitConfigCommands.map((c) => c.command);
  expect(cmds.some((c) => c.includes("user.name"))).toBe(true);
});

test("sandbox-identity: gitConfigCommands include user.email command when email set", () => {
  process.env.SANDCASTLE_BOT_GH_TOKEN = "ghp_test_token";
  process.env.SANDCASTLE_BOT_GIT_NAME = "Sandcastle Bot";
  process.env.SANDCASTLE_BOT_GIT_EMAIL = "bot@example.com";

  const id = sandboxIdentity();
  const cmds = id.gitConfigCommands.map((c) => c.command);
  expect(cmds.some((c) => c.includes("user.email"))).toBe(true);
});

test("sandbox-identity: gitConfigCommands embed the actual name and email values", () => {
  process.env.SANDCASTLE_BOT_GH_TOKEN = "ghp_test_token";
  process.env.SANDCASTLE_BOT_GIT_NAME = "Sandcastle Bot";
  process.env.SANDCASTLE_BOT_GIT_EMAIL = "bot@example.com";

  const id = sandboxIdentity();
  const cmds = id.gitConfigCommands.map((c) => c.command);
  expect(cmds.some((c) => c.includes("Sandcastle Bot"))).toBe(true);
  expect(cmds.some((c) => c.includes("bot@example.com"))).toBe(true);
});
