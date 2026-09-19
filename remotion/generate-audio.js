// Generates high quality 16-bit PCM WAV audio for the slot-text promo video
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIO_DIR = path.join(__dirname, "audio");

if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

function writeWavFile(filename, leftChannel, rightChannel = leftChannel, sampleRate = 44100) {
  const numChannels = 2;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const numSamples = leftChannel.length;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // PCM chunk size
  buffer.writeUInt16LE(1, 20); // Linear PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // 16 bits
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const left = Math.max(-1, Math.min(1, leftChannel[i]));
    const right = Math.max(-1, Math.min(1, rightChannel[i]));
    buffer.writeInt16LE(Math.floor(left < 0 ? left * 32768 : left * 32767), offset);
    buffer.writeInt16LE(Math.floor(right < 0 ? right * 32768 : right * 32767), offset + 2);
    offset += 4;
  }

  const filePath = path.join(AUDIO_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  console.log(`Generated ${filename} (${(dataSize / 1024).toFixed(1)} KB)`);
}

const SAMPLE_RATE = 44100;

// 1. Tactile Click Sound (Crisp, snappy mechanical thock with high-frequency tick and low-end body)
function generateClick() {
  const duration = 0.045; // 45ms
  const length = Math.floor(SAMPLE_RATE * duration);
  const left = new Float32Array(length);
  const right = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const t = i / SAMPLE_RATE;
    // initial snap: high passed transient
    const transient = (Math.random() * 2 - 1) * Math.exp(-t * 800) * 0.7;
    // body: pitched sine drop from 280Hz to 80Hz
    const pitch = 80 + 200 * Math.exp(-t * 300);
    const body = Math.sin(2 * Math.PI * pitch * t) * Math.exp(-t * 120) * 0.6;
    // resonant click
    const resonance = Math.sin(2 * Math.PI * 1400 * t) * Math.exp(-t * 500) * 0.25;

    const sample = (transient + body + resonance) * 0.85;
    left[i] = sample;
    right[i] = sample * 0.95;
  }
  writeWavFile("click.wav", left, right);
}

// 2. Slot Roll Tick Flutter (A sequence of 5 tiny soft mechanical gear ticks)
function generateRollFlutter() {
  const duration = 0.35; // 350ms
  const length = Math.floor(SAMPLE_RATE * duration);
  const left = new Float32Array(length);
  const right = new Float32Array(length);

  const tickInterval = 0.045; // every 45ms
  for (let tick = 0; tick < 7; tick++) {
    const startSample = Math.floor(tick * tickInterval * SAMPLE_RATE);
    const tickFreq = 1600 + tick * 180;
    for (let i = 0; i < 400 && startSample + i < length; i++) {
      const idx = startSample + i;
      const t = i / SAMPLE_RATE;
      const s = Math.sin(2 * Math.PI * tickFreq * t) * Math.exp(-t * 600) * 0.28;
      left[idx] += s * (0.8 + 0.3 * (tick % 2));
      right[idx] += s * (1.1 - 0.3 * (tick % 2));
    }
  }
  writeWavFile("roll-flutter.wav", left, right);
}

// 3. Ethereal Chime / Sparkle (A harmonic major chord shimmer)
function generateChime() {
  const duration = 1.2;
  const length = Math.floor(SAMPLE_RATE * duration);
  const left = new Float32Array(length);
  const right = new Float32Array(length);

  // E, G#, B, D#, F# (Emaj9)
  const freqs = [659.25, 830.61, 987.77, 1244.51, 1479.98];

  for (let i = 0; i < length; i++) {
    const t = i / SAMPLE_RATE;
    let sL = 0;
    let sR = 0;
    freqs.forEach((freq, fIdx) => {
      const delay = fIdx * 0.035;
      if (t >= delay) {
        const localT = t - delay;
        const env = Math.exp(-localT * 3.2);
        const osc = Math.sin(2 * Math.PI * freq * localT) + 0.3 * Math.sin(4 * Math.PI * freq * localT);
        const pan = (fIdx / (freqs.length - 1)) * 0.6 + 0.2; // spread across stereo
        sL += osc * env * (1 - pan) * 0.18;
        sR += osc * env * pan * 0.18;
      }
    });
    left[i] = sL;
    right[i] = sR;
  }
  writeWavFile("chime.wav", left, right);
}

// 4. Smooth cinematic transition whoosh (filtered pink noise sweep)
function generateWhoosh() {
  const duration = 0.65;
  const length = Math.floor(SAMPLE_RATE * duration);
  const left = new Float32Array(length);
  const right = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / duration;
    // Bell curve envelope peaking at 40%
    const env = Math.sin(Math.PI * Math.pow(progress, 0.8));
    const noise = Math.random() * 2 - 1;
    // Swept resonance
    const centerFreq = 300 + 1800 * Math.sin(Math.PI * progress);
    const osc = Math.sin(2 * Math.PI * centerFreq * t) * 0.2;
    const sample = (noise * 0.4 + osc) * env * 0.45;
    // Stereo movement from left to right
    left[i] = sample * (1.1 - progress * 0.6);
    right[i] = sample * (0.5 + progress * 0.6);
  }
  writeWavFile("whoosh.wav", left, right);
}

// 5. Cinematic Ambient Soundtrack (20 seconds, 1200 frames @ 60fps)
// A sleek, minimal, premium electronic ambient track:
// - Deep warm analog bass pulse (808-style)
// - Lush floating synthesizer chord pads (F minor / Ab major / Eb)
// - Subtle high-end tactile percussion clock ticks
// - Dynamic build-up and payoff
function generateSoundtrack() {
  const duration = 20.2; // 20.2 seconds
  const length = Math.floor(SAMPLE_RATE * duration);
  const left = new Float32Array(length);
  const right = new Float32Array(length);

  // 120 BPM: 1 beat = 0.5s, 1 bar = 2.0s
  const beatDuration = 0.5;

  // Chord progression (root frequencies):
  // Bar 0-2 (0-4s): F min7 (F3, Ab3, C4, Eb4)
  // Bar 2-4 (4-8s): Db maj7 (Db3, F3, Ab3, C4)
  // Bar 4-6 (8-12s): Bb min9 (Bb2, Db3, F3, Ab3, C4)
  // Bar 6-8 (12-16s): Eb sus4 -> Eb maj (Eb3, Ab3/G3, Bb3, Eb4)
  // Bar 8-10 (16-20s): Ab maj9 / F min (Ab2, C3, Eb3, G3, Bb3)
  const chordProgression = [
    { start: 0, end: 4, freqs: [174.61, 207.65, 261.63, 311.13, 349.23], bass: 87.31 },
    { start: 4, end: 8, freqs: [138.59, 174.61, 207.65, 261.63, 329.63], bass: 69.30 },
    { start: 8, end: 12, freqs: [116.54, 138.59, 174.61, 207.65, 261.63], bass: 58.27 },
    { start: 12, end: 16, freqs: [155.56, 196.00, 233.08, 311.13, 392.00], bass: 77.78 },
    { start: 16, end: 20.2, freqs: [207.65, 261.63, 311.13, 392.00, 466.16], bass: 103.83 },
  ];

  for (let i = 0; i < length; i++) {
    const t = i / SAMPLE_RATE;

    // Master fade in (0-1.5s) and fade out (18.5-20.2s)
    let masterEnv = 1.0;
    if (t < 1.5) masterEnv = t / 1.5;
    else if (t > 18.5) masterEnv = Math.max(0, 1 - (t - 18.5) / 1.7);

    // Find active chord
    const chord = chordProgression.find((c) => t >= c.start && t < c.end) || chordProgression[0];

    // 1. Synth Pad: soft detuned supersaw / sine pad
    let padL = 0;
    let padR = 0;
    chord.freqs.forEach((baseFreq, idx) => {
      // Detuned pair for lush chorus
      const detune = 1.0025;
      const osc1 = Math.sin(2 * Math.PI * baseFreq * t);
      const osc2 = Math.sin(2 * Math.PI * (baseFreq * detune) * t);
      const sub = 0.5 * Math.sin(2 * Math.PI * (baseFreq * 0.5) * t);
      const warmth = (osc1 + osc2 + sub) * 0.035;

      const pan = (idx / (chord.freqs.length - 1)) * 0.7 + 0.15;
      padL += warmth * (1 - pan);
      padR += warmth * pan;
    });

    // 2. Bass Pulse: soft warm 808-style sine on every downbeat (every 1s or 0.5s)
    const beatTime = t % beatDuration;
    const isQuarterNote = Math.floor(t / beatDuration) % 2 === 0;
    const bassEnv = Math.exp(-beatTime * 7.0);
    const bassPitch = chord.bass * (1 + 0.5 * Math.exp(-beatTime * 40));
    const bassSample = Math.sin(2 * Math.PI * bassPitch * t) * bassEnv * 0.22;

    // 3. Tactile Clock Tick (subtle 16th-note rhythm giving modern tech pace)
    const sixteenthTime = t % (beatDuration / 4);
    const sixteenthEnv = Math.exp(-sixteenthTime * 450);
    const tickSample = (Math.random() * 2 - 1) * sixteenthEnv * 0.04;

    // 4. Subtle Shimmer Arpeggio (pentatonic bells floating gently after 4s)
    let arpL = 0;
    let arpR = 0;
    if (t > 4.0) {
      const arpStep = Math.floor((t - 4.0) / 0.25) % chord.freqs.length;
      const arpFreq = chord.freqs[arpStep] * 2; // an octave higher
      const arpTime = (t - 4.0) % 0.25;
      const arpEnv = Math.exp(-arpTime * 12.0) * 0.06;
      const arpOsc = Math.sin(2 * Math.PI * arpFreq * t);
      arpL = arpOsc * arpEnv * (arpStep % 2 === 0 ? 0.9 : 0.3);
      arpR = arpOsc * arpEnv * (arpStep % 2 === 0 ? 0.3 : 0.9);
    }

    const mixedL = (padL + bassSample + tickSample + arpL) * masterEnv;
    const mixedR = (padR + bassSample + tickSample + arpR) * masterEnv;

    left[i] = mixedL;
    right[i] = mixedR;
  }

  writeWavFile("ambient-soundtrack.wav", left, right);
}

console.log("Generating audio assets...");
generateClick();
generateRollFlutter();
generateChime();
generateWhoosh();
generateSoundtrack();
console.log("Audio assets generated successfully!");
