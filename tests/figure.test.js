import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const JS_SRC = readFileSync(
  resolve(__dirname, "../assets/visual-teach.js"),
  "utf8"
);

function setup(html) {
  document.body.innerHTML = html;
  new Function(JS_SRC.replace(/^export\s+/gm, ""))();
}

describe("vt-figure broken-image fallback", () => {
  it("injects .vt-figure-alt with the alt text when error fires on a broken img", () => {
    setup(`
      <figure class="vt-figure">
        <img src="data:image/png;base64,BROKEN" alt="Missing photo" />
      </figure>
    `);
    const img = document.querySelector(".vt-figure img");
    img.dispatchEvent(new Event("error"));

    const alt = document.querySelector(".vt-figure-alt");
    expect(alt, ".vt-figure-alt should be injected").toBeTruthy();
    expect(alt.textContent).toBe("Missing photo");
  });

  it("hides the broken <img> after error so the browser glyph disappears", () => {
    setup(`
      <figure class="vt-figure">
        <img src="data:image/png;base64,BROKEN" alt="Missing photo" />
      </figure>
    `);
    const img = document.querySelector(".vt-figure img");
    img.dispatchEvent(new Event("error"));

    expect(img.style.display).toBe("none");
  });

  it("places .vt-figure-alt as the next sibling of the img", () => {
    setup(`
      <figure class="vt-figure">
        <img src="data:image/png;base64,BROKEN" alt="Broken" />
        <figcaption>caption</figcaption>
      </figure>
    `);
    const img = document.querySelector(".vt-figure img");
    img.dispatchEvent(new Event("error"));

    expect(img.nextElementSibling.className).toBe("vt-figure-alt");
  });

  it("does not inject a second overlay if error fires twice", () => {
    setup(`
      <figure class="vt-figure">
        <img src="data:image/png;base64,BROKEN" alt="Broken" />
      </figure>
    `);
    const img = document.querySelector(".vt-figure img");
    img.dispatchEvent(new Event("error"));
    img.dispatchEvent(new Event("error"));

    expect(document.querySelectorAll(".vt-figure-alt").length).toBe(1);
  });

  it("does not affect images outside .vt-figure", () => {
    setup(`
      <figure>
        <img src="data:image/png;base64,BROKEN" alt="Outside" />
      </figure>
    `);
    const img = document.querySelector("img");
    img.dispatchEvent(new Event("error"));

    expect(document.querySelector(".vt-figure-alt")).toBeNull();
  });

  it("handles empty alt attribute gracefully", () => {
    setup(`
      <figure class="vt-figure">
        <img src="data:image/png;base64,BROKEN" alt="" />
      </figure>
    `);
    const img = document.querySelector(".vt-figure img");
    img.dispatchEvent(new Event("error"));

    const alt = document.querySelector(".vt-figure-alt");
    expect(alt).toBeTruthy();
    expect(alt.textContent).toBe("");
  });
});
