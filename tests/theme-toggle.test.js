import { describe, it, expect, beforeEach } from "vitest";
import { wireThemeToggle } from "../assets/base/base.js";

// Fake window: real document, stubbed localStorage/matchMedia, self===top
// (not iframed). Flip `top` to simulate an embedded lesson.
function fakeWin({ prefersDark = false, stored = null, iframed = false } = {}) {
  const store = {};
  if (stored) store.vtTheme = stored;
  const win = {
    document,
    localStorage: {
      getItem: (k) => store[k] ?? null,
      setItem: (k, v) => {
        store[k] = v;
      },
    },
    matchMedia: () => ({ matches: prefersDark }),
    _store: store,
  };
  win.self = win;
  win.top = iframed ? {} : win;
  return win;
}

beforeEach(() => {
  document.body.innerHTML = "";
  delete document.documentElement.dataset.theme;
});

describe("wireThemeToggle", () => {
  it("injects a toggle button when none exists", () => {
    wireThemeToggle(fakeWin());
    expect(document.querySelectorAll(".vt-theme-toggle")).toHaveLength(1);
  });

  it("skips when the page already has a .vt-theme-toggle", () => {
    document.body.innerHTML = '<button class="vt-theme-toggle">x</button>';
    wireThemeToggle(fakeWin());
    expect(document.querySelectorAll(".vt-theme-toggle")).toHaveLength(1);
  });

  it("skips when iframed (parent owns the theme)", () => {
    wireThemeToggle(fakeWin({ iframed: true }));
    expect(document.querySelector(".vt-theme-toggle")).toBeNull();
  });

  it("applies a stored preference on load", () => {
    wireThemeToggle(fakeWin({ stored: "dark" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("click flips theme from OS default and persists it", () => {
    const win = fakeWin({ prefersDark: false }); // effective = light
    wireThemeToggle(win);
    document.querySelector(".vt-theme-toggle").click();
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(win._store.vtTheme).toBe("dark");
  });
});
