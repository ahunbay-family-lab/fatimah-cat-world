/** Realistic cat meow using the Web Audio API. */

let audioContext: AudioContext | null = null;

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

/** Play a realistic "meow" sound. */
export function speakMeow() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    void ctx.resume().then(() => speakMeow());
    return;
  }

  const t = ctx.currentTime;
  const duration = 0.55;

  // Main meow tone — starts high, slides down like a real cat
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(720, t);
  osc.frequency.exponentialRampToValueAtTime(520, t + 0.08);
  osc.frequency.exponentialRampToValueAtTime(310, t + 0.32);
  osc.frequency.exponentialRampToValueAtTime(220, t + duration);

  // Soft harmonic layer
  const osc2 = ctx.createOscillator();
  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(480, t);
  osc2.frequency.exponentialRampToValueAtTime(260, t + duration);

  // Vibrato for a natural cat voice
  const vibrato = ctx.createOscillator();
  vibrato.frequency.value = 28;
  const vibratoGain = ctx.createGain();
  vibratoGain.gain.value = 18;
  vibrato.connect(vibratoGain);
  vibratoGain.connect(osc.frequency);

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(900, t);
  filter.frequency.exponentialRampToValueAtTime(500, t + duration);
  filter.Q.value = 1.2;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, t);
  gain.gain.linearRampToValueAtTime(0.28, t + 0.04);
  gain.gain.linearRampToValueAtTime(0.22, t + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.001, t);
  gain2.gain.linearRampToValueAtTime(0.1, t + 0.05);
  gain2.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.85);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);

  vibrato.start(t);
  osc.start(t);
  osc2.start(t);
  vibrato.stop(t + duration);
  osc.stop(t + duration);
  osc2.stop(t + duration);
}
