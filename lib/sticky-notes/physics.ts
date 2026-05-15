/**
 * Dimensionless game-physics pendulum for sticky notes.
 *
 * Previous implementation used real-world SI units (kg, m/s², etc.) which made
 * drag forces ~4.9×10⁻¹⁰ degrees per frame — visually zero. This version uses
 * purely tuned constants in "game units" so results are always visible.
 *
 * Model:
 *   - Note is a plate pivoting from its top-centre (the implied hang point).
 *   - Wind applies a torque → spring restores to θ=0 → damping prevents runaway.
 *   - fixedAngle (user tilt) is applied as a display offset in the card, not here.
 *
 * Equilibrium derivation (dimensionless):
 *   tau_wind = windVel × widthFactor × heightFactor × WIND_SCALE
 *   At rest: tau_wind = SPRING_K × θ_eq
 *   → θ_eq = tau_wind / SPRING_K
 *
 *   At average wind (~22 units) on a 200×200 note:
 *     τ = 22 × 1 × 1 × 0.040 = 0.88
 *     θ_eq = 0.88 / 14 = 0.063 rad ≈ 3.6°   (subtle, enjoyable)
 *
 *   At max wind (~55 units) on a 300×300 note:
 *     τ = 55 × 1.5 × 1.5 × 0.040 = 4.95
 *     θ_eq = 4.95 / 14 = 0.354 rad ≈ 20°   (capped at MAX_ANGLE)
 */

const SPRING_K   = 14;    // restoring spring stiffness
const DAMPING    = 4.2;   // viscous damping (underdamped — slight oscillation)
const WIND_SCALE = 0.040; // wind-to-torque scale (tuned for subtlety)
const MAX_ANGLE  = 0.36;  // hard cap ≈ 20°
const MAX_OMEGA  = 2.4;   // rad/s velocity cap

export interface NotePhysicsState {
  angle: number;       // radians
  angularVel: number;  // rad/s
}

export interface NotePhysicsInputs {
  windVelocity: number; // from wind sampler (–55 … +55 nominal)
  width: number;        // px
  height: number;       // px
}

export function createInitialPhysicsState(): NotePhysicsState {
  return { angle: 0, angularVel: 0 };
}

/**
 * One Euler step. Returns a new state; input is not mutated.
 * dt should be capped at ~0.05s (caller's responsibility).
 */
export function integrateNote(
  state: NotePhysicsState,
  { windVelocity, width, height }: NotePhysicsInputs,
  dt: number,
): NotePhysicsState {
  const { angle, angularVel } = state;

  // Sleep: if wind is gone and the note has almost settled, skip integration entirely.
  // Prevents endless micro-oscillation during calm spells.
  if (
    Math.abs(windVelocity) < 0.6 &&
    Math.abs(angle) < 0.0015 &&
    Math.abs(angularVel) < 0.0015
  ) {
    return { angle: 0, angularVel: 0 };
  }

  // Normalised size factors (baseline 200×200px)
  const wf = width  / 200;
  const hf = height / 200;

  // Effective inertia — larger notes are harder to spin, feel heavier
  const I = 0.85 + 0.50 * wf * hf;

  // Wind torque — proportional to exposed area and note height (pendulum arm)
  const tau_wind = windVelocity * wf * hf * WIND_SCALE;

  // Restoring spring (pulls back to 0°)
  const tau_restore = -SPRING_K * angle;

  // Viscous damping
  const tau_damp = -DAMPING * angularVel;

  // Semi-implicit Euler: update velocity first, then position
  let omega = angularVel + ((tau_wind + tau_restore + tau_damp) / I) * dt;
  omega = Math.max(-MAX_OMEGA, Math.min(MAX_OMEGA, omega));

  let theta = angle + omega * dt;
  theta = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, theta));

  return { angle: theta, angularVel: omega };
}

export function angleToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}
