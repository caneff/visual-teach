/**
 * Tests for .vt-code block functionality in visual-teach.js
 * Covers: copy button, Prism init fallback, pcode inline variant.
 *
 * Uses vitest's built-in jsdom environment (set in vitest.config.js).
 * We eval the library source directly into the test's window to keep the
 * global scope consistent and avoid the cross-context issues of new JSDOM().
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const JS_SRC = readFileSync(resolve(__dirname, '../assets/visual-teach.js'), 'utf8');

/** Set body HTML and re-run the library init. */
function setup(html) {
  document.body.innerHTML = html;
  // Run the IIFE in the current jsdom window context
  // eslint-disable-next-line no-new-func
  new Function(JS_SRC)();
}

beforeEach(() => {
  vi.restoreAllMocks();
  // Reset any Prism global between tests
  delete globalThis.Prism;
});

describe('vt-code copy button', () => {
  it('calls clipboard.writeText with the code content when clicked', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    setup(`
      <div class="vt-code">
        <div class="vt-code-head"><span>hello.py</span><button class="vt-code-copy">Copy</button></div>
        <pre><code>print("hello")</code></pre>
      </div>
    `);

    document.querySelector('.vt-code-copy').click();
    await Promise.resolve();

    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText).toHaveBeenCalledWith('print("hello")');
  });

  it('changes button text to "Copied!" then reverts after 2s', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn(() => Promise.resolve()) },
      writable: true,
      configurable: true,
    });
    vi.useFakeTimers();

    setup(`
      <div class="vt-code">
        <div class="vt-code-head"><span>f.js</span><button class="vt-code-copy">Copy</button></div>
        <pre><code>const x = 1;</code></pre>
      </div>
    `);

    const btn = document.querySelector('.vt-code-copy');
    btn.click();
    await Promise.resolve(); // flush the writeText promise

    expect(btn.textContent).toBe('Copied!');

    vi.advanceTimersByTime(2000);
    expect(btn.textContent).toBe('Copy');

    vi.useRealTimers();
  });

  it('does nothing when clipboard API is unavailable (no throw)', () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    setup(`
      <div class="vt-code">
        <div class="vt-code-head"><span>f.js</span><button class="vt-code-copy">Copy</button></div>
        <pre><code>x = 1</code></pre>
      </div>
    `);

    expect(() => document.querySelector('.vt-code-copy').click()).not.toThrow();
  });
});

describe('vt-code Prism init', () => {
  it('calls Prism.highlightAll when Prism is present and code blocks exist', () => {
    const highlightAll = vi.fn();
    globalThis.Prism = { highlightAll };

    setup(`
      <div class="vt-code">
        <pre><code class="language-python">x = 1</code></pre>
      </div>
    `);

    expect(highlightAll).toHaveBeenCalledOnce();
  });

  it('does not call Prism.highlightAll when no language-* code blocks exist', () => {
    const highlightAll = vi.fn();
    globalThis.Prism = { highlightAll };

    setup(`
      <div class="vt-code">
        <pre><code>x = 1</code></pre>
      </div>
    `);

    expect(highlightAll).not.toHaveBeenCalled();
  });

  it('does not throw when Prism is absent (plain code fallback)', () => {
    setup(`
      <div class="vt-code">
        <pre><code class="language-python">x = 1</code></pre>
      </div>
    `);
    // No Prism global — should not throw
  });
});

describe('vt-pcode inline token emphasis', () => {
  it('.vt-pcode elements require no JS — they exist as plain code elements', () => {
    setup(`<p>Use <code class="vt-pcode">return</code> to exit a function.</p>`);
    const el = document.querySelector('.vt-pcode');
    expect(el).not.toBeNull();
    expect(el.tagName).toBe('CODE');
    expect(el.textContent).toBe('return');
  });
});
