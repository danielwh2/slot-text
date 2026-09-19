import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SlotRoll } from "../components/SlotRoll";
import { Cursor } from "../components/Cursor";

export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Part 1: Problem comparison (Frames 0 to 90)
  const part1Opacity = interpolate(frame, [0, 15, 78, 90], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const part1Scale = interpolate(frame, [0, 15, 78, 90], [0.95, 1, 1, 0.98], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Plain button snap at frame 45
  const isPlainCopied = frame >= 45;

  // Part 2: Hero Intro Reveal (Frames 90 to 240)
  const part2Progress = spring({
    frame: Math.max(0, frame - 90),
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.8 },
  });
  const part2Opacity = interpolate(frame, [90, 105, 230, 240], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const part2Scale = interpolate(part2Progress, [0, 1], [0.94, 1]);

  // Pill badge springs (staggered)
  const badge1Spring = spring({
    frame: Math.max(0, frame - 145),
    fps,
    config: { damping: 13, stiffness: 120 },
  });
  const badge2Spring = spring({
    frame: Math.max(0, frame - 160),
    fps,
    config: { damping: 13, stiffness: 120 },
  });
  const badge3Spring = spring({
    frame: Math.max(0, frame - 175),
    fps,
    config: { damping: 13, stiffness: 120 },
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* PART 1: The Problem (Plain Text Switch) */}
      {frame < 95 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: part1Opacity,
            transform: `scale(${part1Scale})`,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#8b949e",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 24,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Why do UI text updates still feel abrupt?
          </div>

          {/* Flat matte problem card */}
          <div
            style={{
              padding: "44px 64px",
              borderRadius: 16,
              backgroundColor: "#161b22",
              border: "1px solid #30363d",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              minWidth: 420,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 140,
                height: 52,
                borderRadius: 12,
                backgroundColor: isPlainCopied ? "#21262d" : "#edf2f7",
                border: isPlainCopied ? "1px solid #30363d" : "1px solid #e2e8f0",
                color: isPlainCopied ? "#58a6ff" : "#0c50c6",
                fontSize: 20,
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                transform: frame >= 45 && frame < 52 ? "scale(0.96)" : "scale(1)",
              }}
            >
              <span>{isPlainCopied ? "Copied" : "Copy"}</span>
            </div>

            {isPlainCopied && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 6,
                  backgroundColor: "#211619",
                  border: "1px solid #7f1d1d",
                  color: "#f87171",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <span>⚠ Instant swap — no tactile continuity</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cursor at root screen level for exact positioning */}
      {frame < 95 && (
        <Cursor
          waypoints={[
            { frame: 10, x: 1140, y: 660 },
            { frame: 42, x: 960, y: 535 },
            { frame: 45, x: 960, y: 535, click: true },
            { frame: 75, x: 1080, y: 590 },
          ]}
        />
      )}

      {/* PART 2: The Solution (Meet slot-text) */}
      {frame >= 85 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: part2Opacity,
            transform: `scale(${part2Scale})`,
            textAlign: "center",
            padding: "0 40px",
          }}
        >
          {/* Eyebrow Badge (flat, solid, no glow) */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 6,
              backgroundColor: "#161b22",
              border: "1px solid #38bdf8",
              color: "#38bdf8",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 28,
            }}
          >
            <span>✦ Introducing</span>
          </div>

          {/* Main Title with Real Slot Roll */}
          <h1
            style={{
              margin: 0,
              fontSize: 116,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              fontFamily: "Inter, sans-serif",
              color: "#f0f6fc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SlotRoll
              timeline={[
                { frame: 0, text: "plain-text" },
                {
                  frame: 105,
                  text: "slot-text",
                  direction: "up",
                  bounce: 0.65,
                  chromatic: { from: 190, spread: 260 },
                  duration: 20,
                  stagger: 2.8,
                },
              ]}
              fontSize={116}
              fontWeight={800}
              letterSpacing="-0.04em"
              restingColor="#f0f6fc"
            />
          </h1>

          {/* Subtitle */}
          <p
            style={{
              margin: "24px 0 40px 0",
              fontSize: 32,
              fontWeight: 400,
              color: "#8b949e",
              maxWidth: 900,
              lineHeight: 1.4,
              letterSpacing: "-0.01em",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Dependency-free text roll animation for{" "}
            <span style={{ color: "#f0f6fc", fontWeight: 600 }}>tiny, tactile</span> UI labels.
          </p>

          {/* Flat Solid Feature Badges */}
          <div
            style={{
              display: "flex",
              gap: 18,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 24px",
                borderRadius: 8,
                backgroundColor: "#161b22",
                border: "1px solid #30363d",
                color: "#f0f6fc",
                fontSize: 17,
                fontWeight: 600,
                opacity: badge1Spring,
                transform: `scale(${interpolate(badge1Spring, [0, 1], [0.85, 1])}) translateY(${interpolate(badge1Spring, [0, 1], [16, 0])}px)`,
              }}
            >
              <span style={{ color: "#3fb950", fontSize: 18 }}>⚡</span>
              <span>0 Dependencies</span>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 24px",
                borderRadius: 8,
                backgroundColor: "#161b22",
                border: "1px solid #30363d",
                color: "#f0f6fc",
                fontSize: 17,
                fontWeight: 600,
                opacity: badge2Spring,
                transform: `scale(${interpolate(badge2Spring, [0, 1], [0.85, 1])}) translateY(${interpolate(badge2Spring, [0, 1], [16, 0])}px)`,
              }}
            >
              <span style={{ color: "#bc8cff", fontSize: 18 }}>📦</span>
              <span>&lt; 2 kB minzipped</span>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 24px",
                borderRadius: 8,
                backgroundColor: "#161b22",
                border: "1px solid #30363d",
                color: "#f0f6fc",
                fontSize: 17,
                fontWeight: 600,
                opacity: badge3Spring,
                transform: `scale(${interpolate(badge3Spring, [0, 1], [0.85, 1])}) translateY(${interpolate(badge3Spring, [0, 1], [16, 0])}px)`,
              }}
            >
              <span style={{ color: "#58a6ff", fontSize: 18 }}>✨</span>
              <span>Pure CSS + Spring Physics</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
