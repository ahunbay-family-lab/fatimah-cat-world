/** Celebration song with pre-recorded vocals and a cheerful melody. */

type LyricCue = {
  frame: number;
  text: string;
  file: string;
};

type MelodyNote = {
  freq: number;
  start: number;
  duration: number;
};

export const DANCE_LYRICS: LyricCue[] = [
  {
    frame: 0,
    text: "Jump up high, touch the sky!",
    file: "/sounds/song/line1.wav",
  },
  {
    frame: 55,
    text: "Gold is shining, clouds go by!",
    file: "/sounds/song/line2.wav",
  },
  {
    frame: 110,
    text: "Dodge those dogs, watch me fly!",
    file: "/sounds/song/line3.wav",
  },
  {
    frame: 165,
    text: "Cat runner star, meow hooray!",
    file: "/sounds/song/line4.wav",
  },
];

const CELEBRATION_MELODY: MelodyNote[] = [
  { freq: 392, start: 0.0, duration: 0.24 },
  { freq: 440, start: 0.26, duration: 0.24 },
  { freq: 494, start: 0.52, duration: 0.24 },
  { freq: 523, start: 0.78, duration: 0.32 },
  { freq: 494, start: 1.14, duration: 0.24 },
  { freq: 440, start: 1.4, duration: 0.24 },
  { freq: 392, start: 1.66, duration: 0.24 },
  { freq: 440, start: 1.92, duration: 0.24 },
  { freq: 494, start: 2.18, duration: 0.24 },
  { freq: 587, start: 2.44, duration: 0.24 },
  { freq: 523, start: 2.7, duration: 0.24 },
  { freq: 440, start: 2.96, duration: 0.36 },
];

let audioContext: AudioContext | null = null;
let lineBuffers = new Map<string, AudioBuffer>();
let loadPromise: Promise<void> | null = null;
let songSession = 0;

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

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function decodeAudio(url: string, ctx: AudioContext): Promise<AudioBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return ctx.decodeAudioData(arrayBuffer);
}

/** Preload celebration song vocals. Safe to call multiple times. */
export function loadDanceSong(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const entries = await Promise.all(
      DANCE_LYRICS.map(async (cue) => {
        const buffer = await decodeAudio(cue.file, ctx);
        return [cue.file, buffer] as const;
      }),
    );

    lineBuffers = new Map(entries);
  })();

  return loadPromise;
}

/** Backwards-compatible alias. */
export const loadDanceSongVoice = loadDanceSong;

function playLine(buffer: AudioBuffer, ctx: AudioContext) {
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.value = 0.96;

  source.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

function playCelebrationMelody(ctx: AudioContext) {
  const start = ctx.currentTime;

  for (const note of CELEBRATION_MELODY) {
    const lead = ctx.createOscillator();
    lead.type = "sine";

    const harmony = ctx.createOscillator();
    harmony.type = "triangle";

    const noteStart = start + note.start;
    const noteEnd = noteStart + note.duration;

    lead.frequency.setValueAtTime(note.freq, noteStart);
    harmony.frequency.setValueAtTime(note.freq * 0.75, noteStart);

    const leadGain = ctx.createGain();
    leadGain.gain.setValueAtTime(0.0001, noteStart);
    leadGain.gain.linearRampToValueAtTime(0.07, noteStart + 0.02);
    leadGain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

    const harmonyGain = ctx.createGain();
    harmonyGain.gain.setValueAtTime(0.0001, noteStart);
    harmonyGain.gain.linearRampToValueAtTime(0.03, noteStart + 0.02);
    harmonyGain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2600;

    lead.connect(filter);
    filter.connect(leadGain);
    harmony.connect(harmonyGain);
    leadGain.connect(ctx.destination);
    harmonyGain.connect(ctx.destination);

    lead.start(noteStart);
    harmony.start(noteStart);
    lead.stop(noteEnd + 0.02);
    harmony.stop(noteEnd + 0.02);
  }
}

/** Return the lyric line that should be shown during the dance. */
export function getDanceLyric(celebrationFrame: number): string {
  let line = DANCE_LYRICS[0]?.text ?? "";
  for (const cue of DANCE_LYRICS) {
    if (celebrationFrame >= cue.frame) {
      line = cue.text;
    }
  }
  return line;
}

/** Stop any in-progress dance song. */
export function stopDanceSong() {
  songSession += 1;
}

async function singCelebrationSong(session: number) {
  await loadDanceSong();
  if (session !== songSession) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const startedAt = performance.now();

  for (const cue of DANCE_LYRICS) {
    const targetMs = (cue.frame / 60) * 1000;
    const elapsedMs = performance.now() - startedAt;
    if (targetMs > elapsedMs) {
      await sleep(targetMs - elapsedMs);
    }
    if (session !== songSession) return;

    const buffer = lineBuffers.get(cue.file);
    if (buffer) {
      playLine(buffer, ctx);
    }
  }
}

/** Play the celebration song (melody + recorded vocals). */
export function playDanceSong() {
  const session = ++songSession;
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    void ctx.resume().then(() => playDanceSong());
    return;
  }

  if (lineBuffers.size === 0) {
    void loadDanceSong().then(() => playDanceSong());
    return;
  }

  playCelebrationMelody(ctx);
  void singCelebrationSong(session);
}
