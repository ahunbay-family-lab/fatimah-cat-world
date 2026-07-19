/** Short robot dance song for the 200-point celebration. */

type LyricCue = {
  frame: number;
  text: string;
  pitch: number;
};

type MelodyNote = {
  freq: number;
  start: number;
  duration: number;
};

export const DANCE_LYRICS: LyricCue[] = [
  { frame: 0, text: "I'm a cat bot!", pitch: 1.24 },
  { frame: 50, text: "Step left, step right!", pitch: 1.18 },
  { frame: 100, text: "Pop and lock!", pitch: 1.2 },
  { frame: 150, text: "Meow meow, alright!", pitch: 1.22 },
];

const ROBOT_MELODY: MelodyNote[] = [
  { freq: 392, start: 0, duration: 0.14 },
  { freq: 392, start: 0.16, duration: 0.14 },
  { freq: 523, start: 0.32, duration: 0.14 },
  { freq: 523, start: 0.48, duration: 0.14 },
  { freq: 587, start: 0.64, duration: 0.14 },
  { freq: 587, start: 0.8, duration: 0.14 },
  { freq: 523, start: 0.96, duration: 0.18 },
  { freq: 494, start: 1.2, duration: 0.14 },
  { freq: 494, start: 1.36, duration: 0.14 },
  { freq: 440, start: 1.52, duration: 0.14 },
  { freq: 440, start: 1.68, duration: 0.14 },
  { freq: 392, start: 1.84, duration: 0.28 },
];

const PREFERRED_VOICES = [
  "Samantha",
  "Karen",
  "Victoria",
  "Google US English",
  "Microsoft Zira",
  "Fiona",
  "Tessa",
  "Moira",
  "Google UK English Female",
];

let audioContext: AudioContext | null = null;
let songSession = 0;
let singVoice: SpeechSynthesisVoice | null = null;
let voicesReady: Promise<void> | null = null;

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

function pickSingVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;

  const voices = window.speechSynthesis.getVoices();
  for (const preferred of PREFERRED_VOICES) {
    const match = voices.find(
      (voice) => voice.name.includes(preferred) && voice.lang.startsWith("en"),
    );
    if (match) return match;
  }

  return (
    voices.find((voice) => voice.lang.startsWith("en") && voice.localService) ??
    voices.find((voice) => voice.lang.startsWith("en")) ??
    null
  );
}

/** Warm up speech voices so the first lyric sounds clear. */
export function loadDanceSongVoice(): Promise<void> {
  if (voicesReady) return voicesReady;

  voicesReady = new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }

    const refreshVoice = () => {
      singVoice = pickSingVoice();
    };

    refreshVoice();
    if (window.speechSynthesis.getVoices().length > 0) {
      resolve();
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
      refreshVoice();
      resolve();
    };
    window.setTimeout(() => {
      refreshVoice();
      resolve();
    }, 300);
  });

  return voicesReady;
}

function speakSongLine(text: string, pitch: number): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = singVoice ?? pickSingVoice();
    utterance.lang = utterance.voice?.lang ?? "en-US";
    utterance.pitch = pitch;
    utterance.rate = 0.92;
    utterance.volume = 1;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

function playRobotMelody(ctx: AudioContext) {
  const start = ctx.currentTime;

  for (const note of ROBOT_MELODY) {
    const osc = ctx.createOscillator();
    osc.type = "triangle";

    const gain = ctx.createGain();
    const noteStart = start + note.start;
    const noteEnd = noteStart + note.duration;

    osc.frequency.setValueAtTime(note.freq, noteStart);
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.linearRampToValueAtTime(0.045, noteStart + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2200;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteStart);
    osc.stop(noteEnd + 0.02);
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

/** Stop any in-progress dance song vocals. */
export function stopDanceSong() {
  songSession += 1;
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

async function singDanceSong(session: number) {
  await loadDanceSongVoice();
  if (session !== songSession) return;

  const startedAt = performance.now();

  for (const cue of DANCE_LYRICS) {
    const targetMs = (cue.frame / 60) * 1000;
    const elapsedMs = performance.now() - startedAt;
    if (targetMs > elapsedMs) {
      await sleep(targetMs - elapsedMs);
    }
    if (session !== songSession) return;
    await speakSongLine(cue.text, cue.pitch);
  }
}

/** Play the short robot dance song (soft melody + clear sung lyrics). */
export function playDanceSong() {
  const session = ++songSession;
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    void ctx.resume().then(() => playDanceSong());
    return;
  }

  playRobotMelody(ctx);
  void singDanceSong(session);
}
