import { describe, it, expect, beforeEach } from 'vitest';
import { wireQuiz } from '../assets/visual-teach.js';

function makeQuiz(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
  return div.querySelector('.vt-quiz');
}

function click(el) {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

beforeEach(() => {
  document.body.innerHTML = '';
});

// ── Single-answer (default mode) ──────────────────────────────────────────────

describe('quiz — single answer, default mode', () => {
  function buildQuiz() {
    const q = makeQuiz(`
      <div class="vt-quiz" data-answer="1">
        <p class="q">Which option is correct?</p>
        <button class="opt">Wrong A</button>
        <button class="opt">Correct B</button>
        <button class="opt">Wrong C</button>
        <div class="feedback"></div>
        <template class="why-good">Because B is right.</template>
        <template class="why-bad">Generic wrong explanation.</template>
        <template data-opt="0">Misconception for A.</template>
        <template data-opt="2">Misconception for C.</template>
        <div class="vt-quiz-live" aria-live="polite" aria-atomic="true"></div>
      </div>
    `);
    wireQuiz(q);
    return q;
  }

  it('marks correct button with .correct on correct click', () => {
    const q = buildQuiz();
    click(q.querySelectorAll('button.opt')[1]);
    expect(q.querySelectorAll('button.opt')[1].classList.contains('correct')).toBe(true);
  });

  it('shows good feedback on correct click', () => {
    const q = buildQuiz();
    click(q.querySelectorAll('button.opt')[1]);
    const fb = q.querySelector('.feedback');
    expect(fb.classList.contains('show')).toBe(true);
    expect(fb.classList.contains('good')).toBe(true);
    expect(fb.textContent).toContain('Because B is right.');
  });

  it('marks wrong button with .wrong on wrong click', () => {
    const q = buildQuiz();
    click(q.querySelectorAll('button.opt')[0]);
    expect(q.querySelectorAll('button.opt')[0].classList.contains('wrong')).toBe(true);
  });

  it('shows per-option misconception for opt 0', () => {
    const q = buildQuiz();
    click(q.querySelectorAll('button.opt')[0]);
    const fb = q.querySelector('.feedback');
    expect(fb.classList.contains('bad')).toBe(true);
    expect(fb.textContent).toContain('Misconception for A.');
  });

  it('shows per-option misconception for opt 2', () => {
    const q = buildQuiz();
    click(q.querySelectorAll('button.opt')[2]);
    const fb = q.querySelector('.feedback');
    expect(fb.textContent).toContain('Misconception for C.');
  });

  it('falls back to generic why-bad when no per-option template exists', () => {
    const q = makeQuiz(`
      <div class="vt-quiz" data-answer="1">
        <button class="opt">Wrong A</button>
        <button class="opt">Correct B</button>
        <div class="feedback"></div>
        <template class="why-good">Good.</template>
        <template class="why-bad">Generic wrong.</template>
        <div class="vt-quiz-live" aria-live="polite" aria-atomic="true"></div>
      </div>
    `);
    wireQuiz(q);
    click(q.querySelectorAll('button.opt')[0]);
    const fb = q.querySelector('.feedback');
    expect(fb.textContent).toContain('Generic wrong.');
  });

  it('always shows why-correct explanation after a wrong click', () => {
    const q = buildQuiz();
    click(q.querySelectorAll('button.opt')[0]);
    const fb = q.querySelector('.feedback');
    expect(fb.textContent).toContain('Because B is right.');
  });

  it('marks correct answer button even after wrong click', () => {
    const q = buildQuiz();
    click(q.querySelectorAll('button.opt')[0]);
    expect(q.querySelectorAll('button.opt')[1].classList.contains('correct')).toBe(true);
  });

  it('disables all buttons after answering (default, no try-again)', () => {
    const q = buildQuiz();
    click(q.querySelectorAll('button.opt')[0]);
    q.querySelectorAll('button.opt').forEach(b => {
      expect(b.disabled).toBe(true);
    });
  });

  it('announces feedback in aria-live region', () => {
    const q = buildQuiz();
    click(q.querySelectorAll('button.opt')[1]);
    const live = q.querySelector('[aria-live]');
    expect(live.textContent.trim().length).toBeGreaterThan(0);
  });
});

// ── A11y ──────────────────────────────────────────────────────────────────────

describe('quiz — a11y', () => {
  it('quiz div has role=group', () => {
    const q = makeQuiz(`
      <div class="vt-quiz" data-answer="0">
        <p class="q" id="qid">Q?</p>
        <button class="opt">A</button>
        <div class="feedback"></div>
        <div class="vt-quiz-live" aria-live="polite" aria-atomic="true"></div>
      </div>
    `);
    wireQuiz(q);
    expect(q.getAttribute('role')).toBe('group');
  });

  it('each opt button has type=button', () => {
    const q = makeQuiz(`
      <div class="vt-quiz" data-answer="0">
        <button class="opt">A</button>
        <div class="feedback"></div>
        <div class="vt-quiz-live" aria-live="polite" aria-atomic="true"></div>
      </div>
    `);
    wireQuiz(q);
    q.querySelectorAll('button.opt').forEach(b => {
      expect(b.type).toBe('button');
    });
  });
});

// ── Try-again mode ────────────────────────────────────────────────────────────

describe('quiz — try-again mode', () => {
  function buildTryAgainQuiz() {
    const q = makeQuiz(`
      <div class="vt-quiz" data-answer="1" data-try-again>
        <button class="opt">Wrong</button>
        <button class="opt">Correct</button>
        <div class="feedback"></div>
        <template class="why-good">Yes!</template>
        <div class="vt-quiz-live" aria-live="polite" aria-atomic="true"></div>
      </div>
    `);
    wireQuiz(q);
    return q;
  }

  it('buttons remain enabled after wrong click in try-again mode', () => {
    const q = buildTryAgainQuiz();
    click(q.querySelectorAll('button.opt')[0]);
    // wrong click — buttons should NOT be disabled
    q.querySelectorAll('button.opt').forEach(b => {
      expect(b.disabled).toBe(false);
    });
  });

  it('shows try-again button after wrong click', () => {
    const q = buildTryAgainQuiz();
    click(q.querySelectorAll('button.opt')[0]);
    const tryBtn = q.querySelector('.vt-quiz-try-again');
    expect(tryBtn).not.toBeNull();
  });

  it('clicking try-again resets the quiz', () => {
    const q = buildTryAgainQuiz();
    click(q.querySelectorAll('button.opt')[0]);
    const tryBtn = q.querySelector('.vt-quiz-try-again');
    click(tryBtn);
    const fb = q.querySelector('.feedback');
    expect(fb.classList.contains('show')).toBe(false);
    q.querySelectorAll('button.opt').forEach(b => {
      expect(b.classList.contains('correct')).toBe(false);
      expect(b.classList.contains('wrong')).toBe(false);
    });
  });

  it('locks quiz after correct click even in try-again mode', () => {
    const q = buildTryAgainQuiz();
    click(q.querySelectorAll('button.opt')[1]);
    q.querySelectorAll('button.opt').forEach(b => {
      expect(b.disabled).toBe(true);
    });
  });
});

// ── Multi-select mode ─────────────────────────────────────────────────────────

describe('quiz — multi-select mode', () => {
  function buildMultiQuiz() {
    const q = makeQuiz(`
      <div class="vt-quiz" data-answer="0,2" data-multi>
        <p class="q">Pick all correct options.</p>
        <button class="opt">Correct A</button>
        <button class="opt">Wrong B</button>
        <button class="opt">Correct C</button>
        <div class="feedback"></div>
        <template class="why-good">A and C are correct.</template>
        <div class="vt-quiz-live" aria-live="polite" aria-atomic="true"></div>
      </div>
    `);
    wireQuiz(q);
    return q;
  }

  it('renders a Check answer button in multi mode', () => {
    const q = buildMultiQuiz();
    const checkBtn = q.querySelector('.vt-quiz-check');
    expect(checkBtn).not.toBeNull();
  });

  it('buttons toggle aria-pressed when clicked in multi mode', () => {
    const q = buildMultiQuiz();
    const opts = q.querySelectorAll('button.opt');
    click(opts[0]);
    expect(opts[0].getAttribute('aria-pressed')).toBe('true');
    click(opts[0]);
    expect(opts[0].getAttribute('aria-pressed')).toBe('false');
  });

  it('reveals correct/wrong on Check click', () => {
    const q = buildMultiQuiz();
    const opts = q.querySelectorAll('button.opt');
    // select both correct options
    click(opts[0]);
    click(opts[2]);
    const checkBtn = q.querySelector('.vt-quiz-check');
    click(checkBtn);
    expect(opts[0].classList.contains('correct')).toBe(true);
    expect(opts[2].classList.contains('correct')).toBe(true);
    expect(opts[1].classList.contains('wrong')).toBe(false); // wasn't selected
  });

  it('shows wrong if incorrect option selected', () => {
    const q = buildMultiQuiz();
    const opts = q.querySelectorAll('button.opt');
    click(opts[1]); // wrong option
    const checkBtn = q.querySelector('.vt-quiz-check');
    click(checkBtn);
    expect(opts[1].classList.contains('wrong')).toBe(true);
  });

  it('shows good feedback when all correct options selected', () => {
    const q = buildMultiQuiz();
    const opts = q.querySelectorAll('button.opt');
    click(opts[0]);
    click(opts[2]);
    const checkBtn = q.querySelector('.vt-quiz-check');
    click(checkBtn);
    const fb = q.querySelector('.feedback');
    expect(fb.classList.contains('good')).toBe(true);
    expect(fb.textContent).toContain('A and C are correct.');
  });
});
