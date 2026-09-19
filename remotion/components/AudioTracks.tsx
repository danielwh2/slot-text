import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

export const AudioTracks: React.FC = () => {
  return (
    <>
      {/* Background ambient music track across the entire video */}
      <Sequence from={0} durationInFrames={1200}>
        <Audio
          src={staticFile("ambient-soundtrack.wav")}
          volume={(f) => {
            // Smooth fade-in and fade-out
            if (f < 60) return (f / 60) * 0.7;
            if (f > 1130) return Math.max(0, ((1200 - f) / 70) * 0.7);
            return 0.7;
          }}
        />
      </Sequence>

      {/* Cinematic Transition Whooshes */}
      <Sequence from={0} durationInFrames={40}>
        <Audio src={staticFile("whoosh.wav")} volume={0.35} />
      </Sequence>
      <Sequence from={220} durationInFrames={40}>
        <Audio src={staticFile("whoosh.wav")} volume={0.4} />
      </Sequence>
      <Sequence from={520} durationInFrames={40}>
        <Audio src={staticFile("whoosh.wav")} volume={0.4} />
      </Sequence>
      <Sequence from={800} durationInFrames={40}>
        <Audio src={staticFile("whoosh.wav")} volume={0.4} />
      </Sequence>
      <Sequence from={1010} durationInFrames={40}>
        <Audio src={staticFile("whoosh.wav")} volume={0.45} />
      </Sequence>

      {/* Tactile Button Clicks */}
      {/* Scene 1 initial dummy comparison click */}
      <Sequence from={70} durationInFrames={15}>
        <Audio src={staticFile("click.wav")} volume={0.5} />
      </Sequence>

      {/* Scene 2 Hero interaction click */}
      <Sequence from={290} durationInFrames={15}>
        <Audio src={staticFile("click.wav")} volume={0.85} />
      </Sequence>

      {/* Hero roll flutter */}
      <Sequence from={292} durationInFrames={25}>
        <Audio src={staticFile("roll-flutter.wav")} volume={0.6} />
      </Sequence>

      {/* Hero chime when Copied settles */}
      <Sequence from={305} durationInFrames={60}>
        <Audio src={staticFile("chime.wav")} volume={0.5} />
      </Sequence>

      {/* Hero auto-revert flutter */}
      <Sequence from={400} durationInFrames={25}>
        <Audio src={staticFile("roll-flutter.wav")} volume={0.4} />
      </Sequence>

      {/* Hero spam clicks */}
      <Sequence from={445} durationInFrames={15}>
        <Audio src={staticFile("click.wav")} volume={0.8} />
      </Sequence>
      <Sequence from={458} durationInFrames={15}>
        <Audio src={staticFile("click.wav")} volume={0.8} />
      </Sequence>
      <Sequence from={460} durationInFrames={25}>
        <Audio src={staticFile("roll-flutter.wav")} volume={0.5} />
      </Sequence>

      {/* Scene 3 feature toggles */}
      <Sequence from={600} durationInFrames={15}>
        <Audio src={staticFile("click.wav")} volume={0.6} />
      </Sequence>
      <Sequence from={602} durationInFrames={25}>
        <Audio src={staticFile("roll-flutter.wav")} volume={0.5} />
      </Sequence>
      <Sequence from={680} durationInFrames={25}>
        <Audio src={staticFile("roll-flutter.wav")} volume={0.5} />
      </Sequence>

      {/* Scene 4 Framework tab switch clicks */}
      <Sequence from={870} durationInFrames={15}>
        <Audio src={staticFile("click.wav")} volume={0.5} />
      </Sequence>
      <Sequence from={920} durationInFrames={15}>
        <Audio src={staticFile("click.wav")} volume={0.5} />
      </Sequence>

      {/* Scene 5 Outro install copy button click & chime */}
      <Sequence from={1080} durationInFrames={15}>
        <Audio src={staticFile("click.wav")} volume={0.85} />
      </Sequence>
      <Sequence from={1082} durationInFrames={25}>
        <Audio src={staticFile("roll-flutter.wav")} volume={0.6} />
      </Sequence>
      <Sequence from={1095} durationInFrames={60}>
        <Audio src={staticFile("chime.wav")} volume={0.65} />
      </Sequence>
    </>
  );
};
