// Address PR review comments — a focused, on-demand sandcastle runner.
//
// Unlike main.mts (which is issue-driven), this takes one or more PR numbers
// and, for each, spins up a sandbox that checks out the PR branch, addresses
// the unresolved review comments, pushes the fixes back to the same branch
// (updating the open PR in place), and replies to each thread.
//
// Reply-only: it does NOT resolve threads and does NOT merge. You review the
// replies and resolve/merge yourself.
//
// Usage:
//   npx tsx .sandcastle/address.mts <pr-number> [<pr-number> ...]  # specific PRs
//   npx tsx .sandcastle/address.mts                                # all open PRs with comments

import { execSync } from "node:child_process";
import * as sandcastle from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";

const sh = (cmd: string) => execSync(cmd, { encoding: "utf8" }).trim();

let prs = process.argv.slice(2);

if (prs.length === 0) {
  // No args: sweep every open PR that actually has comments to address.
  // Skip comment-free PRs so we don't burn a sandbox finding nothing.
  const slug = sh(`gh repo view --json nameWithOwner --jq .nameWithOwner`);
  const open = sh(`gh pr list --state open --json number --jq '.[].number'`)
    .split("\n")
    .filter(Boolean);
  prs = open.filter((n) => {
    const inline = Number(
      sh(`gh api repos/${slug}/pulls/${n}/comments --jq 'length'`)
    );
    const top = Number(
      sh(`gh api repos/${slug}/issues/${n}/comments --jq 'length'`)
    );
    return inline + top > 0;
  });
  if (prs.length === 0) {
    console.log("No open PRs with comments to address.");
    process.exit(0);
  }
  console.log(`Open PR(s) with comments: ${prs.join(", ")}`);
}

const hooks = {
  sandbox: { onSandboxReady: [{ command: "npm install" }] },
};

// Sequential: each run pushes to a branch, so we avoid concurrent pushes and
// keep the token spend predictable. We resolve each PR's head branch and use
// `branchStrategy: branch`, which fetches that branch into an isolated git
// worktree — it never touches your current checkout, so no stashing needed.
for (const pr of prs) {
  const branch = sh(`gh pr view ${pr} --json headRefName --jq .headRefName`);
  console.log(
    `\n=== Addressing review comments on PR #${pr} (${branch}) ===\n`
  );
  await sandcastle.run({
    hooks,
    copyToWorktree: ["node_modules"],
    sandbox: docker(),
    branchStrategy: { type: "branch", branch },
    name: `address-pr-${pr}`,
    maxIterations: 30,
    agent: sandcastle.claudeCode("claude-sonnet-4-6"),
    promptFile: "./.sandcastle/address-comments-prompt.md",
    promptArgs: { PR_NUMBER: pr },
  });
}

console.log("\nAll done.");
