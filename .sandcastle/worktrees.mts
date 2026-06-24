// Pure helper for worktree GC. Parses `git worktree list --porcelain` output
// and returns the paths of sandcastle issue worktrees that should be removed.
export function parseSandcastleWorktrees(porcelainOutput: string): string[] {
  return [...porcelainOutput.matchAll(/^worktree (.+)$/gm)]
    .map((m) => m[1])
    .filter((path) => path.includes("/.sandcastle/worktrees/"));
}
