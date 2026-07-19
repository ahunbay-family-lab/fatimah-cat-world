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

function scheduleMeowPitch(
  oscillator: OscillatorNode,
  startTime: number,
  duration: number,
) {
  const t = startTime;
  oscillator.frequency.setValueAtTime(380, t);
  oscillator.frequency.linearRampToValueAtTime(620, t + 0.09);
  oscillator.frequency.linearRampToValueAtTime(760, t + 0.17);
  oscillator.frequency.exponentialRampToValueAtTime(540, t + 0.3);
  oscillator.frequency.exponentialRampToValueAtTime(260, t + duration);
}

function createFormant(
  ctx: AudioContext,
  frequency: number,
  q: number,
  gainValue: number,
) {
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = frequency;
  filter.Q.value = q;

  const gain = ctx.createGain();
  gain.gain.value = gainValue;

  filter.connect(gain);
  return { filter, gain };
}

/** Play a clear, realistic "meow" sound. */
export function speakMeow() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    void ctx.resume().then(() => speakMeow());
    return;
  }

  const t = ctx.currentTime;
  const duration = 0.62;

  const voice = ctx.createOscillator();
  voice.type = "triangle";
  scheduleMeowPitch(voice, t, duration);

  const harmonic = ctx.createOscillator();
  harmonic.type = "sine";
  scheduleMeowPitch(harmonic, t, duration);
  harmonic.detune.value = 6;

  const vibrato = ctx.createOscillator();
  vibrato.frequency.value = 5.5;
  const vibratoDepth = ctx.createGain();
  vibratoDepth.gain.value = 9;
  vibrato.connect(vibratoDepth);
  vibratoDepth.connect(voice.frequency);
  vibratoDepth.connect(harmonic.frequency);

  const f1 = createFormant(ctx, 560, 6, 0.55);
  const f2 = createFormant(ctx, 1180, 9, 0.34);
  const f3 = createFormant(ctx, 2280, 11, 0.16);

  f1.filter.frequency.setValueAtTime(520, t);
  f1.filter.frequency.linearRampToValueAtTime(700, t + 0.16);
  f1.filter.frequency.exponentialRampToValueAtTime(420, t + duration);

  f2.filter.frequency.setValueAtTime(980, t);
  f2.filter.frequency.linearRampToValueAtTime(1320, t + 0.16);
  f2.filter.frequency.exponentialRampToValueAtTime(760, t + duration);

  const voiceMix = ctx.createGain();
  voiceMix.gain.setValueAtTime(0.001, t);
  voiceMix.gain.linearRampToValueAtTime(0.42, t + 0.05);
  voiceMix.gain.linearRampToValueAtTime(0.38, t + 0.18);
  voiceMix.gain.exponentialRampToValueAtTime(0.001, t + duration);

  const harmonicMix = ctx.createGain();
  harmonicMix.gain.setValueAtTime(0.001, t);
  harmonicMix.gain.linearRampToValueAtTime(0.18, t + 0.06);
  harmonicMix.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.92);

  voice.connect(f1.filter);
  voice.connect(f2.filter);
  voice.connect(f3.filter);

  const formantBus = ctx.createGain();
  formantBus.gain.value = 1;
  f1.gain.connect(formantBus);
  f2.gain.connect(formantBus);
  f3.gain.connect(formantBus);
  formantBus.connect(voiceMix);

  harmonic.connect(harmonicMix);

  const noiseBuffer = ctx.createBuffer(
    1,
    Math.floor(ctx.sampleRate * 0.1),
    ctx.sampleRate,
  );
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseData.length; i += 1) {
    const fade = 1 - i / noiseData.length;
    noiseData[i] = (Math.random() * 2 - 1) * fade * fade;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 420;
  noiseFilter.Q.value = 2.4;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.001, t);
  noiseGain.gain.linearRampToValueAtTime(0.14, t + 0.02);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 200;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.setValueAtTime(3600, t);
  lowpass.frequency.exponentialRampToValueAtTime(2200, t + duration);
  lowpass.Q.value = 0.8;

  const master = ctx.createGain();
  master.gain.value = 0.95;

  voiceMix.connect(highpass);
  harmonicMix.connect(highpass);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(highpass);
  highpass.connect(lowpass);
  lowpass.connect(master);
  master.connect(ctx.destination);

  vibrato.start(t);
  voice.start(t);
  harmonic.start(t);
  noise.start(t);
  vibrato.stop(t + duration);
  voice.stop(t + duration);
  harmonic.stop(t + duration);
  noise.stop(t + 0.1);
}
