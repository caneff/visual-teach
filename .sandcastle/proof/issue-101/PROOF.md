### #101

| Before                                                                                        | After                                                                                       |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| ![before](https://pub-f13a48c633ed409aacedb90d7827f740.r2.dev/issue-101-before.png?v=cc393b0) | ![after](https://pub-f13a48c633ed409aacedb90d7827f740.r2.dev/issue-101-after.png?v=0ad8aea) |

The before screenshot shows the normal (non-forced-colors) rendering — callout tones differentiated by color tints and SVG mask icons.
The after screenshot shows the same page under forced-colors emulation (Playwright `forcedColors: 'active'`), where SVG-mask icons collapse to a monochrome slab and the new `::after` glyph labels (⚠ ℹ 💡 ✓ ⛔) and `::before` quiz/pill/level glyphs become the only distinguishing cues.
