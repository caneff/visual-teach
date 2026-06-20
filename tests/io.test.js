// Tests for .vt-io paired input→output block.
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

const VALID_IO = `
  <div class="vt-io">
    <div class="vt-io-input">
      <div class="vt-io-head"><span>code.py</span><button class="vt-code-copy" aria-label="Copy code"></button></div>
      <pre><code class="language-python">x = 1</code></pre>
    </div>
    <div class="vt-io-output">
      <div class="vt-io-head"><span>Output</span></div>
      <pre><code>1</code></pre>
    </div>
  </div>
`;

describe('vt-io slots', () => {
  it('renders both the input and output slots', () => {
    setup(VALID_IO);
    expect(document.querySelector('.vt-io-input')).not.toBeNull();
    expect(document.querySelector('.vt-io-output')).not.toBeNull();
  });

  it('wires the copy button inside the input slot', () => {
    setup(VALID_IO);
    const btn = document.querySelector('.vt-io-input .vt-code-copy');
    expect(btn).not.toBeNull();
    // After wiring the button receives the copy SVG icon
    expect(btn.innerHTML).toContain('<svg');
  });
});

describe('vt-io copy button', () => {
  it('copy button is only present in the input slot, not the output slot', () => {
    setup(VALID_IO);
    // The output slot must never have a copy button wired into it
    expect(document.querySelector('.vt-io-output .vt-code-copy')).toBeNull();
    expect(document.querySelector('.vt-io-input .vt-code-copy')).not.toBeNull();
  });

  it('calls clipboard.writeText with the input code content when clicked', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    setup(`
      <div class="vt-io">
        <div class="vt-io-input">
          <div class="vt-io-head"><span>code.py</span><button class="vt-code-copy"></button></div>
          <pre><code>print("hello")</code></pre>
        </div>
        <div class="vt-io-output">
          <div class="vt-io-head"><span>Output</span></div>
          <pre><code>hello</code></pre>
        </div>
      </div>
    `);

    document.querySelector('.vt-io-input .vt-code-copy').click();
    await Promise.resolve();

    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText).toHaveBeenCalledWith('print("hello")');
  });
});

describe('vt-io Prism highlighting', () => {
  it('calls Prism.highlightAll when a language-* code block exists in the input slot', () => {
    const highlightAll = vi.fn();
    globalThis.Prism = { highlightAll };

    setup(VALID_IO);

    expect(highlightAll).toHaveBeenCalledOnce();
  });
});

describe('vt-io missing required children', () => {
  it('warns when .vt-io-input slot is missing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    setup(`
      <div class="vt-io">
        <div class="vt-io-output">
          <div class="vt-io-head"><span>Output</span></div>
          <pre><code>1</code></pre>
        </div>
      </div>
    `);

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('.vt-io-input'));
    warnSpy.mockRestore();
  });

  it('warns when .vt-io-output slot is missing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    setup(`
      <div class="vt-io">
        <div class="vt-io-input">
          <div class="vt-io-head"><span>code.py</span><button class="vt-code-copy"></button></div>
          <pre><code>x = 1</code></pre>
        </div>
      </div>
    `);

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('.vt-io-output'));
    warnSpy.mockRestore();
  });

  it('warns when .vt-code-copy is missing from the input slot', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    setup(`
      <div class="vt-io">
        <div class="vt-io-input">
          <div class="vt-io-head"><span>code.py</span></div>
          <pre><code>x = 1</code></pre>
        </div>
        <div class="vt-io-output">
          <div class="vt-io-head"><span>Output</span></div>
          <pre><code>1</code></pre>
        </div>
      </div>
    `);

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('.vt-code-copy'));
    warnSpy.mockRestore();
  });

  it('warns when pre is missing from the input slot', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    setup(`
      <div class="vt-io">
        <div class="vt-io-input">
          <div class="vt-io-head"><span>code.py</span><button class="vt-code-copy"></button></div>
        </div>
        <div class="vt-io-output">
          <div class="vt-io-head"><span>Output</span></div>
          <pre><code>1</code></pre>
        </div>
      </div>
    `);

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('pre'));
    warnSpy.mockRestore();
  });

  it('includes the block class in the warning message', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    setup(`<div class="vt-io"></div>`);

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('vt-io'));
    warnSpy.mockRestore();
  });
});
