/**
 * Short timer-expiry chime via the Web Audio API. Replaces a remote MP3 fetch so
 * the alert works offline, has no latency, and leaks nothing to a third-party CDN.
 * The AudioContext is created lazily and reused across plays.
 */
let audioCtx: AudioContext | null = null;

const CHIME_FREQ_HZ = 880;
const CHIME_PEAK_GAIN = 0.15;
const CHIME_DURATION_S = 0.4;

export const playTimerChime = (): void => {
  try {
    audioCtx ??= new AudioContext();
    const ctx = audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = CHIME_FREQ_HZ;
    gain.gain.setValueAtTime(CHIME_PEAK_GAIN, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + CHIME_DURATION_S);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + CHIME_DURATION_S);
  } catch {
    // Audio unavailable (e.g. autoplay policy before any user gesture) — silent is fine.
  }
};
