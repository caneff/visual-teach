import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/**",
      "skills/visual-teach/assets/prism/**", // vendored, minified
      "skills/visual-teach/assets/katex/**", // vendored, minified
      ".claude/skills/teach/assets/prism/**", // vendored, minified
      ".claude/skills/teach/assets/katex/**", // vendored, minified
      ".claude/skills/teach/assets/mermaid.js", // vendored
      "course-tests/**",
      "demo/adoption-demos/**", // generated A/B lesson output + vendored assets (#180)
      ".sandcastle/**", // includes .mts (TypeScript), not linted here
    ],
  },
  js.configs.recommended,
  {
    // Intentional patterns in the shipped code.
    rules: {
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-unused-vars": ["error", { caughtErrors: "none" }],
    },
  },
  {
    // Browser runtime: the shipped components. mermaid.js is a UMD wrapper, so
    // it also reads the CommonJS `module`; Prism is an external global.
    files: [
      "skills/visual-teach/assets/**/*.js",
      ".claude/skills/teach/assets/**/*.js",
    ],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.browser,
        Prism: "readonly",
        module: "readonly",
        katex: "readonly",
        renderMathInElement: "readonly",
      },
    },
  },
  {
    // Tests run under jsdom (browser globals) on Node; demo scripts are Node.
    files: ["tests/**", "demo/**", "scripts/**", "*.config.js"],
    languageOptions: {
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
    },
  },
];
