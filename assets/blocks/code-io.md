# Code blocks and input/output pairs

## Code block — `vt-code` — filename header + copy button + optional Prism highlighting

```html
<div class="vt-code">
  <div class="vt-code-head">
    <span>filename.py</span
    ><button class="vt-code-copy" aria-label="Copy code"></button>
  </div>
  <pre><code class="language-python">def hello():
    return "world"</code></pre>
</div>
```

Add the Prism vendor scripts **before** `visual-teach.js`. The copy button and
Prism init are both wired automatically by `visual-teach.js`. Without Prism (or
JS disabled) the block stays readable — it degrades to styled plain text.

**Bundled grammars** (in `assets/prism/`) — default web set:

| File                      | Languages covered                           |
| ------------------------- | ------------------------------------------- |
| `prism-core.min.js`       | Prism engine (always required first)        |
| `prism-markup.min.js`     | HTML, XML, SVG                              |
| `prism-css.min.js`        | CSS                                         |
| `prism-clike.min.js`      | Shared C-style token rules (required by JS) |
| `prism-javascript.min.js` | JavaScript                                  |
| `prism-python.min.js`     | Python                                      |
| `prism-sql.min.js`        | SQL                                         |
| `prism-bash.min.js`       | Bash / shell                                |

Default web snippet (covers HTML/CSS/JS):

```html
<script src="../assets/prism/prism-core.min.js"></script>
<script src="../assets/prism/prism-markup.min.js"></script>
<script src="../assets/prism/prism-css.min.js"></script>
<script src="../assets/prism/prism-clike.min.js"></script>
<script src="../assets/prism/prism-javascript.min.js"></script>
<script src="../assets/visual-teach.js"></script>
```

Add extra grammars for non-web lessons (Python, SQL, Bash) by appending the
relevant `<script>` tags before `visual-teach.js`. If a `language-X` class is
used but no grammar is loaded, `visual-teach.js` logs a `console.warn` naming
the missing file. To add a new language, download the `.min.js` file from
`https://cdn.jsdelivr.net/npm/prismjs/components/` into `assets/prism/`.

### Display-only variant — `vt-static` — formulas, sample output, ASCII diagrams

Add `.vt-static` to `.vt-code` for preformatted boxes that should never be
copied. A `.vt-code.vt-static` block requires only a `<pre>` (no
`.vt-code-copy`), wires nothing, and emits no console warning.

```html
<div class="vt-code vt-static">
  <div class="vt-code-head"><span>Formula</span></div>
  <pre><code>zenith distance = 90° − Ho</code></pre>
</div>
```

Plain `.vt-code` (without `.vt-static`) still requires `.vt-code-copy` and
warns if absent. For real equations, prefer `.vt-math` / `.vt-eq` (KaTeX/LaTeX).

## Input → output pair — `vt-io` — code beside its result

Side-by-side on wide viewports, stacked below 600 px. Copy button on the
input only. Prism highlighting applies to the input slot. Long lines in either
slot scroll horizontally within the block.

Required children (enforced at runtime): `.vt-io-input` and `.vt-io-output`;
inside `.vt-io-input`: `.vt-code-copy` and `pre`.

```html
<div class="vt-io">
  <div class="vt-io-input">
    <div class="vt-io-head">
      <span>pattern.py</span>
      <button class="vt-code-copy" aria-label="Copy code"></button>
    </div>
    <pre><code class="language-python">import re
print(re.findall(r'\d+', 'abc 123 def 456'))</code></pre>
  </div>
  <div class="vt-io-output">
    <div class="vt-io-head"><span>Output</span></div>
    <pre><code>['123', '456']</code></pre>
  </div>
</div>
```
