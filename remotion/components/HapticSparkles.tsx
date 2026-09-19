import React, { useMemo } from "react";
import { interpolate, useCurrentFrame } from "remotion";

export interface HapticSparklesProps {
  triggerFrame: number;
  x: number;
  y: number;
  count?: number;
  frame?: number;
}

export const HapticSparkles: React.FC<HapticSparklesProps> = ({
  triggerFrame,
  x,
  y,
  count = 10,
  frame: frameProp,
}) => {
  const currentHookFrame = useCurrentFrame();
  const frame = frameProp !== undefined ? frameProp : currentHookFrame;
  const age = frame - triggerFrame;

  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2 + 0.15;
      const distance = 35 + (i % 3) * 18;
      const size = 3 + (i % 2) * 2;
      const hues = ["#38bdf8", "#34d399", "#a855f7", "#f59e0b", "#ec4899"];
      const color = hues[i % hues.length];
      return { angle, distance, size, color };
    });
  }, [count]);

  if (age < 0 || age > 22) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      {particles.map((p, idx) => {
        const progress = interpolate(age, [0, 20], [0, 1], {
          extrapolateRight: "clamp",
        });
        const eased = 1 - Math.pow(1 - progress, 3);
        const dist = p.distance * eased;
        const px = Math.cos(p.angle) * dist;
        const py = Math.sin(p.angle) * dist;
        const opacity = interpolate(age, [0, 4, 20], [0, 1, 0]);

        return (
          <div
            key={`sparkle-${idx}`}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: p.size,
              height: p.size,
              borderRadius: 1, // crisp tiny geometric square/tick (no glow, no blur)
              backgroundColor: p.color,
              transform: `translate(-50%, -50%) rotate(${age * 12}deg)`,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
};
