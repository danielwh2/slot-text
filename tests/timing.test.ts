import { describe, expect, it } from "vitest";
import {
  calculateGlyphTiming,
  calculateWidthTiming,
  resolveAnimationOptions,
} from "../src/timing.js";

describe("resolveAnimationOptions()", () => {
  it("keeps defaults when optional values are explicitly undefined", () => {
    const options = resolveAnimationOptions({
      duration: undefined,
      interrupt: undefined,
      stagger: undefined,
    });

    expect(options.duration).toBe(300);
    expect(options.interrupt).toBe(true);
    expect(options.rollBy).toBe("character");
    expect(options.stagger).toBe(45);
  });
});

describe("calculateGlyphTiming()", () => {
  it("is deterministic when bounce is disabled", () => {
    expect(
      calculateGlyphTiming(2, 5, false, {
        bounce: 0,
        duration: 300,
        stagger: 45,
      }),
    ).toEqual({
      durationMs: 300,
      startDelayMs: 90,
      startingTiltDegrees: 0,
    });
  });
});

describe("calculateWidthTiming()", () => {
  const timing = {
    durationMs: 300,
    startDelayMs: 90,
    startingTiltDegrees: 0,
  };

  it("opens an empty slot before its glyph enters", () => {
    expect(calculateWidthTiming("", "A", timing)).toEqual({
      startDelayMs: 90,
      durationMs: 140,
    });
  });

  it("keeps a tail slot open for most of its exit", () => {
    expect(calculateWidthTiming("A", "", timing)).toEqual({
      startDelayMs: 255,
      durationMs: 180,
    });
  });
});
