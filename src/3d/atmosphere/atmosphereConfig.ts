// ============================================================================
// ATMOSPHERE CONFIG — fog, background and the static light rig positions.
// ----------------------------------------------------------------------------s
// Lighting has a HARD BUDGET per quality tier (see quality.ts):
//   HIGH   → 4 corridor point lights + shadow-casting key spot
//   MEDIUM → 2 corridor point lights, no shadows
//   LOW    → 1 corridor point light, no shadows
// Plus one hemisphere base light. Emissive lamp/glow instances and the
// far-end haze panel provide depth WITHOUT spending light slots.
// ============================================================================

export const ATMOSPHERE = {
  /** Near-black with a cold tint — matches the original intro overlay. */
  background: "#05060a",
  fogColor: "#070810",
  /** Fog starts just past the gate close-up distance. */
  fogNear: 4.5,
  /** Hemisphere base illumination (cool sky, dark ground). */
  hemiSky: "#2e3a52",
  hemiGround: "#0a0b10",
  hemiIntensity: 0.26,
  /**
   * Strength of the procedural environment map (metals need *something* to
   * reflect or they render black). Kept subtle to preserve the dark mood.
   */
  envIntensity: 0.35,
  /**
   * Gate key light: warm, high, front-right in the entry hall. This is the
   * only shadow caster (when the tier allows shadows).
   */
  keySpot: {
    position: [1.5, 3.15, 3.4] as const,
    color: "#ffd9a8",
    intensity: 5.2,
    angle: 0.62,
    penumbra: 0.7,
    distance: 16,
    decay: 1.4,
  },
  /**
   * Corridor lamp lights (budget-lit, index order = enable order).
   * Positioned to pool light between the cells.
   */
  corridorLights: [
    { position: [2.0, 2.7, -7] as const, color: "#ffcf96", intensity: 3.2 },
    { position: [-2.0, 2.7, -17] as const, color: "#ffc98c", intensity: 3.0 },
    { position: [2.0, 2.7, -27] as const, color: "#ffcf96", intensity: 3.0 },
    { position: [-2.0, 2.7, -37] as const, color: "#ffc488", intensity: 2.8 },
  ],
  /** Far-end haze panel (MeshBasic, no light cost). */
  farGlow: { position: [0, 1.7, -44.7] as const, scale: [5.4, 3.2] as const },
  /**
   * Cool haze slab mid-corridor — separates foreground/middle/background
   * against the warm far-end glow. Additive, fog-free, extremely subtle.
   */
  midHaze: { position: [0, 1.7, -21] as const, scale: [5.4, 3.0] as const },
  /**
   * Distant electrical fixture on the dead-end wall — an extremely subtle
   * cool light source so the deep corridor reads as serviced, not golden.
   */
  coolFixture: { position: [0, 3.16, -44.62] as const, scale: [1.3, 0.05] as const },
} as const;
