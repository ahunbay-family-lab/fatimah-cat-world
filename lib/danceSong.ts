/** Short robot dance song for the 200-point celebration. */

type LyricCue = {
  frame: number;
  text: string;
};

type MelodyNote = {
  freq: number;
  start: number;
  duration: number;
};

export const DANCE_LYRICS: LyricCue[] = [
  { frame: 0, text: "I'm a cat bot!" },
  { frame: 50, text: "Step left, step right!" },
  { frame: 100, text: "Pop and lock!" },
  { frame: 150, text: "Meow meow — alright!" },
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

let audioContext: AudioContext | null = null;
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

function speakRobotLine(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.05;
  utterance.pitch = 0.72;
  utterance.volume = 0.95;
  window.speechSynthesis.speak(utterance);
}

function playRobotMelody(ctx: AudioContext) {
  const start = ctx.currentTime;

  for (const note of ROBOT_MELODY) {
    const osc = ctx.createOscillator();
    osc.type = "square";

    const gain = ctx.createGain();
    const noteStart = start + note.start;
    const noteEnd = noteStart + note.duration;

    osc.frequency.setValueAtTime(note.freq, noteStart);
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.linearRampToValueAtTime(0.09, noteStart + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1800;

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

/** Play the short robot dance song (beeps + sung lyrics). */
export function playDanceSong() {
  const session = ++songSession;
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    void ctx.resume().then(() => playDanceSong());
    return;
  }

  playRobotMelody(ctx);

  for (const cue of DANCE_LYRICS) {
    window.setTimeout(() => {
      if (session !== songSession) return;
      speakRobotLine(cue.text);
    }, (cue.frame / 60) * 1000);
  }
}
