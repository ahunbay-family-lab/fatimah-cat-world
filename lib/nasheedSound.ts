/** Soft looping instrumental nasheed for background music. */

const NASHEED_URL = "/sounds/nasheed.wav";
const NORMAL_VOLUME = 0.34;
const DUCKED_VOLUME = 0.08;
const CELEBRATION_VOLUME = 0.05;

let audioContext: AudioContext | null = null;
let nasheedBuffer: AudioBuffer | null = null;
let loadPromise: Promise<void> | null = null;
let source: AudioBufferSourceNode | null = null;
let gainNode: GainNode | null = null;
let duckTimeout: number | null = null;
let enabled = true;
let playing = false;

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

async function decodeNasheed(ctx: AudioContext): Promise<AudioBuffer> {
  const response = await fetch(NASHEED_URL);
  if (!response.ok) {
    throw new Error(`Failed to load ${NASHEED_URL}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return ctx.decodeAudioData(arrayBuffer);
}

function setGain(value: number, rampSeconds = 0.35) {
  const ctx = getAudioContext();
  if (!ctx || !gainNode) return;
  const now = ctx.currentTime;
  gainNode.gain.cancelScheduledValues(now);
  gainNode.gain.setValueAtTime(gainNode.gain.value, now);
  gainNode.gain.linearRampToValueAtTime(value, now + rampSeconds);
}

function startLoop() {
  const ctx = getAudioContext();
  if (!ctx || !nasheedBuffer || !enabled || playing) return;

  stopLoop(false);

  source = ctx.createBufferSource();
  source.buffer = nasheedBuffer;
  source.loop = true;

  gainNode = ctx.createGain();
  gainNode.gain.value = 0;

  source.connect(gainNode);
  gainNode.connect(ctx.destination);
  source.start();
  playing = true;
  setGain(NORMAL_VOLUME, 0.8);
}

function stopLoop(fadeOut = true) {
  if (!source || !gainNode) return;

  const activeSource = source;
  const activeGain = gainNode;
  source = null;
  gainNode = null;
  playing = false;

  if (fadeOut) {
    const ctx = getAudioContext();
    if (ctx) {
      const now = ctx.currentTime;
      activeGain.gain.cancelScheduledValues(now);
      activeGain.gain.setValueAtTime(activeGain.gain.value, now);
      activeGain.gain.linearRampToValueAtTime(0, now + 0.4);
    }
    window.setTimeout(() => {
      try {
        activeSource.stop();
      } catch {
        // Source may already be stopped.
      }
    }, 450);
    return;
  }

  try {
    activeSource.stop();
  } catch {
    // Source may already be stopped.
  }
}

/** Preload the nasheed audio file. */
export function loadNasheed(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    nasheedBuffer = await decodeNasheed(ctx);
  })();

  return loadPromise;
}

/** Whether background nasheed is turned on. */
export function isNasheedEnabled(): boolean {
  return enabled;
}

/** Turn background nasheed on or off. */
export function setNasheedEnabled(next: boolean) {
  enabled = next;
  if (!enabled) {
    stopLoop(true);
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    void ctx.resume().then(() => {
      if (enabled) void startNasheed();
    });
    return;
  }

  void startNasheed();
}

/** Start the looping nasheed if enabled. */
export async function startNasheed() {
  const ctx = getAudioContext();
  if (!ctx || !enabled) return;

  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  if (!nasheedBuffer) {
    await loadNasheed();
  }

  if (!enabled || !nasheedBuffer) return;
  startLoop();
}

/** Fade out and stop the nasheed. */
export function stopNasheed() {
  stopLoop(true);
}

/** Briefly lower nasheed volume when a bark plays. */
export function duckNasheedForBark() {
  if (!playing || !enabled || !gainNode) return;

  setGain(DUCKED_VOLUME, 0.08);

  if (duckTimeout !== null) {
    window.clearTimeout(duckTimeout);
  }

  duckTimeout = window.setTimeout(() => {
    duckTimeout = null;
    if (playing && enabled) {
      setGain(NORMAL_VOLUME, 0.25);
    }
  }, 650);
}

/** Lower nasheed during the celebration dance. */
export function softenNasheedForCelebration() {
  if (!playing || !enabled) return;
  setGain(CELEBRATION_VOLUME, 0.3);
}

/** Restore normal nasheed volume after celebration. */
export function restoreNasheedAfterCelebration() {
  if (!playing || !enabled) return;
  setGain(NORMAL_VOLUME, 0.4);
}

/** Unlock audio and prepare nasheed playback. */
export function unlockNasheedAudio() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  void loadNasheed();
}
