### #83

No visual change (logic/warning only).

The fix adds a `console.warn` in `wireQuiz` when a `data-multi` quiz has a
missing or single-index `data-answer`. Rendering and grading behaviour are
unchanged; the warning appears only in the browser/Node console during
authoring.
