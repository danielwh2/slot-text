import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SlotRoll } from "../components/SlotRoll";
import { Cursor } from "../components/Cursor";

export const Scene3Features: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance and exit (frames 0 to 270)
  const sceneOpacity = interpolate(frame, [0, 15, 255, 270], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const card1Spring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });
  const card2Spring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 14, stiffness: 100 },
  });
  const card3Spring = spring({
    frame: Math.max(0, frame - 16),
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Local triggers:
  // Pricing toggle click: frame 60
  const isAnnual = frame >= 60;

  // Word roll trigger: frame 130
  const isDeployed = frame >= 130;

  // Direction roll trigger: frame 180
  const isDown = frame >= 180;

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
          padding: "0 80px",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 44,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#bc8cff",
            }}
          >
            ✦ Built for Real World UI
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
            Crafted for precision, layout stability, and delight
          </h2>
        </div>

        {/* 3-Column Bento Grid (solid cards, no glow) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 28,
            width: "100%",
            maxWidth: 1440,
          }}
        >
          {/* CARD 1: Tabular Numbers & Pricing */}
          <div
            style={{
              borderRadius: 16,
              backgroundColor: "#161b22",
              border: "1px solid #30363d",
              padding: 32,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: 380,
              transform: `translateY(${interpolate(card1Spring, [0, 1], [30, 0])}px) scale(${interpolate(card1Spring, [0, 1], [0.94, 1])})`,
              opacity: card1Spring,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#38bdf8",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                Tabular Figures
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#f0f6fc", marginBottom: 6 }}>
                Zero Layout Shift
              </div>
              <div style={{ fontSize: 14, color: "#8b949e", lineHeight: 1.4 }}>
                skipUnchanged keeps static glyphs rock-solid while numbers roll smoothly.
              </div>
            </div>

            {/* Pricing Mockup */}
            <div
              style={{
                padding: "20px 24px",
                borderRadius: 12,
                backgroundColor: "#0e1116",
                border: "1px solid #21262d",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                alignItems: "center",
              }}
            >
              {/* Toggle */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: 3,
                  borderRadius: 8,
                  backgroundColor: "#161b22",
                  border: "1px solid #30363d",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <div
                  style={{
                    padding: "4px 12px",
                    borderRadius: 6,
                    backgroundColor: !isAnnual ? "#38bdf8" : "transparent",
                    color: !isAnnual ? "#0f172a" : "#8b949e",
                  }}
                >
                  Monthly
                </div>
                <div
                  style={{
                    padding: "4px 12px",
                    borderRadius: 6,
                    backgroundColor: isAnnual ? "#38bdf8" : "transparent",
                    color: isAnnual ? "#0f172a" : "#8b949e",
                  }}
                >
                  Yearly <span style={{ fontSize: 11, color: isAnnual ? "#0369a1" : "#3fb950" }}>-20%</span>
                </div>
              </div>

              {/* Price Tag */}
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  color: "#f0f6fc",
                  fontFamily: "Inter, sans-serif",
                  fontVariantNumeric: "tabular-nums",
                  display: "flex",
                  alignItems: "baseline",
                  letterSpacing: "-0.03em",
                }}
              >
                <SlotRoll
                  timeline={[
                    { frame: 0, text: "$19 / mo" },
                    {
                      frame: 60,
                      text: "$190 / yr",
                      direction: "up",
                      bounce: 0.5,
                      duration: 18,
                      stagger: 2.2,
                    },
                  ]}
                  fontSize={48}
                  fontWeight={800}
                  restingColor="#f0f6fc"
                  skipUnchanged={true}
                />
              </div>
            </div>

            <div
              style={{
                fontSize: 13,
                fontFamily: "JetBrains Mono, monospace",
                color: "#8b949e",
                textAlign: "center",
              }}
            >
              skipUnchanged: true
            </div>
          </div>

          {/* CARD 2: Word Mode */}
          <div
            style={{
              borderRadius: 16,
              backgroundColor: "#161b22",
              border: "1px solid #30363d",
              padding: 32,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: 380,
              transform: `translateY(${interpolate(card2Spring, [0, 1], [30, 0])}px) scale(${interpolate(card2Spring, [0, 1], [0.94, 1])})`,
              opacity: card2Spring,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#3fb950",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                rollBy: "word"
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#f0f6fc", marginBottom: 6 }}>
                Preserve Kerning & Shaping
              </div>
              <div style={{ fontSize: 14, color: "#8b949e", lineHeight: 1.4 }}>
                Rolls whole words as single units, preserving ligatures, cursive, and multi-word phrases.
              </div>
            </div>

            {/* Status Badge Mockup */}
            <div
              style={{
                padding: "24px 20px",
                borderRadius: 12,
                backgroundColor: "#0e1116",
                border: "1px solid #21262d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: isDeployed ? "#3fb950" : "#d29922",
                }}
              />

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: isDeployed ? "#3fb950" : "#d29922",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <SlotRoll
                  timeline={[
                    { frame: 0, text: "Deploying commit...", rollBy: "word" },
                    {
                      frame: 130,
                      text: "Live on Edge ✨",
                      direction: "up",
                      rollBy: "word",
                      bounce: 0.6,
                      duration: 20,
                      stagger: 4,
                    },
                  ]}
                  fontSize={20}
                  fontWeight={600}
                  rollBy="word"
                  restingColor={isDeployed ? "#3fb950" : "#d29922"}
                />
              </div>
            </div>

            <div
              style={{
                fontSize: 13,
                fontFamily: "JetBrains Mono, monospace",
                color: "#8b949e",
                textAlign: "center",
              }}
            >
              Intl.Segmenter aware
            </div>
          </div>

          {/* CARD 3: Direction & Spring Tilt */}
          <div
            style={{
              borderRadius: 16,
              backgroundColor: "#161b22",
              border: "1px solid #30363d",
              padding: 32,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: 380,
              transform: `translateY(${interpolate(card3Spring, [0, 1], [30, 0])}px) scale(${interpolate(card3Spring, [0, 1], [0.94, 1])})`,
              opacity: card3Spring,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#f778ba",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                Physics & Tilt
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#f0f6fc", marginBottom: 6 }}>
                Springy Settle Tilt
              </div>
              <div style={{ fontSize: 14, color: "#8b949e", lineHeight: 1.4 }}>
                Subtle per-glyph tilt up to 5° gives each character tactile split-flap life.
              </div>
            </div>

            {/* Direction Demo Pill */}
            <div
              style={{
                padding: "24px 20px",
                borderRadius: 12,
                backgroundColor: "#0e1116",
                border: "1px solid #21262d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#f778ba",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>{isDown ? "↓" : "↑"}</span>
                <SlotRoll
                  timeline={[
                    { frame: 0, text: "Rolling Up" },
                    {
                      frame: 180,
                      text: "Rolling Down",
                      direction: "down",
                      bounce: 0.8,
                      duration: 22,
                      stagger: 2.8,
                    },
                  ]}
                  fontSize={26}
                  fontWeight={700}
                  restingColor="#f778ba"
                />
              </div>
            </div>

            <div
              style={{
                fontSize: 13,
                fontFamily: "JetBrains Mono, monospace",
                color: "#8b949e",
                textAlign: "center",
              }}
            >
              direction: "{isDown ? "down" : "up"}", bounce: 0.6
            </div>
          </div>
        </div>
      </div>

      {/* Mouse Cursor clicking toggle */}
      <Cursor
        waypoints={[
          { frame: 10, x: 400, y: 760 },
          { frame: 56, x: 520, y: 558 },
          { frame: 60, x: 520, y: 558, click: true },
          { frame: 90, x: 580, y: 620 },
        ]}
      />
    </div>
  );
};
