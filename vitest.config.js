import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    // The orchestrator's own tests are dev-only and live in the template repo;
    // an adopter's .sandcastle carries runtime only, so there is nothing here to
    // include (agent-skills#180).
    include: ["tests/**/*.test.{js,mjs}", "tests/skill.mjs"],
  },
});
