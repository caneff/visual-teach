# Sandbox image for a JavaScript (npm) target repo. Runs the coding agent, git, gh,
# and the target's toolchain. main.mts runs on the HOST (via tsx) — it is never
# in this image; only the in-sandbox agent + its tools live here.
FROM node:22-bookworm

# System dependencies
RUN apt-get update && apt-get install -y \
  git \
  curl \
  ca-certificates \
  jq \
  && rm -rf /var/lib/apt/lists/*

# GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
  | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && apt-get update && apt-get install -y gh \
  && rm -rf /var/lib/apt/lists/*

# sandcastle:local — only this repo publishes screenshots, so only its sandbox
# needs the R2 uploader.
# Cloudflare wrangler CLI — uploads visual-proof PNGs to an R2 bucket (durable
# public CDN URLs). Installed globally as root so it lands on PATH for the agent.
# ponytail: pinned to major v4; bump when R2 upload flags change.
RUN npm install -g wrangler@4

# sandcastle:local — the root half of this repo's Playwright layer; see the
# browser-binary step further down for why this repo needs a browser at all.
# Chromium system libs for Playwright (.sandcastle/shot.mjs visual proof). Needs root,
# so install the apt deps here; the browser binary itself is fetched per-user below.
RUN npx -y playwright@1.61.0 install-deps chromium \
  && rm -rf /var/lib/apt/lists/*

# Build-args for UID/GID alignment: sandcastle docker build-image defaults these
# to the host user's UID/GID so image-built files and bind-mounted files share
# an owner without runtime chown.
ARG AGENT_UID=1000
ARG AGENT_GID=1000

# Rename the base image's own user — and its GROUP, hence `-n agent`; without
# that the container reports gid=1000(node) and the two ecosystems hand the
# orchestrator different identities — aligning it to the host UID/GID.
RUN groupmod -o -g $AGENT_GID -n agent node \
  && usermod -o -u $AGENT_UID -g $AGENT_GID -d /home/agent -m -s /bin/bash -l agent node
USER ${AGENT_UID}:${AGENT_GID}

# Claude Code CLI (standalone binary — not a Node app).
RUN curl -fsSL https://claude.ai/install.sh | bash

# sandcastle:local — this repo's agents photograph the lesson pages they build,
# so its sandbox needs a browser no other adopter does. Must sit after USER: the
# binary lands in the calling user's ~/.cache/ms-playwright, and shot.mjs runs as
# agent. The apt libs it needs are installed as root above.
RUN npx -y playwright@1.61.0 install chromium

# The tools installed above land under ~/.local/bin
ENV PATH="/home/agent/.local/bin:$PATH"

WORKDIR /home/agent

# In worktree sandbox mode, Sandcastle bind-mounts the git worktree at
# /home/agent/workspace and overrides the working directory there at container start.
ENTRYPOINT ["sleep", "infinity"]
