import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetSlotLayoutCache } from "../src/dom.js";
import { SlotText } from "../src/react.js";

const SLOT_TEXT_CSS = `
  .slot-text { display: inline-flex; }
  .char-slot { position: relative; display: inline-flex; }
  .char-face { position: absolute; }
`;

let container: HTMLDivElement;
let root: Root | undefined;
let style: HTMLStyleElement;

const readText = (element: HTMLElement) =>
  Array.from(element.querySelectorAll<HTMLElement>(".char-slot"))
    .map((slot) => slot.dataset.char ?? "")
    .join("");

beforeEach(() => {
  vi.useFakeTimers();
  resetSlotLayoutCache();

  style = document.createElement("style");
  style.textContent = SLOT_TEXT_CSS;
  document.head.appendChild(style);

  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  if (root) {
    flushSync(() => root?.unmount());
    root = undefined;
  }
  vi.useRealTimers();
  style.remove();
  container.remove();
});

describe("React adapter", () => {
  it("renders readable initial text before effects run", () => {
    const markup = renderToStaticMarkup(
      createElement(SlotText, { text: "Copy" }),
    );

    expect(markup).toBe('<span aria-label="Copy">Copy</span>');
  });

  it("keeps updates owned by the slot animation after mounting", () => {
    root = createRoot(container);
    flushSync(() => root?.render(createElement(SlotText, { text: "Copy" })));

    const element = container.querySelector<HTMLElement>("span");
    expect(element).not.toBeNull();
    expect(readText(element!)).toBe("Copy");

    flushSync(() => root?.render(createElement(SlotText, { text: "Copied" })));
    vi.runAllTimers();

    expect(readText(element!)).toBe("Copied");
  });
});
