### #74

| Before                                                                             | After                                                                            |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| ![before](https://pub-f13a48c633ed409aacedb90d7827f740.r2.dev/issue-74-before.png) | ![after](https://pub-f13a48c633ed409aacedb90d7827f740.r2.dev/issue-74-after.png) |

Before: long labels in `vt-split-label` had no `overflow-wrap`, so they could overflow the half-width panel. `vt-io` and `vt-code` blocks inside split panels lacked CSS contract tests confirming their scroll-safety.

After: `overflow-wrap: break-word` on `.vt-col-label, .vt-split-label` prevents label text from clipping at the panel edge. CSS contract tests added for `vt-io pre { overflow-x: auto }` and `vt-io-input/output { min-width: 0 }` to lock in the existing scroll-safe properties alongside the `vt-code` tests from issue #44.
