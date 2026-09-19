import React, { useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export type RollBy = "character" | "word";

export interface RollEvent {
  frame: number;
  text: string;
  direction?: "up" | "down";
  rollBy?: RollBy;
  bounce?: number;
  chromatic?: boolean | { from?: number; spread?: number };
  duration?: number; // frames per segment (default ~18 frames at 60fps = 300ms)
  stagger?: number; // frames between segments (default ~2.7 frames = 45ms)
}

export interface SlotRollProps {
  timeline: RollEvent[];
  frame?: number;
  fontSize?: number | string;
  fontFamily?: string;
  fontWeight?: number | string;
  letterSpacing?: string;
  restingColor?: string;
  skipUnchanged?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

// Exact deterministic variation from slot-text/timing.ts
function getDeterministicVariation(segmentIndex: number, variationChannel: number): number {
  const oneBasedSegmentIndex = segmentIndex + 1;
  const pseudoRandomSeed =
    Math.sin(oneBasedSegmentIndex * 12.9898 + variationChannel * 78.233) * 43758.5453;
  const zeroToOne = pseudoRandomSeed - Math.floor(pseudoRandomSeed);
  return zeroToOne * 2 - 1;
}

// Segmentation helper supporting character and word mode
function segmentText(text: string, rollBy: RollBy = "character"): string[] {
  if (rollBy === "word") {
    const tokens: string[] = [];
    const parts = text.split(/(\s+)/);
    for (const part of parts) {
      if (part.length > 0) tokens.push(part);
    }
    return tokens;
  }

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

export const SlotRoll: React.FC<SlotRollProps> = ({
  timeline,
  frame: frameProp,
  fontSize = "1rem",
  fontFamily = "inherit",
  fontWeight = 600,
  letterSpacing = "normal",
  restingColor = "#edf2f7",
  skipUnchanged = true,
  style,
  className,
}) => {
  const currentHookFrame = useCurrentFrame();
  const frame = frameProp !== undefined ? frameProp : currentHookFrame;
  const { fps } = useVideoConfig();

  // Find active and previous roll events from the timeline
  const { activeEvent, previousEvent } = useMemo(() => {
    let active = timeline[0];
    let prev: RollEvent | null = null;

    for (let i = 0; i < timeline.length; i++) {
      if (frame >= timeline[i].frame) {
        prev = i > 0 ? timeline[i - 1] : null;
        active = timeline[i];
      } else {
        break;
      }
    }

    return { activeEvent: active, previousEvent: prev };
  }, [timeline, frame]);

  const direction = activeEvent.direction ?? "down";
  const rollBy = activeEvent.rollBy ?? "character";
  const bounce = activeEvent.bounce ?? 0.6;
  const chromaticConfig = activeEvent.chromatic;
  const durationFrames = activeEvent.duration ?? Math.round((300 / 1000) * fps); // ~18 frames
  const staggerFrames = activeEvent.stagger ?? (45 / 1000) * fps; // ~2.7 frames

  const currentSegments = useMemo(
    () => segmentText(activeEvent.text, rollBy),
    [activeEvent.text, rollBy],
  );

  const prevSegments = useMemo(
    () => (previousEvent ? segmentText(previousEvent.text, rollBy) : currentSegments),
    [previousEvent, currentSegments, rollBy],
  );

  const maxLen = Math.max(currentSegments.length, prevSegments.length);
  const elapsedSinceRoll = Math.max(0, frame - activeEvent.frame);
  const isRolling = previousEvent !== null && elapsedSinceRoll < durationFrames + maxLen * staggerFrames + 8;

  // Solid chromatic color sweep (no gradients, no glow)
  const getChromaticColor = (index: number, count: number): string => {
    if (!chromaticConfig) return restingColor;
    const from = typeof chromaticConfig === "object" && chromaticConfig.from !== undefined ? chromaticConfig.from : 0;
    const spread = typeof chromaticConfig === "object" && chromaticConfig.spread !== undefined ? chromaticConfig.spread : 320;
    const progress = count <= 1 ? 0 : index / (count - 1);
    const hue = (from + progress * spread) % 360;
    return `hsl(${hue} 88% 58%)`;
  };

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        whiteSpace: "pre",
        fontFamily,
        fontSize,
        fontWeight,
        letterSpacing,
        lineHeight: 1.3,
        ...style,
      }}
    >
      {Array.from({ length: maxLen }).map((_, i) => {
        const targetChar = currentSegments[i] ?? "";
        const prevChar = prevSegments[i] ?? "";
        const isIdentical = skipUnchanged && targetChar === prevChar && targetChar !== "";

        if (isIdentical || !isRolling) {
          if (targetChar === "") return null;
          return (
            <span
              key={`slot-${i}-${targetChar}`}
              style={{
                position: "relative",
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "baseline",
                overflowY: "clip",
                overflowX: "visible",
                lineHeight: 1.3,
                color: restingColor,
              }}
            >
              <span style={{ visibility: "hidden" }}>{targetChar}</span>
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  whiteSpace: "pre",
                  color: restingColor,
                }}
              >
                {targetChar}
              </span>
            </span>
          );
        }

        // Rolling slot animation
        const variationChannel = 2;
        const variationMult = 1 + bounce * 0.25 * getDeterministicVariation(i, variationChannel);
        const segmentStart = activeEvent.frame + i * staggerFrames * variationMult;
        const segmentProgressFrame = Math.max(0, frame - segmentStart);

        const rollSpring = spring({
          frame: segmentProgressFrame,
          fps,
          config: {
            damping: 14,
            mass: 0.65,
            stiffness: 130,
          },
        });

        // Tilt variation from slot-text formula
        const maxTilt = 5;
        const startingTiltDegrees = bounce * maxTilt * getDeterministicVariation(i, 3);
        const currentTilt = interpolate(rollSpring, [0, 1], [startingTiltDegrees, 0]);

        const incomingY =
          direction === "down"
            ? interpolate(rollSpring, [0, 1], [-100, 0])
            : interpolate(rollSpring, [0, 1], [100, 0]);

        const outgoingY =
          direction === "down"
            ? interpolate(rollSpring, [0, 1], [0, 100])
            : interpolate(rollSpring, [0, 1], [0, -100]);

        // Flat solid color transition
        const initialColor = getChromaticColor(i, maxLen);
        const colorFadeProgress = interpolate(
          segmentProgressFrame,
          [durationFrames * 0.4, durationFrames * 1.1],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        const sizerText = targetChar || prevChar || " ";

        return (
          <span
            key={`rolling-slot-${i}`}
            style={{
              position: "relative",
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "baseline",
              overflowY: "clip",
              overflowX: "visible",
              lineHeight: 1.3,
            }}
          >
            <span style={{ visibility: "hidden" }}>{sizerText}</span>

            {/* Outgoing face */}
            {prevChar !== "" && (
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  whiteSpace: "pre",
                  transform: `translateY(${outgoingY}%) rotate(${-currentTilt * 0.5}deg)`,
                  opacity: interpolate(rollSpring, [0, 0.7, 1], [1, 0.2, 0]),
                  color: restingColor,
                }}
              >
                {prevChar}
              </span>
            )}

            {/* Incoming face */}
            {targetChar !== "" && (
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  whiteSpace: "pre",
                  transform: `translateY(${incomingY}%) rotate(${currentTilt}deg)`,
                  opacity: interpolate(rollSpring, [0, 0.3, 1], [0, 1, 1]),
                  color: chromaticConfig
                    ? colorFadeProgress >= 1
                      ? restingColor
                      : initialColor
                    : restingColor,
                }}
              >
                {targetChar}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
};
