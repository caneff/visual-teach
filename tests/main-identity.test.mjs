import { test, expect, describe } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");
const mainSrc = readFileSync(join(root, ".sandcastle/main.mts"), "utf8");

// Contract tests: verify that main.mts wires bot identity into every sandbox
// so a full Sandcastle run (plan → implement → review → pr) attributes all
// GitHub actions (commits, PRs, issue comments) to the bot when env vars are set.

describe("main.mts — bot identity wiring", () => {
  test("imports sandboxIdentity from sandbox-identity.mts", () => {
    expect(mainSrc).toMatch(/import.*sandboxIdentity.*sandbox-identity/);
  });

  test("awaits sandboxIdentity() so async token minting resolves before any sandbox starts", () => {
    expect(mainSrc).toMatch(/await sandboxIdentity\(\)/);
  });

  test("hooks.sandbox.onSandboxReady spreads identity.gitConfigCommands for in-sandbox git identity", () => {
    expect(mainSrc).toMatch(/\.\.\.\s*identity\.gitConfigCommands/);
  });

  test("all three docker() sandbox calls pass identity.env (planner, issue, pr-consolidator)", () => {
    const matches = [
      ...mainSrc.matchAll(/docker\(\{\s*env:\s*identity\.env\s*\}\)/g),
    ];
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });

  test("hooks object (containing identity.gitConfigCommands) is passed to all sandcastle.run calls", () => {
    const runWithHooks = [
      ...mainSrc.matchAll(/sandcastle\.run\(\{[^}]*hooks[^}]*\}/gs),
    ];
    expect(runWithHooks.length).toBeGreaterThanOrEqual(2); // planner + pr-consolidator
  });

  test("createSandbox carries hooks that spread identity.gitConfigCommands", () => {
    // sandboxHooks is built by spreading hooks (which contains gitConfigCommands)
    expect(mainSrc).toMatch(/\.\.\.hooks/);
    expect(mainSrc).toMatch(/createSandbox\(\{/);
  });

  test("no hardcoded GH_TOKEN value in main.mts — token always comes from sandboxIdentity()", () => {
    // GH_TOKEN must not appear as a literal object key assignment in main.mts.
    // It is set inside sandboxIdentity() only; main.mts receives it via identity.env.
    expect(mainSrc).not.toMatch(/GH_TOKEN\s*:/);
  });
});
