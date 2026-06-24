# Issues carry native GitHub relationships; the planner treats them as authoritative

Status: accepted

GitHub CLI 2.94+ exposes issue **parent/sub-issue**, **dependencies**
(`blockedBy`/`blocking`), and **type** as first-class fields on `gh issue
create`/`edit` and as `--json` outputs. Before this, the Sandcastle planner
reconstructed the entire dependency forest by re-reading every issue's prose on
each run — an LLM cost paid every iteration, nondeterministic, and prone to
missing an edge (a missed parent breaks the dependent's build). The relationship
data the issue author already knew was being thrown away into prose and guessed
back out. Now it travels as structured data the planner reads directly.

## Decisions

- **Authors record relationships natively, not just as prose.** The `/to-issues`
  skill — and any ad-hoc issue creation — wires edges at create time:
  `gh issue create ... --parent <#> --blocked-by <#,#>`. The body's `## Parent` /
  `## Blocked by` sections remain as a human-readable mirror (and a fallback for
  trackers without native support), but the native fields are the source of truth.

- **The planner treats native `blockedBy`/`parent` as authoritative hard edges,
  then infers more on top.** `plan-prompt.md` pulls `parent,blockedBy,issueType`
  in its `gh issue list` queries and honors those edges unconditionally; the
  existing prose/file-overlap heuristics only _add_ blockers, never override a
  declared one. When the fields are empty — a tracker without dependency support,
  or an issue authored before they were set — it falls back entirely to prose
  inference, so nothing breaks during the transition.

- **Issue types are omitted on this repo.** Types are an org-only feature;
  `caneff/visual-teach` is a user-account repo with no types defined, so
  `gh issue create --type X` errors (`type "X" not found; available types:`). The
  convention documents `--type` for portability, but every surface omits it unless
  a type vocabulary exists. Sub-issues and dependencies work on any repo and are
  verified live here.

- **The convention is documented once, shared everywhere.** It lives in the issue
  tracker conventions doc (`docs/agents/issue-tracker.md`, mirrored in the
  Matt-Pocock `setup-*-skills` source) so every issue-authoring and issue-reading
  surface reads the same rules rather than each re-deriving them.
