### #93

| Before                                                                                       | After                                                                                      |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| ![before](https://pub-f13a48c633ed409aacedb90d7827f740.r2.dev/issue-93-before.png?v=5b02269) | ![after](https://pub-f13a48c633ed409aacedb90d7827f740.r2.dev/issue-93-after.png?v=5b02269) |

**Before:** page forced to `data-theme="dark"` with a flat author `:root { --vt-accent: #4338ca }` override.
The indigo accent clobbered vt's dark blue (#5b9dff) — low contrast on dark paper.

**After:** vt's `:root[data-theme="dark"]` rule has specificity 0,2,0 vs the author's 0,1,0, so the
dark-safe blue (#5b9dff) wins. The callout bar and accent nodes show the correct dark accent.
