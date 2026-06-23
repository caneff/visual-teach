# Math equations and inline emphasis

## Math equations — `vt-math` / `vt-eq` — KaTeX display + inline

Vendor KaTeX into `assets/katex/` (already included). Link the CSS and scripts
**before** `visual-teach.js`; `initKatex()` runs automatically on `DOMContentLoaded`.

```html
<link rel="stylesheet" href="../assets/katex/katex.min.css" />
<script src="../assets/katex/katex.min.js"></script>
<script src="../assets/katex/auto-render.min.js"></script>
<script src="../assets/visual-teach.js"></script>
```

**Display block** — wrap LaTeX in `class="vt-math"`. Add `vt-eq` for a
centered, type-sized equation (no inline `style` needed):

```html
<!-- display math, left-aligned -->
<div class="vt-math">\gamma = \frac{1}{\sqrt{1 - v^2/c^2}}</div>

<!-- display math, centered + enlarged (the recommended variant) -->
<div class="vt-math vt-eq">\gamma = \frac{1}{\sqrt{1 - v^2/c^2}}</div>
```

**Inline math** — use `\(...\)` delimiters anywhere in prose; auto-render
processes the whole document body:

```html
<p>The Lorentz factor \(\gamma \geq 1\) means moving clocks always run slow.</p>
```

**Block delimiters** — `\[...\]` renders display-mode inline in prose:

```html
<p>The energy-momentum relation: \[E^2 = (pc)^2 + (m_0 c^2)^2\]</p>
```

Degrades to readable raw LaTeX when KaTeX is absent (JS off, no-network).
Dark/light theming is automatic — KaTeX inherits `currentColor` and the block
uses `var(--vt-ink)`.

## Inline token emphasis — `vt-pcode` — spotlight one keyword

```html
<p>The <code class="vt-pcode">return</code> keyword exits a function.</p>
```

No JS required. Renders with accent background + border so it stands out from
plain `<code>` without being syntax-highlighted.

Inline `<code>` nested inside an `<a>` automatically loses its pill background
and side padding so it reads as normal link text without gap artifacts.
