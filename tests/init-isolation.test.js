import { describe, it, expect, beforeEach } from 'vitest';
import { init, BLOCKS } from '../assets/visual-teach.js';

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
});

describe('init() — block registry', () => {
  it('BLOCKS is the single registry of selectors wired by init()', () => {
    expect(Array.isArray(BLOCKS)).toBe(true);
    const sels = BLOCKS.map(b => b.sel);
    expect(sels).toContain('.vt-quiz');
    expect(sels).toContain('.vt-checklist');
    expect(sels).toContain('.vt-code');
  });

  it('each BLOCKS entry has a sel string and a wire function', () => {
    BLOCKS.forEach(b => {
      expect(typeof b.sel).toBe('string');
      expect(typeof b.wire).toBe('function');
    });
  });

  it('malformed quiz does not prevent a valid checklist from wiring', () => {
    // Malformed quiz: missing .feedback child so wireQuiz would throw on fb.className
    document.body.innerHTML = `
      <div class="vt-quiz" data-answer="0">
        <button class="opt">A</button>
        <!-- .feedback intentionally omitted to trigger the throw -->
      </div>
      <ol class="vt-checklist" data-key="isolation-test">
        <li><input type="checkbox" id="c1"><label for="c1"><span class="vt-step-title">Step 1</span></label></li>
        <li><input type="checkbox" id="c2"><label for="c2"><span class="vt-step-title">Step 2</span></label></li>
      </ol>
    `;

    expect(() => init()).not.toThrow();

    // The checklist should still have its progress bar injected
    const bar = document.querySelector('.vt-progress-bar');
    expect(bar).not.toBeNull();
  });

  it('a valid quiz still wires when preceded by a malformed quiz', () => {
    document.body.innerHTML = `
      <div class="vt-quiz" data-answer="0">
        <button class="opt">A</button>
        <!-- malformed: no .feedback -->
      </div>
      <div class="vt-quiz" data-answer="1">
        <button class="opt">Wrong</button>
        <button class="opt">Correct</button>
        <div class="feedback"></div>
        <template class="why-good">Yes!</template>
        <div class="vt-quiz-live" aria-live="polite" aria-atomic="true"></div>
      </div>
    `;

    expect(() => init()).not.toThrow();

    // The valid quiz should have its buttons wired (type=button set by wireQuiz)
    const quizzes = document.querySelectorAll('.vt-quiz');
    // second quiz should have role=group set by wireQuiz
    expect(quizzes[1].getAttribute('role')).toBe('group');
  });
});
