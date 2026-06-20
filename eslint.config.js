import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/**",
      "assets/prism/**", // vendored, minified
      "course-tests/**",
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
    files: ["assets/**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: { ...globals.browser, Prism: "readonly", module: "readonly" },
    },
  },
  {
    // Tests run under jsdom (browser globals) on Node; demo scripts are Node.
    files: ["tests/**", "demo/**", "*.config.js"],
    languageOptions: {
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
    },
  },
];
