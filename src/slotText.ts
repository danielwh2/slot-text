import { TUNING } from "./constants.js";
import {
  addMissingCharacterSlots,
  canRenderSlotLayout,
  getCharacterSlots,
  isSlotLayoutReady,
  measureChangedSlots,
  measureCharacterHeight,
  prepareSlotAnimation,
  renderPlainText,
  renderCharacterSlots,
  scheduleSlotAnimation,
} from "./dom.js";
import { segmentText, type RollBy } from "./text.js";
import { resolveAnimationOptions } from "./timing.js";

const { chromatic: chromaticTuning, lifecycle } = TUNING;

/**
 * Browser-only text-roll animation. Each character or word owns one clipped
 * slot; the previous face rolls out while the next face rolls in.
 */
/** Options shared by the low-level animation and all framework adapters. */
export interface SlotOptions {
  /** "down" rolls glyphs downward (enter from top); "up" rolls upward. */
  direction?: "up" | "down";
  /** Roll each user-perceived character or each word. Default "character". */
  rollBy?: RollBy;
  /** Per-segment stagger in ms (default 45). */
  stagger?: number;
  /** Slide duration per segment in ms (default 300). */
  duration?: number;
  /** How long the incoming glyph trails the outgoing one, in ms (default 50). */
  exitOffset?: number;
  /** Easing — defaults to a springy, overshooting "back" curve. */
  easing?: string;
  /**
   * Per-segment personality: 0 makes every segment move identically; 1 adds
   * the strongest timing variation and tilt. Default 0.6.
   */
  bounce?: number;
  /**
   * Incoming glyph tint. Pass one CSS color, or return a color for each
   * `(segmentIndex, segmentCount)` pair.
   */
  color?: string | ((segmentIndex: number, segmentCount: number) => string);
  /** Tint fade duration in ms (default 280). */
  colorFade?: number;
  /**
   * Keep segments that are identical at the same index static. Disable this
   * when differently sized strings are not positionally aligned.
   */
  skipUnchanged?: boolean;
  /**
   * true interrupts the running roll. false lets it finish, then plays only
   * the latest queued target. Default true.
   */
  interrupt?: boolean;
}

export interface ChromaticOptions {
  /** Starting hue in degrees. Default 0. */
  from?: number;
  /** Hue distance from first to last roll segment. Default 320 degrees. */
  spread?: number;
  /** HSL saturation percentage. Default 92. */
  saturation?: number;
  /** HSL lightness percentage. Default 60. */
  lightness?: number;
}

/** Build a color function that sweeps a hue range across the roll segments. */
export function chromatic({
  from = chromaticTuning.hueStartDegrees,
  spread = chromaticTuning.hueSpreadDegrees,
  saturation = chromaticTuning.saturationPercent,
  lightness = chromaticTuning.lightnessPercent,
}: ChromaticOptions = {}) {
  return (segmentIndex: number, segmentCount: number) => {
    const lastSegmentIndex = segmentCount - 1;
    const progress =
      segmentCount <= 1 ? 0 : segmentIndex / lastSegmentIndex;
    const hueDegrees =
      (from + progress * spread) % chromaticTuning.fullHueRotationDegrees;
    return `hsl(${hueDegrees} ${saturation}% ${lightness}%)`;
  };
}

interface AnimationState {
  timerIds: number[];
  targetText: string;
  rollBy: RollBy;
  pendingAnimation?: { text: string; options: SlotOptions };
}

const animationStates = new WeakMap<HTMLElement, AnimationState>();
const initializedContainers = new WeakSet<HTMLElement>();

function cancelRunningAnimation(container: HTMLElement) {
  const animationState = animationStates.get(container);
  if (!animationState) return undefined;
  animationState.timerIds.forEach((timerId) => window.clearTimeout(timerId));
  animationStates.delete(container);
  return animationState;
}

/** Render settled text, falling back to plain text until the CSS is ready. */
export function renderTextWithCssFallback(
  container: HTMLElement,
  text: string,
  rollBy: RollBy = "character",
) {
  initializedContainers.add(container);
  if (canRenderSlotLayout()) renderCharacterSlots(container, text, rollBy);
  else renderPlainText(container, text);
}

function finishRunningAnimationImmediately(container: HTMLElement) {
  const animationState = cancelRunningAnimation(container);
  if (animationState) {
    renderTextWithCssFallback(
      container,
      animationState.targetText,
      animationState.rollBy,
    );
  }
}

/** Build slot markup immediately and cancel any animation that owns it. */
export function buildSlotText(
  container: HTMLElement,
  text: string,
  { rollBy = "character" }: Pick<SlotOptions, "rollBy"> = {},
) {
  cancelRunningAnimation(container);
  initializedContainers.add(container);
  renderCharacterSlots(container, text, rollBy);
}

function scheduleAnimationTask(
  animationState: AnimationState,
  callback: () => void,
  delayMs: number,
) {
  const timerId = window.setTimeout(callback, delayMs);
  animationState.timerIds.push(timerId);
}

export function animateSlotText(
  container: HTMLElement,
  targetText: string,
  options: SlotOptions = {},
) {
  const resolvedOptions = resolveAnimationOptions(options);
  const runningAnimation = animationStates.get(container);

  if (runningAnimation && !resolvedOptions.interrupt) {
    runningAnimation.pendingAnimation =
      targetText === runningAnimation.targetText
        ? undefined
        : { text: targetText, options };
    return;
  }

  finishRunningAnimationImmediately(container);

  let characterSlots = getCharacterSlots(container);
  if (characterSlots.length === 0) {
    if (!initializedContainers.has(container)) {
      renderTextWithCssFallback(container, targetText, resolvedOptions.rollBy);
      return;
    }

    if (!canRenderSlotLayout()) {
      renderPlainText(container, targetText);
      return;
    }

    renderCharacterSlots(
      container,
      container.textContent ?? "",
      resolvedOptions.rollBy,
    );
    characterSlots = getCharacterSlots(container);
  }

  const firstCharacterSlot = characterSlots[0];
  if (firstCharacterSlot && !isSlotLayoutReady(firstCharacterSlot)) {
    renderPlainText(container, targetText);
    return;
  }

  let currentSegments = characterSlots.map((slot) => slot.dataset.char ?? "");
  const currentText = currentSegments.join("");
  const regroupedCurrentSegments = segmentText(
    currentText,
    resolvedOptions.rollBy,
  );
  if (
    currentSegments.length !== regroupedCurrentSegments.length ||
    currentSegments.some(
      (segment, index) => segment !== regroupedCurrentSegments[index],
    )
  ) {
    renderCharacterSlots(container, currentText, resolvedOptions.rollBy);
    characterSlots = getCharacterSlots(container);
    currentSegments = regroupedCurrentSegments;
  }

  const targetSegments = segmentText(targetText, resolvedOptions.rollBy);
  if (
    !resolvedOptions.interrupt &&
    currentSegments.length === targetSegments.length &&
    currentSegments.every(
      (segment, index) => segment === targetSegments[index],
    )
  ) {
    return;
  }

  const requiredSlotCount = Math.max(currentSegments.length, targetSegments.length);
  addMissingCharacterSlots(container, characterSlots, requiredSlotCount);

  const containerStyle = getComputedStyle(container);
  const characterHeight = measureCharacterHeight(container, characterSlots, containerStyle);
  const restingColor = resolvedOptions.color ? containerStyle.color : "";
  const changedSlotMeasurements = measureChangedSlots(
    characterSlots,
    currentSegments,
    targetSegments,
    resolvedOptions.skipUnchanged,
  );

  if (changedSlotMeasurements.length === 0) {
    renderCharacterSlots(container, targetText, resolvedOptions.rollBy);
    return;
  }

  const animationState: AnimationState = {
    timerIds: [],
    targetText,
    rollBy: resolvedOptions.rollBy,
  };
  animationStates.set(container, animationState);
  const preparedSlotAnimations = changedSlotMeasurements.map((measurement) =>
    prepareSlotAnimation(
      measurement,
      targetSegments.length,
      characterHeight,
      resolvedOptions,
    ),
  );

  // Commit every start style with one layout flush instead of one per glyph.
  void container.offsetWidth;
  preparedSlotAnimations.forEach((preparedSlotAnimation) =>
    scheduleSlotAnimation(
      preparedSlotAnimation,
      characterHeight,
      restingColor,
      resolvedOptions,
      (callback, delayMs) =>
        scheduleAnimationTask(animationState, callback, delayMs),
    ),
  );

  const completionDelayMs =
    Math.max(...preparedSlotAnimations.map(({ completionTimeMs }) => completionTimeMs)) +
    lifecycle.completionBufferMs;
  scheduleAnimationTask(animationState, () => {
    if (animationStates.get(container) !== animationState) return;
    const pendingAnimation = animationState.pendingAnimation;
    animationStates.delete(container);
    renderTextWithCssFallback(container, targetText, resolvedOptions.rollBy);
    if (pendingAnimation) {
      animateSlotText(container, pendingAnimation.text, pendingAnimation.options);
    }
  }, completionDelayMs);
}

export function clearSlotText(container: HTMLElement, text = "") {
  cancelRunningAnimation(container);
  initializedContainers.delete(container);
  renderPlainText(container, text);
}
