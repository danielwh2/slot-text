import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene4Frameworks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance and exit (frames 0 to 210)
  const sceneOpacity = interpolate(frame, [0, 15, 195, 210], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cardEntrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Framework tabs active state:
  // 0: React (0 - 65)
  // 1: Vue (65 - 130)
  // 2: Svelte (130 - 210)
  const activeTabIndex = frame < 65 ? 0 : frame < 130 ? 1 : 2;

  const frameworks = [
    { name: "React", icon: "⚛️", color: "#61dafb" },
    { name: "Vue", icon: "💚", color: "#42b883" },
    { name: "Svelte", icon: "🧡", color: "#ff3e00" },
    { name: "Solid", icon: "🔷", color: "#2c4f7c" },
    { name: "Vanilla", icon: "⚡", color: "#facc15" },
  ];

  const codeSnippets = [
    // React
    `import "slot-text/style.css";
import { SlotText } from "slot-text/react";
import { chromatic } from "slot-text";

<SlotText
  text={copied ? "Copied" : "Copy"}
  options={{
    direction: copied ? "up" : "down",
    color: copied ? chromatic() : undefined
  }}
/>`,
    // Vue
    `<script setup lang="ts">
import "slot-text/style.css";
import { SlotText } from "slot-text/vue";
import { chromatic } from "slot-text";
</script>

<template>
  <SlotText
    :text="copied ? 'Copied' : 'Copy'"
    :options="{ direction: 'up', color: chromatic() }"
  />
</template>`,
    // Svelte
    `<script lang="ts">
import "slot-text/style.css";
import { slotText } from "slot-text/svelte";
import { chromatic } from "slot-text";

let copied = false;
</script>

<button on:click={() => copied = true}>
  <span use:slotText={{ text: copied ? "Copied" : "Copy" }} />
</button>`,
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: sceneOpacity,
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 36,
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
            color: "#61dafb",
          }}
        >
          ✦ Universal Framework Support
        </span>
        <h2
          style={{
            margin: 0,
            fontSize: 48,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "#edf2f7",
            fontFamily: "Inter, sans-serif",
          }}
        >
          One tiny core. First-class in every stack.
        </h2>
      </div>

      {/* Code Card Window (solid, matte, no blur, no glow) */}
      <div
        style={{
          width: 820,
          borderRadius: 16,
          backgroundColor: "#161b22",
          border: "1px solid #30363d",
          transform: `scale(${interpolate(cardEntrance, [0, 1], [0.94, 1])})`,
          overflow: "hidden",
        }}
      >
        {/* Tab Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
            borderBottom: "1px solid #21262d",
            backgroundColor: "#0e1116",
          }}
        >
          {/* Framework Switcher Tabs */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {frameworks.map((fw, idx) => {
              const isActive = idx === activeTabIndex;
              return (
                <div
                  key={fw.name}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 14px",
                    borderRadius: 6,
                    backgroundColor: isActive ? "#21262d" : "transparent",
                    border: `1px solid ${isActive ? "#38bdf8" : "transparent"}`,
                    color: isActive ? "#ffffff" : "#8b949e",
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <span>{fw.icon}</span>
                  <span>{fw.name}</span>
                </div>
              );
            })}
          </div>

          <div
            style={{
              fontSize: 13,
              color: "#8b949e",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            slot-text/{frameworks[activeTabIndex].name.toLowerCase()}
          </div>
        </div>

        {/* Code Content */}
        <div style={{ padding: "28px 32px", backgroundColor: "#161b22" }}>
          <pre
            style={{
              margin: 0,
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 16,
              lineHeight: 1.6,
              color: "#edf2f7",
              overflowX: "hidden",
            }}
          >
            <code>
              {codeSnippets[activeTabIndex].split("\n").map((line, lIdx) => {
                let formatted = line;
                return (
                  <div key={`line-${activeTabIndex}-${lIdx}`} style={{ display: "flex", gap: 20 }}>
                    <span
                      style={{
                        width: 24,
                        textAlign: "right",
                        color: "#484f58",
                        userSelect: "none",
                        fontSize: 14,
                      }}
                    >
                      {lIdx + 1}
                    </span>
                    <span style={{ flex: 1 }}>
                      {formatted.includes("import") ? (
                        <>
                          <span style={{ color: "#ff7b72" }}>import </span>
                          <span style={{ color: "#edf2f7" }}>
                            {formatted.replace("import ", "").split("from")[0]}
                          </span>
                          {formatted.includes("from") && (
                            <>
                              <span style={{ color: "#ff7b72" }}>from </span>
                              <span style={{ color: "#a5d6ff" }}>
                                {formatted.split("from ")[1]}
                              </span>
                            </>
                          )}
                        </>
                      ) : formatted.includes("<SlotText") || formatted.includes("<span") || formatted.includes("<button") ? (
                        <span style={{ color: "#7ee787" }}>{formatted}</span>
                      ) : formatted.includes("direction") || formatted.includes("color:") || formatted.includes("text=") ? (
                        <>
                          <span style={{ color: "#d2a8ff" }}>{formatted.split(":")[0] || formatted.split("=")[0]}</span>
                          <span style={{ color: "#8b949e" }}>: </span>
                          <span style={{ color: "#79c0ff" }}>{formatted.split(":")[1] || formatted.split("=")[1]}</span>
                        </>
                      ) : (
                        <span style={{ color: "#8b949e" }}>{formatted}</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </code>
          </pre>
        </div>
      </div>

      {/* Flat Solid Badges */}
      <div
        style={{
          marginTop: 28,
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 6,
            backgroundColor: "#161b22",
            border: "1px solid #238636",
            color: "#3fb950",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <span>✓</span> Zero runtime dependencies
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 6,
            backgroundColor: "#161b22",
            border: "1px solid #1f6feb",
            color: "#58a6ff",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <span>✓</span> Under 2 kB minzipped
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 6,
            backgroundColor: "#161b22",
            border: "1px solid #8957e5",
            color: "#bc8cff",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <span>✓</span> 100% TypeScript typed
        </div>
      </div>
    </div>
  );
};
