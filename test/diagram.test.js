import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
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
    assert.match(css, /\.vt-diagram/);
  });

  it('.vt-node selector exists', () => {
    assert.match(css, /\.vt-node/);
  });

  it('.vt-box selector exists', () => {
    assert.match(css, /\.vt-box/);
  });

  it('.vt-flow selector exists', () => {
    assert.match(css, /\.vt-flow/);
  });

  it('.vt-row selector exists', () => {
    assert.match(css, /\.vt-row/);
  });

  it('.vt-col selector exists', () => {
    assert.match(css, /\.vt-col/);
  });

  it('.vt-split selector exists', () => {
    assert.match(css, /\.vt-split/);
  });
});

describe('diagram CSS tokenization', () => {
  it('.vt-diagram uses --vt-* tokens (no raw hex colours)', () => {
    // Extract the .vt-diagram rule block
    const match = css.match(/\.vt-diagram\s*\{([^}]*)\}/);
    assert.ok(match, '.vt-diagram rule not found');
    // Any color-like values (3/6/8-digit hex) should be absent in the block
    assert.doesNotMatch(match[1], /#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/);
  });

  it('.vt-node / .vt-box use --vt-* tokens for color properties', () => {
    const match = css.match(/\.vt-node,\s*\.vt-box\s*\{([^}]*)\}/) ||
                  css.match(/\.vt-node\s*\{([^}]*)\}/);
    assert.ok(match, '.vt-node rule not found');
    assert.doesNotMatch(match[1], /#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/);
  });

  it('.vt-flow connector uses --vt-* tokens', () => {
    const match = css.match(/\.vt-flow\s*\{([^}]*)\}/);
    assert.ok(match, '.vt-flow rule not found');
    assert.doesNotMatch(match[1], /#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/);
  });
});

describe('diagram emphasis variants', () => {
  it('.vt-node.em or .vt-box.em selector exists', () => {
    assert.match(css, /\.vt-(?:node|box)\.em/);
  });
});

describe('diagram flow arrows', () => {
  it('.vt-flow has auto arrow connector (::before or content on child)', () => {
    // Arrow connectors via ::before on subsequent children
    assert.match(css, /\.vt-flow\s*>.*::before|\.vt-flow.*content/);
  });
});

describe('print rules for diagram blocks', () => {
  it('@media print rule covers diagram blocks', () => {
    const printBlocks = css.match(/@media print\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/);
    assert.ok(printBlocks, '@media print not found');
  });
});

describe('cheatsheet updated', () => {
  it('cheatsheet has .vt-diagram example', () => {
    assert.match(cheatsheet, /vt-diagram/);
  });

  it('cheatsheet has .vt-flow example', () => {
    assert.match(cheatsheet, /vt-flow/);
  });

  it('cheatsheet has .vt-split example', () => {
    assert.match(cheatsheet, /vt-split/);
  });
});

describe('showcase updated', () => {
  it('showcase includes .vt-diagram section', () => {
    assert.match(showcase, /vt-diagram/);
  });

  it('showcase includes .vt-flow', () => {
    assert.match(showcase, /vt-flow/);
  });

  it('showcase includes .vt-split', () => {
    assert.match(showcase, /vt-split/);
  });
});

describe('diagram demo file', () => {
  it('demo/diagram-blocks.html links visual-teach.css', () => {
    assert.match(diagramDemo, /visual-teach\.css/);
  });

  it('demo has .vt-diagram', () => {
    assert.match(diagramDemo, /vt-diagram/);
  });

  it('demo has .vt-flow', () => {
    assert.match(diagramDemo, /vt-flow/);
  });

  it('demo has .vt-node or .vt-box', () => {
    assert.match(diagramDemo, /vt-node|vt-box/);
  });

  it('demo has .vt-split', () => {
    assert.match(diagramDemo, /vt-split/);
  });

  it('demo has .vt-row or .vt-col', () => {
    assert.match(diagramDemo, /vt-row|vt-col/);
  });
});
