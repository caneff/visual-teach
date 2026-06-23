// Showcase generator: globs assets/components/*/demo.html, splices bodies into
// one base-linked page, writes demo/showcase.html. Fails if any component lacks a demo.
// Usage: node scripts/showcase.js
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { resolve, join } from "path";
import { fileURLToPath } from "url";

const root = resolve(fileURLToPath(import.meta.url), "../..");
const componentsDir = join(root, "assets", "components");
const outPath = join(root, "demo", "showcase.html");

// Every component that must have a demo — assertion fails if any is missing.
const REQUIRED = [
  "callout",
  "code",
  "table",
  "chip",
  "quiz",
  "checklist",
  "diagram",
  "math",
  "teacher-box",
];

// Discover all component dirs (alphabetical, stable order).
const found = readdirSync(componentsDir).filter((d) =>
  existsSync(join(componentsDir, d, "demo.html"))
);

// Assert every required component has a demo.
const missing = REQUIRED.filter((name) => !found.includes(name));
if (missing.length) {
  console.error(
    `showcase: missing demo.html in components: ${missing.join(", ")}`
  );
  process.exit(1);
}

// Use REQUIRED order so the showcase page is stable regardless of filesystem order.
const components = REQUIRED.filter((name) => found.includes(name));

// Extract content between <body> and </body> (strips the body tag itself).
function extractBody(html) {
  const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return m ? m[1].trim() : html;
}

// Build asset paths relative to demo/showcase.html.
const baseCss = "../assets/base/base.css";
const baseJs = "../assets/base/base.js";

const componentCssLinks = components
  .map(
    (name) =>
      `<link rel="stylesheet" href="../assets/components/${name}/${name}.css">`
  )
  .join("\n");

// Interactive components that ship their own JS.
const jsComponents = ["quiz", "checklist", "code", "diagram", "math"];
const prismScripts = [
  "../assets/prism/prism-core.min.js",
  "../assets/prism/prism-markup.min.js",
  "../assets/prism/prism-css.min.js",
  "../assets/prism/prism-clike.min.js",
  "../assets/prism/prism-javascript.min.js",
  "../assets/prism/prism-python.min.js",
]
  .map((src) => `<script src="${src}"></script>`)
  .join("\n");

const componentJsScripts = jsComponents
  .map(
    (name) => `<script src="../assets/components/${name}/${name}.js"></script>`
  )
  .join("\n");

// Splice each component's body content with a section header.
const sections = components
  .map((name) => {
    const demoPath = join(componentsDir, name, "demo.html");
    const html = readFileSync(demoPath, "utf8");
    const body = extractBody(html);
    const title =
      name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ");
    return `
<!-- ─── ${title} ─────────────────────────────────────────────────────── -->
<div class="sc-component" id="component-${name}">
<p class="sc-label">${title}</p>
${body}
</div>`;
  })
  .join("\n");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>visual-teach · showcase</title>
<link rel="stylesheet" href="${baseCss}">
<link rel="stylesheet" href="../assets/katex/katex.min.css">
${componentCssLinks}
<style>
/* showcase-only chrome — not part of the library */
.sc-label {
  font-family: "Helvetica Neue", Arial, sans-serif;
  font-size: .7rem; text-transform: uppercase; letter-spacing: .1em;
  color: var(--vt-muted); margin: 2.5rem 0 .4rem;
  border-top: 1px dashed var(--vt-rule); padding-top: 1.2rem;
}
.sc-component { margin-bottom: 3rem; }
h3 { font-family: "Helvetica Neue", Arial, sans-serif; font-size: 1.02rem; margin: 1.8rem 0 .4rem; }
</style>
</head>
<body>
<main>
  <p class="vt-kicker">visual-teach · showcase</p>
  <h1>Component showcase</h1>
  <p class="vt-lede">Every component the library ships, rendered from their individual source files.</p>
${sections}
</main>
${prismScripts}
<script src="${baseJs}"></script>
${componentJsScripts}
<script src="../assets/mermaid.js"></script>
<script src="../assets/katex/auto-render.min.js"></script>
</body>
</html>`;

writeFileSync(outPath, html, "utf8");
console.log(`showcase: wrote ${outPath} (${components.length} components)`);
