import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const css = readFileSync(join(root, 'assets', 'visual-teach.css'), 'utf8');
const cheatsheet = readFileSync(join(root, 'assets', 'visual-teach.md'), 'utf8');
const showcase = readFileSync(join(root, 'demo', 'showcase.html'), 'utf8');
const diagramDemo = readFileSync(join(root, 'demo', 'diagram-blocks.html'), 'utf8');

describe('diagram CSS selectors', () => {
  it('.vt-diagram panel selector exists', () => {
    expect(css).toMatch(/\.vt-diagram/);
  });

  it('.vt-node selector exists', () => {
    expect(css).toMatch(/\.vt-node/);
  });

  it('.vt-box selector exists', () => {
    expect(css).toMatch(/\.vt-box/);
  });

  it('.vt-flow selector exists', () => {
    expect(css).toMatch(/\.vt-flow/);
  });

  it('.vt-row selector exists', () => {
    expect(css).toMatch(/\.vt-row/);
  });

  it('.vt-col selector exists', () => {
    expect(css).toMatch(/\.vt-col/);
  });

  it('.vt-split selector exists', () => {
    expect(css).toMatch(/\.vt-split/);
  });
});

describe('diagram CSS tokenization', () => {
  it('.vt-diagram uses --vt-* tokens (no raw hex colours)', () => {
    const match = css.match(/\.vt-diagram\s*\{([^}]*)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).not.toMatch(/#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/);
  });

  it('.vt-node / .vt-box use --vt-* tokens for color properties', () => {
    const match = css.match(/\.vt-node,\s*\.vt-box\s*\{([^}]*)\}/) ||
                  css.match(/\.vt-node\s*\{([^}]*)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).not.toMatch(/#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/);
  });

  it('.vt-flow connector uses --vt-* tokens', () => {
    const match = css.match(/\.vt-flow\s*\{([^}]*)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).not.toMatch(/#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/);
  });
});

describe('diagram emphasis variants', () => {
  it('.vt-node.em or .vt-box.em selector exists', () => {
    expect(css).toMatch(/\.vt-(?:node|box)\.em/);
  });
});

describe('diagram flow arrows', () => {
  it('.vt-flow has auto arrow connector (::before or content on child)', () => {
    expect(css).toMatch(/\.vt-flow\s*>.*::before|\.vt-flow.*content/);
  });
});

describe('print rules for diagram blocks', () => {
  it('@media print rule covers diagram blocks', () => {
    const printBlocks = css.match(/@media print\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/);
    expect(printBlocks).not.toBeNull();
  });
});

describe('cheatsheet updated', () => {
  it('cheatsheet has .vt-diagram example', () => {
    expect(cheatsheet).toMatch(/vt-diagram/);
  });

  it('cheatsheet has .vt-flow example', () => {
    expect(cheatsheet).toMatch(/vt-flow/);
  });

  it('cheatsheet has .vt-split example', () => {
    expect(cheatsheet).toMatch(/vt-split/);
  });
});

describe('showcase updated', () => {
  it('showcase includes .vt-diagram section', () => {
    expect(showcase).toMatch(/vt-diagram/);
  });

  it('showcase includes .vt-flow', () => {
    expect(showcase).toMatch(/vt-flow/);
  });

  it('showcase includes .vt-split', () => {
    expect(showcase).toMatch(/vt-split/);
  });
});

describe('diagram demo file', () => {
  it('demo/diagram-blocks.html links visual-teach.css', () => {
    expect(diagramDemo).toMatch(/visual-teach\.css/);
  });

  it('demo has .vt-diagram', () => {
    expect(diagramDemo).toMatch(/vt-diagram/);
  });

  it('demo has .vt-flow', () => {
    expect(diagramDemo).toMatch(/vt-flow/);
  });

  it('demo has .vt-node or .vt-box', () => {
    expect(diagramDemo).toMatch(/vt-node|vt-box/);
  });

  it('demo has .vt-split', () => {
    expect(diagramDemo).toMatch(/vt-split/);
  });

  it('demo has .vt-row or .vt-col', () => {
    expect(diagramDemo).toMatch(/vt-row|vt-col/);
  });
});
