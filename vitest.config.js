import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: [
      "tests/**/*.test.{js,mjs}",
      "tests/skill.mjs",
      ".sandcastle/tests/**/*.test.mjs",
    ],
  },
});
