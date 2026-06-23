# Quizzes and checklists

## Quiz — `vt-quiz`

`data-answer` = 0-based index of the correct option.

**Option text rules** — the goal is that no option visually singles itself out as the answer:

- Keep the visible text of each option roughly the same length.
- Inline code (`<code>` or `vt-pcode`) is fine **as long as it is used uniformly across all options** — the rule guards against only the correct answer having special formatting, not against formatting itself.
- Never spell out punctuation as words: write `re.findall`, not "re dot findall".

Required children (`button.opt`, `.feedback`) are declared in `wireQuiz` in
`visual-teach.js` and enforced at runtime — a console warning names any missing
child and leaves the block inert.

### Single-answer — retry until correct, with per-option misconceptions

```html
<div class="vt-quiz" data-answer="1">
  <p class="q">Question?</p>
  <button class="opt">Option A</button>
  <button class="opt">Option B — correct</button>
  <button class="opt">Option C</button>
  <div class="feedback"></div>
  <template class="why-good">Shown once the learner picks correctly.</template>
  <template class="why-bad"
    >Fallback shown when wrong, no per-option template.</template
  >
  <template data-opt="0">Misconception for option A specifically.</template>
  <template data-opt="2">Misconception for option C specifically.</template>
  <div class="vt-quiz-live" aria-live="polite" aria-atomic="true"></div>
</div>
```

Wrong pick shows feedback but never reveals the answer or locks — learner retries
until correct, and can still click wrong options afterward to read their explanations.
Optional: `template[data-opt="N"]` per-option misconception (falls back to
`template.why-bad`), `template.why-good`, `template.why-bad`, `div[aria-live]`
for screen-reader feedback.

### Multi-select — add `data-multi`, set `data-answer` to a comma-separated list

```html
<div class="vt-quiz" data-answer="0,2" data-multi>
  <p class="q">Pick all correct options.</p>
  <button class="opt">Correct A</button>
  <button class="opt">Wrong B</button>
  <button class="opt">Correct C</button>
  <div class="feedback"></div>
  <template class="why-good">A and C are correct because…</template>
  <div class="vt-quiz-live" aria-live="polite" aria-atomic="true"></div>
</div>
```

A "Check answer" button is auto-injected. Clicking options toggles selection
(`aria-pressed`).

## Checklist — `vt-checklist` (persists in localStorage; progress bar + count + reset auto-injected)

`data-key` must be unique per lesson.

```html
<ol class="vt-checklist" data-key="topic-0001">
  <li>
    <input type="checkbox" />
    <div>
      <span class="vt-step-title">Step title</span>
      <span class="vt-step-body">What to do.</span>
    </div>
  </li>
</ol>
```

A11y: label association and `aria-valuenow` on the progress bar are auto-injected.
