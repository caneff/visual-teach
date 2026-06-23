# Visual proof protocol

This repo is visual: a change to a `vt-*` block changes how it renders, so the PR
must **show** before/after screenshots, not just describe the change. Follow this
whenever your change has any visual surface. `<id>` below is the issue number you
are working on — substitute it everywhere.

Tool: `node .sandcastle/shot.mjs <html-file> <out.png> [cssSelector]` (Playwright;
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
     `node .sandcastle/shot.mjs demo/<page>.html .sandcastle/proof/issue-<id>/before.png [selector]`
  2. Make your change.
  3. **AFTER** — same page, same selector:
     `node .sandcastle/shot.mjs demo/<page>.html .sandcastle/proof/issue-<id>/after.png [selector]`
- **Regenerating proof on an open PR** — `before.png` already EXISTS: the "before"
  is the original pre-fix state. **Do NOT touch it.** Re-shoot only `after.png` on
  your fixed code, using the same page/selector as the existing proof.

## Upload to Cloudflare R2 (durable CDN URLs, no binaries in git history)

`wrangler` is preinstalled and authenticates from `CLOUDFLARE_API_TOKEN` /
`CLOUDFLARE_ACCOUNT_ID`; the bucket is `$R2_BUCKET`. Objects are namespaced by
issue. Re-uploads overwrite the object in place:

```
wrangler r2 object put "$R2_BUCKET/issue-<id>-after.png" \
  --file=.sandcastle/proof/issue-<id>/after.png \
  --content-type=image/png --remote
```

Repeat for `before.png` **only** when you captured a new before. `--remote` is
required (without it wrangler writes a local simulation, not the real bucket);
`--content-type=image/png` makes the browser render the image inline.

**The embedded URL MUST carry a cache-buster, and you MUST bump it on every
re-shoot.** GitHub proxies all PR/markdown images through
`camo.githubusercontent.com`, which caches by full URL and ignores the origin's
`Cache-Control`. Overwriting a stable R2 key therefore changes NOTHING the
reviewer sees — camo keeps serving the first copy it cached. The reviewer will
say "nothing changed" and they will be right. The only thing that forces camo to
refetch is a URL it has never seen, so version the URL with the commit that
carries the new screenshot:

```
$R2_PUBLIC_BASE/issue-<id>-after.png?v=<short-sha>
```

`<short-sha>` = `git rev-parse --short HEAD` of your latest commit (the fix), or
any fresh unique token — it only needs to be a URL camo has never seen. Resolve
`$R2_PUBLIC_BASE` from the env (e.g. `https://pub-<hash>.r2.dev`). The R2 key stays
stable (overwrite in place); only the `?v=` query changes. This means the embed in
the PR description DOES get edited on every re-shoot — that is mandatory, not optional. Do NOT try
to fix a stale image by `curl -X PURGE` on the camo URL; GitHub has degraded that
path and it is unreliable.

## Record

Write `.sandcastle/proof/issue-<id>/PROOF.md` as **local scratch** — the whole
`proof/` dir is gitignored, so nothing here is committed. It is the source you
paste into the **PR description**; that is the only place the proof lives. Head it
with a per-issue subheading — **NOT** `## Visual proof`, which the PR's own Visual
proof section supplies once; a second one double-prints:

```
### #<id>
| Before | After |
|---|---|
| ![before](<before-url>) | ![after](<after-url>) |
```

Put the table in the **PR description**; never commit `PROOF.md` or the PNGs. When
you regenerated `after.png` for an existing PR, bump the `?v=<short-sha>`
cache-buster on the after-URL in the PR description — see the camo note above.
Leaving the URL unchanged means the reviewer keeps seeing the old image.

## Rules

- **Keep R2 hosting; don't re-host on raw.githubusercontent or elsewhere.** A
  sandbox failing to read an R2 URL is a network blip, not a reason to switch hosts.
  But the embedded URL is NOT immutable: it carries a `?v=<short-sha>` cache-buster
  that you bump on every re-shoot (see the camo note above). If a reviewer says a
  re-shot image "looks unchanged," the cause is almost always a missing `?v=` bump —
  camo served the stale cached copy. Fix the URL, don't re-argue the pixels.
- **Never drop the "before" column.** Before and after always ship together.
- Skip proof ONLY for a change with no visual surface (logic / docs / tooling). Then
  PROOF.md is just `### #<id>` and a line `No visual change (docs/tooling only).`
