import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetSlotLayoutCache } from "../src/dom.js";
import { buildSlotText, slotText } from "../src/index.js";
import { animateSlotText } from "../src/slotText.js";

let el: HTMLElement;
let style: HTMLStyleElement;

const SLOT_TEXT_CSS = `
  .slot-text { display: inline-flex; }
  .char-slot { position: relative; display: inline-flex; }
  .char-face { position: absolute; }
`;

beforeEach(() => {
  vi.useFakeTimers();
  resetSlotLayoutCache();
  style = document.createElement("style");
  style.textContent = SLOT_TEXT_CSS;
  document.head.appendChild(style);
  el = document.createElement("span");
  document.body.appendChild(el);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  style.remove();
  el.remove();
});

const readText = () =>
  Array.from(el.querySelectorAll<HTMLElement>(".char-slot"))
    .map((slot) => slot.dataset.char ?? "")
    .join("");

describe("missing CSS fallback", () => {
  beforeEach(() => style.remove());

  it("keeps exact plain text on initial render and update", () => {
    const label = slotText(el, "Take the next step");

    expect(el.textContent).toBe("Take the next step");
    expect(el.querySelector(".char-slot")).toBeNull();

    label.set("Continue");

    expect(label.value).toBe("Continue");
    expect(el.textContent).toBe("Continue");
    expect(el.querySelector(".char-slot")).toBeNull();
  });

  it("replaces unstyled slot markup with plain target text", () => {
    buildSlotText(el, "Take");
    expect(el.textContent).toBe("TTaakkee");

    animateSlotText(el, "Continue");

    expect(el.textContent).toBe("Continue");
    expect(el.querySelector(".char-slot")).toBeNull();
  });

  it("upgrades plain text after the stylesheet arrives", () => {
    const label = slotText(el, "Copy");
    expect(el.querySelector(".char-slot")).toBeNull();

    document.head.appendChild(style);
    label.set("Copied");

    expect(el.querySelector(".char-slot")).not.toBeNull();
    vi.runAllTimers();
    expect(readText()).toBe("Copied");
  });
});

describe("initial DOM", () => {
  it("builds one slot per character with a sizer and face", () => {
    slotText(el, "Copy");

    expect(el.classList.contains("slot-text")).toBe(true);
    const slots = el.querySelectorAll(".char-slot");
    expect(slots).toHaveLength(4);
    for (const slot of slots) {
      expect(slot.querySelector(".char-sizer")).not.toBeNull();
      expect(slot.querySelectorAll(".char-face")).toHaveLength(1);
    }
    expect(readText()).toBe("Copy");
  });

  it("renders spaces as non-breaking spaces in faces", () => {
    slotText(el, "a b");
    const [, spaceFace] = el.querySelectorAll(".char-face");
    expect(spaceFace.textContent).toBe("\u00A0");
  });
});

describe("segmentation", () => {
  it.each([
    ["astral emoji", "😀"],
    ["joined emoji", "👨‍👩‍👧"],
    ["combining marks", "e\u0301"],
  ])("keeps %s in one grapheme slot", (_, target) => {
    const label = slotText(el, "e");
    label.set(target);
    vi.runAllTimers();

    expect(el.querySelectorAll(".char-slot")).toHaveLength(1);
    expect(readText()).toBe(target);
  });

  it("rolls words as single units when rollBy is word", () => {
    const label = slotText(el, "Ship faster", { rollBy: "word" });
    expect(
      Array.from(el.querySelectorAll<HTMLElement>(".char-slot")).map(
        (slot) => slot.dataset.char,
      ),
    ).toEqual(["Ship", " ", "faster"]);

    label.set("Build faster");

    const slots = el.querySelectorAll(".char-slot");
    expect(slots[0].querySelectorAll(".char-face")).toHaveLength(2);
    expect(slots[2].querySelectorAll(".char-face")).toHaveLength(1);

    label.set("Move faster");
    expect(el.querySelectorAll(".char-slot")).toHaveLength(3);
    vi.runAllTimers();
    expect(readText()).toBe("Move faster");
  });

  it("can switch an existing label from character rolls to word rolls", () => {
    const label = slotText(el, "Ship now");

    label.set("Build now", { rollBy: "word" });

    expect(el.querySelectorAll(".char-slot")).toHaveLength(3);
    vi.runAllTimers();
    expect(readText()).toBe("Build now");
  });

  it("uses word slots through the low-level animation API", () => {
    animateSlotText(el, "Ship faster", { rollBy: "word" });

    expect(el.querySelectorAll(".char-slot")).toHaveLength(3);
    expect(readText()).toBe("Ship faster");
  });
});

describe("set()", () => {
  it("rolls to the new text and settles there", () => {
    const label = slotText(el, "Copy");
    label.set("Copied");
    vi.runAllTimers();
    expect(label.value).toBe("Copied");
    expect(readText()).toBe("Copied");
  });

  it("grows and shrinks the slot count", () => {
    const label = slotText(el, "Hi");
    label.set("Hello");
    vi.runAllTimers();
    expect(el.querySelectorAll(".char-slot")).toHaveLength(5);
    label.set("Yo");
    vi.runAllTimers();
    expect(el.querySelectorAll(".char-slot")).toHaveLength(2);
    expect(readText()).toBe("Yo");
  });

  it("lands on the last value after rapid interrupting calls", () => {
    const label = slotText(el, "one");
    label.set("two");
    label.set("three");
    label.set("four");
    vi.runAllTimers();
    expect(label.value).toBe("four");
    expect(readText()).toBe("four");
  });

  it("keeps the same text when set() receives the current value", () => {
    const label = slotText(el, "Copy");
    label.set("Copy");
    vi.runAllTimers();
    expect(label.value).toBe("Copy");
    expect(readText()).toBe("Copy");
  });

  it("clears a stale queued request when the latest call matches the target", () => {
    const label = slotText(el, "Copy");
    label.set("Saved", { interrupt: false });
    label.set("Done", { interrupt: false });
    label.set("Saved", { interrupt: false });
    vi.runAllTimers();
    expect(label.value).toBe("Saved");
    expect(readText()).toBe("Saved");
  });

  it("animates from an initialized empty value", () => {
    const label = slotText(el, "");
    label.set("Go");

    expect(el.querySelectorAll(".char-slot")).toHaveLength(2);
    expect(readText()).toBe("");

    vi.runAllTimers();
    expect(readText()).toBe("Go");
  });

  it("supports empty initial text", () => {
    const label = slotText(el, "");
    expect(label.value).toBe("");
    expect(el.querySelectorAll(".char-slot")).toHaveLength(0);
  });

  it("clears slots when the target is empty", () => {
    const label = slotText(el, "Copy");
    label.set("");
    vi.runAllTimers();
    expect(el.querySelectorAll(".char-slot")).toHaveLength(0);
    expect(readText()).toBe("");
  });

  it("keeps default timings when an optional value is explicitly undefined", () => {
    const label = slotText(el, "Copy");
    const timeout = vi.spyOn(window, "setTimeout");

    label.set("Done", { duration: undefined, stagger: undefined });

    const delays = timeout.mock.calls.map((call) => call[1]);
    expect(delays.length).toBeGreaterThan(0);
    expect(delays.every((delay) => Number.isFinite(delay))).toBe(true);
  });
});

describe("buildSlotText()", () => {
  it("cancels animation ownership before replacing the DOM", () => {
    const label = slotText(el, "Copy");
    label.set("Animating");

    buildSlotText(el, "Manual mode", { rollBy: "word" });
    vi.runAllTimers();

    expect(el.querySelectorAll(".char-slot")).toHaveLength(3);
    expect(readText()).toBe("Manual mode");
  });
});

describe("transition cleanup", () => {
  it("finalizes a slot when its transform transition ends", () => {
    const LONG_TRANSITION_DURATION_MS = 10000;
    const TRANSITION_START_WAIT_MS = 1;
    const label = slotText(el, "A");
    label.set("B", {
      bounce: 0,
      duration: LONG_TRANSITION_DURATION_MS,
      exitOffset: 0,
      stagger: 0,
    });
    vi.advanceTimersByTime(TRANSITION_START_WAIT_MS);

    const faces = el.querySelectorAll<HTMLElement>(".char-face");
    const incoming = faces[faces.length - 1];
    const transitionEnd = new Event("transitionend") as TransitionEvent;
    Object.defineProperty(transitionEnd, "propertyName", { value: "transform" });
    incoming.dispatchEvent(transitionEnd);

    expect(el.querySelectorAll(".char-face")).toHaveLength(1);
    expect(readText()).toBe("B");
  });
});

const LONG_REVERT_DELAY_MS = 100000;
const ANIMATION_SETTLE_WAIT_MS = 5000;
const SECOND_FLASH_DELAY_MS = 400;
const SHORT_REVERT_DELAY_MS = 1000;

describe("flash()", () => {
  it("shows the flash text, then reverts", () => {
    const label = slotText(el, "Copy");
    label.flash("Copied", { revertAfter: LONG_REVERT_DELAY_MS });
    vi.advanceTimersByTime(ANIMATION_SETTLE_WAIT_MS);
    expect(readText()).toBe("Copied");
    vi.advanceTimersByTime(LONG_REVERT_DELAY_MS);
    vi.runAllTimers();
    expect(label.value).toBe("Copy");
    expect(readText()).toBe("Copy");
  });

  it("reverts to the original after a burst of flashes", () => {
    const label = slotText(el, "Copy");
    label.flash("Copied", { revertAfter: LONG_REVERT_DELAY_MS });
    vi.advanceTimersByTime(SECOND_FLASH_DELAY_MS);
    label.flash("Copied!", { revertAfter: LONG_REVERT_DELAY_MS });
    vi.advanceTimersByTime(ANIMATION_SETTLE_WAIT_MS);
    expect(readText()).toBe("Copied!");
    vi.advanceTimersByTime(LONG_REVERT_DELAY_MS);
    vi.runAllTimers();
    expect(label.value).toBe("Copy");
    expect(readText()).toBe("Copy");
  });

  it("is cancelled by an explicit set()", () => {
    const label = slotText(el, "Copy");
    label.flash("Copied", { revertAfter: SHORT_REVERT_DELAY_MS });
    label.set("Done");
    vi.runAllTimers();
    expect(label.value).toBe("Done");
    expect(readText()).toBe("Done");
  });
});

describe("destroy()", () => {
  it("restores plain text and cancels pending work", () => {
    const label = slotText(el, "Copy");
    label.set("Copied");
    label.destroy();
    vi.runAllTimers();
    expect(el.classList.contains("slot-text")).toBe(false);
    expect(el.querySelector(".char-slot")).toBeNull();
    expect(el.textContent).toBe("Copied");
  });

  it("cancels a pending flash revert", () => {
    const label = slotText(el, "Copy");
    label.flash("Copied", { revertAfter: LONG_REVERT_DELAY_MS });
    vi.advanceTimersByTime(ANIMATION_SETTLE_WAIT_MS);
    label.destroy();
    vi.runAllTimers();
    expect(el.classList.contains("slot-text")).toBe(false);
    expect(el.textContent).toBe("Copied");
  });
});
