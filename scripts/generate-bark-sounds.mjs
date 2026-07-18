/**
 * Generates short, realistic dog-bark WAV files (run once at build/dev time).
 * Usage: node scripts/generate-bark-sounds.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../public/sounds");
const SAMPLE_RATE = 44100;

function pinkNoise() {
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let b3 = 0;
  let b4 = 0;
  let b5 = 0;
  let b6 = 0;
  return () => {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    b6 = white * 0.115926;
    return pink * 0.11;
  };
}

function softClip(sample) {
  return Math.tanh(sample * 2.2) * 0.9;
}

function lowPass(prev, input, cutoffHz) {
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / SAMPLE_RATE;
  const alpha = dt / (rc + dt);
  return prev + alpha * (input - prev);
}

function generateBark({
  baseFreq = 280,
  duration = 0.2,
  noiseMix = 0.72,
  secondBark = true,
}) {
  const totalDuration = secondBark ? duration * 1.65 : duration;
  const sampleCount = Math.floor(SAMPLE_RATE * totalDuration);
  const samples = new Float32Array(sampleCount);
  const noise = pinkNoise();
  let phase = 0;
  let lpState = 0;

  function renderSyllable(startSample, syllableDuration, freqStart, freqEnd) {
    const endSample = Math.min(
      sampleCount,
      startSample + Math.floor(SAMPLE_RATE * syllableDuration),
    );
    for (let i = startSample; i < endSample; i++) {
      const t = (i - startSample) / SAMPLE_RATE;
      const progress = t / syllableDuration;

      const attack = 1 - Math.exp(-t * 350);
      const decay = Math.exp(-t * 14);
      const envelope = attack * decay;

      const freq = freqStart * Math.exp(-progress * 3.2) + freqEnd;
      phase += (Math.PI * 2 * freq) / SAMPLE_RATE;

      const fundamental = Math.sin(phase) * 0.22;
      const harmonic2 = Math.sin(phase * 2.05) * 0.14;
      const sub = Math.sin(phase * 0.5) * 0.08;

      const rawNoise = noise() * noiseMix;
      const cutoff = 900 + freq * 1.5;
      lpState = lowPass(lpState, rawNoise, cutoff);
      const rasp = lpState;

      const click = t < 0.006 ? (Math.random() * 2 - 1) * 0.45 : 0;
      const sample = softClip(
        (fundamental + harmonic2 + sub + rasp + click) * envelope,
      );
      samples[i] += sample;
    }
  }

  renderSyllable(0, duration, baseFreq + 160, baseFreq * 0.3);
  if (secondBark) {
    const gap = Math.floor(SAMPLE_RATE * 0.04);
    renderSyllable(
      Math.floor(SAMPLE_RATE * duration * 0.52) + gap,
      duration * 0.55,
      baseFreq * 0.78,
      baseFreq * 0.22,
    );
  }

  let peak = 0;
  for (const s of samples) peak = Math.max(peak, Math.abs(s));
  if (peak > 0) {
    for (let i = 0; i < samples.length; i++) {
      samples[i] = (samples[i] / peak) * 0.9;
    }
  }

  return samples;
}

function writeWav(filePath, samples) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (SAMPLE_RATE * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }

  fs.writeFileSync(filePath, buffer);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const variants = [
  { name: "bark1.wav", baseFreq: 310, duration: 0.19, noiseMix: 0.74 },
  { name: "bark2.wav", baseFreq: 250, duration: 0.22, noiseMix: 0.78, secondBark: true },
  { name: "bark3.wav", baseFreq: 340, duration: 0.16, noiseMix: 0.7, secondBark: false },
];

for (const variant of variants) {
  const samples = generateBark(variant);
  const outPath = path.join(OUT_DIR, variant.name);
  writeWav(outPath, samples);
  console.log(`Wrote ${outPath} (${samples.length} samples)`);
}
