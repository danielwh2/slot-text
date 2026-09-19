import React from "react";
import { Sequence, useCurrentFrame } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

import { Background } from "./components/Background";
import { AudioTracks } from "./components/AudioTracks";
import { Scene1Intro } from "./scenes/Scene1Intro";
import { Scene2Hero } from "./scenes/Scene2Hero";
import { Scene3Features } from "./scenes/Scene3Features";
import { Scene4Frameworks } from "./scenes/Scene4Frameworks";
import { Scene5Outro } from "./scenes/Scene5Outro";

// Ensure fonts are loaded with only required weights
const { fontFamily: interFont } = loadInter("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});
const { fontFamily: monoFont } = loadJetBrainsMono("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
});

export const SlotTextPromo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "relative",
        width: 1920,
        height: 1080,
        backgroundColor: "#0e1116",
        fontFamily: `${interFont}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        overflow: "hidden",
        color: "#ffffff",
      }}
    >
      {/* Dynamic Ambient Background */}
      <Background />

      {/* Audio Layer */}
      <AudioTracks />

      {/* SCENE 1: Introduction & The Problem (Frames 0 to 240) */}
      <Sequence from={0} durationInFrames={240}>
        <Scene1Intro />
      </Sequence>

      {/* SCENE 2: The Hero Interaction - Flash Pattern (Frames 240 to 540) */}
      <Sequence from={240} durationInFrames={300}>
        <Scene2Hero />
      </Sequence>

      {/* SCENE 3: Real World Superpowers (Frames 540 to 810) */}
      <Sequence from={540} durationInFrames={270}>
        <Scene3Features />
      </Sequence>

      {/* SCENE 4: Universal Multi-Framework DX (Frames 810 to 1020) */}
      <Sequence from={810} durationInFrames={210}>
        <Scene4Frameworks />
      </Sequence>

      {/* SCENE 5: Grand Finale & Call to Action (Frames 1020 to 1200) */}
      <Sequence from={1020} durationInFrames={180}>
        <Scene5Outro />
      </Sequence>
    </div>
  );
};
