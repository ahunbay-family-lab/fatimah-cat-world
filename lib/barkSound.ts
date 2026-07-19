/** Dog bark sounds — real recorded woof audio clips. */

let audioContext: AudioContext | null = null;
let barkBuffers: AudioBuffer[] = [];
let loadPromise: Promise<void> | null = null;
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

async function decodeBark(url: string, ctx: AudioContext): Promise<AudioBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return ctx.decodeAudioData(arrayBuffer);
}

/** Preload real bark WAV files. Safe to call multiple times. */
export function loadBarkSounds(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const urls = [
      "/sounds/bark1.wav",
      "/sounds/bark2.wav",
      "/sounds/bark3.wav",
      "/sounds/woof-woof.wav",
    ];
    barkBuffers = await Promise.all(urls.map((url) => decodeBark(url, ctx)));
  })();

  return loadPromise;
}

/** Call on the first tap / key press so the browser allows sound. */
export function unlockAudio() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  void loadBarkSounds();
}

/** Play a realistic dog bark / woof-woof. */
export function playDogBark(force = false) {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    void ctx.resume().then(() => playDogBark(force));
    return;
  }

  if (barkBuffers.length === 0) {
    void loadBarkSounds().then(() => playDogBark(force));
    return;
  }

  const now = performance.now();
  if (!force && now - lastBarkAt < 450) return;
  lastBarkAt = now;

  const singleBarks = barkBuffers.slice(0, 3);
  const woofWoof = barkBuffers[3];
  const useDoubleWoof = Math.random() < 0.5 && woofWoof;
  const buffer = useDoubleWoof
    ? woofWoof
    : singleBarks[Math.floor(Math.random() * singleBarks.length)] ?? barkBuffers[0];

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.value = 0.85;

  // Tiny pitch shift for variety without sounding beepy
  source.playbackRate.value = 0.96 + Math.random() * 0.08;

  source.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}
