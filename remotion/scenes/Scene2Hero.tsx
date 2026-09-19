import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SlotRoll } from "../components/SlotRoll";
import { Cursor } from "../components/Cursor";
import { HapticSparkles } from "../components/HapticSparkles";

export const Scene2Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance and exit (frames 0 to 300)
  const sceneOpacity = interpolate(frame, [0, 15, 285, 300], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cardEntrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const cardScale = interpolate(cardEntrance, [0, 1], [0.94, 1]);

  // Clicks:
  // First click: frame 50
  // Revert: frame 160
  // Spam clicks: frame 205, 218
  const isPressed1 = frame >= 50 && frame <= 56;
  const isPressed2 = frame >= 205 && frame <= 211;
  const isPressed3 = frame >= 218 && frame <= 224;
  const isAnyPressed = isPressed1 || isPressed2 || isPressed3;

  const buttonScale = isAnyPressed ? 0.96 : 1.0;

  const isCopiedState = (frame >= 52 && frame < 160) || frame >= 207;

  const iconSpring = spring({
    frame: isCopiedState ? Math.max(0, frame - (frame >= 207 ? 207 : 52)) : 0,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  const flashCalloutSpring = spring({
    frame: Math.max(0, frame - 50),
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  const spamCalloutSpring = spring({
    frame: Math.max(0, frame - 225),
    fps,
    config: { damping: 13, stiffness: 120 },
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: sceneOpacity,
      }}
    >
      {/* Centered Main Content Area */}
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
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            marginBottom: 36,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#38bdf8",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>●</span> The Classic Flash Pattern
          </span>
          <h2
            style={{
              margin: 0,
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "#f0f6fc",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Tactile micro-interactions made effortless
          </h2>
        </div>

        {/* Terminal Card (solid, matte, no blur, no glow) */}
        <div
          style={{
            width: 940,
            borderRadius: 16,
            backgroundColor: "#161b22",
            border: "1px solid #30363d",
            transform: `scale(${cardScale})`,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Terminal Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 24px",
              borderBottom: "1px solid #21262d",
              backgroundColor: "#0e1116",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: "#ef4444" }} />
              <div style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: "#f59e0b" }} />
              <div style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: "#10b981" }} />
            </div>

            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#8b949e",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              bash — quick start
            </div>

            <div style={{ width: 44 }} />
          </div>

          {/* Terminal Body */}
          <div
            style={{
              padding: "36px 40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              backgroundColor: "#161b22",
            }}
          >
            {/* Code snippet */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontSize: 24,
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: 500,
              }}
            >
              <span style={{ color: "#38bdf8", userSelect: "none" }}>$</span>
              <span style={{ color: "#f0f6fc" }}>npm install </span>
              <span style={{ color: "#bc8cff", fontWeight: 600 }}>slot-text</span>
            </div>

            {/* Tactile Button (Flat, clean, matte, based on examples/basic) */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: 140,
                height: 50,
                borderRadius: 12,
                backgroundColor: "#edf2f7",
                border: "1px solid #e2e8f0",
                color: isCopiedState ? "#059669" : "#0c50c6",
                cursor: "pointer",
                transform: `scale(${buttonScale})`,
                transition: "transform 0.12s ease-out",
              }}
            >
              {/* Morphing Icon */}
              <div
                style={{
                  width: 18,
                  height: 18,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Copy Icon */}
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={isCopiedState ? "transparent" : "#0c50c6"}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    position: "absolute",
                    opacity: isCopiedState ? 0 : 1,
                    transform: isCopiedState ? "scale(0.5)" : "scale(1)",
                  }}
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>

                {/* Checkmark Icon */}
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    position: "absolute",
                    opacity: isCopiedState ? interpolate(iconSpring, [0, 1], [0, 1]) : 0,
                    transform: `scale(${isCopiedState ? interpolate(iconSpring, [0, 1], [0.3, 1]) : 0.3})`,
                  }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              {/* SlotRoll Label */}
              <SlotRoll
                timeline={[
                  { frame: 0, text: "Copy" },
                  {
                    frame: 52,
                    text: "Copied",
                    direction: "up",
                    bounce: 0.65,
                    chromatic: { from: 190, spread: 260 },
                    duration: 20,
                    stagger: 2.8,
                  },
                  {
                    frame: 160,
                    text: "Copy",
                    direction: "down",
                    bounce: 0.5,
                    duration: 18,
                    stagger: 2.5,
                  },
                  {
                    frame: 207,
                    text: "Copied",
                    direction: "up",
                    bounce: 0.65,
                    chromatic: { from: 180, spread: 260 },
                    duration: 20,
                    stagger: 2.8,
                  },
                ]}
                fontSize={18}
                fontWeight={600}
                restingColor={isCopiedState ? "#059669" : "#0c50c6"}
              />
            </div>
          </div>
        </div>

        {/* Explanatory Pills below (solid, flat, no glow) */}
        <div
          style={{
            marginTop: 36,
            display: "flex",
            gap: 20,
            alignItems: "center",
            height: 52,
          }}
        >
          {frame >= 50 && frame < 190 && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 22px",
                borderRadius: 8,
                backgroundColor: "#161b22",
                border: "1px solid #30363d",
                color: "#f0f6fc",
                fontSize: 15,
                fontFamily: "JetBrains Mono, monospace",
                opacity: interpolate(flashCalloutSpring, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(flashCalloutSpring, [0, 1], [15, 0])}px)`,
              }}
            >
              <span style={{ color: "#38bdf8" }}>⚡</span>
              <span>label.flash("Copied", &#123; enter: &#123; color: chromatic() &#125; &#125;)</span>
              <span
                style={{
                  fontSize: 12,
                  padding: "3px 8px",
                  borderRadius: 4,
                  backgroundColor: "#21262d",
                  color: "#8b949e",
                }}
              >
                auto-reverts in 1.4s
              </span>
            </div>
          )}

          {frame >= 210 && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 22px",
                borderRadius: 8,
                backgroundColor: "#161b22",
                border: "1px solid #30363d",
                color: "#f0f6fc",
                fontSize: 15,
                fontWeight: 500,
                opacity: interpolate(spamCalloutSpring, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(spamCalloutSpring, [0, 1], [15, 0])}px)`,
              }}
            >
              <span style={{ color: "#bc8cff", fontSize: 16 }}>🛡️</span>
              <span>
                <strong style={{ color: "#f0f6fc" }}>Spam-safe:</strong> repeat clicks restart revert timer instead of queuing extra rolls.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Crisp flat confetti on click at exact screen coordinates */}
      <HapticSparkles triggerFrame={52} x={1250} y={545} count={12} />
      <HapticSparkles triggerFrame={207} x={1250} y={545} count={12} />

      {/* Mouse Cursor Waypoints positioned at root level */}
      <Cursor
        waypoints={[
          { frame: 5, x: 1420, y: 720 },
          { frame: 46, x: 1250, y: 545 },
          { frame: 50, x: 1250, y: 545, click: true },
          { frame: 80, x: 1290, y: 580 },
          { frame: 195, x: 1250, y: 545 },
          { frame: 205, x: 1250, y: 545, click: true },
          { frame: 218, x: 1250, y: 545, click: true },
          { frame: 250, x: 1350, y: 620 },
        ]}
      />
    </div>
  );
};
