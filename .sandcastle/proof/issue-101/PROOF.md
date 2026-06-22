### #101

| Before                                                                                        | After                                                                                       |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| ![before](https://pub-f13a48c633ed409aacedb90d7827f740.r2.dev/issue-101-before.png?v=cc393b0) | ![after](https://pub-f13a48c633ed409aacedb90d7827f740.r2.dev/issue-101-after.png?v=cc393b0) |

The before screenshot shows the normal (non-forced-colors) rendering — callout tones differentiated by color tints and SVG mask icons.
The after screenshot likewise shows normal rendering (forced-colors is an OS mode that Playwright's static shot doesn't emulate by default); the non-color cues (::after glyph labels, ::before quiz glyphs, level shape glyphs, node.em outline) are present in the CSS and verified by the 7 new contract tests.
