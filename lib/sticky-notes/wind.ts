import { createNoise3D } from 'simplex-noise';

export interface WindSampler {
  /** Returns horizontal wind velocity (pixels/s equivalent) at board position (x,y) and time t (ms) */
  sample(x: number, y: number, t: number): number;
}

/**
 * Creates a spatially-coherent, temporally-smooth wind field using 3-octave simplex noise.
 *
 * Layers:
 *   primary   — large slow sweeps across the board (changes over ~8s, ~1200px spatial scale)
 *   gust      — medium turbulence bursts (changes over ~2s, ~400px spatial scale)
 *   flutter   — high-freq micro-tremor on each note (changes over ~0.6s, local)
 *   envelope  — global amplitude modulator; creates calm spells between active periods
 */
export function createWindSampler(): WindSampler {
  // Each layer gets its own seeded noise function so they're independent
  const noisePrimary = createNoise3D(() => 0.3141);
  const noiseGust    = createNoise3D(() => 0.7182);
  const noiseFlutter = createNoise3D(() => 0.5773);
  const noiseEnv     = createNoise3D(() => 0.1618);

  return {
    sample(x: number, y: number, t: number): number {
      const ts = t / 1000; // seconds

      // --- Global envelope (calm / active spells, ~20–40s cycle) ---
      // rawEnv ∈ [-1, 1].  We shift so the envelope hits 0 when rawEnv < -0.30
      // (simplex noise is below -0.30 roughly 35% of the time → genuine still periods).
      // Then square it so the ramp from calm → windy feels gradual, not abrupt.
      const rawEnv = noiseEnv(ts * 0.018, 0, 0);
      const envelope = Math.pow(Math.max(0, rawEnv * 0.80 + 0.24), 2);

      if (envelope < 0.008) return 0; // dead calm — skip further sampling

      // --- Primary sweep (large spatial scale, slow time) ---
      const primary = noisePrimary(
        x * 0.00065,
        y * 0.00040,
        ts * 0.018,
      );

      // --- Gust layer (medium spatial, faster time) ---
      const gust = noiseGust(
        x * 0.0022,
        y * 0.0015,
        ts * 0.055,
      );

      // --- Flutter layer (small spatial, fast time — per-position micro-variation) ---
      const flutter = noiseFlutter(
        x * 0.0060,
        y * 0.0045,
        ts * 0.18,
      );

      // Weighted sum — primary dominates, flutter adds organic tremor
      const raw = primary * 0.60 + gust * 0.28 + flutter * 0.12;

      // Scale to a comfortable velocity range (–55 … +55 px/s equivalent)
      return raw * envelope * 55;
    },
  };
}
