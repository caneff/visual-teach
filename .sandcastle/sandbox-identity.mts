/**
 * Sandbox identity helper — gated, no-op by default.
 *
 * Returns the GH_TOKEN env and git user config commands that identify Sandcastle
 * as a bot in sandboxes. When the bot env vars are unset (the default), both
 * fields are empty and every sandbox attributes commits/PRs/comments to the
 * maintainer exactly as before.
 *
 * Bot env vars:
 *   SANDCASTLE_BOT_GH_TOKEN  — GitHub token for the bot account
 *   SANDCASTLE_BOT_GIT_NAME  — git user.name for commits made in-sandbox
 *   SANDCASTLE_BOT_GIT_EMAIL — git user.email for commits made in-sandbox
 *
 * Wire-up in main.mts:
 *   docker({ env: identity.env })
 *   hooks.sandbox.onSandboxReady: [...identity.gitConfigCommands, ...]
 */

export interface SandboxIdentity {
  /** Environment variables to merge into docker({ env }). Empty when bot vars unset. */
  env: Record<string, string>;
  /** Commands to prepend to sandbox.onSandboxReady for git identity. Empty when bot vars unset. */
  gitConfigCommands: Array<{ command: string }>;
}

export function sandboxIdentity(): SandboxIdentity {
  const token = process.env.SANDCASTLE_BOT_GH_TOKEN;
  const name = process.env.SANDCASTLE_BOT_GIT_NAME;
  const email = process.env.SANDCASTLE_BOT_GIT_EMAIL;

  const env: Record<string, string> = token ? { GH_TOKEN: token } : {};
  const gitConfigCommands: Array<{ command: string }> = [];
  if (name)
    gitConfigCommands.push({
      command: `git config user.name ${JSON.stringify(name)}`,
    });
  if (email)
    gitConfigCommands.push({
      command: `git config user.email ${JSON.stringify(email)}`,
    });
  return { env, gitConfigCommands };
}
