type KnockKind = "normal" | "crit" | "milestone";

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  return audioCtx;
}

function noiseBurst(
  ctx: AudioContext,
  t: number,
  duration: number,
  volume: number,
) {
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 900;
  filter.Q.value = 0.6;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(t);
  src.stop(t + duration + 0.02);
}

function toneKnock(
  ctx: AudioContext,
  t: number,
  freq: number,
  volume: number,
  decay: number,
) {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(60, freq * 0.35), t + decay);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + decay + 0.04);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + decay + 0.06);
}

/** 木鱼敲击音（需用户点击后浏览器才允许发声） */
export function playWoodenFishKnock(kind: KnockKind = "normal") {
  const ctx = getCtx();
  if (!ctx) return;
  void ctx.resume().catch(() => {});

  const t = ctx.currentTime;
  if (kind === "milestone") {
    toneKnock(ctx, t, 523, 0.2, 0.18);
    toneKnock(ctx, t + 0.1, 659, 0.16, 0.22);
    toneKnock(ctx, t + 0.2, 784, 0.14, 0.28);
    noiseBurst(ctx, t + 0.05, 0.06, 0.08);
    return;
  }
  if (kind === "crit") {
    toneKnock(ctx, t, 280, 0.24, 0.1);
    toneKnock(ctx, t + 0.04, 420, 0.14, 0.08);
    noiseBurst(ctx, t, 0.05, 0.12);
    return;
  }
  toneKnock(ctx, t, 220, 0.26, 0.09);
  noiseBurst(ctx, t, 0.04, 0.1);
}
