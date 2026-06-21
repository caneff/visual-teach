# Visual proof protocol

This repo is visual: a change to a `vt-*` block changes how it renders, so the PR
must **show** before/after screenshots, not just describe the change. Follow this
whenever your change has any visual surface. `<id>` below is the issue number you
are working on — substitute it everywhere.

Tool: `node demo/shot.mjs <html-file> <out.png> [cssSelector]` (Playwright;
chromium installed). Pick the `demo/` page that exercises the block you touched
(e.g. `code-block.html`, `table-variants.html`, `diagram-blocks.html`,
`figure-photo.html`); if unsure use `demo/showcase.html`, which uses every block.
Screenshot the whole page, or pass a `cssSelector` to frame just the affected
block. If the block needs JS (Prism, quiz, checklist, mermaid), `file://` will not
run the ES module — serve first (`python3 -m http.server 8000 &`) and shot a
`http://localhost:8000/...` URL so the shot shows the wired result.

## Capture

- **New work** — `.sandcastle/proof/issue-<id>/before.png` does NOT exist yet:
  1. **BEFORE** — on the UNCHANGED code, before you edit anything:
     `node demo/shot.mjs demo/<page>.html .sandcastle/proof/issue-<id>/before.png [selector]`
  2. Make your change.
  3. **AFTER** — same page, same selector:
     `node demo/shot.mjs demo/<page>.html .sandcastle/proof/issue-<id>/after.png [selector]`
- **Regenerating proof on an open PR** — `before.png` already EXISTS: the "before"
  is the original pre-fix state. **Do NOT touch it.** Re-shoot only `after.png` on
  your fixed code, using the same page/selector as the existing proof.

## Upload to Cloudflare R2 (durable CDN URLs, no binaries in git history)

`wrangler` is preinstalled and authenticates from `CLOUDFLARE_API_TOKEN` /
`CLOUDFLARE_ACCOUNT_ID`; the bucket is `$R2_BUCKET`. Objects are namespaced by
issue, so re-uploads **overwrite in place** — re-shooting after a fix updates the
image everywhere the PR embeds it, with no description edit:

```
wrangler r2 object put "$R2_BUCKET/issue-<id>-after.png" \
  --file=.sandcastle/proof/issue-<id>/after.png \
  --content-type=image/png --remote
```

Repeat for `before.png` **only** when you captured a new before. `--remote` is
required (without it wrangler writes a local simulation, not the real bucket);
`--content-type=image/png` makes the browser render the image inline. Public URL:
`$R2_PUBLIC_BASE/issue-<id>-after.png` (resolve `$R2_PUBLIC_BASE` from the env —
e.g. `https://pub-<hash>.r2.dev`).

## Record

Write `.sandcastle/proof/issue-<id>/PROOF.md` (committed text; the PNGs are
gitignored). Head it with a per-issue subheading — **NOT** `## Visual proof`, which
the PR's own Visual proof section supplies once; a second one double-prints:

```
### #<id>
| Before | After |
|---|---|
| ![before](<before-url>) | ![after](<after-url>) |
```

`git add` `PROOF.md`, never the PNGs. When you only regenerated `after.png` for an
existing PR, PROOF.md already holds the right (stable) URLs — leave it unchanged.

## Rules

- **Never rewrite the PR description to change screenshot hosting.** The R2 URLs are
  stable and work; a sandbox failing to read one is a network blip, not a reason to
  re-host on raw.githubusercontent or anything else.
- **Never drop the "before" column.** Before and after always ship together.
- Skip proof ONLY for a change with no visual surface (logic / docs / tooling). Then
  PROOF.md is just `### #<id>` and a line `No visual change (docs/tooling only).`
