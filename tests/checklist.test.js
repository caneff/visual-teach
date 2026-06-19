import { describe, it, expect, beforeEach } from 'vitest';
import { wireChecklist } from '../assets/visual-teach.js';

function makeChecklist(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
  return div.querySelector('.vt-checklist');
}

function click(el) {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
});

// ── Progress bar ──────────────────────────────────────────────────────────────

describe('checklist — progress bar', () => {
  function buildChecklist() {
    const cl = makeChecklist(`
      <ol class="vt-checklist" data-key="test-1">
        <li><input type="checkbox" id="c1"><label for="c1"><span class="vt-step-title">Step 1</span></label></li>
        <li><input type="checkbox" id="c2"><label for="c2"><span class="vt-step-title">Step 2</span></label></li>
        <li><input type="checkbox" id="c3"><label for="c3"><span class="vt-step-title">Step 3</span></label></li>
      </ol>
    `);
    wireChecklist(cl);
    return cl;
  }

  it('injects a .vt-progress-bar element before the list', () => {
    const cl = buildChecklist();
    const bar = cl.parentNode.querySelector('.vt-progress-bar');
    expect(bar).not.toBeNull();
  });

  it('progress bar fill starts at 0%', () => {
    const cl = buildChecklist();
    const fill = cl.parentNode.querySelector('.vt-progress-bar-fill');
    expect(fill).not.toBeNull();
    expect(fill.style.width).toBe('0%');
  });

  it('progress bar fill updates to 33% after one check', () => {
    const cl = buildChecklist();
    const box = cl.querySelectorAll('input[type="checkbox"]')[0];
    box.checked = true;
    box.dispatchEvent(new Event('change', { bubbles: true }));
    const fill = cl.parentNode.querySelector('.vt-progress-bar-fill');
    expect(fill.style.width).toBe('33%');
  });

  it('progress bar fill reaches 100% when all checked', () => {
    const cl = buildChecklist();
    cl.querySelectorAll('input[type="checkbox"]').forEach(b => {
      b.checked = true;
      b.dispatchEvent(new Event('change', { bubbles: true }));
    });
    const fill = cl.parentNode.querySelector('.vt-progress-bar-fill');
    expect(fill.style.width).toBe('100%');
  });

  it('progress text is kept as the bar label', () => {
    const cl = buildChecklist();
    const p = cl.parentNode.querySelector('.vt-progress');
    expect(p).not.toBeNull();
    expect(p.textContent).toContain('0 of 3');
  });

  it('progress text updates after checking', () => {
    const cl = buildChecklist();
    const box = cl.querySelectorAll('input[type="checkbox"]')[0];
    box.checked = true;
    box.dispatchEvent(new Event('change', { bubbles: true }));
    const p = cl.parentNode.querySelector('.vt-progress');
    expect(p.textContent).toContain('1 of 3');
  });

  it('progress bar resets to 0% after reset click', () => {
    const cl = buildChecklist();
    const box = cl.querySelectorAll('input[type="checkbox"]')[0];
    box.checked = true;
    box.dispatchEvent(new Event('change', { bubbles: true }));
    const resetBtn = cl.parentNode.querySelector('.vt-reset');
    click(resetBtn);
    const fill = cl.parentNode.querySelector('.vt-progress-bar-fill');
    expect(fill.style.width).toBe('0%');
  });
});

// ── A11y ──────────────────────────────────────────────────────────────────────

describe('checklist — a11y', () => {
  it('each checkbox has an associated label (for/id pair)', () => {
    const cl = makeChecklist(`
      <ol class="vt-checklist" data-key="test-a11y">
        <li><input type="checkbox"><div><span class="vt-step-title">Step 1</span><span class="vt-step-body">Do it.</span></div></li>
        <li><input type="checkbox"><div><span class="vt-step-title">Step 2</span><span class="vt-step-body">Do more.</span></div></li>
      </ol>
    `);
    wireChecklist(cl);
    cl.querySelectorAll('input[type="checkbox"]').forEach(box => {
      const id = box.id;
      expect(id).toBeTruthy();
      const lbl = document.querySelector(`label[for="${id}"]`);
      expect(lbl).not.toBeNull();
    });
  });

  it('checkbox reflects aria-checked via native checked property', () => {
    const cl = makeChecklist(`
      <ol class="vt-checklist" data-key="test-aria">
        <li><input type="checkbox"><div><span class="vt-step-title">Step</span></div></li>
      </ol>
    `);
    wireChecklist(cl);
    const box = cl.querySelector('input[type="checkbox"]');
    expect(box.checked).toBe(false);
    box.checked = true;
    box.dispatchEvent(new Event('change', { bubbles: true }));
    expect(box.checked).toBe(true);
  });

  it('progress bar has aria-valuenow, aria-valuemin, aria-valuemax', () => {
    const cl = makeChecklist(`
      <ol class="vt-checklist" data-key="test-aria2">
        <li><input type="checkbox"><div><span class="vt-step-title">Step</span></div></li>
        <li><input type="checkbox"><div><span class="vt-step-title">Step 2</span></div></li>
      </ol>
    `);
    wireChecklist(cl);
    const bar = cl.parentNode.querySelector('.vt-progress-bar');
    expect(bar.getAttribute('role')).toBe('progressbar');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
    expect(bar.getAttribute('aria-valuenow')).toBe('0');
  });

  it('aria-valuenow updates as items are checked', () => {
    const cl = makeChecklist(`
      <ol class="vt-checklist" data-key="test-aria3">
        <li><input type="checkbox"><div><span class="vt-step-title">Step</span></div></li>
        <li><input type="checkbox"><div><span class="vt-step-title">Step 2</span></div></li>
      </ol>
    `);
    wireChecklist(cl);
    const box = cl.querySelectorAll('input[type="checkbox"]')[0];
    box.checked = true;
    box.dispatchEvent(new Event('change', { bubbles: true }));
    const bar = cl.parentNode.querySelector('.vt-progress-bar');
    expect(bar.getAttribute('aria-valuenow')).toBe('50');
  });
});
