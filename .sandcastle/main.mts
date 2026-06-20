// Parallel Planner with Review — four-phase orchestration loop
//
// This template drives a multi-phase workflow:
//   Phase 1 (Plan):             An opus agent analyzes open issues, builds a
//                               dependency graph, and outputs a <plan> JSON
//                               listing unblocked issues with branch names.
//   Phase 2 (Execute + Review): For each issue, a sandbox is created via
//                               createSandbox(). The implementer runs first
//                               (100 iterations). If it produces commits, a
//                               reviewer runs in the same sandbox on the same
//                               branch (1 iteration). All issue pipelines run
//                               concurrently via Promise.allSettled().
//   Phase 3 (Open PRs):         A single agent pushes each completed branch
//                               and opens a PR into the current branch for
//                               manual review (no auto-merge).
//
// The outer loop repeats up to MAX_ITERATIONS times so that newly unblocked
// issues are picked up after each round of merges.
//
// Usage:
//   npx tsx .sandcastle/main.mts
// Or add to package.json:
//   "scripts": { "sandcastle": "npx tsx .sandcastle/main.mts" }

import * as sandcastle from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Issue lifecycle labels (managed host-side, never by the agents)
//
//   ready-for-agent → fresh, plannable. The planner only ever selects these.
//   in-review       → implemented AND reviewed OK; PR pending a human merge.
//   needs-review    → implemented, but the reviewer errored. The branch keeps
//                     its commits; a later pass merges current main into the
//                     branch and re-runs ONLY the reviewer. After
//                     REVIEW_RETRY_CAP failed re-reviews it escalates back to
//                     ready-for-agent for a full re-implement.
//
// Transitioning out of ready-for-agent the moment an outcome is known (rather
// than at the very end of the run) is what stops a finished issue from being
// re-planned on the next iteration / next run.
// ---------------------------------------------------------------------------
function gh(args: string): string | null {
  try {
    return execSync(`gh ${args}`, {
      stdio: ["pipe", "pipe", "pipe"],
    })
      .toString()
      .trim();
  } catch {
    // Non-fatal: label already exists, label not on issue, transient API error.
    return null;
  }
}

function listIssues(label: string): { number: number; title: string }[] {
  const out = gh(
    `issue list --state open --label "${label}" --limit 100 --json number,title`
  );
  return out ? JSON.parse(out) : [];
}

function git(args: string): string | null {
  try {
    return execSync(`git ${args}`, { stdio: ["pipe", "pipe", "pipe"] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

// Whether a branch carries real changes vs main — i.e. there is something to
// review and to put in a PR. Keyed on the diff, NOT on how many commits a given
// run produced: an implementer that resumes an already-complete branch makes
// zero new commits but the branch still has work. Three-dot diffs from the
// merge-base, so a "merge main in" commit alone doesn't count as work.
function branchHasWork(branch: string): boolean {
  const out = git(`diff --name-only main...${branch}`);
  return out !== null && out.length > 0;
}

// add/remove as separate calls so a no-op remove never blocks the add.
function relabel(id: string, add: string, remove: string[]): void {
  gh(`issue edit ${id} --add-label "${add}"`);
  for (const label of remove) gh(`issue edit ${id} --remove-label "${label}"`);
}

// Review-retry cap. A needs-review issue is re-reviewed (cheaply, on its
// existing branch) up to this many times before we give up on review-only and
// escalate to a full re-implement. Without a cap, a deterministically-broken
// branch would re-review and re-fail every run forever.
const REVIEW_RETRY_CAP = 2;
const ATTEMPTS_FILE = ".sandcastle/review-attempts.json";

function readAttempts(): Record<string, number> {
  try {
    return JSON.parse(readFileSync(ATTEMPTS_FILE, "utf8"));
  } catch {
    return {};
  }
}
function writeAttempts(a: Record<string, number>): void {
  writeFileSync(ATTEMPTS_FILE, JSON.stringify(a, null, 2));
}

// Ensure the lifecycle labels exist (idempotent — gh errors if present, swallowed).
gh(
  `label create in-review --color FBCA04 --description "Implemented + reviewed by sandcastle; PR pending human merge"`
);
gh(
  `label create needs-review --color D93F0B --description "Implemented but sandcastle review failed; re-review only"`
);

// The planner emits its plan as JSON inside <plan> tags; Output.object extracts
// and validates it against this schema. We use Zod here, but any Standard
// Schema validator works just as well — Valibot, ArkType, etc. See
// https://standardschema.dev.
const planSchema = z.object({
  issues: z.array(
    z.object({ id: z.string(), title: z.string(), branch: z.string() })
  ),
});

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

// Maximum number of plan→execute→merge cycles before stopping.
// Raise this if your backlog is large; lower it for a quick smoke-test run.
const MAX_ITERATIONS = 5;

// Hooks run inside the sandbox before the agent starts each iteration.
// npm install ensures the sandbox always has fresh dependencies.
const hooks = {
  sandbox: { onSandboxReady: [{ command: "npm install" }] },
};

// Copy node_modules from the host into the worktree before each sandbox
// starts. Avoids a full npm install from scratch; the hook above handles
// platform-specific binaries and any packages added since the last copy.
const copyToWorktree = ["node_modules"];

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------

// One run = one PR. We accumulate every completed issue across all iterations
// and open a single consolidated PR at the end, instead of one PR per issue.
const runId = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const runBranch = `sandcastle/run-${runId}`;
const allCompleted: { id: string; title: string; branch: string }[] = [];

for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
  console.log(`\n=== Iteration ${iteration}/${MAX_ITERATIONS} ===\n`);

  // -------------------------------------------------------------------------
  // Phase 1: Plan
  //
  // The planning agent (opus, for deeper reasoning) reads the open issue list,
  // builds a dependency graph, and selects the issues that can be worked in
  // parallel right now (i.e., no blocking dependencies on other open issues).
  //
  // It outputs a <plan> JSON block — Output.object parses and validates it.
  // -------------------------------------------------------------------------
  const plan = await sandcastle.run({
    hooks,
    sandbox: docker(),
    name: "planner",
    // One iteration is enough: the planner just needs to read and reason,
    // not write code. (Structured output requires maxIterations: 1.)
    maxIterations: 1,
    // Opus for planning: dependency analysis benefits from deeper reasoning.
    agent: sandcastle.claudeCode("claude-opus-4-8"),
    promptFile: "./.sandcastle/plan-prompt.md",
    // Extract and validate the <plan> JSON into a typed object. Throws
    // StructuredOutputError if the tag is missing, the JSON is malformed, or
    // validation fails — which aborts the loop.
    output: sandcastle.Output.object({ tag: "plan", schema: planSchema }),
  });

  // Fresh, unblocked issues from the planner run the full implement→review
  // pipeline. Issues labelled needs-review (implemented earlier, review errored)
  // skip the implementer and re-run ONLY the reviewer on their existing branch.
  const fresh = plan.output.issues.map((i) => ({
    ...i,
    mode: "full" as const,
  }));
  const needsReview = listIssues("needs-review").map((i) => ({
    id: String(i.number),
    title: i.title,
    branch: `sandcastle/issue-${i.number}`,
    mode: "review-only" as const,
  }));
  const work = [...fresh, ...needsReview];

  if (work.length === 0) {
    // No unblocked work and nothing awaiting re-review — done or all blocked.
    console.log("No unblocked or review-pending issues. Exiting.");
    break;
  }

  console.log(
    `Planning complete. ${fresh.length} to implement, ${needsReview.length} to re-review:`
  );
  for (const w of work) {
    console.log(`  [${w.mode}] ${w.id}: ${w.title} → ${w.branch}`);
  }

  // -------------------------------------------------------------------------
  // Phase 2: Execute + Review
  //
  // For each issue, create a sandbox via createSandbox() so the implementer
  // and reviewer share the same sandbox instance per branch. The implementer
  // runs first; if it produces commits, the reviewer runs in the same sandbox.
  //
  // Promise.allSettled means one failing pipeline doesn't cancel the others.
  // -------------------------------------------------------------------------

  const settled = await Promise.allSettled(
    work.map(async (issue) => {
      // A pre-existing branch (a review-only re-review, or a ready-for-agent
      // issue whose stale worktree lingers from an earlier run) was built
      // against an older main. Merge current main into the worktree before the
      // agent runs so upstream fixes (e.g. the katex-diff .gitattributes that
      // blew up #57's reviewer) take effect, and so the reviewer's
      // `main...branch` diff is based on current main. For a brand-new branch
      // cut from main this is a harmless no-op. Best-effort: abort on conflict
      // and proceed; the retry cap escalates a branch that can't be salvaged.
      const sandboxHooks = {
        ...hooks,
        host: {
          onWorktreeReady: [
            {
              command:
                "git fetch origin main && (git merge --no-edit origin/main || git merge --abort)",
            },
          ],
        },
      };

      const sandbox = await sandcastle.createSandbox({
        branch: issue.branch,
        sandbox: docker(),
        hooks: sandboxHooks,
        copyToWorktree,
      });

      try {
        let implementCommits: string[] = [];

        // Implement (full mode only). review-only issues already have commits
        // on their branch from an earlier run.
        if (issue.mode === "full") {
          const implement = await sandbox.run({
            name: "implementer",
            maxIterations: 100,
            agent: sandcastle.claudeCode("claude-sonnet-4-6"),
            promptFile: "./.sandcastle/implement-prompt.md",
            promptArgs: {
              TASK_ID: issue.id,
              ISSUE_TITLE: issue.title,
              BRANCH: issue.branch,
            },
          });
          implementCommits = implement.commits;
        }

        // Decide whether to review by what's ON THE BRANCH, not by this run's
        // commit count. A resumed branch that's already complete yields zero
        // new commits but still has work to review; gating on this-run commits
        // there left the issue ready-for-agent and re-planned it every
        // iteration. Only a branch with no diff vs main is truly "nothing".
        if (implementCommits.length === 0 && !branchHasWork(issue.branch)) {
          return { issue, kind: "nothing" as const, commits: [] };
        }

        // Review. A reviewer error (e.g. context blow-up) must NOT discard the
        // implementer's commits — catch it and flag the issue needs-review so a
        // later pass re-reviews the existing branch instead of re-implementing.
        try {
          const review = await sandbox.run({
            name: "reviewer",
            maxIterations: 1,
            agent: sandcastle.claudeCode("claude-sonnet-4-6"),
            promptFile: "./.sandcastle/review-prompt.md",
            promptArgs: { BRANCH: issue.branch },
          });
          return {
            issue,
            kind: "done" as const,
            commits: [...implementCommits, ...review.commits],
          };
        } catch (e) {
          console.error(`  ⚠ ${issue.id} review failed, will re-review: ${e}`);
          return {
            issue,
            kind: "needs-review" as const,
            commits: implementCommits,
          };
        }
      } finally {
        await sandbox.close();
      }
    })
  );

  // Log any pipelines that threw outright (sandbox crash, network, etc.).
  for (const [i, outcome] of settled.entries()) {
    if (outcome.status === "rejected") {
      console.error(
        `  ✗ ${work[i]!.id} (${work[i]!.branch}) failed: ${outcome.reason}`
      );
    }
  }

  // Transition each issue's label the moment its outcome is known, so the NEXT
  // iteration's planner (and any future run) sees the right state:
  //   done         → in-review  (drop ready-for-agent + needs-review)
  //   needs-review → needs-review (drop ready-for-agent; keep branch commits)
  //   nothing      → left ready-for-agent for a clean retry
  // Only `done` issues are accumulated into the consolidated PR.
  const attempts = readAttempts();
  const completedIssues: { id: string; title: string; branch: string }[] = [];
  for (const outcome of settled) {
    if (outcome.status !== "fulfilled") continue;
    const { issue, kind } = outcome.value;
    if (kind === "done") {
      relabel(issue.id, "in-review", ["ready-for-agent", "needs-review"]);
      delete attempts[issue.id]; // reviewed clean — reset the retry counter
      completedIssues.push({
        id: issue.id,
        title: issue.title,
        branch: issue.branch,
      });
    } else if (kind === "needs-review") {
      attempts[issue.id] = (attempts[issue.id] ?? 0) + 1;
      if (attempts[issue.id] >= REVIEW_RETRY_CAP) {
        // Cheap re-review failed REVIEW_RETRY_CAP times — the branch can't be
        // salvaged by review alone. Escalate to a full implement pass (which
        // can actually change the code) against current main.
        relabel(issue.id, "ready-for-agent", ["needs-review", "in-review"]);
        delete attempts[issue.id];
        console.warn(
          `  ${issue.id} hit review-retry cap (${REVIEW_RETRY_CAP}); back to ready-for-agent for a full re-implement`
        );
      } else {
        relabel(issue.id, "needs-review", ["ready-for-agent"]);
      }
    }
  }
  writeAttempts(attempts);

  console.log(
    `\nExecution complete. ${completedIssues.length} issue(s) reviewed and ready for PR:`
  );
  for (const issue of completedIssues) {
    console.log(`  ${issue.branch}`);
  }

  if (completedIssues.length === 0) {
    console.log("Nothing newly completed this iteration.");
    continue;
  }

  // -------------------------------------------------------------------------
  // Accumulate, do NOT open PRs yet. The single consolidated PR is opened after
  // the outer loop ends (Phase 3), so a whole run produces one PR.
  // -------------------------------------------------------------------------
  allCompleted.push(...completedIssues);
  console.log(
    `Accumulated ${completedIssues.length} issue(s) this iteration; ${allCompleted.length} total so far.`
  );
}

// ---------------------------------------------------------------------------
// Phase 3: One consolidated PR for the whole run
//
// A single agent creates the run branch off main, merges every completed issue
// branch into it, pushes it, and opens ONE PR. The PR body lists all changes
// grouped by issue and includes a QA checklist for manual review before merge.
// ---------------------------------------------------------------------------
if (allCompleted.length === 0) {
  console.log("\nNo completed issues across the run. No PR to open.");
} else {
  console.log(
    `\nOpening one consolidated PR for ${allCompleted.length} issue(s) on ${runBranch}.`
  );
  await sandcastle.run({
    hooks,
    sandbox: docker(),
    name: "pr-consolidator",
    maxIterations: 1,
    agent: sandcastle.claudeCode("claude-sonnet-4-6"),
    promptFile: "./.sandcastle/pr-prompt.md",
    promptArgs: {
      RUN_BRANCH: runBranch,
      // One markdown line per issue: id, title, branch.
      ISSUES: allCompleted
        .map((i) => `- #${i.id} — ${i.title} (branch \`${i.branch}\`)`)
        .join("\n"),
      // Just the branch names, for the merge step.
      BRANCHES: allCompleted.map((i) => `- ${i.branch}`).join("\n"),
    },
  });
  console.log("\nConsolidated PR opened.");
}

console.log("\nAll done.");
