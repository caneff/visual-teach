### #92

| Before                                                                                       | After                                                                                      |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| ![before](https://pub-f13a48c633ed409aacedb90d7827f740.r2.dev/issue-92-before.png?v=fbecab1) | ![after](https://pub-f13a48c633ed409aacedb90d7827f740.r2.dev/issue-92-after.png?v=fbecab1) |

**Before:** `demo/cron-0001-after.html` had `type="module"` on the `visual-teach.js` script tag. Over `file://` the browser blocks the fetch with a CORS policy error, so all interactive components (quiz, checklist, copy buttons) fail to wire up silently.

**After:** `type="module"` removed. The plain `<script src="...">` tag loads the UMD/IIFE correctly over `file://`, so components wire up as expected. The `SKILL.md` Convert instructions and `assets/visual-teach.md` cheatsheet now both explicitly warn against adding `type="module"`.
