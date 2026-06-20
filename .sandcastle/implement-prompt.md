# TASK

Fix issue {{TASK_ID}}: {{ISSUE_TITLE}}

Pull in the issue using `gh issue view <ID>`. If it has a parent PRD, pull that in too.

Only work on the issue specified.

Work on branch {{BRANCH}}. Make commits and run tests.

# CONTEXT

Here are the last 10 commits:

<recent-commits>

!`git log -n 10 --format="%H%n%ad%n%B---" --date=short`

</recent-commits>

# EXPLORATION

Explore the repo and fill your context window with relevant information that will allow you to complete the task.

Pay extra attention to test files that touch the relevant parts of the code.

# EXECUTION

If applicable, use RGR to complete the task.

1. RED: write one test
2. GREEN: write the implementation to pass that test
3. REPEAT until done
4. REFACTOR the code

# FEEDBACK LOOPS

Before committing, run `npm run typecheck` and `npm run test` to ensure the tests pass.

# VISUAL PROOF (before / after)

This repo is visual: almost every change alters how a `vt-*` block renders.
Capture screenshot proof so the PR shows the change, not just describes it.

Use the existing tool `demo/shot.mjs` (Playwright; chromium is installed):
`node demo/shot.mjs <html-file> <out.png> [cssSelector]`.

Pick the demo page under `demo/` that exercises the block you are changing
(e.g. `demo/code-block.html`, `demo/table-variants.html`, `demo/diagram-blocks.html`,
`demo/footer-sources.html`); if unsure, use `demo/showcase.html`, which uses
every block. Screenshot the whole page, or pass a `cssSelector` to frame just the
affected block.

1. **BEFORE** — do this on the unchanged code, before you edit anything:
   `node demo/shot.mjs demo/<page>.html .sandcastle/proof/issue-{{TASK_ID}}/before.png [selector]`
2. Make your change.
3. **AFTER** — same page, same selector:
   `node demo/shot.mjs demo/<page>.html .sandcastle/proof/issue-{{TASK_ID}}/after.png [selector]`
4. If the change affects JS behavior (Prism highlighting, quiz/checklist wiring,
   mermaid), `file://` will not run the ES module. Serve first
   (`python3 -m http.server 8000 &`) and shot a `http://localhost:8000/...` URL
   instead, so the after shot shows the wired result.

5. **Upload the PNGs to Cloudflare R2** (object storage — durable public CDN URLs,
   no binaries in git history). `wrangler` is preinstalled and authenticates from
   `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`; the bucket is `$R2_BUCKET`.
   Namespace each object by issue so re-runs overwrite in place:
   ```
   wrangler r2 object put "$R2_BUCKET/issue-{{TASK_ID}}-before.png" \
     --file=.sandcastle/proof/issue-{{TASK_ID}}/before.png \
     --content-type=image/png --remote
   ```
   (repeat for `after.png`). `--remote` is required — without it wrangler writes a
   local simulation, not the real bucket; `--content-type=image/png` makes the
   browser render the image inline instead of downloading it. The public URL is
   then `$R2_PUBLIC_BASE/issue-{{TASK_ID}}-before.png` (resolve `$R2_PUBLIC_BASE`
   from the env — e.g. `https://pub-<hash>.r2.dev`).
6. **Write `.sandcastle/proof/issue-{{TASK_ID}}/PROOF.md`** (text, committed — the
   PNGs are gitignored) holding the embed block the PR step will paste verbatim.
   Head it with a per-issue subheading (NOT `## Visual proof` — the PR's Visual
   proof section supplies that heading once; a second one here double-prints it):
   ```
   ### #{{TASK_ID}}
   | Before | After |
   |---|---|
   | ![before](<before-url>) | ![after](<after-url>) |
   ```
   `git add` `PROOF.md`. Do NOT `git add` the PNGs.

Skip ONLY if the change has no visual surface at all (pure docs, comments, or
build tooling). If you skip, write `.sandcastle/proof/issue-{{TASK_ID}}/PROOF.md`
containing just `### #{{TASK_ID}}` and a line `No visual change (docs/tooling only).`

# COMMIT

Make a git commit. The commit message must:

1. Start with `RALPH:` prefix
2. Include task completed + PRD reference
3. Key decisions made
4. Files changed
5. Blockers or notes for next iteration

Keep it concise.

# THE ISSUE

If the task is not complete, leave a comment on the issue with what was done.

Do not close the issue - this will be done later.

Once complete, output <promise>COMPLETE</promise>.

# FINAL RULES

ONLY WORK ON A SINGLE TASK.
