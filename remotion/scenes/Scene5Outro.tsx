import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SlotRoll } from "../components/SlotRoll";
import { Cursor } from "../components/Cursor";
import { HapticSparkles } from "../components/HapticSparkles";

export const Scene5Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance and exit (frames 0 to 180)
  const sceneOpacity = interpolate(frame, [0, 15, 168, 180], [0, 1, 1, 0.9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Button click at frame 60
  const isCopied = frame >= 62;
  const isPressed = frame >= 58 && frame <= 64;

  const buttonScale = isPressed ? 0.96 : 1.0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: sceneOpacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            transform: `scale(${interpolate(entrance, [0, 1], [0.94, 1])})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            maxWidth: 960,
          }}
        >
          {/* Eyebrow Badge (solid, flat, no glow) */}
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
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            <span>✦ Open Source & MIT Licensed</span>
          </div>

          {/* Big Bold Headline (NO gradient text, pure solid high-contrast colors) */}
          <h1
            style={{
              margin: 0,
              fontSize: 76,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "#f0f6fc",
              fontFamily: "Inter, sans-serif",
              lineHeight: 1.1,
            }}
          >
            Give your text <br />
            <span style={{ color: "#38bdf8" }}>tactile joy.</span>
          </h1>

          {/* Flat Solid Install Command Pill */}
          <div
            style={{
              marginTop: 10,
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "16px 24px 16px 32px",
              borderRadius: 16,
              backgroundColor: "#161b22",
              border: "1px solid #30363d",
            }}
          >
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 24,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <span style={{ color: "#38bdf8" }}>$</span>
              <span style={{ color: "#f0f6fc" }}>npm install </span>
              <span style={{ color: "#bc8cff", fontWeight: 700 }}>slot-text</span>
            </div>

            {/* Interactive Install Button (clean, flat, high contrast) */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 200,
                height: 52,
                padding: "0 24px",
                borderRadius: 10,
                backgroundColor: isCopied ? "#047857" : "#edf2f7",
                border: isCopied ? "1px solid #059669" : "1px solid #e2e8f0",
                color: isCopied ? "#ffffff" : "#0c50c6",
                fontSize: 16,
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                cursor: "pointer",
                transform: `scale(${buttonScale})`,
                transition: "transform 0.12s ease-out",
              }}
            >
              <SlotRoll
                timeline={[
                  { frame: 0, text: "Copy" },
                  {
                    frame: 60,
                    text: "Ready to Roll! 🚀",
                    direction: "up",
                    bounce: 0.7,
                    chromatic: { from: 180, spread: 260 },
                    duration: 20,
                    stagger: 2.2,
                  },
                ]}
                fontSize={16}
                fontWeight={600}
                restingColor={isCopied ? "#ffffff" : "#0c50c6"}
              />
            </div>
          </div>

          {/* Footer Info: Author & Star Counter */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              marginTop: 12,
              color: "#8b949e",
              fontSize: 16,
              fontFamily: "Inter, sans-serif",
            }}
          >
            <span>Crafted with care by Daniel Belyi</span>
            <span style={{ color: "#484f58" }}>•</span>

            {/* GitHub Star Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 6,
                backgroundColor: "#161b22",
                border: "1px solid #30363d",
                color: "#f0f6fc",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <span style={{ color: "#e3b341" }}>★</span>
              <SlotRoll
                timeline={[
                  { frame: 0, text: "1,248 stars" },
                  {
                    frame: 62,
                    text: "1,420 stars",
                    direction: "up",
                    bounce: 0.5,
                    duration: 18,
                    stagger: 2,
                  },
                ]}
                fontSize={14}
                fontWeight={600}
                restingColor="#f0f6fc"
                skipUnchanged={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Flat Confetti Sparkles on Click (exact screen coordinates) */}
      <HapticSparkles triggerFrame={62} x={1140} y={585} count={14} />

      {/* Mouse Cursor clicking install at exact coordinates */}
      <Cursor
        waypoints={[
          { frame: 10, x: 860, y: 720 },
          { frame: 56, x: 1140, y: 585 },
          { frame: 60, x: 1140, y: 585, click: true },
          { frame: 100, x: 1200, y: 640 },
        ]}
      />
    </div>
  );
};
