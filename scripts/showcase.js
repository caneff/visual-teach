// Showcase generator: globs assets/components/*/demo.html, splices bodies into
// one base-linked page, writes demo/showcase.html. Fails if any component lacks a demo.
// Usage: node scripts/showcase.js
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { resolve, join } from "path";
import { fileURLToPath } from "url";

const root = resolve(fileURLToPath(import.meta.url), "../..");
const componentsDir = join(root, "skills/visual-teach/assets", "components");
const outPath = join(root, "demo", "showcase.html");

// Every component that must have a demo — assertion fails if any is missing.
const REQUIRED = [
  "callout",
  "code",
  "table",
  "chip",
  "quiz",
  "reveal",
  "checklist",
  "diagram",
  "math",
  "sandbox",
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

// Extract <style> blocks from <head> (demo-specific styles like .demo-row).
function extractHeadStyles(html) {
  const headM = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  if (!headM) return "";
  const styles = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(headM[1])) !== null) styles.push(m[1].trim());
  return styles.join("\n");
}

// Extract content between <body> and </body>, stripping script tags.
// Script tags have demo-relative paths that break in the showcase context;
// the correct scripts are added once at the bottom of the generated page.
function extractBody(html) {
  const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = m ? m[1].trim() : html;
  return body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").trim();
}

// Build asset paths relative to demo/showcase.html.
const baseCss = "../skills/visual-teach/assets/base/base.css";
const baseJs = "../skills/visual-teach/assets/base/base.js";

const componentCssLinks = components
  .map(
    (name) =>
      `<link rel="stylesheet" href="../skills/visual-teach/assets/components/${name}/${name}.css">`
  )
  .join("\n");

// Interactive components that ship their own JS.
const jsComponents = [
  "quiz",
  "checklist",
  "code",
  "diagram",
  "math",
  "sandbox",
];
const prismScripts = [
  "../skills/visual-teach/assets/prism/prism-core.min.js",
  "../skills/visual-teach/assets/prism/prism-markup.min.js",
  "../skills/visual-teach/assets/prism/prism-css.min.js",
  "../skills/visual-teach/assets/prism/prism-clike.min.js",
  "../skills/visual-teach/assets/prism/prism-javascript.min.js",
  "../skills/visual-teach/assets/prism/prism-python.min.js",
]
  .map((src) => `<script src="${src}"></script>`)
  .join("\n");

const componentJsScripts = jsComponents
  .map(
    (name) =>
      `<script src="../skills/visual-teach/assets/components/${name}/${name}.js"></script>`
  )
  .join("\n");

// Splice each component's body content with a section header.
const sections = components
  .map((name) => {
    const demoPath = join(componentsDir, name, "demo.html");
    const html = readFileSync(demoPath, "utf8");
    const headStyles = extractHeadStyles(html);
    const body = extractBody(html);
    const title =
      name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ");
    const styleBlock = headStyles ? `<style>\n${headStyles}\n</style>\n` : "";
    return `
<!-- ─── ${title} ─────────────────────────────────────────────────────── -->
<div class="sc-component" id="component-${name}">
${styleBlock}${body}
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
${componentCssLinks}
<style>
/* showcase-only chrome — not part of the library */
.sc-component {
  margin-bottom: 3rem;
  border-top: 1px dashed var(--vt-rule);
  padding-top: 1.2rem;
}
h3 { font-family: "Helvetica Neue", Arial, sans-serif; font-size: 1.02rem; margin: 1.8rem 0 .4rem; }
/* Reset the <main> elements spliced from component demos so base.css's
   max-width/margin/padding only applies to the outer showcase <main>. */
.sc-component main { max-width: none; margin: 0; padding: 0; }
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
<script src="../skills/visual-teach/assets/mermaid.js"></script>
</body>
</html>`;

writeFileSync(outPath, html, "utf8");
console.log(`showcase: wrote ${outPath} (${components.length} components)`);
