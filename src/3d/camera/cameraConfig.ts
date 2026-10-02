// ============================================================================
// CAMERA CONFIG — damping constants and portrait-aware framing.
// ----------------------------------------------------------------------------s
// The CameraRig OWNS camera movement: there is no GSAP camProxy anywhere in
// this build. Shots provide a target pose, the rig damps toward it with
// exponential (frame-rate independent) smoothing.
// ============================================================================

/**
 * Initial pose handed to the R3F <Canvas camera={...}> prop. Matches the
 * gateEstablish shot start exactly, so the very first frame is already the
 * composed image (no dolly-in from a stale position).
 */
export const INITIAL_CAMERA = {
  fov: 46,
  position: [0, 1.62, 4.2] as [number, number, number],
  near: 0.1,
  far: 140,
};

/**
 * Exponential damping rates (higher = snappier). Applied as
 * `1 - exp(-rate * dt)` so behaviour is identical at 30 / 60 / 120 Hz.
 */
export const CAMERA_DAMPING = {
  position: 9,
  target: 7.5,
  fov: 6,
} as const;

/** Hard ceiling for portrait FOV so wide-angle distortion never goes crazy. */
export const MAX_FOV_PORTRAIT = 64;

/**
 * Vertical FOV is fixed on landscape; in portrait the horizontal field of
 * view collapses, so we widen the vertical FOV (clamped) to keep the gate /
 * corridor framed. Camera-relative framing: no React state, pure math.
 */
export function aspectAdjustedFov(baseFov: number, aspect: number): number {
  if (!Number.isFinite(aspect) || aspect >= 1) return baseFov;
  const widen = 1 + (1 / aspect - 1) * 0.55;
  return Math.min(baseFov * widen, MAX_FOV_PORTRAIT);
}
