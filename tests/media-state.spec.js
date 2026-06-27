import { test, expect } from "@playwright/test";
import { injectAxe, checkA11y } from "axe-playwright";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../skills/visual-teach");

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

// ── Grid layout geometry ───────────────────────────────────────────────────

test.describe("main grid layout", () => {
  test("body has 18px font-size", async ({ page }) => {
    await page.goto(url("assets/base/demo.html"));
    await page.waitForLoadState("networkidle");
    const fontSize = await page.evaluate(
      () => window.getComputedStyle(document.body).fontSize
    );
    expect(fontSize).toBe("18px");
  });

  test("main is a CSS grid", async ({ page }) => {
    await page.goto(url("assets/base/demo.html"));
    await page.waitForLoadState("networkidle");
    const display = await page.evaluate(
      () => window.getComputedStyle(document.querySelector("main")).display
    );
    expect(display).toBe("grid");
  });

  test(".vt-wide is left-anchored — same left edge as prose, wider to the right", async ({
    page,
  }) => {
    await page.goto(url("assets/base/demo.html"));
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      const main = document.querySelector("main");
      const prose = document.createElement("p");
      prose.id = "test-prose";
      prose.textContent = "Probe";
      const wide = document.createElement("div");
      wide.className = "vt-wide";
      wide.id = "test-wide";
      wide.textContent = "Wide probe";
      main.appendChild(prose);
      main.appendChild(wide);
    });
    const [proseLeft, proseRight, wideLeft, wideRight] = await page.evaluate(
      () => {
        const pr = document
          .getElementById("test-prose")
          .getBoundingClientRect();
        const wr = document.getElementById("test-wide").getBoundingClientRect();
        return [pr.left, pr.right, wr.left, wr.right];
      }
    );
    expect(wideLeft).toBe(proseLeft);
    expect(wideRight).toBeGreaterThan(proseRight);
  });
});

// ── wireBreakout auto-detection ───────────────────────────────────────────

test.describe("wireBreakout", () => {
  test("narrow SVG diagram does NOT gain .vt-wide", async ({ page }) => {
    await page.goto(url("assets/components/diagram/demo.html"));
    await page.waitForLoadState("networkidle");

    const hasWide = await page.evaluate(() => {
      const main = document.querySelector("main");
      const diagram = document.createElement("div");
      diagram.className = "vt-diagram";
      diagram.id = "test-narrow-diagram";
      // SVG intrinsic width 200px — fits well inside the 700px prose column
      diagram.innerHTML =
        '<svg width="200" height="100" viewBox="0 0 200 100"><rect width="200" height="100"/></svg>';
      main.appendChild(diagram);
      window.vtBase.wireBreakout();
      return document
        .getElementById("test-narrow-diagram")
        .classList.contains("vt-wide");
    });
    expect(hasWide).toBe(false);
  });

  test("resize re-evaluates breakout — stale .vt-wide removed when diagram shrinks", async ({
    page,
  }) => {
    await page.goto(url("assets/components/diagram/demo.html"));
    await page.waitForLoadState("networkidle");

    // Start wide (1500px SVG), confirm .vt-wide added.
    await page.evaluate(() => {
      const main = document.querySelector("main");
      const diagram = document.createElement("div");
      diagram.className = "vt-diagram";
      diagram.id = "test-resize-diagram";
      diagram.innerHTML =
        '<svg width="1500" height="100" viewBox="0 0 1500 100"><rect width="1500" height="100"/></svg>';
      main.appendChild(diagram);
      window.vtBase.wireBreakout();
    });
    const wideBefore = await page.evaluate(() =>
      document
        .getElementById("test-resize-diagram")
        .classList.contains("vt-wide")
    );
    expect(wideBefore).toBe(true);

    // Replace the SVG with a narrow one then manually fire applyBreakout via resize.
    // wireBreakout debounces on resize; calling wireBreakout() again re-runs applyBreakout.
    const wideAfter = await page.evaluate(() => {
      const diagram = document.getElementById("test-resize-diagram");
      diagram.innerHTML =
        '<svg width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100"/></svg>';
      // Re-run wireBreakout to pick up the new SVG (simulates post-resize evaluation).
      window.vtBase.wireBreakout();
      return diagram.classList.contains("vt-wide");
    });
    expect(wideAfter).toBe(false);
  });

  test("wide SVG diagram auto-gains .vt-wide", async ({ page }) => {
    await page.goto(url("assets/components/diagram/demo.html"));
    await page.waitForLoadState("networkidle");

    const hasWide = await page.evaluate(() => {
      const main = document.querySelector("main");
      const diagram = document.createElement("div");
      diagram.className = "vt-diagram";
      diagram.id = "test-wide-diagram";
      // SVG intrinsic width 1500px — well beyond the 700px prose column
      diagram.innerHTML =
        '<svg width="1500" height="100" viewBox="0 0 1500 100"><rect width="1500" height="100"/></svg>';
      main.appendChild(diagram);
      window.vtBase.wireBreakout();
      return document
        .getElementById("test-wide-diagram")
        .classList.contains("vt-wide");
    });
    expect(hasWide).toBe(true);
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
