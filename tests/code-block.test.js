// Tests for .vt-code copy button, Prism init, and pcode inline variant.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const JS_SRC = readFileSync(resolve(__dirname, '../assets/visual-teach.js'), 'utf8');

function setup(html) {
  document.body.innerHTML = html;
  // Strip ES module export keywords so new Function() can evaluate the script
  // eslint-disable-next-line no-new-func
  new Function(JS_SRC.replace(/^export\s+/gm, ''))();
}

beforeEach(() => {
  vi.restoreAllMocks();
  delete globalThis.Prism;
});

afterEach(() => {
  vi.useRealTimers();
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

  it('swaps to the check icon on copy then reverts to the copy icon after 2s', async () => {
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
    // copy icon (two squares) has a <rect>; check icon does not
    expect(btn.innerHTML).toContain('<rect');
    btn.click();
    await Promise.resolve(); // flush the writeText promise

    expect(btn.innerHTML).not.toContain('<rect');
    expect(btn.innerHTML).toContain('M20 6');

    vi.advanceTimersByTime(2000);
    expect(btn.innerHTML).toContain('<rect');
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

  it('warns to console when a language-X block has no grammar loaded', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    globalThis.Prism = { highlightAll: vi.fn(), languages: { css: undefined } };

    setup(`
      <div class="vt-code">
        <pre><code class="language-css">body { color: red; }</code></pre>
      </div>
    `);

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('css'));
    warnSpy.mockRestore();
  });

  it('does not warn when every language-X block has a grammar loaded', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    globalThis.Prism = { highlightAll: vi.fn(), languages: { javascript: {} } };

    setup(`
      <div class="vt-code">
        <pre><code class="language-javascript">const x = 1;</code></pre>
      </div>
    `);

    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
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
