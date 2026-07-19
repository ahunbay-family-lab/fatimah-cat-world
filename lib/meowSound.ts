/** Real cat meow sounds — recorded meow audio clips (CC0). */

let audioContext: AudioContext | null = null;
let meowBuffers: AudioBuffer[] = [];
let loadPromise: Promise<void> | null = null;

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

async function decodeMeow(url: string, ctx: AudioContext): Promise<AudioBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return ctx.decodeAudioData(arrayBuffer);
}

/** Preload real meow WAV files. Safe to call multiple times. */
export function loadMeowSounds(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const urls = [
      "/sounds/meow1.wav",
      "/sounds/meow2.wav",
      "/sounds/meow3.wav",
      "/sounds/meow4.wav",
    ];
    meowBuffers = await Promise.all(urls.map((url) => decodeMeow(url, ctx)));
  })();

  return loadPromise;
}

/** Play a realistic cat meow. */
export function playMeow() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    void ctx.resume().then(() => playMeow());
    return;
  }

  if (meowBuffers.length === 0) {
    void loadMeowSounds().then(() => playMeow());
    return;
  }

  const buffer =
    meowBuffers[Math.floor(Math.random() * meowBuffers.length)] ??
    meowBuffers[0];

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.value = 1;

  const warmth = ctx.createBiquadFilter();
  warmth.type = "peaking";
  warmth.frequency.value = 720;
  warmth.Q.value = 0.9;
  warmth.gain.value = 2.5;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 9000;

  source.playbackRate.value = 0.99 + Math.random() * 0.03;

  source.connect(warmth);
  warmth.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

/** Backwards-compatible alias used by older imports. */
export const speakMeow = playMeow;
