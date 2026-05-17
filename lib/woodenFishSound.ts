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

/** 短促清脆的敲击瞬态（模仿木鱼开口处的「咔」） */
function woodClick(
  ctx: AudioContext,
  t: number,
  volume: number,
  centerHz: number,
) {
  const bufferSize = Math.max(64, Math.floor(ctx.sampleRate * 0.018));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const env = 1 - i / bufferSize;
    data[i] = (Math.random() * 2 - 1) * env * env;
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = centerHz;
  bp.Q.value = 1.8;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 600;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
  src.connect(bp);
  bp.connect(hp);
  hp.connect(gain);
  gain.connect(ctx.destination);
  src.start(t);
  src.stop(t + 0.03);
}

/** 空心木腔的短共振 */
function woodResonance(
  ctx: AudioContext,
  t: number,
  freq: number,
  volume: number,
  decay: number,
) {
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(freq * 1.08, t);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.92, t + decay);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.001, t + decay);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = freq;
  bp.Q.value = 4;
  osc.connect(bp);
  bp.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + decay + 0.02);
}

function playCrispWoodKnock(
  ctx: AudioContext,
  t: number,
  intensity: number,
) {
  const vol = 0.22 * intensity;
  woodClick(ctx, t, vol * 1.35, 2400 + intensity * 400);
  woodResonance(ctx, t, 1280, vol * 0.85, 0.055);
  woodResonance(ctx, t + 0.006, 1860, vol * 0.55, 0.04);
  woodResonance(ctx, t + 0.01, 920, vol * 0.25, 0.035);
}

/** 木鱼敲击音（需用户点击后浏览器才允许发声） */
export function playWoodenFishKnock(kind: KnockKind = "normal") {
  const ctx = getCtx();
  if (!ctx) return;
  void ctx.resume().catch(() => {});

  const t = ctx.currentTime;

  if (kind === "milestone") {
    woodResonance(ctx, t, 1046, 0.12, 0.2);
    woodResonance(ctx, t + 0.12, 1318, 0.1, 0.24);
    woodResonance(ctx, t + 0.24, 1568, 0.08, 0.28);
    playCrispWoodKnock(ctx, t + 0.08, 0.7);
    return;
  }

  if (kind === "crit") {
    playCrispWoodKnock(ctx, t, 1.15);
    playCrispWoodKnock(ctx, t + 0.055, 0.85);
    return;
  }

  playCrispWoodKnock(ctx, t, 1);
}
