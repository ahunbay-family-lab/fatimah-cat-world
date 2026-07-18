/** Dog bark sound effects using the Web Audio API (no audio files needed). */

let audioContext: AudioContext | null = null;
let lastBarkAt = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    audioContext = new AudioCtx();
  }
  return audioContext;
}

/** Call on the first tap / key press so the browser allows sound. */
export function unlockAudio() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
}

function playNoiseBurst(
  ctx: AudioContext,
  startTime: number,
  duration: number,
  frequency: number,
  gainValue: number,
) {
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const fade = 1 - i / bufferSize;
    data[i] = (Math.random() * 2 - 1) * fade;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = frequency;
  filter.Q.value = 1.2;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(gainValue, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(startTime);
  source.stop(startTime + duration);
}

function playTone(
  ctx: AudioContext,
  startTime: number,
  duration: number,
  frequency: number,
  gainValue: number,
) {
  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(frequency, startTime);
  osc.frequency.exponentialRampToValueAtTime(frequency * 0.6, startTime + duration);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(gainValue, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

/** Play a short “woof / bark” if enough time has passed since the last one. */
export function playDogBark(force = false) {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    void ctx.resume().then(() => playDogBark(force));
    return;
  }

  const now = performance.now();
  if (!force && now - lastBarkAt < 420) return;
  lastBarkAt = now;

  const t = ctx.currentTime;
  const pitch = 0.85 + Math.random() * 0.35;

  // Two-part bark: “ruff” then a shorter follow-up
  playNoiseBurst(ctx, t, 0.12, 700 * pitch, 0.35);
  playTone(ctx, t, 0.1, 180 * pitch, 0.18);
  playNoiseBurst(ctx, t + 0.1, 0.09, 520 * pitch, 0.28);
  playTone(ctx, t + 0.1, 0.08, 140 * pitch, 0.12);
}
