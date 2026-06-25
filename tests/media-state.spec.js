import { test, expect } from "@playwright/test";
import { injectAxe, checkA11y } from "axe-playwright";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function url(path) {
  return `file://${resolve(root, path)}`;
}

async function pseudoStyle(page, selector, pseudo, prop) {
  return page.evaluate(
    ({ selector, pseudo, prop }) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      return window.getComputedStyle(el, pseudo).getPropertyValue(prop);
    },
    { selector, pseudo, prop }
  );
}

const WCAG_OPTIONS = {
  axeOptions: {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
  },
};

// ── Print ──────────────────────────────────────────────────────────────────

test.describe("print media", () => {
  test("base demo — theme toggle and code copy hidden, light tokens active", async ({
    page,
  }) => {
    await page.goto(url("assets/base/demo.html"));
    await page.waitForLoadState("networkidle");

    // Inject a copy button stub so we can assert it is hidden in print
    await page.evaluate(() => {
      const btn = document.createElement("button");
      btn.className = "vt-code-copy";
      document.body.appendChild(btn);
    });

    await page.emulateMedia({ media: "print" });

    const toggle = page.locator(".vt-theme-toggle");
    await expect(toggle).toBeHidden();

    const copy = page.locator(".vt-code-copy");
    await expect(copy).toBeHidden();

    // Light-theme token is active even if data-theme="dark" is set.
    // Read a resolved background-color, not the raw --vt-paper property:
    // light-dark() only resolves when the token is used as a real color value.
    const paper = await page.evaluate(() => {
      document.documentElement.dataset.theme = "dark";
      const probe = document.createElement("div");
      probe.style.backgroundColor = "var(--vt-paper)";
      document.body.appendChild(probe);
      return window.getComputedStyle(probe).backgroundColor;
    });
    expect(paper).toBe("rgb(255, 255, 255)");
  });

  test("callout demo — callout block has break-inside: avoid in print", async ({
    page,
  }) => {
    await page.goto(url("assets/components/callout/demo.html"));
    await page.waitForLoadState("networkidle");
    await page.emulateMedia({ media: "print" });

    const breakInside = await page.evaluate(() => {
      const el = document.querySelector(".vt-callout");
      return window.getComputedStyle(el).breakInside;
    });
    expect(breakInside).toBe("avoid");
  });

  test("quiz demo — quiz block has break-inside: avoid in print", async ({
    page,
  }) => {
    await page.goto(url("assets/components/quiz/demo.html"));
    await page.waitForLoadState("networkidle");
    await page.emulateMedia({ media: "print" });

    const breakInside = await page.evaluate(() => {
      const el = document.querySelector(".vt-quiz");
      return window.getComputedStyle(el).breakInside;
    });
    expect(breakInside).toBe("avoid");
  });
});

// ── Forced colors ──────────────────────────────────────────────────────────

test.describe("forced-colors", () => {
  test("callout demo — type labels injected via ::after in forced-colors mode", async ({
    page,
  }) => {
    await page.goto(url("assets/components/callout/demo.html"));
    await page.waitForLoadState("networkidle");
    await page.emulateMedia({ forcedColors: "active" });

    const warnContent = await pseudoStyle(
      page,
      ".vt-callout.warn",
      "::after",
      "content"
    );
    expect(warnContent).toMatch(/⚠/);

    const infoContent = await pseudoStyle(
      page,
      ".vt-callout.info",
      "::after",
      "content"
    );
    expect(infoContent).toMatch(/ℹ/);
  });

  test("chip demo — pill status labels injected via ::before in forced-colors mode", async ({
    page,
  }) => {
    await page.goto(url("assets/components/chip/demo.html"));
    await page.waitForLoadState("networkidle");
    await page.emulateMedia({ forcedColors: "active" });

    const goodContent = await pseudoStyle(
      page,
      ".vt-pill.good",
      "::before",
      "content"
    );
    expect(goodContent).toMatch(/✓/);

    const badContent = await pseudoStyle(
      page,
      ".vt-pill.bad",
      "::before",
      "content"
    );
    expect(badContent).toMatch(/✗/);

    const levelBeginner = await pseudoStyle(
      page,
      ".vt-level.beginner",
      "::before",
      "content"
    );
    expect(levelBeginner).toMatch(/○/);
  });

  test("quiz demo — correct/wrong labels injected via ::before in forced-colors mode", async ({
    page,
  }) => {
    await page.goto(url("assets/components/quiz/demo.html"));
    await page.waitForLoadState("networkidle");
    await page.emulateMedia({ forcedColors: "active" });

    // Add correct/wrong classes to buttons to simulate answered state
    await page.evaluate(() => {
      const opts = document.querySelectorAll(".vt-quiz button.opt");
      if (opts[0]) opts[0].classList.add("correct");
      if (opts[1]) opts[1].classList.add("wrong");
    });

    const correctContent = await pseudoStyle(
      page,
      ".vt-quiz button.opt.correct",
      "::before",
      "content"
    );
    expect(correctContent).toMatch(/✓/);

    const wrongContent = await pseudoStyle(
      page,
      ".vt-quiz button.opt.wrong",
      "::before",
      "content"
    );
    expect(wrongContent).toMatch(/✗/);
  });
});

// ── Reduced motion ─────────────────────────────────────────────────────────

test.describe("prefers-reduced-motion", () => {
  test("checklist demo — progress bar transition is none when reduced motion preferred", async ({
    page,
  }) => {
    await page.goto(url("assets/components/checklist/demo.html"));
    await page.waitForLoadState("networkidle");
    await page.emulateMedia({ reducedMotion: "reduce" });

    const transition = await page.evaluate(() => {
      const el = document.querySelector(".vt-progress-bar-fill");
      return window.getComputedStyle(el).transition;
    });
    expect(transition).toBe("none");
  });
});

// ── RTL ────────────────────────────────────────────────────────────────────

test.describe("dir=rtl", () => {
  test("diagram demo — flow connector arrow flips to ← in RTL", async ({
    page,
  }) => {
    await page.goto(url("assets/components/diagram/demo.html"));
    await page.waitForLoadState("networkidle");

    await page.evaluate(() => {
      document.documentElement.setAttribute("dir", "rtl");
    });

    const arrowContent = await pseudoStyle(
      page,
      ".vt-flow > * + *",
      "::before",
      "content"
    );
    // CSS content is returned as a quoted string e.g. '"←"'
    expect(arrowContent).toMatch(/←/);
  });
});

// ── Axe accessibility ──────────────────────────────────────────────────────

test.describe("axe a11y", () => {
  test("quiz demo — no axe violations", async ({ page }) => {
    await page.goto(url("assets/components/quiz/demo.html"));
    await page.waitForLoadState("networkidle");
    await injectAxe(page);
    await checkA11y(page, undefined, WCAG_OPTIONS);
  });

  test("checklist demo — no axe violations", async ({ page }) => {
    await page.goto(url("assets/components/checklist/demo.html"));
    await page.waitForLoadState("networkidle");
    await injectAxe(page);
    await checkA11y(page, undefined, WCAG_OPTIONS);
  });

  test("callout demo — no axe violations", async ({ page }) => {
    await page.goto(url("assets/components/callout/demo.html"));
    await page.waitForLoadState("networkidle");
    await injectAxe(page);
    await checkA11y(page, undefined, WCAG_OPTIONS);
  });
});
