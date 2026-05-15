/** Web Audio API sounds — no external files needed. */

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try { return new AudioContext(); } catch { return null; }
}

/** Gentle two-tone chime on mode transition. */
export function playChime(volume = 0.6): void {
  const ctx = getCtx();
  if (!ctx) return;

  const notes = [880, 660]; // A5 → E5
  notes.forEach((freq, i) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.value = freq;

    const t = ctx.currentTime + i * 0.18;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume * 0.7, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    osc.start(t);
    osc.stop(t + 0.6);
  });

  // Close context after last note fades
  setTimeout(() => ctx.close().catch(() => {}), 1400);
}

/** Subtle metronome tick for focus intervals. */
export function playTick(volume = 0.15): void {
  const ctx = getCtx();
  if (!ctx) return;

  const buf  = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.025), ctx.sampleRate);
  const data = buf.getChannelData(0);
  const tau  = Math.floor(ctx.sampleRate * 0.004);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / tau);
  }

  const src  = ctx.createBufferSource();
  src.buffer = buf;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  src.connect(gain);
  gain.connect(ctx.destination);
  src.start();
  src.onended = () => ctx.close().catch(() => {});
}
