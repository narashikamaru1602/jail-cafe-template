// ============================================================================
// REVEAL CONFIG — tuning for the 3D corridor reveal.
// ----------------------------------------------------------------------------s
// NOTE: this is the 3D reveal (CorridorReveal). It has nothing to do with the
// DOM scroll-reveal component `components/Reveal.tsx`.
//
// Elements reveal based on DISTANCE ALONG THE CORRIDOR — how deep the
// camera has advanced past an element decides how lit it is. No React frame
// state, no arbitrary per-element timers.
// ============================================================================

export interface RevealConfig {
  /** Distance (metres) at which an element starts waking up. */
  readonly triggerDistance: number;
  /** Metres over which it ramps from 0 to full brightness. */
  readonly span: number;
  /** Global gate: reveal only starts once the camera crosses the threshold. */
  readonly gateRampSeconds: number;
  /** Lamp flicker amplitude (0 = steady). */
  readonly flicker: number;
}

export const REVEAL: RevealConfig = {
  triggerDistance: 18,
  span: 7,
  gateRampSeconds: 1.4,
  flicker: 0.08,
};

/** Warm colour multipliers for the instance-coloured reveal meshes. */
export const REVEAL_COLORS = {
  /** Cell glow panel behind the bars. */
  cellGlow: [1.0, 0.62, 0.34] as const,
  /** Wall lamp capsules. */
  lamp: [1.0, 0.85, 0.62] as const,
  /** Fake floor pools — deeper, closer to the fixture's own spill. */
  lightPool: [1.0, 0.68, 0.4] as const,
  /** Volumetric shafts — match the lamp but quieter. */
  lightCone: [1.0, 0.8, 0.55] as const,
};
