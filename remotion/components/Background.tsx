import React from "react";

export const Background: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#0e1116", // Official matte slot-text canvas background
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {/* Crisp flat architectural hairline grid (no gradients, no glow) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gridTemplateRows: "repeat(8, 1fr)",
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: 96 }).map((_, i) => (
          <div
            key={`cell-${i}`}
            style={{
              borderRight: "1px solid #161b22",
              borderBottom: "1px solid #161b22",
            }}
          />
        ))}
      </div>

      {/* Subtle corner crosshairs for technical precision */}
      <div style={{ position: "absolute", top: 40, left: 40, width: 12, height: 1, backgroundColor: "#30363d" }} />
      <div style={{ position: "absolute", top: 34, left: 45, width: 1, height: 12, backgroundColor: "#30363d" }} />

      <div style={{ position: "absolute", top: 40, right: 40, width: 12, height: 1, backgroundColor: "#30363d" }} />
      <div style={{ position: "absolute", top: 34, right: 45, width: 1, height: 12, backgroundColor: "#30363d" }} />

      <div style={{ position: "absolute", bottom: 40, left: 40, width: 12, height: 1, backgroundColor: "#30363d" }} />
      <div style={{ position: "absolute", bottom: 45, left: 45, width: 1, height: 12, backgroundColor: "#30363d" }} />

      <div style={{ position: "absolute", bottom: 40, right: 40, width: 12, height: 1, backgroundColor: "#30363d" }} />
      <div style={{ position: "absolute", bottom: 45, right: 45, width: 1, height: 12, backgroundColor: "#30363d" }} />
    </div>
  );
};
